var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./injectableobject"], function (require, exports, injectableobject_1) {
    "use strict";
    //#endregion
    var RequestMethod;
    (function (RequestMethod) {
        RequestMethod[RequestMethod["get"] = 0] = "get";
        RequestMethod[RequestMethod["post"] = 1] = "post";
        RequestMethod[RequestMethod["put"] = 2] = "put";
        RequestMethod[RequestMethod["delete"] = 3] = "delete";
    })(RequestMethod || (RequestMethod = {}));
    /**
     * Base Api for all api services
     */
    var BaseApi = (function (_super) {
        __extends(BaseApi, _super);
        function BaseApi(bundle, controller, moduleId) {
            _super.call(this, bundle);
            this.controller = controller;
            this.moduleId = moduleId;
        }
        /**
       * Init bundle
       * @param bundle
       */
        BaseApi.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.$rootScope = bundle.systemBundles['$rootScope'];
            this.$q = bundle.systemBundles['$q'];
            this.$http = bundle.systemBundles['$http'];
            this.config = bundle.systemBundles['config'];
            this.common = bundle.systemBundles['common'];
            this.localization = bundle.systemBundles['localization'];
            this.caching = bundle.systemBundles['caching'];
            this.logger = bundle.systemBundles['logger'];
            this.uploader = bundle.systemBundles['upload'];
            this.constants = bundle.systemBundles['constants'];
        };
        //#endregion
        //#region Methods
        /**
         * Upload a file to remote server
         * @param file Selected file info
         * @param params Optional params to send to server
         */
        BaseApi.prototype.fileUpload = function (file, params) {
            var _this = this;
            return this.uploader.upload({
                showSpinner: false,
                url: this.getAbsoluteUrl(this.constants.server.ACTION_NAME_DEFAULT_FILE_UPLOAD),
                method: RequestMethod[RequestMethod.post],
                data: this.common.extend({ file: file }, params)
            }).then(function (response) {
                _this.logger.console.log({ message: "'" + file.name + "' file succesfully uploaded" });
                return response.data;
            });
        };
        BaseApi.prototype.get = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return this.makeRequest.apply(this, [RequestMethod.get].concat(args));
        };
        BaseApi.prototype.post = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return this.makeRequest.apply(this, [RequestMethod.post].concat(args));
        };
        //#endregion
        //#region Utils
        /**
        * Generic request method using caching
        * @param method Request Method
        * @param args Request args
        */
        BaseApi.prototype.makeRequest = function (method) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (args.length === 0)
                return null;
            var options;
            if (this.common.isString(args[0])) {
                options = {
                    action: args[0],
                    cache: args[2]
                };
                options[method === RequestMethod.post ? "data" : "params"] = args[1];
            }
            else {
                options = args[0];
            }
            //update url
            options.url = options.url || this.getAbsoluteUrl(options.action, options.controller);
            //check if cache is active and returns cached data
            if (options.cache) {
                var cacheKey = options.cacheKey || this.buildUrl(options.url, this.common.extend(options.params, options.data));
                var cachedData = this.caching.cachers[options.cacheType || 2 /* CacheStorage */].get(cacheKey);
                if (this.common.isAssigned(cachedData)) {
                    return this.$q.when(cachedData);
                }
            }
            //remote request
            return this.$http({
                method: RequestMethod[method],
                url: options.url,
                data: options.data || "",
                headers: {
                    "Content-Type": "application/json"
                },
                params: options.params,
                showSpinner: options.showSpinner
            })
                .then(function (response) {
                //cache if configured
                if (options.cache) {
                    var cacheKey = options.cacheKey || _this.buildUrl(options.url, options.params);
                    _this.caching.cachers[options.cacheType || 2 /* CacheStorage */].store(cacheKey, response.data);
                }
                return response.data;
            });
        };
        /**
         * Generate url with url and params
         * @param url Url
         * @param params Params object
         */
        BaseApi.prototype.buildUrl = function (url, params) {
            if (!params)
                return url;
            var parts = [];
            var _loop_1 = function(key) {
                if (params.hasOwnProperty(key)) {
                    var value = params[key];
                    if (!this_1.common.isAssigned(value))
                        return "continue";
                    if (!this_1.common.isArray(value))
                        value = [value];
                    value.forEach(function (v) {
                        if (angular.isObject(v)) {
                            if (angular.isDate(v)) {
                                v = v.toISOString();
                            }
                            else {
                                v = angular.toJson(v);
                            }
                        }
                        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
                    });
                }
            };
            var this_1 = this;
            for (var key in params) {
                _loop_1(key);
            }
            if (parts.length > 0) {
                url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
            }
            return url;
        };
        /**
         * Generate uri with action,controller and api prefix
         * @param action Action
         * @param controller Optional controller name
         */
        BaseApi.prototype.getAbsoluteUrl = function (action, controller) {
            var url = this.config.defaultApiPrefix + "/" + (controller || this.controller) + "/" + action;
            //if xdom module is defined
            //TODO:Same origin might be eliminated
            if (!this.common.isNullOrEmpty(this.moduleId)) {
                url = window.require.toUrl(this.moduleId + "/" + url);
            }
            return url;
        };
        //#endregion
        //#region Init
        BaseApi.injects = injectableobject_1.InjectableObject.injects.concat(['$rootScope', '$q', '$http', 'Config', 'Common', 'Localization', 'Caching', 'Logger', 'Upload', 'Constants']);
        return BaseApi;
    }(injectableobject_1.InjectableObject));
    exports.BaseApi = BaseApi;
});
