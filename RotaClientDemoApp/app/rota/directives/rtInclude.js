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
    //#region ng-include wrapper
    function includeDirective(routing, common) {
        function compile(cElement, cAttrs) {
            function getRelativePath(path) {
                var folders = path.split("/");
                folders.pop();
                return folders.join("/");
            }
            var htmlMarkup = "<ng-include src=\"'{0}'\"></ng-include>";
            var relativePath = getRelativePath(routing.current.templateUrl);
            var absoluteFilePath = common.addTrailingSlash(relativePath) + (cAttrs.name || cAttrs.rtInclude);
            htmlMarkup = htmlMarkup.replace('{0}', absoluteFilePath);
            cElement.append(htmlMarkup);
            return function (scope, element, attrs) {
            };
        }
        //#region Directive Definition
        var directive = {
            restrict: 'AE',
            replace: true,
            compile: compile
        };
        return directive;
        //#endregion
    }
    //#region Injections
    includeDirective.$inject = ['Routing', 'Common'];
    //#endregion
    //#endregion
    //#region Register
    angular.module('rota.directives.rtinclude', [])
        .directive('rtInclude', includeDirective);
});
