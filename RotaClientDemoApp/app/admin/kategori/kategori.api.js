define(["require", "exports", "tslib", "rota/base/basecrudapi", "rota/base/decorators"], function (require, exports, tslib_1, basecrudapi_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //Define your IurunApi interface in your interface file
    var KategoriApi = (function (_super) {
        tslib_1.__extends(KategoriApi, _super);
        function KategoriApi() {
            return _super !== null && _super.apply(this, arguments) || this;
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
        KategoriApi = tslib_1.__decorate([
            decorators_1.Api({ serverApi: 'kategori' })
        ], KategoriApi);
        return KategoriApi;
    }(basecrudapi_1.default));
    exports.KategoriApi = KategoriApi;
});
