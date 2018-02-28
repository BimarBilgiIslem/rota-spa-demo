define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function contentDirective($compile, $http, $q, $controller, $templateCache, loader, routeconfig, config) {
        var compileWidget = function (options, element, scope, prevScope) {
            //set loading template
            element.html(config.dashboardOptions.widgetLoadingTemplate);
            //load controller & template
            return loader.resolve([options.controllerUrl, options.templateUrl]).then(function (response) {
                //create controller
                var templateScope = scope.$new();
                var templateCtrl = $controller(options.controller, {
                    $scope: templateScope,
                    $stateParams: options.params,
                    stateInfo: { isNestedState: true },
                    widget: options
                });
                templateScope[routeconfig.contentControllerAlias] = templateCtrl;
                //controller getModel promise
                var widgetDataPromise = templateCtrl.modelPromise || $q.when();
                //wait for model being loaded
                widgetDataPromise.finally(function () {
                    //append template
                    element.html(response[1]);
                    //remove rtPagePreview directive if any to prevent recursive compiling 
                    $('[rt-page-preview]', element).remove();
                    //set template
                    element.children().data('$ngControllerController', templateCtrl);
                    $compile(element.contents())(templateScope);
                });
                //remove prev scope
                if (prevScope) {
                    prevScope.$destroy();
                }
                return templateScope;
            }, function (err) {
                element.html("<div class=\"alert alert-danger\"><b>Content loading failed !</b><br>" + err.message + "</div>");
            });
        };
        function link(scope, element, attrs) {
            //parse options
            var options = scope.$eval(attrs.rtContent);
            var currentScope;
            //compile widget
            compileWidget(options, element, scope).then(function (result) {
                currentScope = result;
            });
        }
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;
    }
    exports.contentDirective = contentDirective;
    contentDirective.$inject = ['$compile', '$http', '$q', '$controller', '$templateCache', 'Loader', 'RouteConfig', 'Config'];
    //#region Register
    var module = angular.module('rota.directives.rtcontent', []);
    module.directive('rtContent', contentDirective);
});
