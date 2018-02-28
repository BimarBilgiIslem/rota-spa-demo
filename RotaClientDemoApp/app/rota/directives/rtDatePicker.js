/*
 * Copyright 2017 Bimar Bilgi İşlem A.Ş.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["require", "exports", "moment"], function (require, exports, moment) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Ui-DateTime wrapper
    function dateTimePickerDirective($document, $timeout, config, common, constants, localization, uiGridEditConstants) {
        function compile(cElement, cAttrs) {
            //#region DOM manupulations
            var phReskey = 'rota.tarihseciniz';
            var $input = $('input', cElement), inGridCell = !!$(cElement).parent('.ui-grid-cell').length, $datetimepicker = $('datetimepicker', cElement), minStep = cAttrs.minuteStep || config.datetimeFormat.datePickerTimeMinStep;
            //inital view values
            var startView = "day", minView = "day", format = config.datetimeFormat.dateFormat, w = "167px";
            if (common.isNullOrEmpty(cAttrs.dateFormat))
                cAttrs.dateFormat = "day";
            switch (cAttrs.dateFormat) {
                case "day":
                    startView = minView = "day";
                    format = config.datetimeFormat.dateFormat;
                    w = "132px";
                    break;
                case "time":
                    startView = "day";
                    minView = "minute";
                    format = config.datetimeFormat.timeFormat;
                    w = "167px";
                    break;
                case "month":
                    startView = minView = "month";
                    format = config.datetimeFormat.monthFormat;
                    phReskey = 'rota.ayseciniz';
                    w = "120px";
                    break;
                case "year":
                    startView = minView = "year";
                    format = config.datetimeFormat.yearFormat;
                    phReskey = 'rota.yilseciniz';
                    w = "95px";
                    break;
                default:
                    startView = "day";
                    minView = "minute";
                    format = cAttrs.dateFormat;
                    w = "190px";
                    break;
            }
            //set width
            cElement.attr('style', 'width:' + w);
            //set formats
            $datetimepicker.attr('data-datetimepicker-config', "{startView:'" + startView + "',minView:'" + minView + "',minuteStep:" + minStep + "}");
            $input.attr('data-date-time-input', format);
            //placeholder
            $input.attr('placeholder', (cAttrs.placeholder || localization.getLocal(cAttrs.phI18n || phReskey)));
            //#endregion
            return function (scope, element, attrs, modelCtrl) {
                //#region Picker actions
                //open
                scope.openPicker = function ($event) {
                    common.preventClick($event);
                    if (scope.ngDisabled)
                        return;
                    scope.openIt = true;
                };
                //close
                scope.onTimeSet = function (newDate) {
                    scope.openIt = false;
                    if (common.isAssigned(scope.onSelected)) {
                        scope.onSelected({ date: newDate });
                    }
                    //set model dirty
                    modelCtrl.$setDirty();
                    //set focus
                    //BUG:focusing not work
                    $timeout(function () {
                        $input.focus();
                    }, 0);
                    //close date picker after date selected while running in grid cell
                    if (inGridCell) {
                        $timeout(function () {
                            scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                        }, 0);
                    }
                };
                //get current date depending on date-format
                var getCurrentDate = function () {
                    switch (cAttrs.dateFormat) {
                        case "day":
                            return moment().startOf('day').toDate();
                        case "time":
                            return moment().toDate();
                        case "month":
                            return moment().startOf('month').toDate();
                        case "year":
                            return moment().startOf('year').toDate();
                        default:
                            return moment().toDate();
                    }
                };
                //set model depending on date-format
                var setModel = function (increment) {
                    var mDate = moment(modelCtrl.$modelValue);
                    switch (cAttrs.dateFormat) {
                        case "day":
                            modelCtrl.$setViewValue(mDate.add(increment, "d"));
                            break;
                        case "time":
                            modelCtrl.$setViewValue(mDate.add(increment, "h"));
                            break;
                        case "month":
                            modelCtrl.$setViewValue(mDate.add(increment, "M"));
                            break;
                        case "year":
                            modelCtrl.$setViewValue(mDate.add(increment, "y"));
                            break;
                        default:
                            modelCtrl.$setViewValue(mDate.add(increment, "d"));
                    }
                    scope.$apply();
                };
                //key press manage
                $(element).bind('keydown', function (e) {
                    switch (e.which) {
                        //esc
                        case constants.key_codes.ESC:
                            scope.$apply(function () {
                                if (scope.openIt) {
                                    scope.openIt = false;
                                    return;
                                }
                                modelCtrl.$setViewValue(null);
                                common.preventClick(e);
                            });
                            break;
                        //enter
                        case constants.key_codes.ENTER:
                            scope.$apply(function () {
                                var currentDate = getCurrentDate();
                                modelCtrl.$setViewValue(currentDate);
                                common.preventClick(e);
                            });
                            break;
                        //down arrow
                        case constants.key_codes.DOWN_ARROW:
                            setModel(-1);
                            common.preventClick(e);
                            break;
                        //up arrow
                        case constants.key_codes.UP_ARROW:
                            setModel(1);
                            common.preventClick(e);
                            break;
                    }
                });
                //#endregion
                //#region Range validations
                modelCtrl.$validators["daterange"] = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;
                    var isMinCheck = true, isMaxCheck = true;
                    if (scope.minDate && value) {
                        isMinCheck = moment(value).isAfter(scope.minDate);
                    }
                    if (scope.maxDate && value) {
                        isMaxCheck = moment(value).isBefore(scope.maxDate);
                    }
                    return isMinCheck && isMaxCheck;
                };
                scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
                    if (scope.maxDate) {
                        var activeDate = moment(scope.maxDate);
                        for (var i = 0; i < $dates.length; i++) {
                            if ($dates[i].localDateValue() >= activeDate.valueOf())
                                $dates[i].selectable = false;
                        }
                    }
                    if (scope.minDate) {
                        var activeDate = moment(scope.minDate);
                        for (var i = 0; i < $dates.length; i++) {
                            if ($dates[i].localDateValue() <= activeDate.valueOf()) {
                                $dates[i].selectable = false;
                            }
                        }
                    }
                };
                //quit edit mode in grid if selected or clicked outside 
                //https://plnkr.co/edit/ckQhv5bWha2jte5wDBI1?p=preview
                if (inGridCell) {
                    var docClick_1 = function (evt) {
                        if ($(evt.target).closest('.rt-date-picker').length === 0) {
                            scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                            $document.off('click', docClick_1);
                        }
                    };
                    $document.on("click", docClick_1);
                }
                //#endregion
            };
        }
        //#region Directive Definition
        var directive = {
            restrict: 'E',
            require: 'ngModel',
            replace: true,
            compile: compile,
            scope: {
                ngModel: '=',
                ngRequired: '=',
                ngDisabled: '=',
                onSelected: '&?',
                minDate: '=?',
                maxDate: '=?'
            },
            template: function (elem) {
                var inGridCell = !!$(elem).parent('.ui-grid-cell').length;
                return '<div class="rt-date-picker" uib-dropdown is-open="openIt" ' + (inGridCell ? 'dropdown-append-to-body' : '') + '>' +
                    '<div class="input-group">' +
                    '<input ng-disabled=ngDisabled ng-model-options="{debounce:50}" ng-required="ngRequired" ' +
                    'data-date-parse-strict="false" ng-model=ngModel type="text" class="form-control"> ' +
                    '<span class="input-group-btn"><button ng-disabled=ngDisabled class="btn btn-default calendar-picker" ng-click="openPicker($event)">' +
                    '<i class="fa fa-calendar"></i></button></span></div>' +
                    '<ul uib-dropdown-menu role="menu" aria-labelledby="dLabel">' +
                    '<datetimepicker ng-model=ngModel data-on-set-time=onTimeSet(newDate) ' +
                    'data-before-render="beforeRender($view, $dates, $leftDate, $upDate, $rightDate)"/></ul></div>';
            }
        };
        return directive;
        //#endregion
    }
    exports.dateTimePickerDirective = dateTimePickerDirective;
    //#region Injections
    dateTimePickerDirective.$inject = ['$document', '$timeout', 'Config', 'Common', 'Constants', 'Localization', 'uiGridEditConstants'];
    //#endregion
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtdatepicker', []);
    module.directive('rtDatePicker', dateTimePickerDirective).run([
        '$templateCache', 'Config', function ($templateCache, config) {
            $templateCache.put('templates/datetimepicker.html', '<div class="datetimepicker table-responsive">\n    <table class="table table-condensed {{ data.currentView }}-view">\n        <thead>\n        <tr>\n            <th class="left" data-ng-click="changeView(data.currentView, data.leftDate, $event)" data-ng-show="data.leftDate.selectable"><i class="glyphicon glyphicon-arrow-left"><span class="sr-only">{{ screenReader.previous }}</span></i>\n            </th>\n            <th class="switch" colspan="5" data-ng-show="data.previousViewDate.selectable" data-ng-click="changeView(data.previousView, data.previousViewDate, $event)">{{ data.previousViewDate.display }}</th>\n            <th class="right" data-ng-click="changeView(data.currentView, data.rightDate, $event)" data-ng-show="data.rightDate.selectable"><i class="glyphicon glyphicon-arrow-right"><span class="sr-only">{{ screenReader.next }}</span></i>\n            </th>\n        </tr>\n        <tr>\n            <th class="dow" data-ng-repeat="day in data.dayNames">{{ day }}</th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr data-ng-if="data.currentView !== \'day\'">\n            <td colspan="7">\n                          <span class="{{ data.currentView }}" data-ng-repeat="dateObject in data.dates" data-ng-class="{active: dateObject.active, past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}" data-ng-click="changeView(data.nextView, dateObject, $event)">{{ dateObject.display }}</span></td>\n        </tr>\n        <tr data-ng-if="data.currentView === \'day\'" data-ng-repeat="week in data.weeks">\n            <td data-ng-repeat="dateObject in week.dates" data-ng-click="changeView(data.nextView, dateObject, $event)" class="day" data-ng-class="{active: dateObject.active, past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}">{{ dateObject.display }}</td>\n        </tr>\n        </tbody>\n    </table>\n</div>');
            //Override toJson method to serialize date obj with offset
            //http://stackoverflow.com/a/31104671/1016147
            if (config.datetimeFormat.useTimeZoneOffSet) {
                //for post 
                Date.prototype.toJSON = function () { return moment(this).format(); };
                //for get
                Date.prototype.toISOString = function () { return moment(this).format(); };
            }
        }
    ]);
});
