/* author      : sercan.gurbuz
 * date        : 10/20/2016 11:11:01 AM 
 */
//#region Imports
import { App } from "rota/config/app";
import { BaseModalController } from "rota/base/basemodalcontroller";
//#endregion

/**
 * Your base modal controller.Replace IBaseCrudModel model with your return model
 */
class ModalController extends BaseModalController<IBaseCrudModel> {
    constructor(bundle: IBundle) {
        super(bundle);
        debugger;
    }

    //#region BaseModalController
    modalResult(model: IBaseCrudModel): void {
        super.modalResult(model);
    }

    modalliKapat(): void {

        this.closeModal();
    }

    //#endregion
}
//#region Register
App.addController("modalController", ModalController);
//#endregion