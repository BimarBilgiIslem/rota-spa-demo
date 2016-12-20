var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "rota/config/app", "rota/base/baselistcontroller", "./kategori.api"], function (require, exports, app_1, baselistcontroller_1) {
    "use strict";
    //#endregion
    /**
     * Your base list controller.Replace IBaseModel and IBaseModelFilter with your own models
     */
    var KategorilerController = (function (_super) {
        __extends(KategorilerController, _super);
        function KategorilerController(bundle) {
            //configure options for your need
            _super.call(this, bundle, {
                editState: 'shell.content.kategori', pagingEnabled: false,
                initializeModel: true, storeFilterValues: true
            });
            this.listPageOptions.listButtonVisibility.deleteSelected = false;
            //Neler orneklendi
            var whatIncluded = [
                "Liste buttonlarini invisible yapmak",
                "Grid delete butonunu kaldirmak (Kullanım crud-buttons'ları icinde aynı şeklide)"
            ];
            this.logger.notification.info({
                message: whatIncluded.join('<br/>'),
                title: 'Bu sayfadaki örnekler'
            });
        }
        //#region BaseListController
        KategorilerController.prototype.getGridColumns = function (options) {
            options.showDeleteButton = false;
            return [
                {
                    field: 'kategoriAdi',
                    displayName: 'Kategori Adi',
                    width: '40%'
                },
                {
                    field: 'ustKategoriAdi',
                    displayName: 'Ust Kategori',
                    width: '*'
                }
            ];
        };
        KategorilerController.prototype.getModel = function (modelFilter) {
            //return your model here
            return this.kategoriApi.listeyiAl(modelFilter);
        };
        return KategorilerController;
    }(baselistcontroller_1.BaseListController));
    //#region Register
    app_1.App.addController("kategorilerController", KategorilerController, "kategoriApi");
});
//#endregion 
