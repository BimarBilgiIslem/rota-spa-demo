define(["require", "exports", "./security.config"], function (require, exports) {
    "use strict";
    //#endregion
    //#region JWTHelper
    /**
     * JWT helper service
     */
    var JwtHelper = (function () {
        //#endregion
        //#region Init
        function JwtHelper($http, $q, securityConfig, logger, common, constants) {
            this.$http = $http;
            this.$q = $q;
            this.securityConfig = securityConfig;
            this.logger = logger;
            this.common = common;
            this.constants = constants;
            this.metadata = null;
            this.authendpoint = null;
            this.jwks = null;
            this.authority = securityConfig.authority;
            if (this.authority && this.authority.indexOf(constants.security.AUTHORITY_PART) < 0) {
                if (this.authority[this.authority.length - 1] !== '/') {
                    this.authority += '/';
                }
                this.authority += constants.security.AUTHORITY_PART;
                this.logger.console.info({ message: 'authority is set to ' + this.authority });
            }
            else {
                this.logger.console.error({ message: 'authority is not defined' });
            }
        }
        //#endregion
        //#region Methods
        /**
        * Shortcut way of rejection promise
        * @param cause Reason
        * @returns {ng.IPromise<string>}
        */
        JwtHelper.prototype.reject = function (cause) {
            return this.common.rejectedPromise(cause);
        };
        /**
       * Load metadata information using authority
       * @returns {ng.IPromise<IOpenIdMetaData>}
       */
        JwtHelper.prototype.loadMetadata = function () {
            var _this = this;
            this.logger.console.log({ message: 'getting metadata' });
            if (!this.common.isAssigned(this.authority)) {
                return this.reject("no authority configured");
            }
            if (this.common.isAssigned(this.metadata)) {
                return this.common.promise(this.metadata);
            }
            return this.$http.get(this.authority).then(function (response) {
                return _this.metadata = response.data;
            });
        };
        /**
       * Gets authorization endpoint uri using metadata
       * @returns {ng.IPromise<string>}
       */
        JwtHelper.prototype.loadAuthorizationEndpoint = function () {
            var _this = this;
            this.logger.console.log({ message: 'loading autorization endpoint' });
            if (this.common.isAssigned(this.authendpoint)) {
                return this.common.promise(this.authendpoint);
            }
            return this.loadMetadata().then(function (metadata) {
                if (!_this.common.isAssigned(metadata.authorization_endpoint)) {
                    return _this.reject("metadata does not contain authorization_endpoint");
                }
                return _this.authendpoint = metadata.authorization_endpoint;
            });
        };
        /**
       * Load user profile using profile end point in case loadUserProfile flag is true
       * @param accessToken Access Token
       * @returns {ng.IPromise<IUser>}
       */
        JwtHelper.prototype.loadUserProfile = function (accessToken) {
            var _this = this;
            return this.loadMetadata().then(function (metadata) {
                if (!_this.common.isAssigned(metadata.userinfo_endpoint)) {
                    return _this.reject("Metadata does not contain userinfo_endpoint");
                }
                return _this.$http({
                    headers: { 'Authorization': 'Bearer ' + accessToken },
                    method: 'GET',
                    url: metadata.userinfo_endpoint
                }).then(function (response) { return response.data; });
            });
        };
        /**
        * Create Logout request using metadata
        * @param idTokenHint Id Token
        * @returns {ng.IPromise<string>}
        */
        JwtHelper.prototype.createLogoutRequest = function (idTokenHint) {
            var _this = this;
            return this.loadMetadata().then(function (metadata) {
                if (!_this.common.isAssigned(metadata.end_session_endpoint)) {
                    return _this.reject('no end_session_endpoint in metadata');
                }
                var url = metadata.end_session_endpoint;
                if (idTokenHint && _this.securityConfig.postLogoutRedirectUri) {
                    url += "?post_logout_redirect_uri=" + encodeURIComponent(_this.securityConfig.postLogoutRedirectUri);
                    url += "&id_token_hint=" + encodeURIComponent(idTokenHint);
                }
                return url;
            });
        };
        /**
       * Get signing key using metadata
       * @returns {ng.IPromise<string>}
       */
        JwtHelper.prototype.loadX509SigningKey = function () {
            var _this = this;
            var parseKeys = function (jwks) {
                if (!jwks.keys || !jwks.keys.length) {
                    return _this.reject("signing keys empty");
                }
                var key = jwks.keys[0];
                if (key.kty !== "RSA") {
                    return _this.reject("signing key not RSA");
                }
                if (!key.x5c || !key.x5c.length) {
                    return _this.reject("RSA keys empty");
                }
                return _this.common.promise(key.x5c[0]);
            };
            if (this.common.isAssigned(this.jwks)) {
                return parseKeys(this.jwks);
            }
            return this.loadMetadata().then(function (metadata) {
                if (!_this.common.isAssigned(metadata.jwks_uri)) {
                    return _this.reject("metadata does not contain jwks_uri");
                }
                return _this.$http.get(metadata.jwks_uri).then(function (response) {
                    _this.jwks = response.data;
                    return parseKeys(response.data);
                }, function (err) {
                    return _this.reject("Failed to load signing keys (" + err.message + ")");
                });
            });
        };
        /**
        * Validate Id Token comparing state,nonce etc..
        * @param idToken Id Token
        * @param nonce Nonce - Number once
        * @returns {ng.IPromise<IClaims>}
        */
        JwtHelper.prototype.validateIdToken = function (idToken, nonce) {
            var _this = this;
            return this.loadX509SigningKey().then(function (cert) {
                var jws = new KJUR.jws.JWS();
                if (jws.verifyJWSByPemX509Cert(idToken, cert)) {
                    var idTokenContents_1 = JSON.parse(jws.parsedJWS.payloadS);
                    if (nonce !== idTokenContents_1.nonce) {
                        return _this.reject("Invalid nonce");
                    }
                    return _this.loadMetadata().then(function (metadata) {
                        if (idTokenContents_1.iss !== metadata.issuer) {
                            return _this.reject("Invalid issuer");
                        }
                        if (idTokenContents_1.aud !== _this.securityConfig.clientId) {
                            return _this.reject("Invalid audience");
                        }
                        var now = Math.round(Date.now() / 1000);
                        var diff = now - idTokenContents_1.iat;
                        if (diff > (5 * 60)) {
                            return _this.reject("Token issued too long ago");
                        }
                        if (idTokenContents_1.exp < now) {
                            return _this.reject("Token expired");
                        }
                        return _this.common.promise(idTokenContents_1);
                    });
                }
                else {
                    return _this.reject("JWT failed to validate");
                }
            });
        };
        /**
         * Filters claims using openIdBuiltInClaims
         * @param claims All Claims
         * @returns {IUser}
         */
        JwtHelper.prototype.filterProtocolClaims = function (claims) {
            this.constants.security.OPEN_ID_BUILTIN_CLAIMS.forEach(function (claim) {
                delete claims[claim];
            });
            return claims;
        };
        return JwtHelper;
    }());
    //#endregion
    //#region Security Service
    var Security = (function () {
        //#endregion
        //#region Init
        function Security($rootScope, $http, $q, securityConfig, config, common, localization, caching, logger, jwthelper, currentUser, currentCompany, tokens, constants) {
            var _this = this;
            this.$rootScope = $rootScope;
            this.$http = $http;
            this.$q = $q;
            this.securityConfig = securityConfig;
            this.config = config;
            this.common = common;
            this.localization = localization;
            this.caching = caching;
            this.logger = logger;
            this.jwthelper = jwthelper;
            this.currentUser = currentUser;
            this.currentCompany = currentCompany;
            this.tokens = tokens;
            this.constants = constants;
            this.expiresAt = Math.round(Date.now() - 1 / 1000);
            /**
             * Listen for loginRequired event to redirect to login page
             */
            $rootScope.$on(config.eventNames.loginRequired, function () {
                _this.handleUnAuthorized();
            });
            //set current company
            this.setCurrenyCompany();
        }
        Object.defineProperty(Security.prototype, "isAuthenticated", {
            /**
             * Authorization flag
             * @returns {boolean}
             */
            get: function () {
                return !_.isEmpty(this.currentUser) && !this.expired;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Security.prototype, "expired", {
            /**
             * Returns true if id token expired
             * @returns {boolean}
             */
            get: function () {
                var now = Math.round(Date.now() / 1000);
                return this.expiresAt < now;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Security.prototype, "expiresIn", {
            /**
             * Returns time span for expiration
             * @returns {}
             */
            get: function () {
                var now = Math.round(Date.now() / 1000);
                return this.expiresAt - now;
            },
            enumerable: true,
            configurable: true
        });
        //#endregion
        //#region Utils
        /**
         * Set current company
         */
        Security.prototype.setCurrenyCompany = function () {
            var selectedCompany = null;
            var companyId = this.caching.sessionStorage.get(this.constants.security.STORAGE_NAME_COMPANY_ID)
                || this.securityConfig.defaultCompanyId;
            if (this.common.isAssigned(companyId)) {
                selectedCompany = _.findWhere(this.securityConfig.authorizedCompanies, { id: companyId });
            }
            if (!selectedCompany && this.securityConfig.authorizedCompanies && this.securityConfig.authorizedCompanies.length) {
                selectedCompany = this.securityConfig.authorizedCompanies[0];
            }
            angular.extend(this.currentCompany, selectedCompany);
        };
        /**
         * Shortcut way of rejecting promise
         * @param cause Reason
         */
        Security.prototype.reject = function (cause) {
            return this.common.rejectedPromise(cause);
        };
        /**
        * Used by routing service to show view
        * @param state  State obj
        * @description if promise resolved,state is authenticated
        * @returns {ng.IPromise<any>}
        */
        Security.prototype.isStateAuthenticated = function (state) {
            var _this = this;
            var d = this.$q.defer();
            if (!this.securityConfig.allowAnonymousAccess) {
                this.initPromise.then(function () {
                    if (_this.isAuthenticated) {
                        d.resolve();
                    }
                    else {
                        d.reject();
                    }
                });
            }
            else {
                d.resolve();
            }
            return d.promise;
        };
        //#endregion
        //#region UnAuthorized Methods
        /**
         * Clear all cache and headers
         */
        Security.prototype.clearCredentials = function () {
            this.logger.console.warn({ message: 'All authorization token and user info cleared' });
            this.caching.localStorage.remove(this.securityConfig.tokenStorageName);
            delete this.$http.defaults.headers.common['Authorization'];
            this.currentUser = null;
        };
        /**
         * Clear crdentials and redirect to login page
         */
        Security.prototype.handleUnAuthorized = function () {
            var _this = this;
            this.clearCredentials();
            return this.createTokenRequest().then(function (request) {
                _this.caching.sessionStorage.store(_this.securityConfig.stateTempStorageName, request.settings);
                window.location.href = request.url;
            });
        };
        /**
         * Logoff
         */
        Security.prototype.logOff = function () {
            var _this = this;
            //Request logout endpoint
            return this.jwthelper.createLogoutRequest(this.tokens.idToken).then(function (url) {
                //Clear token 
                _this.clearCredentials();
                //Go logout
                window.location.href = url;
            });
        };
        //#endregion
        //#region Token Methods
        /**
         * Get token from storage and initiate authorization
         */
        Security.prototype.initToken = function () {
            var _this = this;
            var storageName = this.securityConfig.tokenStorageName;
            var tokenModel = this.caching.sessionStorage.get(storageName);
            if (this.common.isNotEmptyObject(tokenModel)) {
                this.caching.sessionStorage.remove(storageName);
                return this.handleUserModel(tokenModel).then(function (profile) {
                    var model = {
                        profile: profile,
                        id_token: tokenModel.id_token,
                        access_token: tokenModel.access_token,
                        expires_in: tokenModel.expires_in
                    };
                    _this.caching.localStorage.store(storageName, model);
                    return model;
                });
            }
            var profileModel = this.caching.localStorage.get(storageName);
            if (this.common.isNotEmptyObject(profileModel)) {
                return this.common.promise(profileModel);
            }
            return this.reject();
        };
        /**
         * Generate token request uri using metadata
         */
        Security.prototype.createTokenRequest = function () {
            var _this = this;
            this.logger.console.log({ message: "Creating token request" });
            var self = this;
            //Meta bilgisinden auth endposint bilgisini al
            return this.jwthelper.loadAuthorizationEndpoint().then(function (authorizationEndpoint) {
                //Redirect Uri & State
                var state = _this.common.getRandomNumber();
                var nonce = _this.common.getRandomNumber();
                //Url parts
                var settings = {
                    state: state,
                    nonce: nonce,
                    client_id: self.securityConfig.clientId,
                    response_type: self.securityConfig.responseType,
                    redirect_uri: self.securityConfig.redirectUri,
                    scope: _this.constants.security.DEFAULT_ROTA_SCOPES + " " + _this.securityConfig.scope
                };
                var url = authorizationEndpoint + '?';
                for (var key in settings) {
                    if (settings.hasOwnProperty(key)) {
                        url += key + "=" + encodeURIComponent(settings[key]) + "&";
                    }
                }
                return {
                    settings: {
                        nonce: nonce,
                        state: state
                    },
                    url: url
                };
            });
        };
        /**
         * Validates id token
         * @param model Token Model
         */
        Security.prototype.checkToken = function (model) {
            //Get state to compare
            var requestSettings = this.caching.sessionStorage.get(this.securityConfig.stateTempStorageName);
            this.caching.sessionStorage.remove(this.securityConfig.stateTempStorageName);
            //Kontroller
            if (!requestSettings) {
                return this.reject("No request state loaded");
            }
            if (!requestSettings.state) {
                return this.reject("No state loaded");
            }
            if (model.state !== requestSettings.state) {
                return this.reject("Invalid state");
            }
            if (!requestSettings.nonce) {
                return this.reject("No nonce loaded");
            }
            if (!model.id_token) {
                return this.reject("No identity token");
            }
            if (!model.access_token) {
                return this.reject("No access token");
            }
            //Validate JWT open_id token and return claims
            return this.jwthelper.validateIdToken(model.id_token, requestSettings.nonce);
        };
        /**
        * Request token from which defined in security config
        * @returns {}
        */
        Security.prototype.getAntiForgeryToken = function (state) {
            var _this = this;
            var d = this.$q.defer();
            if (this.common.isAssigned(this.securityConfig.antiForgeryTokenUrl)) {
                this.isStateAuthenticated(state)
                    .then(function () {
                    _this.$http.get(_this.securityConfig.antiForgeryTokenUrl)
                        .then(function (args) {
                        d.resolve(_this.tokens.antiForgeryToken = args.data);
                    });
                }, function () {
                    d.reject();
                });
            }
            else {
                throw new Error(this.constants.errors.NO_ANTIFORGERY_TOKEN_URL_DEFINED);
            }
            return d.promise;
        };
        //#endregion
        //#region Authorize Methods
        /**
         * Set request Authorization
         * @param accessToken Token
         */
        Security.prototype.setAuthHeader = function (accessToken) {
            var header = 'Bearer ' + accessToken;
            delete this.$http.defaults.headers.common['Authorization'];
            this.$http.defaults.headers.common['Authorization'] = header;
        };
        /**
         * Set currentuser value service and broadcast a loginchanged event
         * @param model Profile model
         */
        Security.prototype.setCredentials = function (model) {
            //Authentication icin request header bilgisine token'i ekle
            this.setAuthHeader(model.access_token);
            //Log 
            this.logger.console.log({ message: 'user logged-in as ' + model.profile.name, data: model.profile });
            //currentUser servisini set edip claims bilgilerini donduruyorz
            //Combine user claims provided by OIC and server profile structure
            this.currentUser = angular.extend(this.currentUser, model.profile, this.securityConfig.userProfile);
            //Kullanici login oldugunda event firlat
            this.$rootScope.$broadcast(this.config.eventNames.userLoginChanged, this.currentUser);
            return this.currentUser;
        };
        /**
         * Check model validation and filter builtIn claims
         * @param model Token Model
         */
        Security.prototype.handleUserModel = function (model) {
            var _this = this;
            return this.checkToken(model).then(function (claims) {
                //Filter protocal claims
                var userClaims = _this.jwthelper.filterProtocolClaims(claims);
                if (_this.securityConfig.loadUserProfile) {
                    return _this.jwthelper.loadUserProfile(model.access_token).then(function (profileClaims) { return angular.extend(userClaims || {}, profileClaims); });
                }
                else {
                    return userClaims;
                }
            });
        };
        /**
         * Set interval for checking expiration of id token
         * @param expIn Time span
         */
        Security.prototype.configExpire = function (expIn) {
            var _this = this;
            //Set expireAt
            var now = Math.round(Date.now() / 1000);
            this.expiresAt = now + Math.round(expIn);
            //Automatic expire
            if (expIn) {
                var handle = window.setTimeout(function () {
                    window.clearTimeout(handle);
                    handle = null;
                    //Request auth endpoint
                    _this.handleUnAuthorized();
                }, Math.round(expIn) * 1000);
            }
        };
        /**
         * Starts authorization phase
         */
        Security.prototype.initSecurity = function () {
            var _this = this;
            return this.initToken().then(function (tokenModel) {
                //Save Id token for logout
                _this.tokens.idToken = tokenModel.id_token;
                _this.tokens.accessToken = tokenModel.access_token;
                //Access_token bitiş suresi set et
                _this.configExpire(tokenModel.expires_in);
                //Set auth header,currentUser
                _this.setCredentials(tokenModel);
                //Sonuc model
                return tokenModel;
            }, function (error) {
                if (_this.common.isString(error)) {
                    _this.logger.console.error({ message: error });
                }
                _this.handleUnAuthorized();
                return _this.reject();
            });
        };
        return Security;
    }());
    exports.Security = Security;
    //#region Injection
    JwtHelper.$inject = ['$http', '$q', 'SecurityConfig', 'Logger', 'Common', 'Constants'];
    Security.$inject = ['$rootScope', '$http', '$q', 'SecurityConfig', 'Config', 'Common', 'Localization',
        'Caching', 'Logger', 'JWTHelper', 'CurrentUser', 'CurrentCompany', 'Tokens', 'Constants'
    ];
    //#endregion
    //#endregion
    //#region Register
    var serviceModule = angular.module('rota.services.security', ['rota.services.security.config']);
    serviceModule
        .service('JWTHelper', JwtHelper)
        .service('Security', Security)
        .value('CurrentUser', {})
        .value('CurrentCompany', {})
        .value('Tokens', {});
    //#endregion
    //#region Initialize Security
    serviceModule.run(['Security', 'SecurityConfig', 'Logger', function (security, securityconfig, logger) {
            //Log
            logger.console.warn({
                message: "Security is initiated with AllowAnonymousAccess " + (securityconfig.allowAnonymousAccess ? 'true' : 'false') + ",antiForgeryTokenEnabled " + (securityconfig.antiForgeryTokenEnabled ? 'true' : 'false')
            });
            //Eger allowAnonymousAccess e izin verilmiyorsa 
            if (!securityconfig.allowAnonymousAccess) {
                //Bir onceki session'dan eger varsa kullanici bilgilerini yukle
                security.initPromise = security.initSecurity();
            }
        }]);
    //#endregion
});
