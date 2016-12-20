var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "rota/config/app", "rota/base/baseapi"], function (require, exports, app_1, baseapi_1) {
    "use strict";
    //#endregion
    //Define your IvitrinApi interface in your interface file
    var VitrinApi = (function (_super) {
        __extends(VitrinApi, _super);
        function VitrinApi(bundle) {
            _super.call(this, bundle);
            this.SEPETIM_CACHE_KEY = 'sepetim';
            this.sepetim = this.caching.sessionStorage.get(this.SEPETIM_CACHE_KEY) || [];
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
        return VitrinApi;
    }(baseapi_1.BaseApi));
    exports.VitrinApi = VitrinApi;
    //#region Register
    app_1.App.addApi("vitrinApi", VitrinApi);
    //#endregion
});
