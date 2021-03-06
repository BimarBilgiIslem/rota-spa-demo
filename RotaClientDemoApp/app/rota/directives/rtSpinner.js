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
define(["require", "exports", "spinner"], function (require, exports, spinner) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Directive
    function spinnerDirective() {
        function link(scope, element, attrs) {
            scope.$watch(attrs.rtSpinner, function (options) {
                if (scope.rtSpinner) {
                    scope.rtSpinner.stop();
                }
                scope.rtSpinner = new spinner(options);
                scope.rtSpinner.spin(element[0]);
            }, true);
        }
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;
    }
    exports.spinnerDirective = spinnerDirective;
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtspinner', []);
    module.directive('rtSpinner', spinnerDirective);
});
