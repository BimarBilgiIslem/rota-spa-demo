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
define(["require", "exports", "tslib", "../base/baseconfig"], function (require, exports, tslib_1, baseconfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region SecurityConfig
    var SecurityConfigProvider = (function (_super) {
        tslib_1.__extends(SecurityConfigProvider, _super);
        function SecurityConfigProvider(environments, constants) {
            var _this = _super.call(this) || this;
            var config = {
                logOffWhenIdleTimeout: environments.logOffWhenIdleTimeout === undefined ? true : environments.logOffWhenIdleTimeout,
                idleTimeout: constants.security.IDLE_TIMEOUT,
                idleLogoffCountDown: constants.security.COUNT_DOWN_FOR_IDLE_TIMEOUT,
                useFirstLetterAvatar: true,
                avatarFetchType: 1 /* GetRequest */,
                accessTokenQueryStringName: constants.security.ACCESS_TOKEN_QUERY_STRING_NAME
            };
            _this.config = config;
            return _this;
        }
        SecurityConfigProvider.injectionName = "SecurityConfig";
        return SecurityConfigProvider;
    }(baseconfig_1.BaseConfig));
    exports.SecurityConfigProvider = SecurityConfigProvider;
    //#endregion
    //#region Injection
    SecurityConfigProvider.$inject = ['Environment', 'Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.security.config', []);
    module.provider(SecurityConfigProvider.injectionName, SecurityConfigProvider);
});
