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
define(["require", "exports", "./signalr.hub"], function (require, exports, signalr_hub_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PushService = (function () {
        function PushService(config, logger, common) {
            this.config = config;
            this.logger = logger;
            this.common = common;
            //#region Props
            this.serviceName = "PushService";
        }
        PushService.prototype.connectToHub = function (hubName, options) {
            if (this.common.isNullOrEmpty(hubName))
                throw new Error("hub name must be provided");
            options = angular.extend({
                rootPath: this.config.pushServicePath,
                logging: this.config.debugMode,
                errorHandler: this.config.debugMode && this.errorHandler.bind(this),
                useSharedConnection: true
            }, options);
            return new signalr_hub_1.Hub(hubName, options);
        };
        PushService.prototype.errorHandler = function (error) {
            this.logger.toastr.error({ message: error.message });
            this.logger.console.error({ message: error.message, data: error });
        };
        PushService.injectionName = "PushService";
        //#endregion
        //#region Init
        PushService.$inject = ["Config", "Logger", "Common"];
        return PushService;
    }());
    exports.PushService = PushService;
    //#region Register
    var module = angular.module('rota.services.signalr', []);
    module.service(PushService.injectionName, PushService);
});
