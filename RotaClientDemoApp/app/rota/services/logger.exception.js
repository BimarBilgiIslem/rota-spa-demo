define(["require", "exports", "./logger.service"], function (require, exports) {
    "use strict";
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
            loggerService.toastr.error({ message: exception.message });
            loggerService.notification.error({ message: exception.message });
        };
    };
    exceptionHandler.$inject = ['$delegate', '$injector', 'Config'];
    //#endregion
    //#region Server Error Tracker
    var errorHttpInterceptorService = function ($q, logger, config) {
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
                if (response.status >= 400 && response.status <= 500) {
                    /********************************************************/
                    var message = "Unknown error occured";
                    //customize 404 messages
                    if (response.status === 404) {
                        message = "'<b>" + response.config.url + "</b>' not found on the server";
                    }
                    else {
                        message = concatErrorMessages(response.data);
                    }
                    logger.notification.error({ message: message });
                }
                else if (response.status === 0) {
                    //no response from server
                    logger.notification.error({ message: 'Server connection lost' });
                }
                return $q.reject(response);
            }
        };
    };
    errorHttpInterceptorService.$inject = ['$q', 'Logger', 'Config'];
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
