define(["require", "exports", 'i18n!rota-resources/nls/resources', 'i18n!app-resources/nls/resources', 'underscore', 'i18n!rota-resources/nls/moment-lang'], function (require, exports, rotaresource, appresource, _) {
    "use strict";
    //#endregion
    //#region Localization Service
    var Localization = (function () {
        function Localization($window, $interpolate, resources, config, constants) {
            this.$window = $window;
            this.$interpolate = $interpolate;
            this.resources = resources;
            this.config = config;
            this.constants = constants;
            //#region Props
            this.serviceName = "Localization Service";
            var currentLangCode = $window.localStorage.getItem(constants.localization.ACTIVE_LANG_STORAGE_NAME) ||
                constants.localization.DEFAULT_LANGUAGE;
            this._currentLanguage = _.findWhere(this.config.supportedLanguages, { code: currentLangCode });
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
                this.$window.localStorage.setItem(this.constants.localization.ACTIVE_LANG_STORAGE_NAME, value.code);
                this.$window.location.reload();
            },
            enumerable: true,
            configurable: true
        });
        Localization.prototype.getLocal = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
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
        //#endregion
        //#region Init
        Localization.$inject = ['$window', '$interpolate', 'Resource', 'Config', 'Constants'];
        return Localization;
    }());
    exports.Localization = Localization;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.localization', []);
    module.service('Localization', Localization);
    module.factory('Resource', function () {
        return angular.extend({}, appresource, rotaresource);
    });
    //#endregion
});
