/* author      : sercan.gurbuz
 * date        : 10/21/2016 3:51:38 PM 
 */
//#region Imports
import BaseApi from "rota/base/baseapi";
import { Api } from "rota/base/decorators";
//#endregion

//Define your IvitrinApi interface in your interface file
@Api()
class VitrinApi extends BaseApi {
    readonly SEPETIM_CACHE_KEY = 'sepetim';
    sepetim: ISepetim;

    constructor(bundle: IBundle) {
        super(bundle);
        this.sepetim = this.caching.sessionStorage.get<ISepetim>(this.SEPETIM_CACHE_KEY) || [];
    }

    sepeteEkle(urun: IUrun, adet: number): void {
        const urunVarmi = _.find(this.sepetim, { urunId: urun.id });

        if (urunVarmi) urunVarmi.adet++;
        else {
            this.sepetim.push({ urunId: urun.id, adet: adet, urunAdi: urun.urunAdi });
        }

        this.caching.sessionStorage.store(this.SEPETIM_CACHE_KEY, this.sepetim);
    }
}
export { VitrinApi }