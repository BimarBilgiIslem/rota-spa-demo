var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../base/baseconfig", "toastr"], function (require, exports, baseconfig_1, toastr) {
    "use strict";
    //#endregion
    //#region RouteConfig
    var LoggerConfig = (function (_super) {
        __extends(LoggerConfig, _super);
        function LoggerConfig(constants) {
            _super.call(this);
            var config = {}; //$Log service enabled
            //toastr common settings
            toastr.options.timeOut = constants.logger.TOASTR_TIMEOUT;
            toastr.options.positionClass = constants.logger.TOASTR_POSITION;
            //timeout durations
            config.timeOuts = {};
            config.timeOuts[2 /* Warn */] = constants.logger.TOASTR_WARN_TIMEOUT;
            config.timeOuts[1 /* Error */] = constants.logger.TOASTR_ERROR_TIMEOUT;
            config.timeOuts[0 /* Info */] = constants.logger.TOASTR_INFO_TIMEOUT;
            config.timeOuts[3 /* Success */] = constants.logger.TOASTR_SUCCESS_TIMEOUT;
            config.timeOuts[4 /* Debug */] = constants.logger.TOASTR_DEBUG_TIMEOUT;
            config.defaultTitles = {};
            this.config = config;
        }
        return LoggerConfig;
    }(baseconfig_1.BaseConfig));
    exports.LoggerConfig = LoggerConfig;
    //#endregion
    //#region Injection
    LoggerConfig.$inject = ['Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.log.config', []);
    module.provider('LoggerConfig', LoggerConfig);
    //#endregion
});
