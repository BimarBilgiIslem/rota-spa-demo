define(["require", "exports"], function (require, exports) {
    "use strict";
    //#endregion
    //#region Directive
    function rtFocusDirective($timeout) {
        function link($scope, element, attrs) {
            var focus = function () {
                $timeout(function () {
                    var isInput = element[0] instanceof HTMLInputElement ||
                        element[0] instanceof HTMLButtonElement;
                    if (isInput) {
                        element[0].focus();
                    }
                    else {
                        var input = element.find('input');
                        input && typeof input.focus == "function" && input.focus();
                    }
                }, 0);
            };
            //lazy focus
            if (attrs.rtFocus) {
                $scope.$watch(attrs.rtFocus, function (newValue) {
                    focus();
                });
            }
            else {
                //initial focus
                focus();
            }
        }
        var directive = {
            restrict: 'A',
            priority: -1,
            link: link
        };
        return directive;
    }
    exports.rtFocusDirective = rtFocusDirective;
    rtFocusDirective.$inject = ['$timeout'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtfocus', [])
        .directive('rtFocus', rtFocusDirective);
    //#endregion
});
