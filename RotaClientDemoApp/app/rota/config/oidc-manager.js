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
define(["require", "exports", "oidc"], function (require, exports) {
    "use strict";
    //#endregion
    /**
     * OIDC client manager wrapper
     */
    var OidcManager = (function () {
        function OidcManager() {
        }
        //#endregion
        //#region Methods
        OidcManager.init = function (settings) {
            //get oidc usermanager
            OidcManager.instance = OidcManager.createInstance(settings);
            //clear stale sessions
            OidcManager.instance.clearStaleState();
            //check signout request
            if (OidcManager.PATH.toLowerCase() === OidcManager.SIGNOUT_PATH) {
                OidcManager.instance.removeUser();
            }
            //enable logging
            if (window.__globalEnvironment.debugging) {
                Oidc.Log.logger = console;
            }
            //update user when token updated
            OidcManager.instance.events.addUserLoaded(function (user) {
                OidcManager.user = user;
            });
            OidcManager.instance.events.addAccessTokenExpired(function (ev) {
                OidcManager.signinRedirect();
            });
            OidcManager.instance.events.addUserSignedOut(function () {
                OidcManager.signinRedirect();
            });
            return OidcManager.authorize();
        };
        /**
         * Sign off
         */
        OidcManager.signOut = function () {
            OidcManager.instance.signoutRedirect();
        };
        /**
         * Refresh token
         */
        OidcManager.signinRedirect = function () {
            if (OidcManager.PATH.toLowerCase() !== OidcManager.SIGNOUT_PATH) {
                sessionStorage.setItem(OidcManager.REDIRECT_URI_STORAGE_NAME, location.href);
            }
            OidcManager.instance.signinRedirect();
        };
        /**
         * Update user when silent renew occured
         * @param callback
         */
        OidcManager.userRenewed = function (callback) {
            OidcManager.instance.events.addUserLoaded(callback);
        };
        /**
         * Init authorization
         */
        OidcManager.authorize = function () {
            var result;
            //signin callback
            if (window.location.hash && OidcManager.REGEX_ID_TOKEN.test(window.location.hash)) {
                result = OidcManager.instance.signinRedirectCallback().then(function (user) {
                    OidcManager.removeHash();
                    //redirect requested uri
                    var redirectUri = sessionStorage.getItem(OidcManager.REDIRECT_URI_STORAGE_NAME);
                    sessionStorage.removeItem(OidcManager.REDIRECT_URI_STORAGE_NAME);
                    if (redirectUri && location.href !== redirectUri) {
                        window.history.pushState(null, null, redirectUri);
                    }
                    return user;
                });
            }
            else {
                //already loggedin ?
                result = OidcManager.instance.getUser();
            }
            return result.then(function (user) {
                if (user !== null) {
                    OidcManager.user = user;
                }
                else {
                    OidcManager.signinRedirect();
                }
                return user;
            });
        };
        /**
         * Remove fragment part from url
         */
        OidcManager.removeHash = function () {
            window.location.replace("#");
            if (typeof window.history.replaceState == 'function') {
                history.replaceState({}, '', window.location.href.slice(0, -1));
            }
        };
        /**
         * get Oidc usermanager instance
         */
        OidcManager.createInstance = function (settings) {
            var _settings = {
                redirect_uri: settings.redirectUri || OidcManager.HOST,
                post_logout_redirect_uri: settings.postLogoutRedirectUri || OidcManager.HOST,
                authority: settings.authority,
                client_id: settings.clientId,
                response_type: OidcManager.RESPONSE_TYPE,
                scope: settings.scope || OidcManager.SCOPE,
                clockSkew: settings.clockSkew || OidcManager.CLOCK_SKEW,
                filterProtocolClaims: true,
                loadUserInfo: false,
                monitorSession: true,
                ui_locales: settings.lang,
                automaticSilentRenew: true,
                silent_redirect_uri: settings.silentRedirectUri || (OidcManager.HOST + "/" + OidcManager.SILENT_RENEW_HTML_PATH),
                userStore: new Oidc.WebStorageStateStore({ store: window.sessionStorage })
            };
            return new Oidc.UserManager(_settings);
        };
        //#region Props
        OidcManager.REGEX_ID_TOKEN = /\#id_token/;
        OidcManager.REDIRECT_URI_STORAGE_NAME = "_redirect-uri";
        OidcManager.SIGNOUT_PATH = "signout";
        OidcManager.RESPONSE_TYPE = "id_token token";
        OidcManager.SCOPE = "openid rotauser rotaapi";
        OidcManager.CLOCK_SKEW = 60;
        OidcManager.HOST = window.location.protocol + "//" + window.location.host;
        OidcManager.SILENT_RENEW_HTML_PATH = window.require.toUrl("silentrenew").split("?")[0];
        OidcManager.PATH = window.location.href.split('/').pop();
        return OidcManager;
    }());
    return OidcManager;
});
