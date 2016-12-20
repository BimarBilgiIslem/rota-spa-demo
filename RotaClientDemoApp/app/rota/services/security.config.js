var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../base/baseconfig"], function (require, exports, baseconfig_1) {
    "use strict";
    //#endregion
    //#region SecurityConfig
    var SecurityConfigProvider = (function (_super) {
        __extends(SecurityConfigProvider, _super);
        function SecurityConfigProvider(environments, constants) {
            _super.call(this);
            var config = {
                tokenStorageName: constants.security.STORAGE_NAME_AUTH_TOKEN,
                stateTempStorageName: constants.security.STORAGE_NAME_TEMP_STATE,
                redirectUri: window.location.protocol + "//" + window.location.host + constants.security.REDIRECT_URI_PATH,
                postLogoutRedirectUri: window.location.protocol + "//" + window.location.host,
                responseType: constants.security.DEFAULT_ROTA_RESPONSE_TYPE,
                scope: '',
                loadUserProfile: false,
                filterProtocolClaims: true,
                clientId: environments.clientId,
                authority: environments.authority,
                allowAnonymousAccess: environments.allowAnonymousAccess,
                antiForgeryTokenEnabled: environments.antiForgeryTokenEnabled,
                antiForgeryTokenUrl: constants.server.ACTION_NAME_ANTI_FORGERY_TOKEN,
                antiForgeryTokenHeaderName: constants.server.HEADER_NAME_ANTI_FORGERY_TOKEN
            };
            this.config = config;
        }
        return SecurityConfigProvider;
    }(baseconfig_1.BaseConfig));
    exports.SecurityConfigProvider = SecurityConfigProvider;
    //#endregion
    //#region Injection
    SecurityConfigProvider.$inject = ['Environment', 'Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.security.config', []);
    module.provider('SecurityConfig', SecurityConfigProvider);
    //#endregion
});
