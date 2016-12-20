define(["require", "exports", "signalr.hubs"], function (require, exports) {
    "use strict";
    //#endregion
    /**
     * SignalR helper hub class in conjuction with server hub
     */
    var Hub = (function () {
        //#endregion
        //#region Init
        function Hub(hubName, options) {
            this.options = options;
            this.connection = Hub.getConnection(options);
            this.proxy = this.connection.createHubProxy(hubName);
            this.methods = {};
            this.registerMethods();
            if (options && options.queryParams) {
                this.connection.qs = options.queryParams;
            }
            if (options && options.errorHandler) {
                this.connection.error(options.errorHandler);
            }
            if (options && options.stateChanged) {
                this.connection.stateChanged(options.stateChanged);
            }
            //Adding additional property of promise allows to access it in rest of the application.
            if (options.autoConnect === undefined || options.autoConnect) {
                this.promise = this.connect();
            }
        }
        /**
         * Create new connnection for negotition
         * @param options Hub Options
         */
        Hub.initNewConnection = function (options) {
            var connection = null;
            if (options && options.rootPath) {
                connection = $.hubConnection(options.rootPath, { useDefaultPath: false });
            }
            else {
                connection = $.hubConnection();
            }
            connection.logging = (options && options.logging);
            return connection;
        };
        /**
         * Get connection
         * @param options
         */
        Hub.getConnection = function (options) {
            var useSharedConnection = !(options && options.useSharedConnection === false);
            if (useSharedConnection) {
                return typeof Hub.globalConnections[options.rootPath] === 'undefined' ?
                    Hub.globalConnections[options.rootPath] = Hub.initNewConnection(options) :
                    Hub.globalConnections[options.rootPath];
            }
            else {
                return Hub.initNewConnection(options);
            }
        };
        /**
         * Register initial server methods
         */
        Hub.prototype.registerMethods = function () {
            var _this = this;
            //register server methods for listening
            if (this.options && this.options.listeners) {
                Object.getOwnPropertyNames(this.options.listeners)
                    .filter(function (propName) { return (typeof _this.options.listeners[propName] === 'function'); })
                    .forEach(function (propName) {
                    _this.on(propName, _this.options.listeners[propName]);
                });
            }
            //register server methods for triggering
            if (this.options && this.options.methods) {
                angular.forEach(this.options.methods, function (method) {
                    _this.methods[method] = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        args.unshift(method);
                        return _this.invoke.apply(_this, args);
                    };
                });
            }
        };
        //#endregion
        //#region Methods
        /**
         * Register server method for listening
         * @param eventName
         * @param callback
         */
        Hub.prototype.on = function (eventName, callback) {
            this.proxy.on(eventName, callback);
        };
        /**
         * Call server method
         * @param method Method name
         * @param args Optional params
         */
        Hub.prototype.invoke = function (method, args) {
            return this.proxy.invoke.apply(this.proxy, arguments);
        };
        /**
         * Disconnects pipeline
         */
        Hub.prototype.disconnect = function () {
            this.connection.stop();
        };
        /**
         * Connect
         * @param queryParams
         */
        Hub.prototype.connect = function (queryParams) {
            var startOptions = {};
            if (this.options.transport)
                startOptions.transport = this.options.transport;
            if (this.options.jsonp)
                startOptions.jsonp = this.options.jsonp;
            if (this.options.pingInterval !== undefined)
                startOptions.pingInterval = this.options.pingInterval;
            if (angular.isDefined(this.options.withCredentials))
                startOptions.withCredentials = this.options.withCredentials;
            if (queryParams)
                this.connection.qs = queryParams;
            return this.connection.start(startOptions);
        };
        ;
        //#region Static Methods
        Hub.globalConnections = [];
        return Hub;
    }());
    exports.Hub = Hub;
});
