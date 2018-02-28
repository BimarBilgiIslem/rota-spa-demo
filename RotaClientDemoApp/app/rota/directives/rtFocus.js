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
    //#region Directive
    function rtFocusDirective($timeout) {
        function link($scope, element, attrs) {
            var focus = function () {
                $timeout(function () {
                    var isInput = element[0] instanceof HTMLInputElement ||
                        element[0] instanceof HTMLButtonElement;
                    if (isInput) {
                        element[0].focus();
                    }
                    else {
                        var input = element.find('input');
                        input && typeof input.focus == "function" && input.focus();
                    }
                }, 500);
            };
            //lazy focus
            if (attrs.rtFocus) {
                $scope.$watch(attrs.rtFocus, function (newValue) {
                    focus();
                });
            }
            else {
                //initial focus
                focus();
            }
        }
        var directive = {
            restrict: 'A',
            priority: -1,
            link: link
        };
        return directive;
    }
    exports.rtFocusDirective = rtFocusDirective;
    rtFocusDirective.$inject = ['$timeout'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtfocus', [])
        .directive('rtFocus', rtFocusDirective);
});
