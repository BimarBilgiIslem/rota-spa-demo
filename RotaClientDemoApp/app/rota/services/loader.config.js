var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../base/baseconfig"], function (require, exports, baseconfig_1) {
    "use strict";
    //#region RouteConfig
    var LoaderConfig = (function (_super) {
        __extends(LoaderConfig, _super);
        function LoaderConfig() {
            _super.call(this);
            //set default values
            var config = {};
            config.useBaseUrl =
                config.useTemplateUrlPath = true;
            this.config = config;
        }
        return LoaderConfig;
    }(baseconfig_1.BaseConfig));
    exports.LoaderConfig = LoaderConfig;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.loader.config', []);
    module.provider('LoaderConfig', LoaderConfig);
    //#endregion
});
