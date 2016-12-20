define(["require", "exports", './loader.config'], function (require, exports) {
    "use strict";
    //#endregion
    //#region Loader Service
    /**
     * Controller File Loader Service
     */
    var Loader = (function () {
        function Loader(loaderconfig, routeconfig) {
            this.loaderconfig = loaderconfig;
            this.routeconfig = routeconfig;
            this.serviceName = "Loader Service";
        }
        /**
         * Generate file path depending on provided settings and general settings
         * @param settings Settings
         */
        Loader.prototype.getPath = function (settings) {
            var relativePath = settings.controllerUrl;
            if (!relativePath && (settings.useTemplateUrlPath || this.loaderconfig.useTemplateUrlPath)) {
                relativePath = settings.templateUrl.replace('.html', '.controller');
            }
            var controllerFullName = relativePath;
            return controllerFullName;
        };
        /**
         * Returns inline annotated function array for the loaded file
         * @param settings Settings
         */
        Loader.prototype.resolve = function (settings) {
            var fileFullPath = this.getPath(settings);
            //file resolve
            return {
                //lazy loading promise
                load: ['$q', '$rootScope', function ($q, $rootScope) {
                        var defer = $q.defer();
                        window.require([fileFullPath], function () {
                            defer.resolve();
                            $rootScope.$apply();
                        });
                        return defer.promise;
                    }]
            };
        };
        //states
        Loader.$inject = ['LoaderConfig', 'RouteConfig'];
        return Loader;
    }());
    exports.Loader = Loader;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.loader', ['rota.services.loader.config']);
    module.service('Loader', Loader);
    //#endregion
});
