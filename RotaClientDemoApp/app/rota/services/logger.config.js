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
define(["require", "exports", "tslib", "../base/baseconfig", "toastr"], function (require, exports, tslib_1, baseconfig_1, toastr) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region RouteConfig
    var LoggerConfig = (function (_super) {
        tslib_1.__extends(LoggerConfig, _super);
        function LoggerConfig(constants) {
            var _this = _super.call(this) || this;
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
            _this.config = config;
            return _this;
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
});
