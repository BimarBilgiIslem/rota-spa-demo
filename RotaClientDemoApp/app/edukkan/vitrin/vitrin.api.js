define(["require", "exports", "tslib", "rota/base/baseapi", "rota/base/decorators"], function (require, exports, tslib_1, baseapi_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //Define your IvitrinApi interface in your interface file
    var VitrinApi = (function (_super) {
        tslib_1.__extends(VitrinApi, _super);
        function VitrinApi(bundle) {
            var _this = _super.call(this, bundle) || this;
            _this.SEPETIM_CACHE_KEY = 'sepetim';
            _this.sepetim = _this.caching.sessionStorage.get(_this.SEPETIM_CACHE_KEY) || [];
            return _this;
        }
        VitrinApi.prototype.sepeteEkle = function (urun, adet) {
            var urunVarmi = _.find(this.sepetim, { urunId: urun.id });
            if (urunVarmi)
                urunVarmi.adet++;
            else {
                this.sepetim.push({ urunId: urun.id, adet: adet, urunAdi: urun.urunAdi });
            }
            this.caching.sessionStorage.store(this.SEPETIM_CACHE_KEY, this.sepetim);
        };
        VitrinApi = tslib_1.__decorate([
            decorators_1.Api(),
            tslib_1.__metadata("design:paramtypes", [Object])
        ], VitrinApi);
        return VitrinApi;
    }(baseapi_1.default));
    exports.VitrinApi = VitrinApi;
});
