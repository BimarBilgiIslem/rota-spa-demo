define(["require", "exports", "tslib", "rota/base/baselistcontroller", "rota/base/decorators", "./urun.api", "../kategori/kategori.api"], function (require, exports, tslib_1, baselistcontroller_1, decorators_1, urun_api_1, kategori_api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Your base list controller.Replace IBaseModel and IBaseModelFilter with your own models
     */
    var UrunlerController = (function (_super) {
        tslib_1.__extends(UrunlerController, _super);
        function UrunlerController(bundle, urunApi, kategoriApi) {
            var _this = 
            //configure options for your need
            _super.call(this, bundle) || this;
            _this.urunApi = urunApi;
            _this.kategoriApi = kategoriApi;
            //Neler orneklendi
            var whatIncluded = [
                "Filtre ile Listeleme sayfası örneği",
                "Filtre saklama",
                "<b>Grid context menu</b> örnegi",
                "<b>ui-grid</b> custom cell formatting",
                "<b>ui-grid</b> custom row formmating işlemi <a href='http://ui-grid.info/docs/#/tutorial/317_custom_templates' target='_blank'>ui-grid custom template</a>"
            ];
            _this.notification.info({
                message: whatIncluded.join('<br/>'),
                title: 'Bu sayfadaki örnekler'
            });
            return _this;
        }
        UrunlerController.prototype.rowFormatter = function (row) {
            return row.entity.stokMiktari <= this.urunApi.minStokMiktari;
        };
        //#region BaseListController
        UrunlerController.prototype.getGridColumns = function (options) {
            var _this = this;
            options.showContextMenu = true;
            options.rowFormatter = function (row) {
                return row.entity.stokMiktari <= _this.urunApi.minStokMiktari ? 'kritikStokMiktari' : '';
            };
            return [
                {
                    name: 'kodu',
                    displayName: 'Kodu',
                    width: '30%',
                    cellTemplate: '<span class="badge alert-info">{{row.entity.kodu}}</span>',
                    cellClass: 'stokKodu'
                },
                {
                    field: 'urunAdi',
                    displayName: 'Ürün Adi',
                    width: '50%'
                },
                {
                    field: 'stokMiktari',
                    displayName: 'Stok',
                    width: '5%',
                    cellClass: 'text-center bold'
                },
                {
                    field: 'kategoriAdi',
                    displayName: 'Kategori',
                    width: '*'
                }
            ];
        };
        UrunlerController.prototype.getModel = function (modelFilter) {
            //return your model here
            return this.urunApi.getList(modelFilter);
        };
        UrunlerController = tslib_1.__decorate([
            decorators_1.Controller({
                registerName: 'urunlerController',
                editState: 'shell.content.urun',
                pagingEnabled: false,
                storeFilterValues: true
            }),
            tslib_1.__metadata("design:paramtypes", [Object, urun_api_1.UrunApi,
                kategori_api_1.KategoriApi])
        ], UrunlerController);
        return UrunlerController;
    }(baselistcontroller_1.default));
});
