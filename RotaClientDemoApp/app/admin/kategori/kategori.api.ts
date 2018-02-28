/* author      : sercan.gurbuz
 * date        : 10/18/2016 11:01:48 AM 
 */
//#region Imports
import BaseCrudApi from "rota/base/basecrudapi";
import { Api } from "rota/base/decorators";
//#endregion

//Define your IurunApi interface in your interface file
@Api({ serverApi: 'kategori' })
class KategoriApi extends BaseCrudApi<IKategori> {
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
export { KategoriApi }