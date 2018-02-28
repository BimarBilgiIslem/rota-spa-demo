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

//#region Imports
import * as $ from "jquery";
//#endregion

interface IPagePreviewScope extends ng.IScope {
    rtPagePreview: IPagePreviewOptions;
    options: IPagePreviewOptions;
}

//#region Directives
function pagePreviewDirective($compile: ng.ICompileService, routing: IRouting, constants: IConstants) {

    function link(scope: IPagePreviewScope, element: ng.IAugmentedJQuery): void {
        element.removeAttr("rt-page-preview");

        if (!scope.rtPagePreview) throw "page-preview options is missing";
        //add popover
        const popoverElem = $(element).attr({
            "uib-popover-template": "'rota/rtpagepreview.tpl.html'",
            "popover-placement": "auto right",
            "popover-append-to-body": "true",
            "popover-trigger": `'${scope.rtPagePreview.trigger || "outsideClick"}'`,
            "popover-title": "Preview - [{{options.title}}]",
            "popover-class": "rt-page-preview",
            "popover-popup-delay": "200"
        });

        let options = angular.copy(scope.rtPagePreview);
        //update options if state is provided
        if (options.state) {
            const { controllerUrl, controller, templateUrl, hierarchicalMenu } =
                routing.states.firstOrDefault(state => state.name === options.state);
            options = angular.extend({ controllerUrl, controller, templateUrl, title: hierarchicalMenu.title }, options);
        }
        //update preview param
        options.params = angular.extend(options.params || {}, {
            [constants.controller.PREVIEW_MODE_PARAM_NAME]: true
        });
        scope.options = options;
        //compile
        $compile(popoverElem)(scope);
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        link: link,
        priority: 2,
        scope: {
            rtPagePreview: '='
        }
    };
    return directive;
}
pagePreviewDirective.$inject = ['$compile', 'Routing', 'Constants'];

//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtpagepreview', []);
module.directive('rtPagePreview', pagePreviewDirective)
    .run([
        '$templateCache', ($templateCache: ng.ITemplateCacheService) => {
            $templateCache.put('rota/rtpagepreview.tpl.html', '' +
                '<div rt-content="{controllerUrl:options.controllerUrl,' +
                '                  controller:options.controller,' +
                '                  templateUrl:options.templateUrl,' +
                '                  params:options.params}" class="rt-page-preview-content">' +
                '</div>');
        }
    ]);
//#endregion

export { pagePreviewDirective }