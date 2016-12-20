define(["require", "exports"], function (require, exports) {
    "use strict";
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
    //#endregion
});
