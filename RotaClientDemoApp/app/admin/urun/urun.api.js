var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "rota/config/app", "rota/base/basecrudapi"], function (require, exports, app_1, basecrudapi_1) {
    "use strict";
    //#endregion
    var MIN_STOK_MIKTARI_CACHE_KEY = 'min_stok_miktari';
    var DEFAULT_MIN_STOK_MIKTARI = 10;
    //Define your IurunApi interface in your interface file
    var UrunApi = (function (_super) {
        __extends(UrunApi, _super);
        function UrunApi(bundle) {
            _super.call(this, bundle, 'urun');
            this.minStokMiktari = +this.caching.localStorage.get(MIN_STOK_MIKTARI_CACHE_KEY) || DEFAULT_MIN_STOK_MIKTARI;
        }
        /**
         * Min stok miktari
         * @description Min stok miktari localstorage'a yazar
         */
        UrunApi.prototype.minStokMiktariKaydet = function (value) {
            this.caching.localStorage.store(MIN_STOK_MIKTARI_CACHE_KEY, value);
            this.minStokMiktari = value;
        };
        return UrunApi;
    }(basecrudapi_1.BaseCrudApi));
    exports.UrunApi = UrunApi;
    //#region Register
    app_1.App.addApi("urunApi", UrunApi);
    //#endregion
});
