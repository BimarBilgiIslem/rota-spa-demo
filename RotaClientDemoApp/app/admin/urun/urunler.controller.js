var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "rota/config/app", "rota/base/baselistcontroller", "./urun.api", "../kategori/kategori.api"], function (require, exports, app_1, baselistcontroller_1) {
    "use strict";
    //#endregion
    /**
     * Your base list controller.Replace IBaseModel and IBaseModelFilter with your own models
     */
    var UrunlerController = (function (_super) {
        __extends(UrunlerController, _super);
        function UrunlerController(bundle) {
            //configure options for your need
            _super.call(this, bundle, { editState: 'shell.content.urun', pagingEnabled: false, storeFilterValues: true });
            //Neler orneklendi
            var whatIncluded = [
                "Filtre ile Listeleme sayfası örneği",
                "Filtre saklama",
                "<b>Grid context menu</b> örnegi",
                "<b>ui-grid</b> custom cell formatting",
                "<b>ui-grid</b> custom row formmating işlemi <a href='http://ui-grid.info/docs/#/tutorial/317_custom_templates' target='_blank'>ui-grid custom template</a>"
            ];
            this.logger.notification.info({
                message: whatIncluded.join('<br/>'),
                title: 'Bu sayfadaki örnekler'
            });
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
        return UrunlerController;
    }(baselistcontroller_1.BaseListController));
    //#region Register
    app_1.App.addController("urunlerController", UrunlerController, "urunApi", "kategoriApi");
});
//#endregion 
