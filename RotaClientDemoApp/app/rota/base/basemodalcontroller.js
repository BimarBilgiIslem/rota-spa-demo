var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './basemodelcontroller', "./obserablemodel"], function (require, exports, basemodelcontroller_1, obserablemodel_1) {
    "use strict";
    //#endregion
    /**
     * Base Modal controller
     */
    var BaseModalController = (function (_super) {
        __extends(BaseModalController, _super);
        //#endregion
        //#region Init
        function BaseModalController(bundle, options) {
            _super.call(this, bundle, options);
            var modalPageOptions = this.common.extend({ initializeModel: true }, options);
            if (modalPageOptions.initializeModel) {
                this.initModel();
            }
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
        //#endregion
        //#region InjcetableObject
        /**
        * Update bundle
        * @param bundle IBundle
        */
        BaseModalController.prototype.initBundle = function (bundle) {
            var _this = this;
            _super.prototype.initBundle.call(this, bundle);
            this.$uibModalInstance = bundle.systemBundles["$uibmodalinstance"];
            this.instanceOptions = bundle.systemBundles["instanceoptions"] || {};
            //Inject optional custom services if any
            if (this.instanceOptions.services) {
                this.instanceOptions.services.forEach(function (service) {
                    _this.defineService(service, _this.$injector.get(service));
                });
            }
        };
        //#endregion
        //#region Modal 
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
        BaseModalController.prototype.closeModal = function () {
            this.model.revertOriginal();
            this.$uibModalInstance.dismiss(this.model);
        };
        //#endregion
        //#region BaseModelController
        /**
         * Get model
         */
        BaseModalController.prototype.getModel = function () {
            return this.instanceOptions.model;
        };
        /**
         * Convert model to obserable
         * @param model Literal model
         */
        BaseModalController.prototype.setModel = function (model) {
            if (!(model instanceof obserablemodel_1.ObserableModel)) {
                return new obserablemodel_1.ObserableModel(model);
            }
            return model;
        };
        //#region Statics,Members,Props
        BaseModalController.injects = basemodelcontroller_1.BaseModelController.injects.concat(['$uibModalInstance', 'instanceOptions']);
        return BaseModalController;
    }(basemodelcontroller_1.BaseModelController));
    exports.BaseModalController = BaseModalController;
});
