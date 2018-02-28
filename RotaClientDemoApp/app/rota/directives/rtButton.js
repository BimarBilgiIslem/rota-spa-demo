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
    function buttonDirective($document, hotkeys, localization, common) {
        var pendingText = localization.getLocal('rota.lutfenbekleyiniz');
        function compile(tElement, tAttrs) {
            var disabledAttr = 'isBusy';
            if (common.isDefined(tAttrs['ngDisabled'])) {
                disabledAttr += " || (" + tAttrs['ngDisabled'] + ")";
            }
            tAttrs.$set('ngDisabled', disabledAttr);
            return function (scope, element, attrs, formCnt) {
                //get original items
                var orjText = scope.text;
                var orjIcon = scope.icon;
                scope.$watchGroup(['textI18n', 'text'], function (data) {
                    orjText = scope.caption = data[1] || (data[0] && localization.getLocal(data[0]));
                });
                //shortcut
                if (angular.isDefined(attrs.shortcut)) {
                    hotkeys.bindTo(scope).add({
                        combo: attrs.shortcut,
                        description: orjText,
                        allowIn: ['INPUT', 'TEXTAREA', 'SELECT'],
                        callback: function () {
                            if (!element.attr('disabled')) {
                                scope.doclick();
                            }
                        }
                    });
                }
                scope.isBusy = false;
                //methods
                var setButtonAttrs = function (buttonAttrs) {
                    scope.caption = buttonAttrs.caption;
                    scope.icon = buttonAttrs.icon + " " + (buttonAttrs.showSpin ? 'fa-spin' : '');
                    scope.isBusy = buttonAttrs.disable;
                };
                var startAjax = function () {
                    setButtonAttrs({ caption: pendingText, icon: 'refresh', showSpin: true, disable: true });
                };
                var endAjax = function () {
                    setButtonAttrs({ caption: orjText, icon: orjIcon, disable: false });
                    //scroll if elem is defined
                    if (scope.elemToScroll && formCnt && formCnt.$valid) {
                        var elem = document.getElementById(scope.elemToScroll);
                        $document.duScrollToElement(angular.element(elem), 0, 750);
                    }
                };
                scope.doclick = function (e) {
                    var result = scope.click(e);
                    if (common.isPromise(result)) {
                        startAjax();
                        result.finally(function () {
                            endAjax();
                        });
                    }
                };
            };
        }
        var directive = {
            restrict: 'AE',
            replace: true,
            require: '?^form',
            scope: {
                text: '@',
                textI18n: '@',
                icon: '@',
                color: '@',
                click: '&',
                size: '@',
                elemToScroll: '@'
            },
            templateUrl: function (elem, attr) { return (angular.isDefined(attr.iconToRight) ?
                'rota/rtbutton-r.tpl.html' : 'rota/rtbutton-l.tpl.html'); },
            compile: compile
        };
        return directive;
    }
    exports.buttonDirective = buttonDirective;
    buttonDirective.$inject = ['$document', 'hotkeys', 'Localization', 'Common'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtbutton', [])
        .directive('rtButton', buttonDirective)
        .run([
        '$templateCache', function ($templateCache) {
            $templateCache.put('rota/rtbutton-r.tpl.html', '<a href ng-class="[\'btn\', \'btn-\' + color,\'btn-\' +size]" ' +
                'tooltip-placement="bottom">' +
                '<span class="hidden-sm hidden-xs">' +
                '{{caption}}</span>&nbsp;<i ng-if="icon" ng-class="[\'fa\', \'fa-\' + icon]"></i></a>');
            $templateCache.put('rota/rtbutton-l.tpl.html', '<button  ng-class="[\'btn\', \'btn-\' + color,\'btn-\' +size]" ng-click="doclick($event)" ' +
                'tooltip-placement="bottom">' +
                '<i ng-if="icon" ng-class="[\'fa\', \'fa-\' + icon]"></i><span class="hidden-sm hidden-xs">' +
                '{{caption}}</span></button>');
        }
    ]);
});
