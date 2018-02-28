/* author      : sercan.gurbuz
 * date        : 10/20/2016 11:11:01 AM 
 */
//#region Imports
import BaseModalController from "rota/base/basemodalcontroller";
import { Controller } from "rota/base/decorators";
//#endregion

/**
 * Your base modal controller.Replace IBaseCrudModel model with your return model
 */
@Controller("modalController")
class ModalController extends BaseModalController<IBaseCrudModel> {
    //#region BaseModalController
    modalResult(model: IBaseCrudModel): void {
        super.modalResult(model);
    }

    modalliKapat(): void {

        this.closeModal();
    }
    //#endregion
}
