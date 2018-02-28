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
define(["require", "exports", "i18n!rota-resources/nls/resources", "i18n!app-resources/nls/resources", "i18n!rota-resources/nls/moment-lang"], function (require, exports, rotaresource, appresource) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Localization Service
    var Localization = (function () {
        function Localization($injector, $window, $interpolate, resources, config, constants, currentUser) {
            this.$injector = $injector;
            this.$window = $window;
            this.$interpolate = $interpolate;
            this.resources = resources;
            this.config = config;
            this.constants = constants;
            this.currentUser = currentUser;
            //#region Props
            this.serviceName = "Localization Service";
            //Init culture 
            this._currentLanguage = this.config.supportedLanguages.firstOrDefault(function (lang) { return lang.code === window.__CULTURE.toLowerCase(); });
        }
        Object.defineProperty(Localization.prototype, "currentLanguage", {
            /**
            * Gets current language code,Default 'tr-tr'
            * @returns {string}
            */
            get: function () { return this._currentLanguage; },
            /**
             * Change current language and reload page
             * @param value Language to change
             */
            set: function (value) {
                if (value === this.currentLanguage)
                    return;
                if (!this.config.supportedLanguages.any(function (lang) { return lang.code === value.code.toLowerCase(); })) {
                    throw new Error("'" + value.code + "' not supported culture.(allowed 'en-us' or 'tr-tr')");
                }
                this.$window.localStorage.setItem(this.constants.localization.ACTIVE_LANG_STORAGE_NAME, value.code.toLowerCase());
                this.$window.location.reload();
            },
            enumerable: true,
            configurable: true
        });
        Localization.prototype.getLocal = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            //if no param provided return with null
            if (args.length === 0)
                return null;
            //get first param as ket value
            var key = args[0];
            //get localized value
            var tag = this.getLocalizedValue(key);
            //format
            if (args.length > 1) {
                //interpolation
                if (angular.isObject(args[1])) {
                    tag = this.$interpolate(tag)(args[1]);
                }
                else {
                    //format
                    for (var index = 1; index < args.length; index++) {
                        var target = '{' + (index - 1) + '}';
                        tag = tag.replace(target, args[index]);
                    }
                }
            }
            return tag;
        };
        /**
         * Get localized string fro the key path
         * @param path Key
         * @returns {string}
         */
        Localization.prototype.getLocalizedValue = function (path) {
            var keys = path.split(".");
            var level = 0;
            var extractValue = function (context) {
                if (context[keys[level]]) {
                    var val = context[keys[level]];
                    if (typeof val === 'string') {
                        return val;
                    }
                    else {
                        level++;
                        return extractValue(val);
                    }
                }
                else {
                    return null;
                }
            };
            return extractValue(this.resources);
        };
        Localization.injectionName = "Localization";
        //#endregion
        //#region Init
        Localization.$inject = ['$injector', '$window', '$interpolate', 'Resource', 'Config', 'Constants', 'CurrentUser'];
        return Localization;
    }());
    exports.Localization = Localization;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.localization', []);
    module.service(Localization.injectionName, Localization);
    module.factory('Resource', function () {
        return angular.merge({}, rotaresource, appresource);
    });
});
