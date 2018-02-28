define(["require", "exports", "tslib", "rota/base/basemodalcontroller", "rota/base/decorators"], function (require, exports, tslib_1, basemodalcontroller_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Your base modal controller.Replace IBaseCrudModel model with your return model
     */
    var ModalController = (function (_super) {
        tslib_1.__extends(ModalController, _super);
        function ModalController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //#region BaseModalController
        ModalController.prototype.modalResult = function (model) {
            _super.prototype.modalResult.call(this, model);
        };
        ModalController.prototype.modalliKapat = function () {
            this.closeModal();
        };
        ModalController = tslib_1.__decorate([
            decorators_1.Controller("modalController")
        ], ModalController);
        return ModalController;
    }(basemodalcontroller_1.default));
});
