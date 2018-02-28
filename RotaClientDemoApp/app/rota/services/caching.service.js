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
    //#region Storage Class
    /**
     * Generic cachers class
     */
    var Storage = (function () {
        function Storage(storage, base64) {
            this.storage = storage;
            this.base64 = base64;
        }
        Storage.prototype.get = function (key, defaultValue, decode) {
            if (decode === void 0) { decode = true; }
            try {
                var data = this.storage.getItem(key);
                if (data) {
                    var decoded = (decode && this.base64) ? this.base64.decode(data) : data;
                    var model = JSON.parse(decoded);
                    this.log(key + " retrived from storage", model);
                    return model;
                }
            }
            catch (e) {
                this.log(key + " can not be retrived from storage.", e);
                //remove if failed
                this.remove(key);
                return defaultValue;
            }
            return defaultValue;
        };
        Storage.prototype.store = function (key, value, encode) {
            if (encode === void 0) { encode = true; }
            if (value === undefined || value === null) {
                this.log(key + " not stored due to undefined or null");
                return;
            }
            ;
            try {
                //to remove the $$hashKey prop,angular.tojson is used instead of JSON.stringfy
                //https://stackoverflow.com/a/23656919/1016147
                var strData = angular.toJson(value);
                this.storage.setItem(key, (encode && this.base64) ? this.base64.encode(strData) : strData);
                this.log(key + " stored", value);
            }
            catch (e) {
                this.log(key + " can not be stored", e);
            }
        };
        Storage.prototype.remove = function (key) {
            this.storage.removeItem(key);
            this.log(key + " removed");
        };
        Storage.prototype.log = function (message, data) { };
        Object.defineProperty(Storage.prototype, "isAvailable", {
            get: function () { return !!this.storage.setItem; },
            enumerable: true,
            configurable: true
        });
        return Storage;
    }());
    //#endregion
    //#region Caching Service
    /**
     * Caching service
     */
    var Caching = (function () {
        function Caching($window, $cacheFactory, $cookies, logger, base64, config) {
            //#region Props
            this.serviceName = "Caching Service";
            this.cachers = {};
            //define cachers
            var encoder = config.encodeStorageValues && base64;
            this.cachers[0 /* LocalStorage */] = new Storage($window.localStorage, encoder);
            this.cachers[1 /* SessionStorage */] = new Storage($window.sessionStorage, encoder);
            var cacheFactory = $cacheFactory(Caching.cacheId);
            this.cachers[2 /* CacheStorage */] = new Storage({
                getItem: cacheFactory.get,
                setItem: cacheFactory.put,
                removeItem: cacheFactory.remove
            }, encoder);
            this.cachers[3 /* CookieStorage */] = new Storage({
                getItem: $cookies.get,
                setItem: $cookies.put,
                removeItem: $cookies.remove
            }, encoder);
            //fallback to cookiestorage
            for (var i = 0 /* LocalStorage */; i <= 3 /* CookieStorage */; i++) {
                this.cachers[i].log = function (message, data) { return logger.console.log({ message: message, data: data }); };
                if (!this.cachers[i].isAvailable) {
                    this.cachers[i] = this.cookieStorage;
                }
            }
        }
        Object.defineProperty(Caching.prototype, "localStorage", {
            //#endregion
            //#region Shortcut for Storages
            get: function () { return this.cachers[0 /* LocalStorage */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Caching.prototype, "sessionStorage", {
            get: function () { return this.cachers[1 /* SessionStorage */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Caching.prototype, "cacheStorage", {
            get: function () { return this.cachers[2 /* CacheStorage */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Caching.prototype, "cookieStorage", {
            get: function () { return this.cachers[3 /* CookieStorage */]; },
            enumerable: true,
            configurable: true
        });
        Caching.injectionName = "Caching";
        Caching.cacheId = "rota-cache";
        //#endregion
        //#region Init
        Caching.$inject = ['$window', '$cacheFactory', '$cookies', 'Logger', 'Base64', 'Config'];
        return Caching;
    }());
    exports.Caching = Caching;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.caching', []);
    module.service(Caching.injectionName, Caching);
});
