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
    function panelDirective(localization) {
        function compile(cElement, cAttrs, trancludeFn) {
            return function (scope, element) {
                scope.caption = scope.title || (scope.titleI18n && localization.getLocal(scope.titleI18n));
                var $panelBody = $(".panel-body", element);
                trancludeFn(scope.$parent, function (clonedElement) {
                    angular.forEach(clonedElement, function (node) {
                        if (node.tagName && node.tagName.toLowerCase() === "rt-header") {
                            scope.headingElement = node;
                        }
                        else {
                            $panelBody.append(node);
                        }
                    });
                });
                element.removeAttr('title');
            };
        }
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {
                title: '@',
                titleI18n: '@',
                icon: '@',
                color: '@',
                ngDisabled: '='
            },
            transclude: true,
            controller: function () {
            },
            template: '<div class="panel" ng-class="color ? \'panel-\' + color : \'panel-default\'">' +
                '   <div class="panel-heading" rt-heading-transclude>' +
                '       <h3 class="panel-title"><i ng-class="[\'fa\', \'fa-\' + icon]"></i>&nbsp;{{::caption}}</h3>' +
                '   </div>' +
                '   <div class="panel-body"></div>' +
                '</div>',
            compile: compile
        };
        return directive;
    }
    exports.panelDirective = panelDirective;
    panelDirective.$inject = ['Localization'];
    function headerDirective() {
        var directive = {
            restrict: 'A',
            require: '^rtPanel',
            link: function (scope, element) {
                scope.$watch('headingElement', function (heading) {
                    if (heading) {
                        element.html('');
                        element.append(heading);
                    }
                });
            }
        };
        return directive;
    }
    //#endregion
    //#region Register
    angular.module('rota.directives.rtpanel', [])
        .directive('rtPanel', panelDirective)
        .directive('rtHeadingTransclude', headerDirective);
});
