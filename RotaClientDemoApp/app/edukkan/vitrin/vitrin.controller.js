define(["require", "exports", "tslib", "rota/base/basecontroller", "rota/base/decorators", "admin/urun/urun.api", "./vitrin.api"], function (require, exports, tslib_1, basecontroller_1, decorators_1, urun_api_1, vitrin_api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    var VitrinController = (function (_super) {
        tslib_1.__extends(VitrinController, _super);
        function VitrinController(bundle, urunApi, vitrinApi) {
            var _this = _super.call(this, bundle) || this;
            _this.urunApi = urunApi;
            _this.vitrinApi = vitrinApi;
            urunApi.getList()
                .then(function (urunler) {
                _this.urunler = urunler;
            });
            return _this;
        }
        VitrinController.prototype.sepeteEkle = function (urun, adet) {
            if (urun.stokMiktari < adet) {
                this.toastr.error({ message: 'Stok miktarından fazla sipariş veremezsiniz' });
                return;
            }
            this.vitrinApi.sepeteEkle(urun, adet);
        };
        VitrinController.prototype.sepetiGoster = function () {
            this.dialogs.showModal({
                templateUrl: 'edukkan/vitrin/sepet.html',
                instanceOptions: {
                    services: [{ injectionName: vitrin_api_1.VitrinApi.injectionName, instanceName: 'vitrinApi' }],
                    params: { sepetim: this.vitrinApi.sepetim }
                }
            });
        };
        VitrinController = tslib_1.__decorate([
            decorators_1.Controller("vitrinController"),
            tslib_1.__metadata("design:paramtypes", [Object, urun_api_1.UrunApi,
                vitrin_api_1.VitrinApi])
        ], VitrinController);
        return VitrinController;
    }(basecontroller_1.default));
});
