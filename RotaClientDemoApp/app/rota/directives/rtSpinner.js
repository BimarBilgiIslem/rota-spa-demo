define(["require", "exports", "spinner"], function (require, exports, spinner) {
    "use strict";
    //#endregion
    //#region Directive
    function spinnerDirective() {
        function link(scope, element, attrs) {
            scope.$watch(attrs.rtSpinner, function (options) {
                if (scope.rtSpinner) {
                    scope.rtSpinner.stop();
                }
                scope.rtSpinner = new spinner(options);
                scope.rtSpinner.spin(element[0]);
            }, true);
        }
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;
    }
    exports.spinnerDirective = spinnerDirective;
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtspinner', []);
    module.directive('rtSpinner', spinnerDirective);
    //#endregion
});
