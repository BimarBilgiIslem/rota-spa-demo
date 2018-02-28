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
define(["require", "exports", "tslib", "./injectableobject"], function (require, exports, tslib_1, injectableobject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        tslib_1.__extends(BaseApi, _super);
        function BaseApi(bundle) {
            var services = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                services[_i - 1] = arguments[_i];
            }
            var _this = _super.call(this, bundle) || this;
            //set options
            _this.controller = bundle.options && bundle.options.serverApi;
            _this.moduleId = bundle.options && bundle.options.moduleId;
            return _this;
        }
        /**
       * Init bundle
       * @param bundle
       */
        BaseApi.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.$q = bundle.services['$q'];
            this.$http = bundle.services['$http'];
            this.$httpParamSerializer = bundle.services['$httpparamserializer'];
            this.config = bundle.services['config'];
            this.common = bundle.services['common'];
            this.localization = bundle.services['localization'];
            this.caching = bundle.services['caching'];
            this.logger = bundle.services['logger'];
            this.uploader = bundle.services['upload'];
            this.constants = bundle.services['constants'];
            this.environment = bundle.services['environment'];
        };
        //#endregion
        //#region Methods
        /**
         * Upload a file to remote server
         * @param file Selected file info
         * @param params Optional params to send to server
         */
        BaseApi.prototype.fileUpload = function (file, params, actionName) {
            var _this = this;
            return this.uploader.upload({
                showSpinner: false,
                url: this.getAbsoluteUrl(actionName || this.constants.server.ACTION_NAME_DEFAULT_FILE_UPLOAD),
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
                args[_i] = arguments[_i];
            }
            return this.makeRequest.apply(this, [RequestMethod.get].concat(args));
        };
        BaseApi.prototype.post = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
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
                showSpinner: options.showSpinner,
                byPassErrorInterceptor: options.byPassErrorInterceptor
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
            var _loop_1 = function (key) {
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
                        parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(v));
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
            if (!this.common.isNullOrEmpty(this.moduleId) && this.moduleId !== this.config.host) {
                var moduleUrl = this.environment.doms[this.moduleId];
                if (!this.common.isNullOrEmpty(moduleUrl)) {
                    url = "" + this.common.addTrailingSlash(moduleUrl) + url;
                }
                else {
                    this.logger.console.error({ message: this.moduleId + " is not defined in environment.doms." + url + " will be the returned" });
                }
            }
            return url;
        };
        //#endregion
        //#region Init
        BaseApi.injects = injectableobject_1.default.injects.concat(['$q', '$http', '$httpParamSerializer', 'Config', 'Common',
            'Localization', 'Caching', 'Logger', 'Upload', 'Constants', 'Environment']);
        return BaseApi;
    }(injectableobject_1.default));
    exports.default = BaseApi;
});
