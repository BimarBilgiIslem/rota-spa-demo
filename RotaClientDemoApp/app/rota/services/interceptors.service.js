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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Request Tracker
    var httpRequestTrackerService = function ($q, $location, $rootScope, $timeout, config, constants) {
        var queue = [];
        var timerPromise;
        var timerPromiseHide;
        var processRequest = function () {
            queue.push({});
            if (queue.length === 1) {
                timerPromise = $timeout(function () {
                    if (queue.length) {
                        $rootScope.$broadcast(config.eventNames.ajaxStarted);
                    }
                }, constants.server.AJAX_TIMER_DELAY);
            }
        };
        var processResponse = function () {
            queue.pop();
            if (queue.length === 0) {
                //Since we don't know if another XHR request will be made, pause before
                //hiding the overlay. If another XHR request comes in then the overlay
                //will stay visible which prevents a flicker
                timerPromiseHide = $timeout(function () {
                    //Make sure queue is still 0 since a new XHR request may have come in
                    //while timer was running
                    if (queue.length === 0) {
                        $rootScope.$broadcast(config.eventNames.ajaxFinished);
                        if (timerPromiseHide)
                            $timeout.cancel(timerPromiseHide);
                    }
                }, constants.server.AJAX_TIMER_DELAY);
            }
        };
        return {
            request: function (config) {
                if (config.showSpinner === undefined || config.showSpinner)
                    processRequest();
                return config || $q.when(config);
            },
            response: function (response) {
                processResponse();
                return response || $q.when(response);
            },
            responseError: function (rejection) {
                processResponse();
                return $q.reject(rejection);
            }
        };
    };
    httpRequestTrackerService.$inject = ['$q', '$location', '$rootScope', '$timeout', 'Config', 'Constants'];
    //#endregion
    //#region Request Wrapper - All request wrappers must be coded in this interceptor
    var requestWrapperInterceptor = function ($q, localization, currentCompany, constants, mainConfig) {
        return {
            request: function (config) {
                //TODO:Add headers to only restful service request if (common.isApiRequest(config)) 
                config.headers[constants.server.HEADER_NAME_LANGUAGE] = localization.currentLanguage.code;
                if (currentCompany && mainConfig.requestHeaderMaps) {
                    //custom company values
                    for (var key in mainConfig.requestHeaderMaps) {
                        if (mainConfig.requestHeaderMaps.hasOwnProperty(key) && currentCompany[key]) {
                            config.headers[mainConfig.requestHeaderMaps[key]] = currentCompany[key];
                        }
                    }
                }
                return $q.when(config);
            }
        };
    };
    requestWrapperInterceptor.$inject = ['$q', 'Localization', 'CurrentCompany', 'Constants', 'Config'];
    //#endregion
    //#region Security Interceptor
    var securityInterceptor = function ($rootScope, $q, config, securityConfig, tokens, common) {
        return {
            responseError: function (response) {
                if (response.status === 401 && !response.config.ignoreAuthModule) {
                    $rootScope.$broadcast(config.eventNames.loginRequired);
                }
                return $q.reject(response);
            }
        };
    };
    securityInterceptor.$inject = ['$rootScope', '$q', 'Config', 'SecurityConfig', 'Tokens', 'Common'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.httpRequestTracker', []);
    module.factory('httpAjaxInterceptor', httpRequestTrackerService)
        .factory('requestWrapperInterceptor', requestWrapperInterceptor)
        .factory('securityInterceptor', securityInterceptor)
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('securityInterceptor');
            $httpProvider.interceptors.push('httpAjaxInterceptor');
            $httpProvider.interceptors.push('requestWrapperInterceptor');
            //#region fix for IE caching problem
            //http://stackoverflow.com/questions/16098430/angular-ie-caching-issue-for-http
            if (!$httpProvider.defaults.headers.get) {
                $httpProvider.defaults.headers.get = {};
            }
            $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
            $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
            $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
            //#endregion
        }]);
});
//#endregion
