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
define(["require", "exports", "underscore.string"], function (require, exports, _s) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Directive
    function textCaseDirective($timeout) {
        function link($scope, element, attrs, modelCtrl) {
            var changeCase = function (value) {
                if (!value)
                    return value;
                var result = value;
                switch (attrs.rtTextCase) {
                    case "uppercase":
                        result = value.toLocaleUpperCase();
                        break;
                    case "title":
                        result = _s.titleize(value);
                        break;
                    case "lowercase":
                        result = value.toLocaleLowerCase();
                        break;
                }
                if (result !== value) {
                    modelCtrl.$setViewValue(result);
                    modelCtrl.$render();
                }
                return result;
            };
            modelCtrl.$parsers.unshift(changeCase);
        }
        var directive = {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };
        return directive;
    }
    exports.textCaseDirective = textCaseDirective;
    textCaseDirective.$inject = ['$timeout'];
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rttextcase', []);
    module.directive('rtTextCase', textCaseDirective);
});
