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
    //#region RouteConfig
    var RouteConfigProvider = (function (_super) {
        tslib_1.__extends(RouteConfigProvider, _super);
        function RouteConfigProvider(constants) {
            var _this = _super.call(this) || this;
            var config = {};
            config.templates = tslib_1.__assign({}, constants.routing.TEMPLATES);
            config.contentControllerAlias = constants.routing.CONTROLLER_ALIAS_NAME;
            config.shellControllerAlias = constants.routing.SHELL_CONTROLLER_ALIAS_NAME;
            _this.config = config;
            return _this;
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
});
