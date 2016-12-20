define(["require", "exports"], function (require, exports) {
    "use strict";
    //#region Cachers
    /**
     * LocalStorage
     */
    var LocalStorage = (function () {
        function LocalStorage(logger, storage) {
            this.logger = logger;
            this.storage = storage;
        }
        Object.defineProperty(LocalStorage.prototype, "isAvailable", {
            get: function () { return !!this.storage; },
            enumerable: true,
            configurable: true
        });
        LocalStorage.prototype.get = function (key) {
            var data = this.storage.getItem(key);
            if (data) {
                var model = JSON.parse(data);
                this.logger.console.log({ message: 'localstorage cache restored with key ' + key, data: model });
                return model;
            }
            return null;
        };
        LocalStorage.prototype.store = function (key, value) {
            var strData = JSON.stringify(value);
            this.storage.setItem(key, strData);
            this.logger.console.log({ message: 'localstorage cache created with key ' + key, data: value });
        };
        LocalStorage.prototype.remove = function (key) {
            this.storage.removeItem(key);
            this.logger.console.log({ message: 'localstorage cache removed with key ' + key });
        };
        return LocalStorage;
    }());
    /**
     * Session Storage
     */
    var SessionStorage = (function () {
        function SessionStorage(logger, storage) {
            this.logger = logger;
            this.storage = storage;
        }
        Object.defineProperty(SessionStorage.prototype, "isAvailable", {
            get: function () { return !!this.storage; },
            enumerable: true,
            configurable: true
        });
        SessionStorage.prototype.get = function (key) {
            var data = this.storage.getItem(key);
            if (data) {
                var model = JSON.parse(data);
                this.logger.console.log({ message: 'sessionstorage cache restored with key ' + key, data: model });
                return model;
            }
            return null;
        };
        SessionStorage.prototype.store = function (key, value) {
            var strData = JSON.stringify(value);
            this.storage.setItem(key, strData);
            this.logger.console.log({ message: 'sessionstorage cache created with key ' + key, data: value });
        };
        SessionStorage.prototype.remove = function (key) {
            this.storage.removeItem(key);
            this.logger.console.log({ message: 'sessionstorage cache removed with key ' + key });
        };
        return SessionStorage;
    }());
    /**
     * Cache Storage
     */
    var CacheStorage = (function () {
        function CacheStorage(logger, cacheObject) {
            this.logger = logger;
            this.cacheObject = cacheObject;
        }
        Object.defineProperty(CacheStorage.prototype, "isAvailable", {
            get: function () { return !!this.cacheObject; },
            enumerable: true,
            configurable: true
        });
        CacheStorage.prototype.get = function (key) {
            var data = this.cacheObject.get(key);
            if (data) {
                this.logger.console.log({ message: 'cachestorage cache restored with key ' + key, data: data });
                return data;
            }
            return null;
        };
        CacheStorage.prototype.store = function (key, value) {
            this.cacheObject.put(key, value);
            this.logger.console.log({ message: 'cachestorage cache created with key ' + key, data: value });
        };
        CacheStorage.prototype.remove = function (key) {
            this.cacheObject.remove(key);
            this.logger.console.log({ message: 'cachestorage cache removed with key ' + key });
        };
        return CacheStorage;
    }());
    /**
     * Cookie Storage
     */
    var CookieStorage = (function () {
        function CookieStorage(logger, cookies) {
            this.logger = logger;
            this.cookies = cookies;
        }
        Object.defineProperty(CookieStorage.prototype, "isAvailable", {
            get: function () { return !!this.cookies; },
            enumerable: true,
            configurable: true
        });
        CookieStorage.prototype.get = function (key) {
            var data = this.cookies.get(key);
            if (data) {
                data = JSON.parse(data);
                return data;
            }
            return null;
        };
        CookieStorage.prototype.store = function (key, value) {
            var strData = JSON.stringify(value);
            this.cookies.put(key, strData);
        };
        CookieStorage.prototype.remove = function (key) {
            this.cookies.remove(key);
        };
        return CookieStorage;
    }());
    //#endregion
    //#region Caching Service
    /**
     * Caching service
     */
    var Caching = (function () {
        function Caching($window, $cacheFactory, $cookies, logger) {
            //#region Props
            this.serviceName = "Caching Service";
            this.cachers = {};
            this.cachers[2 /* CacheStorage */] = new CacheStorage(logger, $cacheFactory(Caching.cacheId));
            this.cachers[0 /* LocalStorage */] = new LocalStorage(logger, $window.localStorage);
            this.cachers[1 /* SessionStorage */] = new SessionStorage(logger, $window.sessionStorage);
            this.cachers[3 /* CookieStorage */] = new CookieStorage(logger, $cookies);
            //fallback to cookiestorage
            for (var i = 0 /* LocalStorage */; i <= 3 /* CookieStorage */; i++) {
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
        Caching.cacheId = "rota-cache";
        //#endregion
        //#region Init
        Caching.$inject = ['$window', '$cacheFactory', '$cookies', 'Logger'];
        return Caching;
    }());
    exports.Caching = Caching;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.caching', []);
    module.service('Caching', Caching);
    //#endregion
});
