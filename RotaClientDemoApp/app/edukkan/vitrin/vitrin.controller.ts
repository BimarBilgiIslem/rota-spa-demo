/* author      : sercan.gurbuz
 * date        : 10/21/2016 2:31:14 PM 
 */
//#region Imports
import { App } from "rota/config/app";
import { BaseController } from "rota/base/basecontroller";

import "admin/urun/urun.api"
import "./vitrin.api"
//#endregion


class VitrinController extends BaseController {
    urunApi: IUrunApi;
    caching: ICaching;
    vitrinApi: IVitrinApi;
    urunler: IUrun[];

    constructor(bundle: IBundle) {
        super(bundle);
        this.urunApi.getList()
            .then((urunler) => {
                this.urunler = urunler;
            });
    }

    sepeteEkle(urun: IUrun, adet: number): void {
        if (urun.stokMiktari < adet) {
            return this.logger.toastr.error({ message: 'Stok miktarından fazla sipariş veremezsiniz' });
        }
        this.vitrinApi.sepeteEkle(urun, adet);
    }

    sepetiGoster(): void {
        this.dialogs.showModal({
            templateUrl: 'edukkan/vitrin/sepet.html',
            instanceOptions: { services: ['vitrinApi'], params: { sepetim: this.vitrinApi.sepetim} }
        });
    }
}
//#region Register
App.addController("vitrinController", VitrinController, "urunApi", "Caching", "vitrinApi");
//#endregion