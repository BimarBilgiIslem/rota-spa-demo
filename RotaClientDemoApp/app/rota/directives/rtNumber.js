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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region ngCurrency wrapper
    function numberDirective($compile, constants) {
        function link(scope, element, attrs) {
            element.attr('ng-currency', '');
            element.attr('fraction', attrs.rtNumber || 2);
            element.attr('min', attrs.minValue || constants.MIN_NUMBER_VALUE);
            element.attr('max', attrs.maxValue || constants.MAX_NUMBER_VALUE);
            element.attr('currency-symbol', attrs.currencySymbol || '');
            //required attr does not work in ngCurrency,ng-required works !
            if (angular.isDefined(attrs.required))
                element.attr('ng-required', 'true');
            //remove rtnumber to stop infinite loop
            element.removeAttr("rt-number");
            $compile(element)(scope);
        }
        //#region Directive Definition
        var directive = {
            restrict: 'A',
            terminal: true,
            priority: 1000,
            link: link
        };
        return directive;
        //#endregion
    }
    exports.numberDirective = numberDirective;
    //#endregion
    //#region Injections
    numberDirective.$inject = ['$compile', 'Constants'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtnumber', [])
        .directive('rtNumber', numberDirective);
});
