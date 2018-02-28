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
interface IContentAttributes extends ng.IAttributes {
    rtContent: string;
}

function contentDirective($compile: ng.ICompileService, $http: ng.IHttpService,
    $q: ng.IQService, $controller: ng.IControllerService, $templateCache: ng.ITemplateCacheService,
    loader: ILoader, routeconfig: IRouteConfig, config: IMainConfig) {

    const compileWidget = (options: IContentOptions, element: ng.IAugmentedJQuery,
        scope: ng.IScope, prevScope?: ng.IScope): IP<ng.IScope> => {
        //set loading template
        element.html(config.dashboardOptions.widgetLoadingTemplate);
        //load controller & template
        return loader.resolve([options.controllerUrl, options.templateUrl]).then(response => {
            //create controller
            const templateScope = scope.$new();
            const templateCtrl = $controller<IBaseModelController<IBaseCrudModel>>(options.controller,
                {
                    $scope: templateScope,
                    $stateParams: options.params,
                    stateInfo: { isNestedState: true },
                    widget: options
                });
            templateScope[routeconfig.contentControllerAlias] = templateCtrl;
            //controller getModel promise
            const widgetDataPromise = templateCtrl.modelPromise || $q.when();
            //wait for model being loaded
            widgetDataPromise.finally(() => {
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
        }, (err: RequireError) => {
            element.html(`<div class="alert alert-danger"><b>Content loading failed !</b><br>${err.message}</div>`);
        });
    }

    function link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: IContentAttributes): void {
        //parse options
        const options = scope.$eval(attrs.rtContent) as IContentOptions;
        let currentScope: ng.IScope;
        //compile widget
        compileWidget(options, element, scope).then(result => {
            currentScope = result;
        });
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        link: link
    };
    return directive;
}

contentDirective.$inject = ['$compile', '$http', '$q', '$controller', '$templateCache', 'Loader', 'RouteConfig', 'Config'];

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtcontent', []);
module.directive('rtContent', contentDirective);
//#endregion

export { contentDirective }