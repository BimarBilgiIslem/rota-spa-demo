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
    //#endregion
    //#region Directive
    function rtInfoDirective($compile) {
        function link(scope, element, attrs) {
            var infoElem = $('<i/>').addClass("fa fa-info-circle rt-info")
                .attr({
                "uib-popover": attrs.rtInfo,
                "popover-placement": "auto bottom-left",
                "popover-append-to-body": "true",
                "popover-trigger": "'mouseenter'"
            });
            var $infoElem = $compile(infoElem)(scope);
            $($infoElem).prependTo(element);
            element.removeAttr("rt-info");
        }
        var directive = {
            restrict: 'A',
            link: link,
            //run after i18n directive
            priority: 2
        };
        return directive;
    }
    exports.rtInfoDirective = rtInfoDirective;
    rtInfoDirective.$inject = ['$compile'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtinfo', [])
        .directive('rtInfo', rtInfoDirective);
});
