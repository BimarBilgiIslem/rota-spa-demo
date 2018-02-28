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
    //#region Controllers
    var DashboardController = (function () {
        function DashboardController(scope, common) {
            this.scope = scope;
            this.common = common;
            this.widgets = [];
        }
        DashboardController.prototype.addWidget = function (options) {
            this.widgets.unshift(options);
        };
        DashboardController.prototype.deleteWidget = function (value) {
        };
        return DashboardController;
    }());
    DashboardController.$inject = ['$scope', 'Common'];
    //#endregion
    //#region Directives
    //Dashboard
    function dashboardDirective() {
        var directive = {
            restrict: 'EA',
            transclude: true,
            controllerAs: 'dashboardVm',
            controller: DashboardController,
            template: '<div class="rtDashboard" ng-transclude></div>',
            bindToController: {}
        };
        return directive;
    }
    //Widget
    function widgetDirective(localization) {
        function link(scope, element, attrs, dashBoardCnt) {
            dashBoardCnt.addWidget(scope.options);
            scope.caption = scope.options.title ||
                (scope.options.titleI18N && localization.getLocal(scope.options.titleI18N));
        }
        var directive = {
            restrict: 'EA',
            require: '^rtDashboard',
            link: link,
            template: '<div ng-class="options.class">' +
                '<div class="panel panel-default">' +
                '<div class="panel-heading">{{caption}}</div>' +
                '<div class="panel-body" rt-content="options">' +
                '</div>' +
                '</div>' +
                '</div>',
            controller: function () { },
            scope: {
                options: '='
            }
        };
        return directive;
    }
    widgetDirective.$inject = ["Localization"];
    //Async Widget
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtdashboard', []);
    module.directive('rtDashboard', dashboardDirective)
        .directive('rtWidget', widgetDirective);
});
