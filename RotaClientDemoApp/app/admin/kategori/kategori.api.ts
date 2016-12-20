/* author      : sercan.gurbuz
 * date        : 10/18/2016 11:01:48 AM 
 */
//#region Imports
import { App } from "rota/config/app";
import { BaseCrudApi } from "rota/base/basecrudapi";
//#endregion

//Define your IurunApi interface in your interface file
class KategoriApi extends BaseCrudApi<IBaseCrudModel> implements IKategoriApi {
    constructor(bundle: IBundle) {
        super(bundle, 'kategori');
    }

    listeyiAl(filter: IKategoriFilter): IP<IKategori[]> {
        return this.get({ action: 'ListeyiAl', params: filter })
            .then((kategoriler: IBaseListModel<IKategori>) => {
                return kategoriler.map((kategori) => {
                    const ustKategori = kategoriler.findById(kategori.ustKategoriId);
                    kategori.ustKategoriAdi = ustKategori && ustKategori.kategoriAdi;
                    return kategori;
                });
            });
    }

    kategoriKaydet(model: IKategori): IP<ICrudServerResponseData> {
        return this.post({ action: 'SaveChanges', data: model });
    }
}
//#region Register
App.addApi("kategoriApi", KategoriApi);
//#endregion
export { KategoriApi }