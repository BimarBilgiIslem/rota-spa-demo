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

import * as $ from "jquery";

//#region Interfaces
interface ILeafScope extends ng.IScope {
    leaf: INavMenuItem;
    url: string;
    initSubMenu: (e: ng.IAngularEvent) => void;
}
//#endregion

//#region Directives
function rtNavMenuDirective() {
    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        scope: {
            trees: '='
        },
        templateUrl: 'template/navbar-tree-li.html'
    };
    return directive;
}


function rtNavMenuItemsDirective() {
    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        scope: {
            tree: '='
        },
        templateUrl: 'template/navbar-ul.html'
    };
    return directive;
}

function rtNavMenuItemDirective($compile: ng.ICompileService) {

    function link(scope: ILeafScope, element: ng.IAugmentedJQuery) {
        if (!scope.leaf.subtree || !scope.leaf.subtree.length) return;
        /**
         * Check for available room for ul.dropdown-menu vertically and horizontally.
         */
        scope.initSubMenu = (e: ng.IAngularEvent) => {
            if (typeof element.offset !== "function") return;

            const docW = $(window).width(),
                docH = $(window).height();

            const liOffset = element.offset();
            const $ul = $('ul', element).eq(0);
            //horizantal direction
            const w = liOffset.left + element.width() + $ul.width();
            if (w < docW) {
                $ul.css({ "left": "100%", "right": "auto" });
            } else {
                $ul.css({ "left": "auto", "right": "100%" });
            }
            //vertical scrolling
            const h = $ul.offset().top - $(document).scrollTop() + $ul.height();
            if (h > docH) {
                $ul.addClass("scrollable-menu").css("max-height", docH - $ul.offset().top);
            }
        }

        element.append('<rt-nav-menu-items tree=\"leaf.subtree\"></rt-nav-menu-items>').addClass('dropdown-submenu');
        $compile(element.contents())(scope);
    }

    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        scope: {
            leaf: '='
        },
        templateUrl: 'template/navbar-li.html',
        link: link
    };
    return directive;
}
rtNavMenuItemDirective.$inject = ['$compile'];
//#endregion

//#region Register
angular.module('rota.directives.rtnavmenu', ['ui.bootstrap', 'ui.router'])
    .directive('rtNavMenu', rtNavMenuDirective)
    .directive('rtNavMenuItems', rtNavMenuItemsDirective)
    .directive('rtNavMenuItem', rtNavMenuItemDirective)
    .run([
        "$templateCache", ($templateCache: ng.ITemplateCacheService) => {
            $templateCache.put("template/navbar-tree-li.html",
                "<ul class=\"nav navbar-nav\">\n" +
                "    <li ng-repeat=\"tree in trees\" uib-dropdown>\n" +
                "       <a href=\"#\" uib-dropdown-toggle>\n" +
                "          <i ng-if=\"tree.icon\" class=\"fa fa-fw\" ng-class=\"'fa-'+tree.icon\"></i>\n" +
                "          {{tree.text}}<span class='caret'></span>" +
                "       </a>\n" +
                "       <rt-nav-menu-items tree='tree.subtree'></rt-nav-menu-items>\n" +
                "    </li>" +
                "</ul>");

            $templateCache.put("template/navbar-ul.html",
                "<ul uib-dropdown-menu>\n" +
                "    <rt-nav-menu-item ng-repeat='leaf in tree' leaf='leaf'></rt-nav-menu-item>\n" +
                "</ul>");

            $templateCache.put("template/navbar-li.html",
                "<li ng-mouseover=\"initSubMenu($event)\" ng-class=\"{divider: leaf.text == 'divider'}\">\n" +
                "    <a href=\"{{leaf.url}}\" ng-if=\"leaf.text !== 'divider'\">\n" +
                "        <i ng-if=\"leaf.icon\" class=\"fa fa-fw\" ng-class=\"'fa-'+leaf.icon\"></i>&nbsp;{{leaf.text}}\n" +
                "    </a>\n" +
                "</li>");
        }
    ]);
//#endregion

export { rtNavMenuDirective }