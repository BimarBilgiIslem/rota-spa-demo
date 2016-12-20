define(["require", "exports", "moment"], function (require, exports, moment) {
    "use strict";
    //#endregion
    //#region Ui-DateTime wrapper
    function dateTimePickerDirective($timeout, config, common, constants) {
        function compile(cElement, cAttrs) {
            //#region DOM manupulations
            var $input = $('input', cElement), $datetimepicker = $('datetimepicker', cElement), minStep = cAttrs.minuteStep || config.datetimeFormat.datePickerTimeMinStep;
            //inital view values
            var startView = "day", minView = "day", format = config.datetimeFormat.dateFormat;
            switch (cAttrs.dateFormat) {
                case "day":
                    startView = minView = "day";
                    format = config.datetimeFormat.dateFormat;
                    break;
                case "time":
                    startView = "day";
                    minView = "minute";
                    format = config.datetimeFormat.timeFormat;
                    break;
                case "month":
                    startView = minView = "month";
                    format = config.datetimeFormat.monthFormat;
                    break;
                case "year":
                    startView = minView = "year";
                    format = config.datetimeFormat.yearFormat;
                    break;
            }
            //set formats
            $datetimepicker.attr('data-datetimepicker-config', "{startView:'" + startView + "',minView:'" + minView + "',minuteStep:" + minStep + "}");
            $input.attr('data-date-time-input', format);
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
                    if (common.isDefined(scope.minDate)) {
                        isMinCheck = moment(value).isAfter(scope.minDate);
                    }
                    if (angular.isDefined(scope.maxDate)) {
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
            template: '<div class="rt-date-picker" uib-dropdown is-open="openIt">' +
                '<div class="input-group" uib-tooltip="{{::\'rota.buguntarihienter\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="right">' +
                '<input ng-disabled=ngDisabled ng-model-options="{debounce:50}" ng-required="ngRequired" ' +
                'data-date-parse-strict="false" ng-model=ngModel type="text" class="form-control"> ' +
                '<span style="cursor:pointer;" ng-click="openPicker($event)" class="input-group-addon">' +
                '<i class="fa fa-calendar"></i></span></div>' +
                '<ul uib-dropdown-menu role="menu" aria-labelledby="dLabel">' +
                '<datetimepicker ng-model=ngModel data-on-set-time=onTimeSet(newDate) ' +
                'data-before-render="beforeRender($view, $dates, $leftDate, $upDate, $rightDate)"/></ul></div>'
        };
        return directive;
        //#endregion
    }
    exports.dateTimePickerDirective = dateTimePickerDirective;
    //#region Injections
    dateTimePickerDirective.$inject = ['$timeout', 'Config', 'Common', 'Constants'];
    //#endregion
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtdatepicker', []);
    module.directive('rtDatePicker', dateTimePickerDirective).run([
        '$templateCache', function ($templateCache) {
            $templateCache.put('templates/datetimepicker.html', '<div class="datetimepicker table-responsive">\n    <table class="table table-condensed {{ data.currentView }}-view">\n        <thead>\n        <tr>\n            <th class="left" data-ng-click="changeView(data.currentView, data.leftDate, $event)" data-ng-show="data.leftDate.selectable"><i class="glyphicon glyphicon-arrow-left"><span class="sr-only">{{ screenReader.previous }}</span></i>\n            </th>\n            <th class="switch" colspan="5" data-ng-show="data.previousViewDate.selectable" data-ng-click="changeView(data.previousView, data.previousViewDate, $event)">{{ data.previousViewDate.display }}</th>\n            <th class="right" data-ng-click="changeView(data.currentView, data.rightDate, $event)" data-ng-show="data.rightDate.selectable"><i class="glyphicon glyphicon-arrow-right"><span class="sr-only">{{ screenReader.next }}</span></i>\n            </th>\n        </tr>\n        <tr>\n            <th class="dow" data-ng-repeat="day in data.dayNames">{{ day }}</th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr data-ng-if="data.currentView !== \'day\'">\n            <td colspan="7">\n                          <span class="{{ data.currentView }}" data-ng-repeat="dateObject in data.dates" data-ng-class="{active: dateObject.active, past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}" data-ng-click="changeView(data.nextView, dateObject, $event)">{{ dateObject.display }}</span></td>\n        </tr>\n        <tr data-ng-if="data.currentView === \'day\'" data-ng-repeat="week in data.weeks">\n            <td data-ng-repeat="dateObject in week.dates" data-ng-click="changeView(data.nextView, dateObject, $event)" class="day" data-ng-class="{active: dateObject.active, past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}">{{ dateObject.display }}</td>\n        </tr>\n        </tbody>\n    </table>\n</div>');
        }
    ]);
    //#endregion
});
