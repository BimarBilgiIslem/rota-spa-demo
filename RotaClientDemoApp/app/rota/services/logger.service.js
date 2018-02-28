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
define(["require", "exports", "toastr", "moment", "angular", "./logger.config", "../config/config"], function (require, exports, toastr, moment, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Log Services
    /**
     * Toast notification based on //John Papa toastr - https://github.com/CodeSeven/toastr
     */
    var Toastr = (function () {
        function Toastr(loggerconfig) {
            this.loggerconfig = loggerconfig;
        }
        /**
         * Toast log message
         * @param toast Log
         */
        Toastr.prototype.log = function (toast) {
            toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[4 /* Debug */];
            return this.info(toast);
        };
        /**
         * Toast error message
         * @param toast Log
         */
        Toastr.prototype.error = function (toast) {
            toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[1 /* Error */];
            var elem = toastr.error(toast.message, toast.title || this.loggerconfig.defaultTitles[1 /* Error */]);
            return function () { toastr.clear(elem); };
        };
        /**
         * Toast warn message
         * @param toast Log
         */
        Toastr.prototype.warn = function (toast) {
            toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[2 /* Warn */];
            var elem = toastr.warning(toast.message, toast.title || this.loggerconfig.defaultTitles[2 /* Warn */]);
            return function () { toastr.clear(elem); };
        };
        /**
         * Toast success message
         * @param toast Log
         */
        Toastr.prototype.success = function (toast) {
            toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[3 /* Success */];
            var elem = toastr.success(toast.message, toast.title || this.loggerconfig.defaultTitles[3 /* Success */]);
            return function () { toastr.clear(elem); };
        };
        /**
         * Toast info message
         * @param toast Log
         */
        Toastr.prototype.info = function (toast) {
            toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[0 /* Info */];
            var elem = toastr.info(toast.message, toast.title || this.loggerconfig.defaultTitles[0 /* Info */]);
            return function () { toastr.clear(elem); };
        };
        /**
         * Clear all toasts
         */
        Toastr.prototype.clearAll = function () {
            toastr.clear();
        };
        return Toastr;
    }());
    /**
     * Notification service works with notification.html in shell folder
     */
    var Notification = (function () {
        function Notification(loggerconfig, $document, $timeout) {
            this.loggerconfig = loggerconfig;
            this.$document = $document;
            this.$timeout = $timeout;
            this.notifications = [];
        }
        /**
         * Notify log message
         * @param notify Notify message
         */
        Notification.prototype.log = function (notify) {
            return this.info(notify);
        };
        /**
         * Notify info message
         * @param notify Notify message
         */
        Notification.prototype.info = function (notify) {
            var _this = this;
            var result = this.addNotification({
                title: notify.title || this.loggerconfig.defaultTitles[0 /* Info */],
                message: notify.message,
                icon: 'info-circle',
                style: 'info',
                isSticky: notify.isSticky,
                notificationLayout: notify.notificationLayout || 0 /* Content */,
                autoHideDelay: notify.autoHideDelay
            });
            return function () { _this.removeNotification(result); };
        };
        /**
         * Notify error message
         * @param notify Notify message
         */
        Notification.prototype.error = function (notify) {
            var _this = this;
            var result = this.addNotification({
                title: notify.title || this.loggerconfig.defaultTitles[1 /* Error */],
                message: notify.message,
                icon: 'times',
                style: 'danger',
                isSticky: notify.isSticky,
                notificationLayout: notify.notificationLayout || 0 /* Content */,
                autoHideDelay: notify.autoHideDelay
            });
            return function () { _this.removeNotification(result); };
        };
        /**
         * Notify warn message
         * @param notify Notify message
         */
        Notification.prototype.warn = function (notify) {
            var _this = this;
            var result = this.addNotification({
                title: notify.title || this.loggerconfig.defaultTitles[2 /* Warn */],
                message: notify.message,
                icon: 'warning',
                style: 'warning',
                isSticky: notify.isSticky,
                notificationLayout: notify.notificationLayout || 0 /* Content */,
                autoHideDelay: notify.autoHideDelay
            });
            return function () { _this.removeNotification(result); };
        };
        /**
         * Notify success message
         * @param notify Notify message
         */
        Notification.prototype.success = function (notify) {
            var _this = this;
            var result = this.addNotification({
                title: notify.title || this.loggerconfig.defaultTitles[3 /* Success */],
                message: notify.message,
                icon: 'check-square-o',
                style: 'success',
                isSticky: notify.isSticky,
                notificationLayout: notify.notificationLayout || 0 /* Content */,
                autoHideDelay: notify.autoHideDelay
            });
            return function () { _this.removeNotification(result); };
        };
        /**
         * Add notification
         * @param notify Notify object
         * @param notifyType Notify Type
         */
        Notification.prototype.addNotification = function (notify) {
            var _this = this;
            //TODO:sce sanitize message and text ?
            this.notifications.push(notify);
            //autohide 
            if (notify.autoHideDelay) {
                this.$timeout(function () { return _this.removeNotification(notify); }, notify.autoHideDelay);
            }
            //Scroll up to top to make notifications visible
            this.$document.duScrollTop && this.$document.duScrollTop(0, 500);
            return notify;
        };
        /**
         * Remove notification
         * @param notify Notify
         */
        Notification.prototype.removeNotification = function (notify) {
            this.notifications.delete(notify);
        };
        /**
         * Remove all registered notifications
         * @param includeSticky Include sticky flag
         */
        Notification.prototype.removeAll = function (includeSticky) {
            this.notifications.delete(function (item) {
                return includeSticky || !item.isSticky;
            });
        };
        /**
        * Clear all notifications
        */
        Notification.prototype.clearAll = function () {
            this.removeAll(true);
        };
        return Notification;
    }());
    /**
     * Console logger for either debugging and exceptions
     */
    var Console = (function () {
        function Console($log, config) {
            this.$log = $log;
            this.config = config;
        }
        /**
         * Format log with timestamp
         * @param log Log
         */
        Console.prototype.formatLog = function (log) {
            return moment().format('H:mm:ss SSS') + " - " + log.message;
        };
        /**
         * Log generic method only works on debug mode
         * @param type Log type
         * @param args Args
         */
        Console.prototype.logit = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this.config.debugMode) {
                (_a = this.$log)[type].apply(_a, args);
            }
            var _a;
        };
        /**
         * Log
         * @param log Log
         */
        Console.prototype.log = function (log) {
            this.logit('log', this.formatLog(log), log.data);
        };
        /**
         * Info
         * @param log Log
         */
        Console.prototype.info = function (log) {
            this.logit('info', this.formatLog(log), log.data);
        };
        /**
         * Error
         * @param log Log
         */
        Console.prototype.error = function (log) {
            this.logit('error', this.formatLog(log), log.data);
        };
        /**
         * Warning
         * @param log Log
         */
        Console.prototype.warn = function (log) {
            this.logit('warn', this.formatLog(log), log.data);
        };
        /**
         * Success
         * @param log Log
         */
        Console.prototype.success = function (log) {
            this.logit('info', this.formatLog(log), log.data);
        };
        /**
         * Used for logs u think its important
         * @param message Message
         */
        Console.prototype.important = function (message) {
            this.logit('log', '%c %s %s %s ', 'color: white; background-color: #57889c;', '--', message, '--');
        };
        /**
         * Used for timing measurements,starts times
         * @param message Message
         * @param timerName Timer name
         */
        Console.prototype.startTime = function (message, timerName) {
            if (!this.config.debugMode)
                return;
            this.logit('log', '%c%s %s %s', 'color: brown; font-weight: bold; text-decoration: underline;', '--', message, '--');
            //Start timer
            if (console.time) {
                console.time(timerName);
            }
            else {
                this.logit('error', 'console.time not supported');
            }
        };
        /**
         * Used for timing measurements,ends times
         * @param message Message
         * @param timerName Timer name
         */
        Console.prototype.endTime = function (message, timerName) {
            if (!this.config.debugMode)
                return;
            this.logit('log', '%c%s %s %s', 'color: brown; font-weight: bold; text-decoration: underline;', '--', message, '--');
            //Start timer
            if (console.timeEnd) {
                console.timeEnd(timerName);
            }
            else {
                this.logit('error', 'console.timeEnd not supported');
            }
        };
        /**
        * Clear console
        */
        Console.prototype.clearAll = function () {
            console.clear();
        };
        return Console;
    }());
    //#endregion
    //#region Logger Service
    /**
     * Logger Service
     */
    var Logger = (function () {
        function Logger($rootScope, $log, $document, $timeout, config, loggerconfig, localization, constants) {
            var _this = this;
            this.$rootScope = $rootScope;
            this.$log = $log;
            this.$document = $document;
            this.$timeout = $timeout;
            this.config = config;
            this.loggerconfig = loggerconfig;
            this.localization = localization;
            this.constants = constants;
            //#region Props
            this.serviceName = "Logger Service";
            loggerconfig.defaultTitles[0 /* Info */] = localization.getLocal('rota.titleinfo');
            loggerconfig.defaultTitles[2 /* Warn */] = localization.getLocal('rota.titlewarn');
            loggerconfig.defaultTitles[3 /* Success */] = localization.getLocal('rota.titlesuccess');
            loggerconfig.defaultTitles[1 /* Error */] = localization.getLocal('rota.titleerror');
            loggerconfig.defaultTitles[4 /* Debug */] = localization.getLocal('rota.titledebug');
            //register services
            this.logServices = {};
            this.logServices[1 /* Console */] = new Console($log, config);
            this.logServices[4 /* Notification */] = new Notification(loggerconfig, $document, $timeout);
            //clear notifications when state changes for only menu states
            $rootScope.$on(constants.events.EVENT_STATE_CHANGE_SUCCESS, function (event, toState, toParams, fromState) {
                //remove all notifications on condition that state is not nested or reload in process
                if (!toState.isNestedState || toState.name === fromState.name) {
                    _this.logServices[4 /* Notification */].removeAll();
                }
            });
            this.logServices[2 /* Toastr */] = new Toastr(loggerconfig);
        }
        Object.defineProperty(Logger.prototype, "console", {
            //Services
            /**
             * Console Service
             * @returns {} Console Service
             */
            get: function () { return this.logServices[1 /* Console */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "notification", {
            /**
             * Notification Service
             * @returns {} Notification Service
             */
            get: function () { return this.logServices[4 /* Notification */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "toastr", {
            /**
             * Toastr service
             * @returns {} Toastr service
             */
            get: function () { return this.logServices[2 /* Toastr */]; },
            enumerable: true,
            configurable: true
        });
        Logger.injectionName = "Logger";
        //#endregion
        Logger.$inject = ['$rootScope', '$log', '$document', '$timeout', 'Config', 'LoggerConfig', 'Localization', 'Constants'];
        return Logger;
    }());
    exports.Logger = Logger;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.log', ['rota.services.log.config', 'rota.config']);
    module.service(Logger.injectionName, Logger);
    //Config 
    module.config([
        '$logProvider', 'ConfigProvider',
        function ($logProvider, configProvider) {
            if ($logProvider.debugEnabled) {
                $logProvider.debugEnabled(configProvider.config.debugMode);
            }
        }
    ]);
});
