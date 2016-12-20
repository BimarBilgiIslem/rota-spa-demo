define(["require", "exports", 'jquery', "../base/obserablemodel"], function (require, exports, $, obserablemodel_1) {
    "use strict";
    //#endregion
    //#region Multi Select Directive
    function multiSelectDirective($timeout, $parse, $injector, $q, common, logger, dialogs, multiSelectI18NService, constants) {
        function compile(cElement, cAttrs) {
            //#region DOM manupulations
            //#region rtSelect settings
            var dropDown = $('rt-select', cElement);
            dropDown.attr('value-prop', cAttrs.valueProp)
                .attr('display-prop', cAttrs.displayProp)
                .attr('custom-filter', cAttrs.customFilter)
                .attr('display-template', cAttrs.displayTemplate)
                .attr('groupby-prop', cAttrs.groupbyProp)
                .attr('ph-i18n', cAttrs.phI18n)
                .attr('placeholder', cAttrs.placeholder)
                .attr('items-count', cAttrs.itemsCount)
                .attr('new-item-options', cAttrs.newItemOptions)
                .attr('search-item-options', cAttrs.searchItemsOptions);
            if (common.isDefined(cAttrs.onRefresh)) {
                dropDown.attr('on-refresh', 'onRefresh({keyword:keyword})');
                dropDown.attr('on-get', 'onGet({id:id})');
            }
            else {
                dropDown.attr('items', 'items');
                dropDown.attr('on-fetch', 'onFetch({params:params})');
            }
            //#endregion
            var groupbyEnabled = common.isDefined(cAttrs.groupbyProp);
            //Display template
            if (cAttrs.displayTemplate) {
                $('td.value', cElement).html(common.updateExpressions(cAttrs.displayTemplate, 'item.$selectItem'));
            }
            else {
                $('td.value', cElement).html('{{item.$selectItem.' + cAttrs.displayProp + '}}');
            }
            //Selection Prop
            if (common.isDefined(cAttrs.selectionProp)) {
                var timestamp = common.getRandomNumber();
                $('td.selection>input:radio', cElement).attr('name', (groupbyEnabled ? '{{group}}' + timestamp : timestamp))
                    .attr('ng-model', 'item.$model.' + cAttrs.selectionProp);
                //selection row highlight class
                $('tr.item', cElement).attr('ng-class', '{selected:item.$model.' + cAttrs.selectionProp + '}');
            }
            //#endregion
            return function (scope, element, attrs, modelCtrl) {
                //#region Init Attrs
                /**
                * AutoSuggest flag
                */
                var autoSuggest = common.isDefined(attrs.onRefresh);
                /**
                 * Filter mode active flag
                 */
                var isFilterMode = !common.isDefined(attrs.modelProp);
                /**
                 * Value prop getter function
                 */
                var valuePropGetter = attrs.valueProp && $parse(attrs.valueProp);
                /**
                 * Model value prop getter function
                 */
                var modelValuePropGetter = attrs.modelProp && $parse(attrs.modelProp);
                /**
                 * Added items store
                 */
                var addedItems = [];
                /**
                 * Listing defer obj
                 * @description  Wait for the request to finish so that items would be available for ngModel changes to select
                 */
                var asyncModelRequestResult = $q.defer();
                /**
                 * Model is being updated from ngModel
                 */
                var initializingModel = true;
                //if autosuggest,initially resolve selectItems promise
                if (autoSuggest)
                    asyncModelRequestResult.resolve([]);
                //#endregion
                //#region Validations
                if (common.isDefined(cAttrs.selectionProp) && isFilterMode) {
                    throw new Error(constants.errors.SELECTION_NOT_AVAILABLE);
                }
                if (!common.isAssigned(valuePropGetter)) {
                    throw new Error(constants.errors.MISSING_VALUE_PROP);
                }
                //#endregion
                //#region Mappers
                /**
                 * Base mapper function
                 * @param context Context obj
                 * @param parser Parser method
                 */
                var getMappedValue = function (context, parser) {
                    if (parser && angular.isObject(context)) {
                        return parser(context);
                    }
                    return context;
                };
                var getSelectValueMapper = function (context) { return getMappedValue(context, valuePropGetter); };
                var getModelValueMapper = function (context) { return getMappedValue(context, modelValuePropGetter || valuePropGetter); };
                //#endregion
                //#region Utility
                /**
                 * Update visible items
                 */
                var refresh = function () {
                    scope.visibleItems = isFilterMode ? addedItems : _.filter(addedItems, function (item) { return item.$model.modelState !== 8 /* Deleted */ &&
                        item.$model.modelState !== 1 /* Detached */; });
                    if (groupbyEnabled) {
                        scope.groupItems = _.groupBy(scope.visibleItems, function (model) {
                            return model.$selectItem[attrs.groupbyProp];
                        });
                    }
                    //Required settings
                    var required = !scope.visibleItems.length && common.isDefined(attrs.required) && attrs.required;
                    modelCtrl.$setValidity('required', !required);
                    modelCtrl.$validate();
                };
                /**
                 *  Find list item by list item or value
                 * @param value List item object or value
                 */
                var findSelectItem = function (value) {
                    var findValue = getModelValueMapper(value);
                    return asyncModelRequestResult.promise.then(function (items) {
                        var foundItem = _.find(items, function (item) {
                            var modelValue = getSelectValueMapper(item);
                            return modelValue === findValue;
                        });
                        return foundItem || common.rejectedPromise();
                    });
                };
                /**
                 * Find list item by list item or value
                 * @param value List item object or value
                 */
                var findListItem = function (value) {
                    var findValue = getSelectValueMapper(value);
                    return _.find(addedItems, function (item) {
                        var modelValue = getModelValueMapper(item.$model);
                        return modelValue === findValue;
                    });
                };
                /**
                 * Check whether model already added
                 * @param model Model
                 */
                var findListItemByModel = function (model) {
                    var findValue = getModelValueMapper(model);
                    var foundItem = _.find(addedItems, function (item) {
                        var modelValue = getModelValueMapper(item.$model);
                        return modelValue === findValue;
                    });
                    return foundItem;
                };
                //#endregion
                //#region ngModel Methods
                if (!isFilterMode) {
                    //Inject formatter pipeline
                    modelCtrl.$formatters.push(function (items) {
                        if (!items)
                            return items;
                        //clear previous items
                        addedItems.length = 0;
                        //load item on init
                        addModels(items);
                        //watch models changes for update view
                        items
                            .subscribeCollectionChanged(function (action, model) {
                            if (action === 4 /* Added */) {
                                var existingModel = findListItemByModel(model);
                                if (!existingModel ||
                                    existingModel.$model.modelState === 1 /* Detached */)
                                    addModels([model]);
                            }
                            else {
                                refresh();
                            }
                        });
                        return items;
                    });
                }
                else {
                    scope.$parent.$watchCollection(attrs.ngModel, function (newItems, oldItems) {
                        //remove items
                        _.each(_.difference(oldItems, newItems), function (item) {
                            removeItem(findListItemByModel(item));
                        });
                        //add items
                        var itemsToAdd = _.filter(newItems, function (item) { return !findListItemByModel(item); });
                        addModels(itemsToAdd);
                    });
                }
                //#endregion
                //#region Adding Methods
                /**
               * Update value according to ngModel
               * @param model
               */
                var addModels = function (items) {
                    var resultPromises = [];
                    var result = common.promise();
                    //this flag is to prevent triggering events
                    initializingModel = true;
                    for (var i = 0; i < items.length; i++) {
                        result = (function (promise, model) {
                            return promise.finally(function () {
                                var modelResultPromise = findSelectItem(model).catch(function () {
                                    if (scope.onGet)
                                        return common.makePromise(scope.onGet({ id: getModelValueMapper(model) }));
                                });
                                return modelResultPromise.then(function (selectItem) {
                                    return addItem(selectItem, model).catch(function (message) {
                                        message && logger.toastr.warn({ message: message });
                                    });
                                });
                            });
                        })(result, items[i]);
                        resultPromises.push(result);
                    }
                    $q.all(resultPromises).finally(function () {
                        refresh();
                        initializingModel = false;
                        scope.selectedModel = null;
                    });
                };
                /**
                * Create multi select model or add selected value
                * @param selectItem Select Item
                */
                var createModel = function (selectItem) {
                    //get selected item value
                    var selectValue = getSelectValueMapper(selectItem);
                    if (!isFilterMode) {
                        //create model
                        var model = common.newCrudModel();
                        model[attrs.modelProp] = selectValue;
                        if (scope.showSelection) {
                            model[attrs.selectionProp] = false;
                        }
                        return new obserablemodel_1.ObserableModel(model);
                    }
                    else {
                        return selectValue;
                    }
                };
                /**
                * Add all items to list
                */
                var addAll = function () {
                    return asyncModelRequestResult.promise.then(function (items) {
                        var allP = [];
                        items.forEach(function (item) {
                            allP.push(addItem(item, null, true)
                                .then(function (model) {
                                if (!isFilterMode)
                                    modelCtrl.$modelValue
                                        .add(model);
                                else
                                    modelCtrl.$modelValue.unshift(model);
                            }));
                        });
                        return $q.all(allP)
                            .finally(function () {
                            refresh();
                        });
                    });
                };
                /**
                * Add item to list
                * @param selectItem Select Item
                * @param model Existing model
                */
                var addItem = function (selectItem, model, isBatchProcess) {
                    if (!common.isAssigned(selectItem))
                        return common.rejectedPromise('select item must be assigned');
                    var defer = $q.defer();
                    //check item already added previously
                    var existingModel = findListItem(selectItem);
                    var msModelArgs = { isBatchProcess: isBatchProcess };
                    if (!common.isAssigned(existingModel)) {
                        msModelArgs.$model = model || createModel(selectItem);
                        msModelArgs.$selectItem = selectItem;
                        //call onadd method - 
                        var addResult = initializingModel ? common.promise() : scope.onAdd({ args: msModelArgs });
                        var addResultPromise = common.makePromise(addResult);
                        addResultPromise.then(function () {
                            addedItems.unshift({ $model: msModelArgs.$model, $selectItem: msModelArgs.$selectItem });
                            modelCtrl.$setDirty();
                            //call added event
                            if (!initializingModel) {
                                scope.onAdded({ args: msModelArgs });
                            }
                            defer.resolve(msModelArgs.$model);
                        }, function (reason) {
                            defer.reject(reason);
                        });
                    }
                    else {
                        if (!isFilterMode) {
                            //model mode here
                            var obserableModel = existingModel.$model;
                            if (obserableModel.modelState === 8 /* Deleted */ ||
                                obserableModel.modelState === 1 /* Detached */) {
                                //if deleted previously,just make it visible again
                                obserableModel.modelState = obserableModel.modelState === 8 /* Deleted */
                                    ? 2 /* Unchanged */
                                    : 4 /* Added */;
                                //call added event
                                msModelArgs.$model = existingModel.$model;
                                msModelArgs.$selectItem = existingModel.$selectItem;
                                if (!initializingModel) {
                                    scope.onAdded({ args: msModelArgs });
                                }
                                defer.reject(multiSelectI18NService.silinenItemGeriAlindi);
                            }
                            else {
                                defer.reject(multiSelectI18NService.zatenekli);
                            }
                        }
                        else {
                            defer.reject(multiSelectI18NService.zatenekli);
                        }
                    }
                    return defer.promise;
                };
                //#endregion
                //#region Removing Methods
                /**
                * Remove selected item
                * @param item Item to be removed
                */
                var removeItem = function (item, isBatchProcess) {
                    if (!common.isAssigned(item))
                        return common.rejectedPromise('item must be assigned');
                    var msModelArgs = { isBatchProcess: isBatchProcess };
                    msModelArgs.$model = item.$model;
                    msModelArgs.$selectItem = item.$selectItem;
                    var removeResult = scope.onRemove({ args: msModelArgs });
                    var removeResultPromise = common.makePromise(removeResult);
                    return removeResultPromise.then(function () {
                        var index = addedItems.indexOf(item);
                        if (index === -1)
                            return common.rejectedPromise('no item found at index ' + index);
                        if (!isFilterMode) {
                            item.$model.remove();
                        }
                        else {
                            modelCtrl.$modelValue.delete(item.$model);
                            addedItems.delete(item);
                        }
                        modelCtrl.$setDirty();
                        scope.onRemoved({ args: item });
                    });
                };
                /**
                 * Remove all items
                 */
                var removeAll = function () {
                    var itemPromises = [];
                    addedItems.forEach(function (item) {
                        itemPromises.push(removeItem(item));
                    });
                    return $q.all(itemPromises);
                };
                //#endregion
                //#region Init scope
                /**
                 * Auto suggest
                 */
                scope.autoSuggest = autoSuggest;
                //#region Tooltips
                scope.ttTumunuekle = multiSelectI18NService.tumunuekle;
                scope.ttTumunusil = multiSelectI18NService.tumunusil;
                scope.ttSil = multiSelectI18NService.sil;
                scope.ttKayitbulunamadi = multiSelectI18NService.kayitbulunamadi;
                scope.ttIslemler = multiSelectI18NService.islemler;
                //#endregion
                /**
                 * Remove item
                 * @param item MultiSelectListItem
                 * @param event Angular event
                 */
                scope.removeItem = function (item, event) {
                    common.preventClick(event);
                    return removeItem(item).then(function () {
                    }, function (message) {
                        logger.toastr.error({ message: message });
                    });
                };
                /**
                 * Add all items
                 * @param event Angular event
                 */
                scope.addAll = function (event) {
                    common.preventClick(event);
                    dialogs.showConfirm({ message: multiSelectI18NService.onaytumkayitekle }).then(function () {
                        addAll().finally(function () {
                            logger.toastr.info({ message: multiSelectI18NService.tumkayitlareklendi });
                        });
                    });
                };
                /**
                 * Remove all items
                 * @param event Angular event
                 */
                scope.removeAll = function (event) {
                    common.preventClick(event);
                    dialogs.showConfirm({ message: multiSelectI18NService.onaytumkayitsil }).then(function () {
                        removeAll()
                            .finally(function () {
                            logger.toastr.info({ message: multiSelectI18NService.tumkayitlarsilindi });
                        });
                    });
                };
                /**
                 * rtSelect selected index changed event
                 * @param args Selected index changed event args
                 */
                scope.onSelectionChanged = function (args) {
                    if (!common.isAssigned(args.model))
                        return;
                    addItem(args.model)
                        .then(function (model) {
                        if (!isFilterMode) {
                            modelCtrl.$modelValue.add(model);
                        }
                        else
                            modelCtrl.$modelValue.unshift(model);
                    }, function (message) {
                        message && logger.toastr.warn({ message: message });
                    })
                        .finally(function () {
                        refresh();
                        scope.selectedModel = null;
                    });
                };
                /**
                 * Show selection radio
                 */
                scope.showSelection = angular.isDefined(attrs.selectionProp);
                /**
                 * Selection raido button click event
                 * @param selItem Selected item
                 * @param groupItems Grouped items if grouping enabled
                 */
                scope.setSelected = function (selItem, groupItems) {
                    //uncheck all items
                    (groupItems || addedItems).forEach(function (item) {
                        if (item.$model[attrs.selectionProp] === true) {
                            item.$model[attrs.selectionProp] = false;
                        }
                    });
                    //set selection
                    selItem.$model[attrs.selectionProp] = true;
                };
                /**
                 * Event triggered since Select items gets populated
                 * @description Defer object resolved here to wait for ngModel changes
                 * @param items Select items
                 */
                scope.onItemsPopulated = function (items) {
                    if (autoSuggest)
                        asyncModelRequestResult = $q.defer();
                    asyncModelRequestResult.resolve(items);
                };
                /**
                 * Watch required attribute
                 */
                scope.$watch("ngRequired", function (newValue, oldValue) {
                    if (newValue !== oldValue)
                        refresh();
                });
                //#endregion
            };
        }
        //#region Directive definition
        var directive = {
            restrict: 'AE',
            require: 'ngModel',
            replace: true,
            scope: {
                //rtSelect options
                items: '=?',
                onFetch: '&?',
                onRefresh: '&?',
                onRetrived: '&?',
                onChange: '&?',
                onGet: '&?',
                params: '=?',
                newItemOptions: '=?',
                searchItemsOptions: '=?',
                ngDisabled: '=?',
                ngRequired: '=?',
                hideButtons: '=',
                //rtMultiSelect options
                onRemoved: '&',
                onRemove: '&',
                onAdded: '&',
                onAdd: '&'
            },
            templateUrl: function (elem, attr) { return (common.isDefined(attr.groupbyProp) ?
                'rota/rtmultiselect.group.tpl.html' : 'rota/rtmultiselect.tpl.html'); },
            compile: compile
        };
        return directive;
        //#endregion
    }
    //#region Injections
    multiSelectDirective.$inject = ['$timeout', '$parse', '$injector', '$q', 'Common', 'Logger',
        'Dialogs', 'rtMultiSelectI18N', 'Constants'];
    //#endregion
    //#endregion
    //#region MultiSelect Localization Service
    var multiSelectI18NService = [
        'Localization', function (localization) {
            return {
                kayitsayisi: localization.getLocal("rota.kayitsayisi"),
                kayitbulunamadi: localization.getLocal("rota.kayitbulunamadi"),
                tumunuekle: localization.getLocal("rota.tumunuekle"),
                tumunusil: localization.getLocal("rota.tumunusil"),
                sil: localization.getLocal("rota.sil"),
                kayitsilindi: localization.getLocal('rota.kayitsilindi'),
                kayiteklendi: localization.getLocal('rota.kayiteklendi'),
                zatenekli: localization.getLocal('rota.zatenekli'),
                onaytumkayitekle: localization.getLocal('rota.onaytumkayitekle'),
                onaytumkayitsil: localization.getLocal('rota.onaytumkayitsil'),
                tumkayitlarsilindi: localization.getLocal('rota.tumkayitlarsilindi'),
                tumkayitlareklendi: localization.getLocal('rota.tumkayitlareklendi'),
                islemler: localization.getLocal('rota.islemler'),
                silinenItemGeriAlindi: localization.getLocal('rota.silinenitemgerialindi')
            };
        }
    ];
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtmultiselect', ['rota.directives.rtselect']);
    module.factory('rtMultiSelectI18N', multiSelectI18NService)
        .directive('rtMultiSelect', multiSelectDirective)
        .run([
        '$templateCache', function ($templateCache) {
            $templateCache.put('rota/rtmultiselect.tpl.html', '<div ng-model-options="{allowInvalid: true}" ng-class="{\'list-open\':visibleItems && visibleItems.length}" class="rt-multiselect">' +
                '<div class="header" ng-class="{\'input-group\':!hideButtons}"><rt-select ng-disabled=ngDisabled ng-model="selectedModel" ' +
                'on-retrived="onItemsPopulated(items)" on-change="onSelectionChanged(args)"></rt-select>' +
                '<div uib-dropdown class="input-group-addon" ng-hide=hideButtons><a href uib-dropdown-toggle><i class="fa fa-th"></i></a>' +
                '<ul class="dropdown-menu text-left" uib-dropdown-menu>' +
                '<li><a ng-hide=ngDisabled href ng-if="!autoSuggest" ng-click="addAll($event)">{{::ttTumunuekle}}</a></li>' +
                '<li><a ng-hide=ngDisabled href ng-click="removeAll($event)">{{::ttTumunusil}}</a></li>' +
                '</ul></div></div>' +
                '<div ng-show="visibleItems && visibleItems.length" class="body"><table class="items">' +
                '<tr class="item rota-animate-rt-multiselect" ng-repeat="item in visibleItems"><td class="selection" ng-if="showSelection">' +
                '<input type="radio" ng-value="true" ng-click="setSelected(item)"/></td><td class="value"></td>' +
                '<td align="right" class="text-align-center" style="width:10px">' +
                '<a class="command" ng-hide=ngDisabled href ng-click="removeItem(item,$event)" uib-tooltip="{{::ttSil}}" tooltip-placement="right">' +
                '<i class="fa fa-minus-circle text-danger"></i></a></td></tr></table></div></div>');
            $templateCache.put('rota/rtmultiselect.group.tpl.html', '<div ng-model-options="{allowInvalid: true}" ng-class="{\'list-open\':visibleItems && visibleItems.length}" class="rt-multiselect">' +
                '<div class="header" ng-class="{\'input-group\':!hideButtons}"><rt-select ng-disabled=ngDisabled ng-model="selectedModel" ' +
                'on-retrived="onItemsPopulated(items)" on-change="onSelectionChanged(args)"></rt-select>' +
                '<div uib-dropdown class="input-group-addon" ng-hide=hideButtons><a href uib-dropdown-toggle><i class="fa fa-th"></i></a>' +
                '<ul class="dropdown-menu text-left" uib-dropdown-menu>' +
                '<li><a ng-hide=ngDisabled href ng-if="!autoSuggest" ng-click="addAll($event)">{{::ttTumunuekle}}</a></li>' +
                '<li><a ng-hide=ngDisabled href ng-click="removeAll($event)">{{::ttTumunusil}}</a></li>' +
                '</ul></div></div><div class="body" ng-show="visibleItems && visibleItems.length"><table class="items">' +
                '<tr class="group-item" ng-repeat-start="(group,items) in groupItems"><td colspan="4">' +
                '<span class="badge alert-info">{{group}}</span></td></tr>' +
                '<tr ng-repeat-end class="item child-item rota-animate-rt-multiselect" ng-repeat="item in items">' +
                '<td class="child-indent"></td><td class="selection" ng-if="showSelection">' +
                '<input type="radio" ng-value="true" ng-click="setSelected(item,items)"/></td><td class="value"></td>' +
                '<td align="right" class="text-align-center" style="width:10px">' +
                '<a class="command" href ng-click="removeItem(item,$event)" uib-tooltip="{{::ttSil}}" tooltip-placement="right">' +
                '<i class="fa fa-minus-circle text-danger"></i></a></td></tr></table></div></div>');
        }
    ]);
    //#endregion
});
