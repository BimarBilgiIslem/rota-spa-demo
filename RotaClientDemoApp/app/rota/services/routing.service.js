define(["require", "exports", "underscore", "./routing.config", "./loader.service"], function (require, exports, _) {
    "use strict";
    //#endregion
    //#region Routing Service
    /**
     * This service wrapper of ui-router services and responsible for menus and static states
     */
    var Routing = (function () {
        //ctor
        function Routing($state, $stateParams, $rootScope, $q, $urlRouter, $location, $stickyState, $urlMatcherFactory, $timeout, $stateProvider, $urlRouterProvider, routeconfig, loader, common, config, logger, localization, base64, constants) {
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
            //#region Props
            this.serviceName = "Routing Service";
            /**
             * Quick menus
             */
            this.quickMenus = [];
            //Register static states and events
            this.init();
        }
        Object.defineProperty(Routing.prototype, "states", {
            get: function () { return this._states; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Routing.prototype, "menus", {
            get: function () { return this._menus; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Routing.prototype, "breadcrumbs", {
            get: function () { return this._breadcrumbs; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Routing.prototype, "activeMenu", {
            get: function () { return this._activeMenu; },
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
        //#region State Active Methods
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
        //#endregion
        //#region State Register Methods
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
            this.$rootScope.$on('$stateChangeSuccess', function (event, toState) {
                /**
                 * Find parent abstract state if state is partial
                 */
                var getMenu = function (_menu) {
                    var menu = _menu || toState.hierarchicalMenu;
                    while (menu && menu.isNestedState) {
                        menu = menu.parentMenu;
                    }
                    return menu;
                };
                /**
                 * Set breadcrumb datasource
                 */
                var setBreadcrumb = function () {
                    var menu = getMenu();
                    var routelist = [];
                    while (menu) {
                        routelist.push({
                            text: menu.title,
                            url: menu.menuUrl || _this.getUrlByState(menu.state),
                            icon: menu.menuIcon
                        });
                        menu = menu.parentMenu && getMenu(menu.parentMenu);
                    }
                    _this._breadcrumbs = routelist.reverse();
                };
                /**
                 * Set current main menu
                 */
                var setActiveMenu = function () {
                    //find parent abstract state if state is partial
                    var menu = getMenu();
                    if (toState.name === _this.constants.routing.SHELL_STATE_NAME || menu !== _this.activeMenu) {
                        _this._activeMenu = menu;
                        _this.$rootScope.$broadcast(_this.config.eventNames.menuChanged, menu);
                    }
                };
                if (!toState)
                    return;
                setActiveMenu();
                setBreadcrumb();
            });
            this.$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                if (!error)
                    return;
                //TODO:Hata tipine gore işlem yapılmali
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
            this.$stateProvider.state(this.constants.routing.NOT_FOUND_STATE_NAME, { url: 'error404', templateUrl: this.routeconfig.error404StateUrl });
            //500 page
            this.$stateProvider.state(this.constants.routing.INTERNAL_ERROR_STATE_NAME, { url: 'error500', templateUrl: this.routeconfig.error500StateUrl });
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
            var _this = this;
            var views = {};
            sections.forEach(function (section) {
                for (var state in section) {
                    if (section.hasOwnProperty(state)) {
                        views[state] = {
                            templateUrl: _this.toUrl(_this.routeconfig.shellPath + section[state].templateUrl),
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
                { 'shell@': { templateUrl: 'shell.html', controller: 'ShellController', controllerAs: this.routeconfig.shellControllerAlias } },
                { 'header@shell': { templateUrl: 'header.html' } }
            ], contentSections = [{ '@shell': { templateUrl: 'content.html' } },
                { 'breadcrumb@shell.content': { templateUrl: 'breadcrumb.html' } },
                { 'notification@shell.content': { templateUrl: 'notification.html' } },
                { 'badges@shell.content': { templateUrl: 'badges.html' } }
            ];
            //register shell state
            //UNDONE:add shell promise
            this.registerShellSection(this.constants.routing.SHELL_STATE_NAME, shellSections, false, '/', true);
            //register content state
            this.registerShellSection(this.constants.routing.SHELL_CONTENT_STATE_NAME, contentSections, true);
        };
        /**
        * Register states
        */
        Routing.prototype.registerStates = function () {
            var _this = this;
            //Create default state params
            var defaultParams = {};
            defaultParams[this.constants.controller.DEFAULT_NEW_ITEM_PARAM_NAME] =
                this.constants.controller.DEFAULT_NEW_ITEM_PARAM_VALUE;
            defaultParams[this.constants.controller.DEFAULT_READONLY_PARAM_NAME] = true;
            //filter to get real states 
            var states = _.filter(this._states, function (state) {
                return !!state.name;
            });
            //register states
            states.forEach(function (state) {
                _this.registerState(state, defaultParams);
            });
        };
        /**
         * Register state
         * @param state State
         */
        Routing.prototype.registerState = function (state, defaultParams) {
            //Check if already defined
            if (this.getState(state.name)) {
                this.logger.console.warn({ message: 'state already registered ' + state.name });
                return this;
            }
            if (!this.common.isAssigned(state.hierarchicalMenu)) {
                this.logger.console.warn({ message: state.name + ' state\'s parent is not exists so state is skipped', data: state });
                return this;
            }
            //set temlate path based on baseUrl - works both html and dynamic file server
            var templateFilePath = this.common.isHtml(state.templateUrl) ?
                window.require.toUrl(state.templateUrl) : state.templateUrl;
            //#region Define State Object
            //set url
            var url = "";
            if (state.url) {
                url = (state.hierarchicalMenu.isNestedState || state.hierarchicalMenu.isStickyTab ? '/' + state.url : state.url);
            }
            //State Object
            var stateObj = {
                sticky: state.sticky,
                deepStateRedirect: state.deepStateRedirect,
                abstract: state.abstract,
                template: state.template,
                templateUrl: templateFilePath,
                controller: state.controller,
                //ControllerAs syntax used as default 'vm'
                controllerAs: this.routeconfig.contentControllerAlias,
                hierarchicalMenu: state.hierarchicalMenu,
                url: url,
                params: angular.extend(defaultParams, state.params),
                //Resolve params
                resolve: {
                    stateInfo: function () {
                        return {
                            isNestedState: state.hierarchicalMenu.isNestedState,
                            stateName: state.name,
                            isStickyTab: state.hierarchicalMenu.isStickyTab
                        };
                    },
                    authenticated: [
                        'Security', function (security) { return security.isStateAuthenticated(state); }
                    ],
                    antiForgeryToken: [
                        'Security', function (security) {
                            if (security.securityConfig.antiForgeryTokenEnabled &&
                                !state.hierarchicalMenu.isNestedState) {
                                return security.getAntiForgeryToken(state);
                            }
                        }
                    ],
                    $modalInstance: angular.noop,
                    modalParams: angular.noop
                }
            };
            //if its tab state,must be added to views object 
            if (state.hierarchicalMenu && state.hierarchicalMenu.isStickyTab) {
                var views = {};
                views[state.name] = {
                    controller: state.controller,
                    templateUrl: templateFilePath,
                    controllerAs: this.routeconfig.contentControllerAlias
                };
                stateObj.views = views;
                stateObj.sticky = true;
            }
            //#endregion
            //#region Controller Resolve
            //Main Controller load
            if (angular.isString(stateObj.controller)) {
                var cntResolve = this.loader.resolve({
                    controllerUrl: state.controllerUrl,
                    templateUrl: state.templateUrl
                });
                stateObj.resolve = angular.extend(stateObj.resolve, cntResolve);
            }
            else {
                //if no controller defined and abstract is set,generic template injected here
                if (state.abstract) {
                    stateObj.template = '<div ui-view></div>';
                }
            }
            //#endregion
            //register state
            this.$stateProvider.state(state.name, stateObj);
            return this;
        };
        //#endregion
        //#region Menu Methods
        /**
           * Get states by parentId
           * @param parentId State parentId
           */
        Routing.prototype.getStatesByParentId = function (parentId) {
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
         * Convert states to hierarchical node way
         */
        Routing.prototype.toHierarchicalMenu = function () {
            var rootMenus = this.getStatesByParentId();
            this.shellContentStateOctateLen = this.constants.routing.SHELL_CONTENT_STATE_NAME.split('.').length;
            if (!rootMenus.length) {
                throw new Error(this.constants.errors.NOT_ROOT_MENU_FOUND);
            }
            //generate menus recursively
            return this.getMenusRecursively(rootMenus);
        };
        /**
         * Get states (menus) recursively
         * @param parentStates Parent states
         * @param parentMenu Parent menu
         */
        Routing.prototype.getMenusRecursively = function (parentStates, parentMenu) {
            var _this = this;
            var menus = [];
            parentStates.forEach(function (state) {
                var menu = angular.copy(state);
                menu.parentMenu = parentMenu;
                menu.state = state.name;
                //update title
                menu.title = menu.title || (menu.titleI18N && _this.localization.getLocal(menu.titleI18N));
                //set isNestedState flag
                if (menu.state) {
                    menu.isNestedState = menu.state.split('.').length > (_this.shellContentStateOctateLen + 1);
                }
                state.hierarchicalMenu = menu;
                //Set substates
                var subStates = _this.getStatesByParentId(state.id);
                if (subStates.length) {
                    menu.subMenus = _this.getMenusRecursively(subStates, menu);
                }
                //set quickmenu
                if (menu.isQuickMenu)
                    _this.quickMenus.push(menu);
                menus.push(menu);
            });
            return menus;
        };
        //#endregion
        //#region State Utils
        /**
             * Get state by name
             * @param stateName
             */
        Routing.prototype.getState = function (stateName) {
            if (!this.common.isAssigned(stateName))
                return undefined;
            return this.$state.get(stateName);
        };
        /**
         * Add states with menu definitions
         * @param states States
         */
        Routing.prototype.addMenus = function (states) {
            this._states = states || [];
            this._menus = this.toHierarchicalMenu();
            try {
                this.registerStates();
            }
            finally {
                this.$urlRouter.sync();
                this.$urlRouter.listen();
            }
            return this;
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
         * Reload state
         */
        Routing.prototype.reload = function () {
            return this.$state.reload();
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
            return this.$state.href(stateName, params);
        };
        /**
         * Convert relative url ro absolute url
         * @param relativeUrl Relative url
         */
        Routing.prototype.toUrl = function (relativeUrl) {
            return window.require.toUrl(relativeUrl);
        };
        //#endregion
        //#region Init
        Routing.$inject = ['$state', '$stateParams', '$rootScope', '$q', '$urlRouter', '$location',
            '$stickyState', '$urlMatcherFactory', '$timeout', 'StateProvider', 'UrlRouterProvider',
            'RouteConfig', 'Loader', 'Common', 'Config', 'Logger', 'Localization', 'Base64', 'Constants'];
        return Routing;
    }());
    exports.Routing = Routing;
    //#endregion
    //#region Config
    var config = function ($provide, $stateProvider, $urlRouterProvider, $stickyStateProvider, constants) {
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
    };
    config.$inject = ['$provide', '$stateProvider', '$urlRouterProvider', '$stickyStateProvider', 'Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.routing', ['rota.services.routing.config', 'rota.services.loader', 'ui.router',
        'ct.ui.router.extras.sticky', 'ct.ui.router.extras.dsr']);
    module.service('Routing', Routing)
        .config(config);
    //#endregion
});
