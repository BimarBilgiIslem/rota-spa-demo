var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./basecontroller"], function (require, exports, basecontroller_1) {
    "use strict";
    //#endregion
    /**
     * This controller is used for loading the any model data remotely or localy
     * @description ModelController is responsible for
     * Loading model
     * Error handling
     * Providing model life cycle methods
     * Model abstraction methods
     */
    var BaseModelController = (function (_super) {
        __extends(BaseModelController, _super);
        //#endregion
        //#region Init
        function BaseModelController(bundle, options) {
            _super.call(this, bundle, options);
        }
        /**
        * Update bundle
        * @param bundle IBundle
        */
        BaseModelController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.$q = bundle.systemBundles['$q'];
            this.$http = bundle.systemBundles['$http'];
        };
        /**
         * Loaded model method triggered at last
         * @param model
         */
        BaseModelController.prototype.loadedModel = function (model) {
            //send broadcast
            this.$rootScope.$broadcast(this.config.eventNames.modelLoaded, model);
        };
        /**
        * Set model for some optional modifications
        * @param model Model
        */
        BaseModelController.prototype.setModel = function (model) {
            return model;
        };
        /**
         * Overridable model definition method
         * @param modelFilter Optional Model filter
         */
        BaseModelController.prototype.defineModel = function (modelFilter) {
            return this.getModel(modelFilter);
        };
        /**
         * Initiates getting data
         * @param args Optional params
         */
        BaseModelController.prototype.initModel = function (modelFilter) {
            var _this = this;
            var d = this.$q.defer();
            var defineModelResult = this.defineModel(modelFilter);
            var processModel = function (model) {
                //call modelloaded event
                _this.loadedModel(_this._model = _this.setModel(model));
                d.resolve(model);
            };
            if (this.common.isPromise(defineModelResult)) {
                defineModelResult.then(function (data) {
                    processModel(data);
                }, function (reason) {
                    //TODO: can be changed depending on server excepion response
                    //this.errorModel(reason.data || reason);
                    d.reject(reason);
                });
            }
            else {
                processModel(defineModelResult);
            }
            return this.modelPromise = d.promise;
        };
        /**
         * Process chainable thenable functions
         * @param pipeline Thenable functions
         * @param params Optional parameters
         */
        BaseModelController.prototype.initParsers = function (pipeline) {
            var _this = this;
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var result = this.common.promise();
            //iterate pipeline methods
            for (var i = 0; i < pipeline.length; i++) {
                result = (function (promise, method) {
                    return promise.then(function (response) {
                        response && params.push(response);
                        if (method) {
                            return method.apply(_this, params);
                        }
                        return params;
                    });
                })(result, pipeline[i]);
            }
            return result;
        };
        //#endregion
        //#region BaseController
        /**
        * Controller getting destroyed
        */
        BaseModelController.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            delete this._model;
        };
        BaseModelController.injects = basecontroller_1.BaseController.injects.concat(['$q', '$http']);
        return BaseModelController;
    }(basecontroller_1.BaseController));
    exports.BaseModelController = BaseModelController;
});
