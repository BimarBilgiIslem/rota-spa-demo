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

//#region Directive
function navProfileDirective(routeconfig: IRouteConfig) {
    const directive = <ng.IDirective>{
        restrict: 'AE',
        controller: 'ProfileController',
        controllerAs: 'profilevm',
        templateUrl: () => {
            return routeconfig.templates.userprofile;
        }
    };
    return directive;
}
navProfileDirective.$inject = ['RouteConfig'];
//#endregion

//#region Register
angular.module('rota.directives.rtnavprofile', [])
    .directive('rtNavProfile', navProfileDirective);
//#endregion

export { navProfileDirective }