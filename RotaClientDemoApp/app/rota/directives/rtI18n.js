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
    i18NDirective.$inject = ['Localization'];
    function i18NDirective(localization) {
        function link(scope, element, attrs) {
            element.text(localization.getLocal(attrs.i18n) || 'Resource (' + attrs.i18n + ')');
        }
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;
    }
    i18NPlaceHolderDirective.$inject = ['Localization'];
    function i18NPlaceHolderDirective(localization) {
        function link(scope, element, attrs) {
            element.attr('placeholder', localization.getLocal(attrs.phI18n) || 'Resource (' + attrs.phI18n + ')');
        }
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;
    }
    //#endregion
    //#region Register
    angular.module('rota.directives.rtI18n', [])
        .directive('i18n', i18NDirective)
        .directive('phI18n', i18NPlaceHolderDirective);
});
