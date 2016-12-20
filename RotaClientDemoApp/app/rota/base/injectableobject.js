define(["require", "exports", "underscore.string"], function (require, exports, _s) {
    "use strict";
    /**
     * Injectable class must be overriden by controllers and services to get access of registered dependencies
     */
    var InjectableObject = (function () {
        //#endregion
        //#region Init
        function InjectableObject(bundle) {
            this.initBundle(bundle);
        }
        /**
         * Resolve services
         * @param bundle Injected services
         */
        InjectableObject.prototype.initBundle = function (bundle) {
            var _this = this;
            this.$injector = bundle.systemBundles['$injector'];
            //custom bundles
            for (var customBundle in bundle.customBundles) {
                if (bundle.customBundles.hasOwnProperty(customBundle)) {
                    (function (bundleName) {
                        _this.defineService(bundleName, bundle.customBundles[bundleName]);
                    })(customBundle);
                }
            }
        };
        /**
         * Dynamically define service on controller
         * @param serviceName Service name
         * @param serviceInstance Service Instance
         */
        InjectableObject.prototype.defineService = function (serviceName, serviceInstance) {
            var propName = _s.decapitalize(serviceName);
            Object.defineProperty(this, propName, {
                get: function () {
                    return serviceInstance;
                }
            });
        };
        /**
         * Service names to be injected
         */
        InjectableObject.injects = ['$injector'];
        return InjectableObject;
    }());
    exports.InjectableObject = InjectableObject;
});
