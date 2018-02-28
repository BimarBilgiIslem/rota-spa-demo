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
define(["require", "exports", "tslib", "./basemodelcontroller", "./obserablemodel"], function (require, exports, tslib_1, basemodelcontroller_1, obserablemodel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Base Modal controller
     */
    var BaseModalController = (function (_super) {
        tslib_1.__extends(BaseModalController, _super);
        //#endregion
        function BaseModalController(bundle) {
            //call base constructor
            return _super.call(this, bundle) || this;
        }
        Object.defineProperty(BaseModalController.prototype, "model", {
            /**
            * Model object
            * @returns {TModel}
            */
            get: function () { return this._model; },
            set: function (value) {
                if (this.isAssigned(value)) {
                    this._model = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseModalController.prototype, "params", {
            /**
             * Modal params
             * @returns {}
             */
            get: function () { return this.instanceOptions.params; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseModalController.prototype, "modalPageOptions", {
            /**
            * Modal Page options
            * @returns {IModalPageOptions}
            */
            get: function () { return this.options; },
            enumerable: true,
            configurable: true
        });
        //#region InjcetableObject
        /**
        * Update bundle
        * @param bundle IBundle
        */
        BaseModalController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.$uibModalInstance = bundle.services["$uibmodalinstance"];
            this.instanceOptions = bundle.services["instanceoptions"] || {};
        };
        //#endregion
        //#region Modal 
        /**
        * Validation for modals
        */
        BaseModalController.prototype.applyValidatitons = function () {
            var _this = this;
            var validateResult = _super.prototype.applyValidatitons.call(this);
            validateResult.catch(function (err) {
                _this.logger.toastr.warn({ message: err.message, title: err.title });
            });
            return validateResult;
        };
        /**
         * Close modal if validation success
         * @param data Result
         */
        BaseModalController.prototype.ok = function (data) {
            var _this = this;
            this.applyValidatitons().then(function () {
                _this.modalResult(data);
            });
        };
        /**
         * Close modal with result
         * @param data Result
         */
        BaseModalController.prototype.modalResult = function (data) {
            this.$uibModalInstance.close(data || this.model);
        };
        /**
         * Close modal with dismiss
         */
        BaseModalController.prototype.closeModal = function (reason) {
            if (this.common.isObserableModel(this.model)) {
                this.model.revertOriginal();
            }
            this.$uibModalInstance.dismiss(reason || this.model);
        };
        //#endregion
        //#region BaseModelController
        /**
         * Get model
         */
        BaseModalController.prototype.getModel = function () {
            return this.common.promise(this.instanceOptions.model);
        };
        /**
         * Convert model to obserable
         * @param model Literal model
         */
        BaseModalController.prototype.setModel = function (model) {
            if (this.common.isObserableModel(model)) {
                return model;
            }
            if (!(this.instanceOptions.convertToObserableModel === false)) {
                return new obserablemodel_1.default(model);
            }
            return model;
        };
        //#region Statics,Members,Props
        BaseModalController.defaultOptions = {
            registerName: null,
            initializeModel: true
        };
        BaseModalController.injects = basemodelcontroller_1.default.injects.concat(['$uibModalInstance', 'instanceOptions']);
        return BaseModalController;
    }(basemodelcontroller_1.default));
    //Exports
    exports.default = BaseModalController;
});
