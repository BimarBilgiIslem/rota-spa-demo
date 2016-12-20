define(["require", "exports"], function (require, exports) {
    "use strict";
    //#endregion
    //#region ng-include wrapper
    function includeDirective(routing, common) {
        function compile(cElement, cAttrs) {
            function getRelativePath(path) {
                var folders = path.split("/");
                folders.pop();
                return folders.join("/");
            }
            var htmlMarkup = "<ng-include src=\"'{0}'\"></ng-include>";
            var relativePath = getRelativePath(routing.current.templateUrl);
            var absoluteFilePath = common.addTrailingSlash(relativePath) + (cAttrs.name || cAttrs.rtInclude);
            htmlMarkup = htmlMarkup.replace('{0}', absoluteFilePath);
            cElement.append(htmlMarkup);
            return function (scope, element, attrs) {
            };
        }
        //#region Directive Definition
        var directive = {
            restrict: 'AE',
            replace: true,
            compile: compile
        };
        return directive;
        //#endregion
    }
    //#region Injections
    includeDirective.$inject = ['Routing', 'Common'];
    //#endregion
    //#endregion
    //#region Register
    angular.module('rota.directives.rtinclude', [])
        .directive('rtInclude', includeDirective);
    //#endregion
});
