var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "rota/config/app", "rota/base/basecontroller", "admin/urun/urun.api", "./vitrin.api"], function (require, exports, app_1, basecontroller_1) {
    "use strict";
    //#endregion
    var VitrinController = (function (_super) {
        __extends(VitrinController, _super);
        function VitrinController(bundle) {
            var _this = this;
            _super.call(this, bundle);
            this.urunApi.getList()
                .then(function (urunler) {
                _this.urunler = urunler;
            });
        }
        VitrinController.prototype.sepeteEkle = function (urun, adet) {
            if (urun.stokMiktari < adet) {
                return this.logger.toastr.error({ message: 'Stok miktarından fazla sipariş veremezsiniz' });
            }
            this.vitrinApi.sepeteEkle(urun, adet);
        };
        VitrinController.prototype.sepetiGoster = function () {
            this.dialogs.showModal({
                templateUrl: 'edukkan/vitrin/sepet.html',
                instanceOptions: { services: ['vitrinApi'], params: { sepetim: this.vitrinApi.sepetim } }
            });
        };
        return VitrinController;
    }(basecontroller_1.BaseController));
    //#region Register
    app_1.App.addController("vitrinController", VitrinController, "urunApi", "Caching", "vitrinApi");
});
//#endregion 
