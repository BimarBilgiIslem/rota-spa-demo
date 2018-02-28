define(["require", "exports", "tslib", "rota/base/basecrudapi", "rota/base/decorators"], function (require, exports, tslib_1, basecrudapi_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    var MIN_STOK_MIKTARI_CACHE_KEY = 'min_stok_miktari';
    var DEFAULT_MIN_STOK_MIKTARI = 10;
    //Define your IurunApi interface in your interface file
    var UrunApi = (function (_super) {
        tslib_1.__extends(UrunApi, _super);
        function UrunApi(bundle) {
            var _this = _super.call(this, bundle) || this;
            _this.minStokMiktari = +_this.caching.localStorage.get(MIN_STOK_MIKTARI_CACHE_KEY) || DEFAULT_MIN_STOK_MIKTARI;
            return _this;
        }
        /**
         * Min stok miktari
         * @description Min stok miktari localstorage'a yazar
         */
        UrunApi.prototype.minStokMiktariKaydet = function (value) {
            this.caching.localStorage.store(MIN_STOK_MIKTARI_CACHE_KEY, value);
            this.minStokMiktari = value;
        };
        UrunApi = tslib_1.__decorate([
            decorators_1.Api({ serverApi: 'urun' }),
            tslib_1.__metadata("design:paramtypes", [Object])
        ], UrunApi);
        return UrunApi;
    }(basecrudapi_1.default));
    exports.UrunApi = UrunApi;
});
