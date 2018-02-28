/* author      : sercan.gurbuz
 * date        : 10/18/2016 11:01:48 AM 
 */
//#region Imports
import BaseCrudApi from "rota/base/basecrudapi";
import { Api } from "rota/base/decorators";
//#endregion

const MIN_STOK_MIKTARI_CACHE_KEY = 'min_stok_miktari';
const DEFAULT_MIN_STOK_MIKTARI = 10;
//Define your IurunApi interface in your interface file
@Api({ serverApi: 'urun' })
class UrunApi extends BaseCrudApi<IUrun>  {
    /**
    * Min stok miktari
    * @description Min stok miktari degerini localstorage dan okur
    */
    minStokMiktari: number;

    constructor(bundle: IBundle) {
        super(bundle);
        this.minStokMiktari = +this.caching.localStorage.get<number>(MIN_STOK_MIKTARI_CACHE_KEY) || DEFAULT_MIN_STOK_MIKTARI;
    }
    /**
     * Min stok miktari
     * @description Min stok miktari localstorage'a yazar     
     */
    minStokMiktariKaydet(value: number) {
        this.caching.localStorage.store(MIN_STOK_MIKTARI_CACHE_KEY, value);
        this.minStokMiktari = value;
    }
}
export { UrunApi }