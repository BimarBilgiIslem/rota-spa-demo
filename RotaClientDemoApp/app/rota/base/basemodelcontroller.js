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
define(["require", "exports", "tslib", "./basecontroller", "../services/validators.service"], function (require, exports, tslib_1, basecontroller_1, validators_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        tslib_1.__extends(BaseModelController, _super);
        //#endregion
        //#region Init
        function BaseModelController(bundle) {
            var _this = _super.call(this, bundle) || this;
            //options update
            _this.modelPageOptions.newItemParamName =
                _this.modelPageOptions.newItemParamName || _this.config.defaultNewItemParamName;
            _this.modelPageOptions.newItemParamValue =
                _this.modelPageOptions.newItemParamValue || _this.config.defaultNewItemParamValue;
            //get new instance of validator service
            _this.validators = _this.$injector.instantiate(validators_service_1.Validators);
            _this.validators.controller = _this;
            return _this;
        }
        Object.defineProperty(BaseModelController.prototype, "modelPageOptions", {
            /**
             * List controller options
             */
            get: function () { return this.options; },
            enumerable: true,
            configurable: true
        });
        /**
        * Update bundle
        * @param bundle IBundle
        */
        BaseModelController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.$http = bundle.services['$http'];
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
        BaseModelController.prototype.chooseModelSource = function (modelFilter) {
            return this.getModel(modelFilter);
        };
        /**
         * Initiates getting data
         * @param args Optional params
         */
        BaseModelController.prototype.initModel = function (modelFilter) {
            var _this = this;
            var d = this.$q.defer();
            var defineModelResult = this.chooseModelSource(modelFilter);
            if (this.common.isAssigned(defineModelResult)) {
                defineModelResult.then(function (data) {
                    //call setModel
                    _this._model = _this.setModel(data);
                    //call loadedModel
                    _this.loadedModel(_this._model);
                    d.resolve(data);
                }, function (reason) {
                    d.reject(reason);
                });
            }
            else {
                d.reject("model data is missing");
            }
            return this.modelPromise = d.promise;
        };
        /**
         * this method is called from decorator with all injections are available
         * initModel is called as default
         */
        BaseModelController.prototype.initController = function () {
            if (this.modelPageOptions.initializeModel)
                this.initModel();
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
        BaseModelController.injects = basecontroller_1.default.injects.concat(['$http']);
        return BaseModelController;
    }(basecontroller_1.default));
    exports.default = BaseModelController;
});
