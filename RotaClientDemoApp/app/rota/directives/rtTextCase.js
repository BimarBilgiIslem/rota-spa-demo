define(["require", "exports", "underscore.string"], function (require, exports, _s) {
    "use strict";
    //#endregion
    //#region Directive
    function textCaseDirective($timeout) {
        function link($scope, element, attrs, modelCtrl) {
            var changeCase = function (value) {
                if (!value)
                    return value;
                var result = value;
                switch (attrs.rtTextCase) {
                    case "uppercase":
                        result = value.toLocaleUpperCase();
                        break;
                    case "title":
                        result = _s.titleize(value);
                        break;
                    case "lowercase":
                        result = value.toLocaleLowerCase();
                        break;
                }
                if (result !== value) {
                    modelCtrl.$setViewValue(result);
                    modelCtrl.$render();
                }
                return result;
            };
            modelCtrl.$parsers.unshift(changeCase);
        }
        var directive = {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };
        return directive;
    }
    exports.textCaseDirective = textCaseDirective;
    textCaseDirective.$inject = ['$timeout'];
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rttextcase', []);
    module.directive('rtTextCase', textCaseDirective);
    //#endregion
});
