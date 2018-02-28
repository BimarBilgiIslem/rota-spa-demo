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
    //#region Loader Service
    /**
     * Controller File Loader Service
     */
    var Loader = (function () {
        function Loader($q, $rootScope, common, config) {
            this.$q = $q;
            this.$rootScope = $rootScope;
            this.common = common;
            this.config = config;
            this.serviceName = "Loader Service";
        }
        /**
         * Load file
         * @param url normalized or relative path
         */
        Loader.prototype.load = function (url) {
            var _this = this;
            var defer = this.$q.defer();
            window.require(url, function () {
                var responses = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    responses[_i] = arguments[_i];
                }
                defer.resolve(responses);
                _this.$rootScope.$apply();
            }, function (reason) {
                defer.reject(reason);
            });
            return defer.promise;
        };
        /**
        * Normalize url
        * @param path Url to normalize
        * @param host Host
        */
        Loader.prototype.normalize = function (path, host) {
            if (host === void 0) { host = this.config.host; }
            //return path if within the same host
            var result = this.config.host === host ? path : host + "/" + this.common.toUrl(path, false);
            //set text plugin prefix for html files
            if (this.common.isHtml(result) && result.indexOf('text!') === -1)
                result = 'text!' + result;
            return result;
        };
        Loader.prototype.resolve = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var arrayValue = !this.common.isArray(args[0]) ? [args[0]] : args[0];
            //set text plugin prefix for html files
            arrayValue = arrayValue.map(function (url) { return _this.normalize(url, args[1]); });
            //file resolve
            return this.load(arrayValue);
        };
        Loader.injectionName = "Loader";
        //states
        Loader.$inject = ['$q', '$rootScope', 'Common', 'Config'];
        return Loader;
    }());
    exports.Loader = Loader;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.loader', []);
    module.service(Loader.injectionName, Loader);
});
