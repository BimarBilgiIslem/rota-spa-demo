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
define(["require", "exports", "./logger.service"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Client Error Tracker
    var exceptionHandler = function ($delegate, $injector, config) {
        var loggerService;
        var httpService;
        var $rootScope;
        //server logging
        var serverLogger = function (exception) {
            httpService = httpService || $injector.get('$http');
            return httpService({
                method: 'POST',
                url: config.serverExceptionLoggingBackendUrl,
                data: exception,
                headers: { 'Content-Type': 'application/json' }
            });
        };
        //Catch requirejs Errors
        requirejs.onError = function (err) {
            $rootScope = $rootScope || $injector.get('$rootScope');
            loggerService = loggerService || $injector.get('Logger');
            $rootScope.$apply(function () {
                loggerService.notification.error({ message: err.message });
            });
            throw err;
        };
        return function (exception, cause) {
            if (config.debugMode) {
                $delegate(exception, cause);
            }
            else {
                if (config.serverExceptionLoggingEnabled) {
                    try {
                        serverLogger(exception);
                    }
                    catch (e) { }
                }
            }
            ;
            loggerService = loggerService || $injector.get('Logger');
            //toastr and notification log
            var errorMsg = typeof exception === "string" ? exception : exception.message;
            loggerService.toastr.error({ message: errorMsg });
            loggerService.notification.error({ message: errorMsg });
        };
    };
    exceptionHandler.$inject = ['$delegate', '$injector', 'Config'];
    //#endregion
    //#region Server Error Tracker
    var errorHttpInterceptorService = function ($q, $rootScope, logger, config, constants) {
        //display server error messages
        var concatErrorMessages = function (exception) {
            if (angular.isString(exception)) {
                return exception;
            }
            var exceptionMessages = new Array();
            var error = exception;
            //standart error messages properties
            error.message && exceptionMessages.push(error.message);
            error.exceptionMessage && exceptionMessages.push(error.exceptionMessage);
            //optional custom error messages
            if (error.errorMessages && error.errorMessages.length) {
                exceptionMessages = exceptionMessages.concat(error.errorMessages);
            }
            //stackTrace
            if (error.stackTrace && config.debugMode) {
                exceptionMessages = exceptionMessages.concat(error.stackTrace);
            }
            error.messageDetail && exceptionMessages.push(error.messageDetail);
            if (!exceptionMessages.length)
                return null;
            return exceptionMessages.join('<br/>');
        };
        return {
            responseError: function (response) {
                //Istemci hatasi 4xx ve Sunucu hatalari 5xx
                //Bad Requests,Internal Server Errors
                if (!response.config.byPassErrorInterceptor) {
                    if (response.status >= 400 && response.status <= 500) {
                        /********************************************************/
                        var message = void 0;
                        //customize 404 messages
                        if (response.status === 404) {
                            message = "'<b>" + response.config.url + "</b>' not found on the server";
                        }
                        else {
                            message = concatErrorMessages(response.data);
                        }
                        logger.notification.error({ message: message });
                        /********************************************************/
                    }
                    else if (response.status === 0) {
                        //no response from server
                        logger.notification.error({ message: 'Server connection lost' });
                    }
                }
                return $q.reject(response);
            }
        };
    };
    errorHttpInterceptorService.$inject = ['$q', '$rootScope', 'Logger', 'Config', 'Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.log');
    //Register client exception handler
    module.config(['$provide', function ($provide) {
            $provide.decorator('$exceptionHandler', exceptionHandler);
        }]);
    //Register server error interceptor
    module.factory('errorHttpInterceptor', errorHttpInterceptorService)
        .config([
        '$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('errorHttpInterceptor');
        }
    ]);
});
//#endregion 
