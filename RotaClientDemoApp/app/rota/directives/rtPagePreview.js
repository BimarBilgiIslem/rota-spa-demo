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
define(["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Directives
    function pagePreviewDirective($compile, routing, constants) {
        function link(scope, element) {
            element.removeAttr("rt-page-preview");
            if (!scope.rtPagePreview)
                throw "page-preview options is missing";
            //add popover
            var popoverElem = $(element).attr({
                "uib-popover-template": "'rota/rtpagepreview.tpl.html'",
                "popover-placement": "auto right",
                "popover-append-to-body": "true",
                "popover-trigger": "'" + (scope.rtPagePreview.trigger || "outsideClick") + "'",
                "popover-title": "Preview - [{{options.title}}]",
                "popover-class": "rt-page-preview",
                "popover-popup-delay": "200"
            });
            var options = angular.copy(scope.rtPagePreview);
            //update options if state is provided
            if (options.state) {
                var _a = routing.states.firstOrDefault(function (state) { return state.name === options.state; }), controllerUrl = _a.controllerUrl, controller = _a.controller, templateUrl = _a.templateUrl, hierarchicalMenu = _a.hierarchicalMenu;
                options = angular.extend({ controllerUrl: controllerUrl, controller: controller, templateUrl: templateUrl, title: hierarchicalMenu.title }, options);
            }
            //update preview param
            options.params = angular.extend(options.params || {}, (_b = {},
                _b[constants.controller.PREVIEW_MODE_PARAM_NAME] = true,
                _b));
            scope.options = options;
            //compile
            $compile(popoverElem)(scope);
            var _b;
        }
        var directive = {
            restrict: 'A',
            link: link,
            priority: 2,
            scope: {
                rtPagePreview: '='
            }
        };
        return directive;
    }
    exports.pagePreviewDirective = pagePreviewDirective;
    pagePreviewDirective.$inject = ['$compile', 'Routing', 'Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtpagepreview', []);
    module.directive('rtPagePreview', pagePreviewDirective)
        .run([
        '$templateCache', function ($templateCache) {
            $templateCache.put('rota/rtpagepreview.tpl.html', '' +
                '<div rt-content="{controllerUrl:options.controllerUrl,' +
                '                  controller:options.controller,' +
                '                  templateUrl:options.templateUrl,' +
                '                  params:options.params}" class="rt-page-preview-content">' +
                '</div>');
        }
    ]);
});
