var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "rota/config/app", "rota/base/basemodalcontroller"], function (require, exports, app_1, basemodalcontroller_1) {
    "use strict";
    //#endregion
    /**
     * Your base modal controller.Replace IBaseCrudModel model with your return model
     */
    var ModalController = (function (_super) {
        __extends(ModalController, _super);
        function ModalController(bundle) {
            _super.call(this, bundle);
            debugger;
        }
        //#region BaseModalController
        ModalController.prototype.modalResult = function (model) {
            _super.prototype.modalResult.call(this, model);
        };
        ModalController.prototype.modalliKapat = function () {
            this.closeModal();
        };
        return ModalController;
    }(basemodalcontroller_1.BaseModalController));
    //#region Register
    app_1.App.addController("modalController", ModalController);
});
//#endregion 
