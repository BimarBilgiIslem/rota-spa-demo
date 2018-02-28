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
define(["require", "exports", "./infrastructure.index"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    var RotaApp = (function () {
        //#endregion
        //#region Init
        function RotaApp(moduleName) {
            //registered objs
            this.registeredObjs = {};
            this.rotaModule = angular.module(moduleName, ["rota"]);
            this.init();
        }
        /**
         * Initialize module setup
         */
        RotaApp.prototype.init = function () {
            var _this = this;
            //#region Config Blocks
            //Configure lazy loading assignments and debug options
            this.configure(['$filterProvider', '$animateProvider', '$compileProvider', '$controllerProvider',
                '$provide', 'ConfigProvider', '$uibTooltipProvider', 'Constants',
                function ($filterProvider, $animateProvider, $compileProvider, $controllerProvider, $provide, configProvider, $uibTooltipProvider, constants) {
                    //Lazy registering 
                    _this.$controllerProvider = $controllerProvider;
                    _this.$provide = $provide;
                    _this.$compileProvider = $compileProvider;
                    _this.$filterProvider = $filterProvider;
                    //remove debug info in prod
                    if (!configProvider.config.debugMode) {
                        $compileProvider.debugInfoEnabled(false);
                        console.log('%c %s %s %s ', 'color: white; background-color: #c11;font-size:30px;', '--', constants.PRODUCTION_DEBUG_WARNING, '--');
                    }
                    //only animation starts with rota-animate is allowed 
                    //Stricted due to error in ui - select https://github.com/angular-ui/ui-select/issues/1467
                    $animateProvider.classNameFilter(/rota-animate/);
                    //remove tooltips for mobile
                    if (window.__IS_TOUCHABLE) {
                        $uibTooltipProvider.options({
                            trigger: 'none'
                        });
                    }
                }]);
            //#endregion
            //#region Run Blocks
            //reload if user specific culture different than browser culture
            //TODO:move to localization service
            this.run(["$window", "Localization", "Config", "CurrentUser", "Constants", "Common",
                function ($window, localization, config, currentUser, constants, common) {
                    var userCulture = config.culture || currentUser.culture, selCulture = localStorage.getItem(constants.localization.ACTIVE_LANG_STORAGE_NAME), initialCulture = $window.__CULTURE;
                    if (userCulture && userCulture.toLowerCase() !== initialCulture.toLowerCase() && common.isNullOrEmpty(selCulture)) {
                        //store culture and reload
                        localization.currentLanguage = { code: userCulture };
                    }
                }]);
            //Make Typescript async/await available with angular $q service
            //https://stackoverflow.com/a/41825004/1016147
            this.run(['$window', '$q', function ($window, $q) {
                    $window.Promise = $q;
                }]);
            //Set favicon
            this.run(["Config", "Common", function (config, common) {
                    if (config.favIconName) {
                        common.setFavIcon(common.addPrefixSlash(config.favIconName));
                    }
                }]);
            //#endregion
            return this;
        };
        //#endregion
        //#region App Methods
        /**
         * Set injector for further module dependecy
         * @param $injector
         */
        RotaApp.prototype.setInjector = function ($injector) {
            this.$injector = $injector;
        };
        /**
         * Add controller with dependencies
         * @param controllerName Controller name
         * @param controller Controller instance
         * @param dependencies Dependencies
         */
        RotaApp.prototype.addController = function (controllerName, controller) {
            var dependencies = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                dependencies[_i - 2] = arguments[_i];
            }
            //check name
            this.validateName(controllerName, "controller");
            //register
            var controllerAnnotation = this.createAnnotation(controller, dependencies);
            this.$controllerProvider.register(controllerName, controllerAnnotation);
            return this;
        };
        /**
        * Add service api with dependencies
        * @param apiName Api name
        * @param api Api class itself
        * @param dependencies Optional dependencies
        */
        RotaApp.prototype.addApi = function (apiName, api) {
            var dependencies = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                dependencies[_i - 2] = arguments[_i];
            }
            //check name
            this.validateName(apiName, "api");
            api.injectionName = apiName;
            //register
            var apiAnnotation = this.createAnnotation(api, dependencies);
            this.$provide.service(apiName, apiAnnotation);
            return this;
        };
        /**
        * Add value provider service
        * @param serviceName Value service name
        * @param service Service itself
        */
        RotaApp.prototype.addValue = function (serviceName, service) {
            this.validateName(serviceName, "value");
            this.$provide.value(serviceName, service);
            return this;
        };
        /**
         * Register directive
         * @param directiveName Directive Name
         * @param directiveFactory Directive function
         */
        RotaApp.prototype.addDirective = function (directiveName, directiveFactory) {
            this.validateName(directiveName, "directive");
            this.$compileProvider.directive(directiveName, directiveFactory);
            return this;
        };
        /**
         * Register filter
         * @param filterName Filter Name
         * @param filterFactory Filter factory
         */
        RotaApp.prototype.addFilter = function (filterName, filterFactory) {
            this.validateName(filterName, "filter");
            this.$filterProvider.register(filterName, filterFactory);
            return this;
        };
        /**
         * Add module after app bootstrap
         * @param modules Modules to load
         */
        RotaApp.prototype.addModule = function () {
            var modules = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                modules[_i] = arguments[_i];
            }
            /**
             * Following code injected to angular to make "module adding after bootstrap" available.line 4345
             * https://github.com/angular/angular.js/pull/4694
             *
             * instanceInjector.loadNewModules = function (mods) {
                  forEach(loadModules(mods), function (fn) { instanceInjector.invoke(fn || noop); });
               };
             */
            this.$injector.loadNewModules(modules);
            return this;
        };
        /**
         * Set app global settings
         * @param settings App settings
         */
        RotaApp.prototype.setConfig = function (settings) {
            this.configure(["ConfigProvider", "SecurityConfigProvider", "RouteConfigProvider", "$urlRouterProvider", "Environment",
                function (config, securityConfig, routeConfig, $urlRouterProvider, environment) {
                    //set all configs
                    settings.main && config.configure(settings.main);
                    settings.security && securityConfig.configure(settings.security);
                    settings.routing && routeConfig.configure(settings.routing);
                    if (settings.main && settings.main.homePageOptions) {
                        if (settings.main.homePageOptions.url) {
                            var baseUrl = "";
                            if (environment.baseUrl)
                                baseUrl = environment.baseUrl.replace(/\/$/, "");
                            //just redirect to home page when "/" is active state
                            $urlRouterProvider.when("/", baseUrl + settings.main.homePageOptions.url);
                        }
                    }
                }]);
            //add extra vendor modules
            if (settings.main && settings.main.dependencyModuleNames) {
                (_a = this.rotaModule.requires).push.apply(_a, settings.main.dependencyModuleNames);
            }
            return this;
            var _a;
        };
        RotaApp.prototype.setNavMenus = function (args) {
            this.run(["Routing", "CurrentUser", "CurrentCompany",
                function (routing, currentUser, currentCompany) {
                    var menus;
                    if (angular.isArray(args)) {
                        menus = args;
                    }
                    if (angular.isFunction(args)) {
                        menus = args(currentUser, currentCompany);
                    }
                    routing.addMenus(menus);
                }]);
            return this;
        };
        /**
         * Extend resources with dynamic resources from DB or else
         * @param dynamicresource Dynamic resource object
         */
        RotaApp.prototype.setResources = function (dynamicresource) {
            this.run(["Resource", function (resource) {
                    //Extend resources from server to statics
                    resource = angular.extend(resource, dynamicresource);
                }]);
            return this;
        };
        /**
        * Configure app method
        * @param fn Function to register
        * @returns {this}
        */
        RotaApp.prototype.configure = function (fn) {
            this.rotaModule.config(fn);
            return this;
        };
        /**
        * Register run phase function
        * @param fn Function to register
        * @returns {this}
        */
        RotaApp.prototype.run = function (fn) {
            this.rotaModule.run(fn);
            return this;
        };
        /**
        * Sets home page settings
        * @param options Options
        * @returns {this}
        */
        RotaApp.prototype.setHomePage = function (options) {
            this.configure([
                "$urlRouterProvider", "RouteConfigProvider", "ConfigProvider",
                function ($urlRouterProvider, routeConfig, config) {
                    if (options.url) {
                        //just redirect to home page when "/" is active state
                        $urlRouterProvider.when("/", options.url);
                    }
                    config.config.homePageOptions = options;
                }
            ]);
            return this;
        };
        /**
         * Define a state rule providiing the url
         * @param redirections List of reddirections including from and to paths
         */
        RotaApp.prototype.redirect = function (redirections) {
            this.configure(["$urlRouterProvider",
                function ($urlRouterProvider) {
                    var escapeRegex = function (stringToGoIntoTheRegex) {
                        return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    };
                    redirections.forEach(function (redirectItem) {
                        var regex = new RegExp("^((?!/" + escapeRegex(redirectItem.to) + ").)*" + escapeRegex(redirectItem.from), "i");
                        $urlRouterProvider.when(regex, "/" + redirectItem.to);
                    });
                }]);
            return this;
        };
        /**
        * Create annotation style of contructor function
        * @param injectableObject Object type to register
        * @param dependencies Optional services depended
        */
        RotaApp.prototype.createAnnotation = function (injectableObject, dependencies) {
            if (dependencies === void 0) { dependencies = []; }
            var deps = new Array().concat(injectableObject.injects, dependencies);
            var controllerCtor = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var bundle = {
                    services: {}
                };
                var systemServices = args.slice(0, args.length - dependencies.length);
                var customServices = args.slice(systemServices.length, args.length);
                systemServices.forEach(function (service, index) {
                    var serviceName = injectableObject.injects[index];
                    bundle.services[serviceName.toLowerCase()] = service;
                });
                var instance = new (injectableObject.bind.apply(injectableObject, [void 0, bundle].concat(customServices)))();
                return instance;
            };
            //add ctor
            deps.push(controllerCtor);
            return deps;
        };
        /**
         * Validate name if already registered
         * @param name Name
         * @param kind Kind of angular obj
         */
        RotaApp.prototype.validateName = function (name, kind) {
            var names = this.registeredObjs[kind] || (this.registeredObjs[kind] = []);
            if (names.indexOf(name) !== -1)
                throw name + " already registered - " + kind;
            names.push(name);
        };
        //#region Props
        //Main module name
        RotaApp.moduleName = "rota-app";
        return RotaApp;
    }());
    //Export
    exports.default = new RotaApp(RotaApp.moduleName);
});
