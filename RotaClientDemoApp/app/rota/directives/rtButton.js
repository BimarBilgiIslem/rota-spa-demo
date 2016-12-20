define(["require", "exports"], function (require, exports) {
    "use strict";
    //#endregion
    //#region Directive
    function buttonDirective(hotkeys, localization, common) {
        var pendingText = localization.getLocal('rota.lutfenbekleyiniz');
        function compile(tElement, tAttrs) {
            var disabledAttr = 'isBusy';
            if (common.isDefined(tAttrs['ngDisabled'])) {
                disabledAttr += " || (" + tAttrs['ngDisabled'] + ")";
            }
            tAttrs.$set('ngDisabled', disabledAttr);
            return function (scope, element, attrs) {
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
            scope: {
                text: '@',
                textI18n: '@',
                icon: '@',
                color: '@',
                click: '&',
                size: '@'
            },
            templateUrl: function (elem, attr) { return (angular.isDefined(attr.iconToRight) ?
                'rota/rtbutton-r.tpl.html' : 'rota/rtbutton-l.tpl.html'); },
            compile: compile
        };
        return directive;
    }
    exports.buttonDirective = buttonDirective;
    buttonDirective.$inject = ['hotkeys', 'Localization', 'Common'];
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
    //#endregion
});
