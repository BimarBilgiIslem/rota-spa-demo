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

//#region Directive
function stickyDirective() {
    const directive = <ng.IDirective>{
        restrict: 'A',
        replace: true,
        link: (scope: ng.IScope, elem: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
            const navH = $("nav").height();

            attrs.$observe('rtSticky', (value: boolean | string = true) => {
                if (value === true || value === 'true' || value === '') {
                    $(window).scroll(() => {
                        if ($(window).scrollTop() > navH + 30) {
                            $(elem).addClass('sticky-panel');
                        } else {
                            $(elem).removeClass('sticky-panel');
                        }
                    });
                } else {
                    $(elem).removeClass('sticky-panel');
                }
            });
        }
    };
    return directive;
}
//#endregion

//#region Register
angular.module('rota.directives.rtsticky', [])
    .directive('rtSticky', stickyDirective);
//#endregion
export { stickyDirective }