define(["require", "exports", '../base/basemodalcontroller', "./infrastructure.index"], function (require, exports, basemodalcontroller_1) {
    "use strict";
    //#endregion
    var RotaApp = (function () {
        //#endregion
        //#region Init
        function RotaApp(moduleName) {
            var _this = this;
            this.rotaModule = angular.module(moduleName, ["rota"]);
            //Configure lazy loading assignments and debug options
            this.configure(['$filterProvider', '$animateProvider', '$compileProvider', '$controllerProvider',
                '$provide', 'ConfigProvider', 'ivhTreeviewOptionsProvider', '$sceDelegateProvider', 'Environment', 'Constants',
                function ($filterProvider, $animateProvider, $compileProvider, $controllerProvider, $provide, configProvider, ivhTreeviewOptionsProvider, $sceDelegateProvider, environment, constants) {
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
                    //treeview global settings
                    ivhTreeviewOptionsProvider.set({
                        idAttribute: 'id',
                        defaultSelectedState: false,
                        validate: true,
                        expandToDepth: 1,
                        twistieCollapsedTpl: constants.tree.TREE_TWISTIE_COLLAPSED_TPL,
                        twistieExpandedTpl: constants.tree.TREE_TWISTIE_EXPANDED_TPL,
                        twistieLeafTpl: '&nbsp;&nbsp;'
                    });
                    //register xdom paths
                    if (!_.isEmpty(environment.xDomPaths)) {
                        var xdoms = ['self'];
                        for (var xdom in environment.xDomPaths) {
                            if (environment.xDomPaths.hasOwnProperty(xdom)) {
                                var domUrl = environment.xDomPaths[xdom];
                                if (domUrl) {
                                    //check trailing slash
                                    if (domUrl.slice(-1) !== '/') {
                                        domUrl += "/";
                                    }
                                    domUrl += "**";
                                    xdoms.push(domUrl);
                                }
                            }
                        }
                        $sceDelegateProvider.resourceUrlWhitelist(xdoms);
                    }
                }]);
            //add base modal controllers if not defined controller.see dialog.services->showModal
            this.rotaModule.controller(window.__constants.DEFAULT_MODAL_CONTROLLER_NAME, this.createAnnotation(basemodalcontroller_1.BaseModalController));
        }
        //#endregion
        //#region App Methods
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
            var controllerAnnotation = this.createAnnotation(controller, dependencies);
            this.$controllerProvider.register(controllerName, controllerAnnotation);
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
            var apiAnnotation = this.createAnnotation(api, dependencies);
            this.$provide.service(apiName, apiAnnotation);
        };
        /**
        * Add value provider service
        * @param serviceName Value service name
        * @param service Service itself
        */
        RotaApp.prototype.addValue = function (serviceName, service) {
            this.$provide.value(serviceName, service);
        };
        /**
         * Register directive
         * @param directiveName Directive Name
         * @param directiveFactory Directive function
         */
        RotaApp.prototype.addDirective = function (directiveName, directiveFactory) {
            this.$compileProvider.directive(directiveName, directiveFactory);
        };
        /**
         * Register filter
         * @param filterName Filter Name
         * @param filterFactory Filter factory
         */
        RotaApp.prototype.addFilter = function (filterName, filterFactory) {
            this.$filterProvider.register(filterName, filterFactory);
        };
        /**
        * Configure app method
        * @param fn Function to register
        * @returns {IRotaApp}
        */
        RotaApp.prototype.configure = function (fn) {
            this.rotaModule.config(fn);
            return this;
        };
        /**
        * Register run phase function
        * @param fn Function to register
        * @returns {IRotaApp}
        */
        RotaApp.prototype.run = function (fn) {
            this.rotaModule.run(fn);
            return this;
        };
        /**
         * Sets home page settings
         * @param options Options
         * @returns {IRotaApp}
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
                    args[_i - 0] = arguments[_i];
                }
                var bundle = {
                    customBundles: {},
                    systemBundles: {}
                };
                var systemServices = args.slice(0, args.length - dependencies.length);
                var customServices = args.slice(systemServices.length, args.length);
                systemServices.forEach(function (service, index) {
                    var serviceName = injectableObject.injects[index];
                    bundle.systemBundles[serviceName.toLowerCase()] = service;
                });
                customServices.forEach(function (service, index) {
                    var serviceName = dependencies[index];
                    bundle.customBundles[serviceName] = service;
                });
                var instance = new injectableObject(bundle);
                return instance;
            };
            //add ctor
            deps.push(controllerCtor);
            return deps;
        };
        return RotaApp;
    }());
    //Instance of rota app
    var rotaApp = new RotaApp("rota-app");
    exports.App = rotaApp;
    //Export
});
