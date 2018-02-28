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
define(["require", "exports", "tslib", "underscore", "./routing.config", "./loader.service"], function (require, exports, tslib_1, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Routing Service
    /**
     * This service wrapper of ui-router services and responsible for menus and static states
     */
    var Routing = (function () {
        //ctor
        function Routing($window, $state, $stateParams, $rootScope, $q, $urlRouter, $location, $stickyState, $urlMatcherFactory, $timeout, $stateProvider, $urlRouterProvider, routeconfig, loader, common, config, logger, localization, base64, constants, caching, environment, $uibModalStack) {
            this.$window = $window;
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.$rootScope = $rootScope;
            this.$q = $q;
            this.$urlRouter = $urlRouter;
            this.$location = $location;
            this.$stickyState = $stickyState;
            this.$urlMatcherFactory = $urlMatcherFactory;
            this.$timeout = $timeout;
            this.$stateProvider = $stateProvider;
            this.$urlRouterProvider = $urlRouterProvider;
            this.routeconfig = routeconfig;
            this.loader = loader;
            this.common = common;
            this.config = config;
            this.logger = logger;
            this.localization = localization;
            this.base64 = base64;
            this.constants = constants;
            this.caching = caching;
            this.environment = environment;
            this.$uibModalStack = $uibModalStack;
            //#region Props
            this.serviceName = "Routing Service";
            this.newItemParamNameRegex = new RegExp("/:" + this.constants.controller.DEFAULT_NEW_ITEM_PARAM_NAME + "$");
            //Register static states and events
            this.init();
            //static shell state octates count, default "shell.content" 
            this.shellContentStateOctateLen = this.constants.routing.SHELL_CONTENT_STATE_NAME.split('.').length;
        }
        Object.defineProperty(Routing.prototype, "states", {
            get: function () { return this._states; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Routing.prototype, "hierarchicalMenus", {
            get: function () { return this._hierarchicalMenus; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Routing.prototype, "navMenus", {
            get: function () { return this._navMenus; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Routing.prototype, "activeMenu", {
            get: function () { return this._activeMenu; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Routing.prototype, "breadcrumbs", {
            get: function () { return this._breadcrumbs; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Routing.prototype, "current", {
            /**
             * Get current state
             * @returns IRotaState{}
             */
            get: function () { return this.$state.current; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Routing.prototype, "currentUrl", {
            /**
             * Get currrent states url
             * @returns {}
             */
            get: function () {
                return this.getUrlByState(this.current.name, this.$stateParams);
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Register static states and events
        */
        Routing.prototype.init = function () {
            //Master Page sections register
            this.registerShellSections();
            //Map static maps
            this.registerStaticPages();
            //State eventleri register ediyoruz
            this.registerEvents();
            //Register custom types
            this.registerCustomTypes();
        };
        //#endregion
        //#region Register Methods
        /**
         * Register custom types
         */
        Routing.prototype.registerCustomTypes = function () {
            var _this = this;
            //encoded param
            this.$urlMatcherFactory.type('encoded', {
                encode: function (val, key) {
                    return _this.base64.encode(val);
                },
                decode: function (val, key) {
                    return _this.base64.decode(val);
                },
                is: function (val, key) {
                    return true;
                }
            });
        };
        /**
            * Register state events
            */
        Routing.prototype.registerEvents = function () {
            var _this = this;
            this.$rootScope.$on(this.constants.events.EVENT_STATE_CHANGE_SUCCESS, function (event, toState) {
                if (!toState)
                    return;
                /**
                 * Set breadcrumb datasource
                 */
                var setBreadcrumb = function () {
                    var menu = _this.getActiveMenu(toState);
                    var routelist = [];
                    while (menu) {
                        routelist.push({
                            text: menu.localizedTitle,
                            url: menu.absoluteUrl,
                            icon: menu.menuIcon
                        });
                        menu = menu.parentMenu;
                    }
                    _this._breadcrumbs = routelist.reverse();
                };
                /**
                 * Set current main menu
                 */
                var setActiveMenu = function () {
                    var menu = _this.getActiveMenu(toState);
                    if (toState.name === _this.constants.routing.SHELL_STATE_NAME || menu !== _this.activeMenu) {
                        _this._activeMenu = menu;
                        //set breadcrumb only when menu changes
                        setBreadcrumb();
                    }
                };
                setActiveMenu();
                /**
                 * Close all opened modals when state has changed with success
                 */
                _this.$uibModalStack.dismissAll();
            });
            this.$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                if (!error)
                    return;
                switch (error.status) {
                    //Not found
                    case 404:
                        _this.go(_this.constants.routing.NOT_FOUND_STATE_NAME);
                        break;
                    //Internal Error
                    case 500:
                        _this.go(_this.constants.routing.INTERNAL_ERROR_STATE_NAME);
                        break;
                }
            });
        };
        /**
         * Register static pages
         */
        Routing.prototype.registerStaticPages = function () {
            //404 page
            this.$stateProvider.state(this.constants.routing.NOT_FOUND_STATE_NAME, { url: 'error404', templateUrl: this.routeconfig.templates.error404 });
            //500 page
            this.$stateProvider.state(this.constants.routing.INTERNAL_ERROR_STATE_NAME, { url: 'error500', templateUrl: this.routeconfig.templates.error500 });
        };
        /**
         * Register shell section
         * @param statename State name
         * @param sections Sections
         * @param url url
         * @param sticky Sticky flag
         * @param resolve Resolve promise
         */
        Routing.prototype.registerShellSection = function (statename, sections, abstract, url, sticky, resolve) {
            var views = {};
            sections.forEach(function (section) {
                for (var state in section) {
                    if (section.hasOwnProperty(state)) {
                        views[state] = {
                            templateUrl: section[state].templateUrl,
                            controller: section[state].controller,
                            controllerAs: section[state].controllerAs
                        };
                    }
                }
            });
            this.$stateProvider.state(statename, {
                abstract: abstract,
                url: url,
                views: views,
                sticky: sticky,
                resolve: resolve
            });
        };
        /**
        * Register shell sections
        */
        Routing.prototype.registerShellSections = function () {
            var shellSections = [
                {
                    'shell@': {
                        templateUrl: this.routeconfig.templates.shell,
                        controller: this.constants.routing.SHELL_CONTROLLER_NAME,
                        controllerAs: this.routeconfig.shellControllerAlias
                    }
                },
                { 'header@shell': { templateUrl: this.routeconfig.templates.header } }
            ], contentSections = [{ '@shell': { templateUrl: this.routeconfig.templates.content } },
                { 'breadcrumb@shell.content': { templateUrl: this.routeconfig.templates.breadcrumb } },
                { 'badges@shell.content': { templateUrl: this.routeconfig.templates.badges } },
                { 'actions@shell.content': { templateUrl: this.routeconfig.templates.actions } },
                { 'currentcompany@shell.content': { templateUrl: this.routeconfig.templates.currentcompany } },
                { 'title@shell.content': { templateUrl: this.routeconfig.templates.title } }];
            //register shell state
            //UNDONE:add shell promise
            this.registerShellSection(this.constants.routing.SHELL_STATE_NAME, shellSections, false, this.environment.baseUrl || '/', true);
            //register content state
            this.registerShellSection(this.constants.routing.SHELL_CONTENT_STATE_NAME, contentSections, true);
        };
        /**
         * Register state
         * @param state State
         */
        Routing.prototype.registerState = function (state) {
            var _this = this;
            //only state name defined and host's name is matched
            if (!state.name || (state.host && this.config.host !== state.host))
                return this;
            //check if already defined
            if (this.getState(state.name)) {
                this.logger.console.warn({ message: 'state already registered ' + state.name });
                return this;
            }
            //is nested state
            var isNestedState = this.isNestedState(state.name);
            //adjust url
            var url = ((state.url && (isNestedState ? '/' + state.url : state.url)) || '');
            //check /:id param is available in state url.if available,this is a crud page
            if (this.newItemParamNameRegex.test(url)) {
                var idParamName = this.constants.controller.DEFAULT_NEW_ITEM_PARAM_NAME;
                var idParamValue = this.constants.controller.DEFAULT_NEW_ITEM_PARAM_VALUE;
                //replace :id param to more strict type.id must be either numeric value or 'new' value
                url = url.replace(":" + idParamName, "{" + idParamName + ":[0-9]+|" + idParamValue + "}");
                //default params for crud pages
                var defaultParams = (_a = {},
                    _a[idParamName] = idParamValue,
                    _a[this.constants.controller.DEFAULT_READONLY_PARAM_NAME] = true,
                    _a[this.constants.controller.PREVIEW_MODE_PARAM_NAME] = false,
                    _a);
                state.params = tslib_1.__assign({}, defaultParams, state.params);
            }
            //define state obj
            var stateObj = {
                hierarchicalMenu: state.hierarchicalMenu,
                abstract: state.abstract,
                templateProvider: function () {
                    return _this.loader.resolve(state.templateUrl);
                },
                controller: state.controller,
                controllerAs: this.routeconfig.contentControllerAlias,
                url: url,
                params: state.params,
                isNestedState: isNestedState,
                resolve: {
                    stateInfo: function () {
                        return {
                            isNestedState: isNestedState,
                            stateName: state.name,
                            isStickyTab: state.sticky
                        };
                    },
                    $modalInstance: angular.noop,
                    modalParams: angular.noop
                }
            };
            //sticky settings 
            if (state.sticky) {
                var views = {};
                views[state.name] = {
                    controller: state.controller,
                    templateProvider: function () {
                        return _this.loader.resolve(state.templateUrl);
                    },
                    controllerAs: this.routeconfig.contentControllerAlias
                };
                stateObj.views = views;
                stateObj.sticky = true;
            }
            //controller load
            if (angular.isString(stateObj.controller)) {
                var cntResolve = { load: function () { return _this.loader.resolve(state.controllerUrl); } };
                stateObj.resolve = angular.extend(stateObj.resolve, cntResolve);
            }
            else {
                //if no controller defined and abstract is set,generic template injected here
                if (state.abstract) {
                    stateObj.template = '<div ui-view></div>';
                }
            }
            //register
            this.$stateProvider.state(state.name, stateObj);
            return this;
            var _a;
        };
        //#endregion
        //#region Menu Methods
        /**
        * Add states with menu definitions
        * @param states States
        */
        Routing.prototype.addMenus = function (states) {
            var _this = this;
            this._states = states || [];
            //create hierarchical & navbar menus
            this._hierarchicalMenus = this.createHierarchicalMenus();
            //register states
            try {
                this._states.forEach(function (state) {
                    _this.registerState(state);
                });
                //create nav menus *this must be called after registration of states*
                this._navMenus = this.createNavMenus();
                //add quick menus
                this.createQuickMenus();
            }
            finally {
                this.$urlRouter.sync();
                this.$urlRouter.listen();
            }
            return this;
        };
        /**
         * Create nav menu items
         * @param menus
         */
        Routing.prototype.createNavMenus = function (menus, parent) {
            var _this = this;
            var navMenus = [];
            (menus || this._hierarchicalMenus).where(function (menu) { return menu.isMenu; })
                .forEach(function (menu) {
                if (menu.startGroup) {
                    navMenus.push({ text: 'divider' });
                }
                var navMenu = {
                    text: menu.localizedTitle,
                    url: _this.getMenuAbsoluteUrl(menu),
                    icon: menu.menuIcon,
                    parent: parent
                };
                navMenu.subtree = menu.subMenus && _this.createNavMenus(menu.subMenus, navMenu);
                navMenus.push(navMenu);
                //update url on menu
                menu.absoluteUrl = navMenu.url;
            });
            return navMenus;
        };
        /**
         * Create NavBar menus
         */
        Routing.prototype.createHierarchicalMenus = function () {
            var rootMenus = this.getMenusByParentId();
            if (!rootMenus.length) {
                this.logger.console.error({ message: this.constants.errors.NOT_ROOT_MENU_FOUND });
            }
            //generate menus recursively
            return this.createHierarchicalMenusRecursive(rootMenus);
        };
        /**
         * Create nav menu items recursively
         * @param parentMenus Parent Menus
         * @param parentNavMenu Parent Menu
         */
        Routing.prototype.createHierarchicalMenusRecursive = function (parentMenus, parentMenu) {
            var _this = this;
            var menus = [];
            parentMenus.forEach(function (state) {
                //create hierarchical menu
                var menu = angular.copy(state);
                //set helper props
                menu.localizedTitle = state.title || (state.titleI18N && _this.localization.getLocal(state.titleI18N));
                menu.parentMenu = parentMenu;
                //create subnav menus
                var subMenus = _this.getMenusByParentId(state.id);
                if (subMenus.length) {
                    menu.subMenus = _this.createHierarchicalMenusRecursive(subMenus, menu);
                }
                menus.push(menu);
                //update state 
                state.hierarchicalMenu = menu;
            });
            return menus;
        };
        /**
         * Add quick menus
         */
        Routing.prototype.createQuickMenus = function () {
            var _this = this;
            //default quickmenus
            var qMenus = this._states.where(function (state) { return state.isQuickMenu; }).map(function (menu) {
                return {
                    url: menu.menuUrl,
                    text: menu.hierarchicalMenu.localizedTitle,
                    icon: menu.menuIcon,
                    state: menu.name
                };
            });
            //user-defined quickmenus
            var staleMenus = [], uqMenus = this.caching.localStorage.get(this.constants.routing.QUICKMENU_STORAGE_KEY) || [];
            uqMenus.forEach(function (sname) {
                var state;
                if (state = _this.getState(sname)) {
                    var menu = _this.getActiveMenu(state);
                    menu.isQuickMenu = true;
                    qMenus.push({
                        text: menu.localizedTitle,
                        icon: menu.menuIcon,
                        state: sname
                    });
                }
                else {
                    staleMenus.push(sname);
                }
            });
            //add
            this.quickMenus = qMenus.slice(0, this.constants.routing.MAX_QUICKMENU_LEN);
            //remove stale states if any 
            if (staleMenus.length) {
                uqMenus.delete(function (sname) { return staleMenus.indexOf(sname) > -1; });
                this.caching.localStorage.store(this.constants.routing.QUICKMENU_STORAGE_KEY, uqMenus);
            }
        };
        /**
         * Add current menu to quick menus
         */
        Routing.prototype.addCurrentMenuToQuickMenus = function () {
            var qmenus = this.caching.localStorage.get(this.constants.routing.QUICKMENU_STORAGE_KEY) || [];
            var selInd = qmenus.indexOf(this.current.name);
            if (!this.activeMenu.isQuickMenu) {
                if (selInd === -1) {
                    if (this.quickMenus.length >= this.constants.routing.MAX_QUICKMENU_LEN) {
                        this.logger.toastr.warn({
                            message: this.localization.getLocal("rota.hizliemenuadetkisiti", this.constants.routing.MAX_QUICKMENU_LEN)
                        });
                        return;
                    }
                    qmenus.push(this.current.name);
                    this.activeMenu.isQuickMenu = true;
                }
            }
            else {
                if (selInd > -1) {
                    qmenus.splice(selInd, 1);
                    this.activeMenu.isQuickMenu = false;
                }
                else {
                    this.logger.toastr.warn({
                        message: this.localization.getLocal("rota.hizlimenusilmehatasi")
                    });
                    return;
                }
            }
            this.caching.localStorage.store(this.constants.routing.QUICKMENU_STORAGE_KEY, qmenus);
            this.createQuickMenus();
        };
        //#endregion
        //#region Utils
        /**
        * Get base host url
        * @returns {string}
        */
        Routing.prototype.getHostUrl = function () {
            return location.protocol + "//" + location.host;
        };
        /**
        * Go to state
        * @param stateName State name
        * @param params State params
        * @param options State options
        */
        Routing.prototype.go = function (stateName, params, options) {
            return this.$state.go(stateName, params, options);
        };
        /**
         * Change address bar url without reloading
         * @param params
         */
        Routing.prototype.changeUrl = function (params) {
            return this.go(this.current.name, params, { notify: false, reload: false });
        };
        /**
         * Reload state
         */
        Routing.prototype.reload = function () {
            return this.$state.reload();
        };
        /**
         * Go preview page
         */
        Routing.prototype.goBack = function () {
            this.$window.history.go(-1);
        };
        /**
         * Full reload
         */
        Routing.prototype.reloadBrowser = function () {
            this.$window.location.replace("");
        };
        /**
         * Set the startup state when app get bootstrapped
         * @param defaultState Startup state
         * @param params State params
         */
        Routing.prototype.start = function (defaultState, params) {
            var _this = this;
            var currentUrl = this.$location.url();
            if (currentUrl === "" || currentUrl === "/") {
                this.$timeout(function () {
                    _this.go(defaultState || _this.constants.routing.SHELL_STATE_NAME, params);
                }, 0);
            }
        };
        /**
         * Get href uri from state
         * @param stateName State Name
         * @param params Optional params
         */
        Routing.prototype.getUrlByState = function (stateName, params) {
            if (!stateName)
                return null;
            return this.$state.href(stateName, params);
        };
        /**
            * Check state is active
            * @param stateName State name
            * @param params Optional Params
            */
        Routing.prototype.isActive = function (stateName, params) {
            return this.$state.is(stateName, params);
        };
        /**
        * Check state is in active pipeline
        * @param stateName State name
        * @param params Optional Params
        */
        Routing.prototype.isInclude = function (stateName, params) {
            return this.$state.includes(stateName, params);
        };
        /**
        * Get states by parentId
        * @param parentId State parentId
        */
        Routing.prototype.getMenusByParentId = function (parentId) {
            var _this = this;
            var menus = _.filter(this._states, function (item) {
                if (_this.common.isAssigned(parentId)) {
                    return item.parentId === parentId;
                }
                return !_this.common.isAssigned(item.parentId);
            });
            return _.sortBy(menus, this.constants.controller.DEFAULT_MODEL_ORDER_FIELD_NAME);
        };
        /**
        * Get state by name
        * @param stateName
        */
        Routing.prototype.getState = function (stateName) {
            if (!stateName)
                return undefined;
            return this.$state.get(stateName);
        };
        /**
         * Get absolute uri of menu
         * @param menu Menu
         */
        Routing.prototype.getMenuAbsoluteUrl = function (menu) {
            var reluri = menu.menuUrl ||
                (menu.name && this.$state.href(menu.name, menu.params)) ||
                (menu.url && /[^?|:]*/.exec(menu.url)[0]);
            if (reluri && menu.host && menu.host !== this.config.host) {
                var moduleUrl = this.environment.doms[menu.host];
                if (!this.common.isNullOrEmpty(moduleUrl)) {
                    reluri = "" + this.common.addTrailingSlash(moduleUrl) + reluri;
                }
                else {
                    this.logger.console.error({ message: menu.host + " is not defined in environment.doms." + reluri + " will be the returned" });
                }
            }
            return reluri;
        };
        /**
         * Returns whether provided state is nested
         * @param name State name
         */
        Routing.prototype.isNestedState = function (name) {
            return name.split('.').length > (this.shellContentStateOctateLen + 1);
        };
        /**
         * Get active menu eliminating nested states
         * @param state Optional state
         */
        Routing.prototype.getActiveMenu = function (state) {
            var menu = (state || this.current).hierarchicalMenu;
            while (menu && this.isNestedState(menu.name)) {
                menu = menu.parentMenu;
            }
            return menu;
        };
        Routing.injectionName = "Routing";
        //#endregion
        //#region Init
        Routing.$inject = ['$window', '$state', '$stateParams', '$rootScope', '$q', '$urlRouter', '$location',
            '$stickyState', '$urlMatcherFactory', '$timeout', 'StateProvider', 'UrlRouterProvider',
            'RouteConfig', 'Loader', 'Common', 'Config', 'Logger', 'Localization', 'Base64', 'Constants',
            'Caching', 'Environment', '$uibModalStack'];
        return Routing;
    }());
    exports.Routing = Routing;
    //#endregion
    //#region Config
    var config = function ($provide, $stateProvider, $urlRouterProvider, $stickyStateProvider, $locationProvider, constants) {
        //make runtime config
        $provide.factory('StateProvider', function () { return $stateProvider; });
        $provide.factory('UrlRouterProvider', function () { return $urlRouterProvider; });
        $urlRouterProvider.deferIntercept();
        //redirect to / when only host entered in url
        $urlRouterProvider.when('', '/');
        //to prevent infinite loop https://github.com/angular-ui/ui-router/issues/600#issuecomment-47228922
        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            $state.go(constants.routing.NOT_FOUND_STATE_NAME);
        });
        //Sticky mode log monitoring
        $stickyStateProvider.enableDebug(false);
        //Enable Html5 mode
        $locationProvider.html5Mode(true);
    };
    config.$inject = ['$provide', '$stateProvider', '$urlRouterProvider', '$stickyStateProvider', '$locationProvider', 'Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.routing', ['rota.services.routing.config', 'rota.services.loader', 'ui.router',
        'ct.ui.router.extras.sticky', 'ct.ui.router.extras.dsr']);
    module.service(Routing.injectionName, Routing)
        .config(config);
});
