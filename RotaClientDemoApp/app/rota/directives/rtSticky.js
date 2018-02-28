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
    //#region Directive
    function stickyDirective() {
        var directive = {
            restrict: 'A',
            replace: true,
            link: function (scope, elem, attrs) {
                var navH = $("nav").height();
                attrs.$observe('rtSticky', function (value) {
                    if (value === void 0) { value = true; }
                    if (value === true || value === 'true' || value === '') {
                        $(window).scroll(function () {
                            if ($(window).scrollTop() > navH + 30) {
                                $(elem).addClass('sticky-panel');
                            }
                            else {
                                $(elem).removeClass('sticky-panel');
                            }
                        });
                    }
                    else {
                        $(elem).removeClass('sticky-panel');
                    }
                });
            }
        };
        return directive;
    }
    exports.stickyDirective = stickyDirective;
    //#endregion
    //#region Register
    angular.module('rota.directives.rtsticky', [])
        .directive('rtSticky', stickyDirective);
});
