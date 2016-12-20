var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "rota/config/app", "rota/base/basecrudapi"], function (require, exports, app_1, basecrudapi_1) {
    "use strict";
    //#endregion
    //Define your IurunApi interface in your interface file
    var KategoriApi = (function (_super) {
        __extends(KategoriApi, _super);
        function KategoriApi(bundle) {
            _super.call(this, bundle, 'kategori');
        }
        KategoriApi.prototype.listeyiAl = function (filter) {
            return this.get({ action: 'ListeyiAl', params: filter })
                .then(function (kategoriler) {
                return kategoriler.map(function (kategori) {
                    var ustKategori = kategoriler.findById(kategori.ustKategoriId);
                    kategori.ustKategoriAdi = ustKategori && ustKategori.kategoriAdi;
                    return kategori;
                });
            });
        };
        KategoriApi.prototype.kategoriKaydet = function (model) {
            return this.post({ action: 'SaveChanges', data: model });
        };
        return KategoriApi;
    }(basecrudapi_1.BaseCrudApi));
    exports.KategoriApi = KategoriApi;
    //#region Register
    app_1.App.addApi("kategoriApi", KategoriApi);
    //#endregion
});
