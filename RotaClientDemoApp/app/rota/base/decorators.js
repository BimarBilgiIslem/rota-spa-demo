define(["require", "exports", "tslib", "rota/config/app"], function (require, exports, tslib_1, app_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var STATIC_INJECTION_SYMBOL_NAME = "static-injections";
    /**
     * This count is dynamically incremented to use as a suffix for the service register name
     */
    var API_COUNT = 0;
    //#region Decorators
    /**
     * Decoration that provides options of controller's behaviours
     * @param options Controller options or registerName
     */
    function Controller(options) {
        return function (base) {
            //cast if only registerName supported
            if (typeof options === "string") {
                options = { registerName: options };
            }
            var extendedController = (function (_super) {
                tslib_1.__extends(class_1, _super);
                function class_1() {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var _this = this;
                    //merge options with default
                    var mergedOptions = tslib_1.__assign({}, base.defaultOptions, options);
                    //merge options with bundle,args[0] is bundle
                    args[0] = tslib_1.__assign({}, args[0], { options: mergedOptions });
                    //call controller constructor
                    _this = _super.apply(this, args) || this;
                    //injected services available here on this so call securely initController method
                    _this.initController();
                    return _this;
                }
                return class_1;
            }(base));
            //register api
            app_1.default.addController.apply(app_1.default, [options.registerName, extendedController].concat(getDependencies(base)));
            return extendedController;
        };
    }
    exports.Controller = Controller;
    /**
     * Decoration that provides options of api's behaviours
     * @param options Api Options
     */
    function Api(options) {
        return function (base) {
            //register api
            var extendedApi = (function (_super) {
                tslib_1.__extends(class_2, _super);
                function class_2() {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var _this = this;
                    //merge options with bundle
                    args[0] = tslib_1.__assign({}, args[0], { options: options });
                    //call controller constructor
                    _this = _super.apply(this, args) || this;
                    return _this;
                }
                return class_2;
            }(base));
            //register api
            app_1.default.addApi.apply(app_1.default, [(options && options.registerName) || "api_" + ++API_COUNT,
                extendedApi].concat(getDependencies(base)));
            return extendedApi;
        };
    }
    exports.Api = Api;
    /**
     * Directive decorator
     * @param options
     */
    function Directive(registerName) {
        return function (base) {
            var directive = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new (base.bind.apply(base, [void 0].concat(args)))();
            };
            directive.$inject = getDependencies(base, 0);
            //register api
            app_1.default.addDirective(registerName, directive);
            return base;
        };
    }
    exports.Directive = Directive;
    /**
     * Static injection decorator,
     * @description Must be used with builtin servicess such as $timeout,$sce
     * @param name
     */
    function Inject(name) {
        return function (target, propertyKey, parameterIndex) {
            var injects = Reflect.getOwnMetadata(STATIC_INJECTION_SYMBOL_NAME, target) || [];
            injects.push({ name: name, parameterIndex: parameterIndex });
            Reflect.defineMetadata(STATIC_INJECTION_SYMBOL_NAME, injects, target);
        };
    }
    exports.Inject = Inject;
    /**
     * get injected param names
     * @description Get injected params from reflected params if available,otherwise use its param name
     * @param constructorFunction
     * @param startIndex
     * @returns {string[]} dependecy names
     */
    //#endregion
    //#region Methods
    var getDependencies = function (constructorFunction, startIndex) {
        if (startIndex === void 0) { startIndex = 1; }
        //get meta of constructor params using reflect
        var paramTypes = Reflect.getMetadata("design:paramtypes", constructorFunction);
        var dependencies = [];
        if (paramTypes && paramTypes.length) {
            var staticInjects_1 = Reflect.getOwnMetadata(STATIC_INJECTION_SYMBOL_NAME, constructorFunction);
            //get injectionname of service otherwise get param key as string,skip bundle as first param
            dependencies = paramTypes.slice(startIndex).map(function (item, i) {
                if (item.injectionName)
                    return item.injectionName;
                if (staticInjects_1 && staticInjects_1.length) {
                    var injectName = staticInjects_1.firstOrDefault(function (item) { return item.parameterIndex === (i + startIndex); });
                    if (injectName)
                        return injectName.name;
                }
                throw "injection failed for parameter index (" + (i + startIndex) + ").are you missing @Inject() decorator ?";
            });
        }
        return dependencies;
    };
});
