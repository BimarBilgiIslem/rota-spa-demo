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
    //#region Ui-Tabs wrapper
    //#region Tabs Controller
    var TabsController = (function () {
        function TabsController($rootScope, $state, $scope, common, routing, logger, constants) {
            var _this = this;
            this.$state = $state;
            this.$scope = $scope;
            this.common = common;
            this.routing = routing;
            this.logger = logger;
            this.constants = constants;
            /**
             * Active tab index
             */
            this.activeIndex = 0;
            if (!common.isArray(this.tabs)) {
                throw new Error(constants.errors.MISSING_TABS);
            }
            var offBinds = [];
            ['$stateChangeSuccess', '$stateChangeError', '$stateChangeCancel', '$stateNotFound'].forEach(function (event) {
                offBinds.push($rootScope.$on(event, _this.refresh.bind(_this)));
            });
            $scope.$on('$destroy', function () {
                offBinds.forEach(function (offFn) {
                    offFn();
                });
            });
            this.refresh();
        }
        /**
         * Check if tab is active state
         * @param tab
         */
        TabsController.prototype.isActive = function (tab) {
            return this.$state.includes(tab.activeState || tab.state, tab.params);
        };
        /**
         * Got to tab state
         * @param tab Selected Tab
         */
        TabsController.prototype.go = function (tab) {
            var isCurrentState = this.$state.is(tab.state, tab.params);
            if (!isCurrentState && !tab.disable) {
                this.routing.go(tab.state, tab.params);
                this.onSelected(tab);
            }
        };
        /**
         * Refresh all tabs
         */
        TabsController.prototype.refresh = function () {
            var _this = this;
            var i = 0;
            this.tabs.forEach(function (tab) {
                var state = _this.routing.getState(tab.state);
                if (!_this.common.isAssigned(state)) {
                    _this.logger.console.warn({ message: state + ' not found' });
                    return;
                }
                tab.index = i++;
                tab.badgeType = tab.badgeType || 'alert-info';
                tab.params = tab.params || {};
                tab.disable = tab.disable;
                if (_this.isActive(tab) && !tab.disable) {
                    _this.activeIndex = tab.index;
                }
                tab.heading = tab.heading || state.hierarchicalMenu.title;
                tab.icon = tab.icon || state.hierarchicalMenu.menuIcon;
                if (state.sticky) {
                    tab.tabViewName = tab.tabViewName || state.name;
                }
                else {
                    tab.tabViewName = 'nosticky';
                    _this.isShowRelativeView = true;
                }
            });
        };
        return TabsController;
    }());
    //#endregion
    //#region Injections
    TabsController.$inject = ['$rootScope', '$state', '$scope', 'Common', 'Routing', 'Logger', 'Constants'];
    //#endregion
    //#region Directive Definition
    function tabsDirective() {
        var directive = {
            restrict: 'E',
            replace: true,
            controller: TabsController,
            controllerAs: 'tabvm',
            bindToController: {
                tabs: '=',
                type: '@',
                justified: '@',
                vertical: '@',
                onSelected: '&'
            },
            scope: true,
            template: '<div class="rt-tabs"><uib-tabset active="tabvm.activeIndex" class="tab-container" type="{{tabvm.type}}" vertical="{{tabvm.vertical}}" ' +
                'justified="{{tabvm.justified}}">' + '<uib-tab index="tab.index" class="tab" ng-repeat="tab in tabvm.tabs track by tab.state"' +
                'disable="tab.disable" ng-click="tabvm.go(tab)">' +
                '<uib-tab-heading><i ng-class="[\'fa\', \'fa-\' + tab.icon]"></i> {{::tab.heading}}' +
                '<span ng-show="tab.badge" class="tabbadge badge" ng-class="tab.badgeType">{{tab.badge}}</span> </uib-tab-heading>' +
                '</uib-tab></uib-tabset>' +
                '<div ng-class="[\'body\',tabvm.type]"><div ng-repeat="tab in tabvm.tabs|filter:{tabViewName:\'!nosticky\'}" ng-show="tabvm.$state.includes(\'{{::tab.state}}\')" ' +
                'class="anim-fadein" ui-view="{{::tab.tabViewName}}"></div>' +
                '<div ng-if="tabvm.isShowRelativeView" ui-view></div>' +
                '</div></div>'
        };
        return directive;
    }
    exports.tabsDirective = tabsDirective;
    //#endregion
    //#endregion
    //#region Register
    angular.module('rota.directives.rttabs', [])
        .directive('rtTabs', tabsDirective);
});
