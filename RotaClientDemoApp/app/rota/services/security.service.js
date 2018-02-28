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
define(["require", "exports", "config/oidc-manager", "./security.config"], function (require, exports, OidcManager) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Security Service
    var Security = (function () {
        //#region Init
        function Security($window, $rootScope, $http, securityConfig, config, common, caching, logger, currentUser, currentCompany, tokens, constants) {
            this.$window = $window;
            this.$rootScope = $rootScope;
            this.$http = $http;
            this.securityConfig = securityConfig;
            this.config = config;
            this.common = common;
            this.caching = caching;
            this.logger = logger;
            this.currentUser = currentUser;
            this.currentCompany = currentCompany;
            this.tokens = tokens;
            this.constants = constants;
            //set current company
            this.setCurrentCompany();
        }
        //#endregion
        //#region Utils
        /**
         * Set company from UI
         * @param company Company to be selected
         */
        Security.prototype.setCompany = function (company) {
            if (this.currentCompany && this.currentCompany.id === company.id)
                return;
            //store current company
            this.caching.sessionStorage.store(this.constants.security.STORAGE_NAME_CURRENT_COMPANY, company, false);
            //store map settings of company that is to be sent to the server in header meta
            this.caching.sessionStorage.store(this.constants.security.STORAGE_NAME_REQUEST_HEADER_MAPS, this.config.requestHeaderMaps, false);
            //redirect to home page
            this.$window.location.replace("");
        };
        /**
         * Set current company
         */
        Security.prototype.setCurrentCompany = function () {
            var selectedCompany = null;
            var storedCompany = this.caching.sessionStorage
                .get(this.constants.security.STORAGE_NAME_CURRENT_COMPANY, null, false);
            var companyId = (storedCompany && this.common.isAssigned(storedCompany.id)) ? storedCompany.id : this.securityConfig.defaultCompanyId;
            if (this.common.isAssigned(companyId)) {
                selectedCompany = this.securityConfig.authorizedCompanies.findById(companyId);
            }
            if (!selectedCompany && this.securityConfig.authorizedCompanies && this.securityConfig.authorizedCompanies.length) {
                selectedCompany = this.securityConfig.authorizedCompanies[0];
            }
            angular.extend(this.currentCompany, selectedCompany);
        };
        //#endregion
        //#region UnAuthorized Methods
        /**
         * Clear crdentials and redirect to login page
         */
        Security.prototype.handleUnAuthorized = function () {
            delete this.$http.defaults.headers.common['Authorization'];
            this.currentUser = null;
            //redirect to oip
            this.logOff();
        };
        /**
         * Logoff
         */
        Security.prototype.logOff = function () {
            OidcManager.signOut();
        };
        //#endregion
        //#region Authorize Methods
        /**
         * Set currentuser value service and broadcast a loginchanged event
         * @param model Profile model
         */
        Security.prototype.setCredentials = function (model) {
            //set auth header for http adapter
            var header = 'Bearer ' + model.access_token;
            delete this.$http.defaults.headers.common['Authorization'];
            this.$http.defaults.headers.common['Authorization'] = header;
            //save tokens for internal usage
            this.tokens.idToken = model.id_token;
            this.tokens.accessToken = model.access_token;
            //combine user claims provided by OIC and server profile structure
            this.currentUser = angular.extend(this.currentUser, model.profile, this.securityConfig.userProfile);
            this.logger.console.log({ message: 'user logged-in as ' + model.profile.name, data: model.profile });
        };
        /**
         * Starts authorization phase
         */
        Security.prototype.initSecurity = function () {
            var _this = this;
            if (!this.common.isNotEmptyObject(OidcManager.user)) {
                return this.handleUnAuthorized();
            }
            //Set auth header,currentUser
            this.setCredentials(OidcManager.user);
            //update user when silent renew occured
            OidcManager.userRenewed(function (user) {
                _this.setCredentials(user);
            });
            //listen for loginRequired event to redirect to login page
            this.$rootScope.$on(this.config.eventNames.loginRequired, function () {
                _this.handleUnAuthorized();
            });
        };
        Security.injectionName = "Security";
        return Security;
    }());
    exports.Security = Security;
    //#region Injection
    Security.$inject = ['$window', '$rootScope', '$http', 'SecurityConfig', 'Config', 'Common',
        'Caching', 'Logger', 'CurrentUser', 'CurrentCompany', 'Tokens', 'Constants'
    ];
    //#endregion
    //#endregion
    //#region Register
    var serviceModule = angular.module('rota.services.security', ['rota.services.security.config']);
    serviceModule
        .service(Security.injectionName, Security)
        .value('CurrentUser', {})
        .value('CurrentCompany', {})
        .value('Tokens', {});
    //#endregion
    //#region Initialize Security
    serviceModule.run(['Security', 'Environment', function (security, env) {
            if (!env.allowAnonymous)
                security.initSecurity();
        }]);
});
