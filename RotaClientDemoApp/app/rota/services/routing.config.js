var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../base/baseconfig"], function (require, exports, baseconfig_1) {
    "use strict";
    //#endregion
    //#region RouteConfig
    var RouteConfigProvider = (function (_super) {
        __extends(RouteConfigProvider, _super);
        function RouteConfigProvider(constants) {
            _super.call(this);
            var config = {};
            config.shellPath = constants.routing.SHELL_PATH;
            config.error404StateUrl = window.require.toUrl(config.shellPath + constants.routing.NOT_FOUND_HTML_NAME);
            config.error500StateUrl = window.require.toUrl(config.shellPath + constants.routing.INTERNAL_ERROR_HTML_NAME);
            config.inactiveStateUrl = '/';
            config.contentControllerAlias = constants.routing.CONTROLLER_ALIAS_NAME;
            config.shellControllerAlias = constants.routing.SHELL_CONTROLLER_ALIAS_NAME;
            this.config = config;
        }
        return RouteConfigProvider;
    }(baseconfig_1.BaseConfig));
    exports.RouteConfigProvider = RouteConfigProvider;
    //#endregion
    //#region Injection
    RouteConfigProvider.$inject = ['Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.routing.config', []);
    module.provider('RouteConfig', RouteConfigProvider);
    //#endregion
});
