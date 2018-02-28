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
    //#region DateRange directive
    function dateRangeDirective($parse, config, common) {
        function compile(cElement, cAttrs) {
            //#region DOM manupulations
            var $sd = $('rt-date-picker.start', cElement), $ed = $('rt-date-picker.end', cElement);
            //Show time
            if (angular.isDefined(cAttrs.dateFormat)) {
                $sd.attr('date-format', cAttrs.dateFormat);
                $ed.attr('date-format', cAttrs.dateFormat);
            }
            //#endregion
            return function (scope, element, attrs, formCtrl) {
                //set dates
                var setDates = function (startDate, endDate) {
                    scope.dateStart = startDate;
                    scope.dateEnd = endDate;
                };
                //set dates or fixed range
                if (common.isDefined(attrs.set)) {
                    var strDate = moment().startOf(attrs.set || 'day').toDate();
                    var endDate = moment().endOf(attrs.set || 'day').toDate();
                    setDates(strDate, endDate);
                    scope.showfixedrange = true;
                }
                //Watch fixed range
                scope.$watch('fixedRange', function (newValue) {
                    if (newValue) {
                        var strDate = moment().subtract(newValue - 1, 'days').startOf('day').toDate();
                        var endDate = moment().endOf('day').toDate();
                        setDates(strDate, endDate);
                    }
                });
                //#region Range validation method
                scope.$watchGroup(['dateStart', 'dateEnd'], function (dates) {
                    var sd = dates[0], ed = dates[1];
                    var isValid = (sd && ed) ? moment(sd).isBefore(ed) : true;
                    formCtrl && formCtrl.$setValidity('range', isValid, null);
                    scope.rangeIsValidClass = isValid ? 'ng-valid' : 'ng-invalid';
                });
                //#endregion
            };
        }
        //#region Directive Definition
        var directive = {
            restrict: 'E',
            replace: true,
            compile: compile,
            require: '?^form',
            scope: {
                dateStart: '=',
                dateEnd: '=',
                fixedRange: '='
            },
            template: '<div class="range-date-picker" ng-class="rangeIsValidClass">' +
                '<div class="fixedrange" ng-hide="showfixedrange">' +
                '<input id="fr1" type="radio" ng-model="fixedRange" value="1" /><label for="fr1" i18n=\'rota.bugun\'></label>' +
                '<input id="fr7" type="radio" ng-model="fixedRange" value="7" /><label for="fr7" i18n=\'rota.sonbirhafta\'></label>' +
                '<input id="fr30" type="radio" ng-model="fixedRange" value="30" /><label for="fr30" i18n=\'rota.sonbiray\'></label>' +
                '<input id="fr180" type="radio" ng-model="fixedRange" value="180" /><label for="fr180" i18n=\'rota.sonaltiay\'></label>' +
                '<input id="fr365" type="radio" ng-model="fixedRange" value="365" /><label for="fr365" i18n=\'rota.sonbiryil\'></label>' +
                '<input id="cus" type="radio" ng-model="fixedRange" value="" ng-click="showfixedrange=true" /><label for="cus" i18n=\'rota.ozel\'></label></div>' +
                '<div ng-show="showfixedrange" class="custom">' +
                '<rt-date-picker ng-model=dateStart date-format="time" class="start"></rt-date-picker>' +
                '<rt-date-picker ng-model=dateEnd date-format="time" class="end"></rt-date-picker>' +
                '</div>'
        };
        return directive;
        //#endregion
    }
    exports.dateRangeDirective = dateRangeDirective;
    //#region Injections
    dateRangeDirective.$inject = ['$parse', 'Config', 'Common'];
    //#endregion
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtdaterange', []);
    module.directive('rtDateRange', dateRangeDirective);
});
