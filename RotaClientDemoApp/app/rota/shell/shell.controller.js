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
//#region Shell Controller
/**
 * Shell controller
 */
var ShellController = (function () {
    //#endregion
    //#region Init
    function ShellController($rootScope, $scope, $location, $window, routing, config, dialogs, constants, currentUser, currentCompany, routeconfig, titleBadges, common) {
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$location = $location;
        this.$window = $window;
        this.routing = routing;
        this.config = config;
        this.dialogs = dialogs;
        this.constants = constants;
        this.currentUser = currentUser;
        this.currentCompany = currentCompany;
        this.routeconfig = routeconfig;
        this.titleBadges = titleBadges;
        this.common = common;
        //init settings
        this.setSpinner();
        this.setActiveMenuListener();
        //initial vars
        if (config.homePageOptions) {
            this.bgImageUrl = config.homePageOptions.imageUri &&
                { 'background-image': "url(" + config.homePageOptions.imageUri + ")" };
            this.vidOptions = config.homePageOptions.videoOptions;
            this.isHomePage = $location.url() === config.homePageOptions.url;
        }
        $rootScope.appTitle = '';
        $rootScope.forms = {};
        this.isMobileOrTablet = common.isMobileOrTablet();
        this.currentYear = (new Date()).getFullYear();
    }
    Object.defineProperty(ShellController.prototype, "isBusy", {
        get: function () { return this._isBusy; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShellController.prototype, "spinnerOptions", {
        get: function () { return this._spinnerOptions; },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Shell Methods
    /**
    * Set spinner settings
    */
    ShellController.prototype.setSpinner = function () {
        var _this = this;
        //register main spinner events
        this.$rootScope.$on(this.config.eventNames.ajaxStarted, function () {
            _this._isBusy = true;
        });
        this.$rootScope.$on(this.config.eventNames.ajaxFinished, function () {
            _this._isBusy = false;
        });
    };
    /**
     * Set active menu & app title
     */
    ShellController.prototype.setActiveMenuListener = function () {
        var _this = this;
        this.$scope.$watch(function () { return _this.routing.activeMenu; }, function (menu) {
            _this.$rootScope.appTitle = menu ? (menu.localizedTitle + " - " + _this.config.appTitle) : _this.config.appTitle;
            if (_this.config.homePageOptions)
                _this.isHomePage = _this.$location.url() === _this.config.homePageOptions.url;
            //set viewpot width size
            _this.viewPortClass =
                (_this.config.enableContainerFluid || (menu && menu.isFullScreen)) ? 'container-fluid' : 'container';
        });
    };
    /**
    * Refresh state
    */
    ShellController.prototype.refresh = function () {
        this.routing.reload();
    };
    /**
     * Quick menu transition
     * @param quickMenu QuickMenu
     */
    ShellController.prototype.goQuickmenu = function (quickMenu) {
        if (!quickMenu)
            return;
        if (quickMenu.url) {
            this.$window.location.replace(quickMenu.url);
        }
        else {
            this.routing.go(quickMenu.state);
        }
    };
    /**
     * Shows nav menus & settings modal for small devices
     */
    ShellController.prototype.showNavMenu = function () {
        this.dialogs.showModal({
            isSideBar: true,
            windowClass: 'side-nav',
            viewPortSize: true,
            absoluteTemplateUrl: this.routeconfig.templates.navmenumobile,
            controller: 'ProfileModalController',
            controllerAs: 'profilevm'
        });
    };
    /**
     * Set Mbf visibility
     * @description Only visible in main page on mobile device.
     */
    ShellController.prototype.isMbfVisible = function () {
        return (!this.isMobileOrTablet || this.isHomePage) &&
            this.config.enableQuickMenu && this.routing.quickMenus.length > 0;
    };
    return ShellController;
}());
//#endregion
//#region Injection
ShellController.$inject = ['$rootScope', '$scope', '$location', '$window', 'Routing', 'Config',
    'Dialogs', 'Constants', 'CurrentUser', 'CurrentCompany', 'RouteConfig', 'TitleBadges', 'Common'];
//#endregion
//#region Register
var module = angular.module('rota.shell', []);
module.controller('ShellController', ShellController);
//#endregion
