/* author      : sercan.gurbuz
 * date        : 10/21/2016 2:31:14 PM 
 */
//#region Imports
import BaseController from "rota/base/basecontroller";
import { Controller } from "rota/base/decorators";

import { UrunApi } from "admin/urun/urun.api"
import { VitrinApi } from "./vitrin.api"
//#endregion
@Controller("vitrinController")
class VitrinController extends BaseController {
    urunler: IUrun[];

    constructor(bundle: IBundle,
        private urunApi: UrunApi,
        private vitrinApi: VitrinApi) {
        super(bundle);

        urunApi.getList()
            .then((urunler) => {
                this.urunler = urunler;
            });
    }

    sepeteEkle(urun: IUrun, adet: number): void {
        if (urun.stokMiktari < adet) {
            this.toastr.error({ message: 'Stok miktarından fazla sipariş veremezsiniz' });
            return;
        }
        this.vitrinApi.sepeteEkle(urun, adet);
    }

    sepetiGoster(): void {
        this.dialogs.showModal({
            templateUrl: 'edukkan/vitrin/sepet.html',
            instanceOptions: {
                services: [{ injectionName: VitrinApi.injectionName, instanceName: 'vitrinApi' }],
                params: { sepetim: this.vitrinApi.sepetim }
            }
        });
    }
}