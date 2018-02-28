define(["require", "exports", "tslib", "rota/base/baselistcontroller", "rota/base/decorators", "./kategori.api"], function (require, exports, tslib_1, baselistcontroller_1, decorators_1, kategori_api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Your base list controller.Replace IBaseModel and IBaseModelFilter with your own models
     */
    var KategorilerController = (function (_super) {
        tslib_1.__extends(KategorilerController, _super);
        function KategorilerController(bundle, kategoriApi) {
            var _this = 
            //configure options for your need
            _super.call(this, bundle) || this;
            _this.kategoriApi = kategoriApi;
            _this.listPageOptions.listButtonVisibility.deleteSelected = false;
            //Neler orneklendi
            var whatIncluded = [
                "Liste buttonlarini invisible yapmak",
                "Grid delete butonunu kaldirmak (Kullanım crud-buttons'ları icinde aynı şeklide)"
            ];
            _this.logger.notification.info({
                message: whatIncluded.join('<br/>'),
                title: 'Bu sayfadaki örnekler'
            });
            return _this;
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
        KategorilerController = tslib_1.__decorate([
            decorators_1.Controller({
                registerName: 'kategorilerController',
                editState: 'shell.content.kategori',
                pagingEnabled: false,
                storeFilterValues: true
            }),
            tslib_1.__metadata("design:paramtypes", [Object, kategori_api_1.KategoriApi])
        ], KategorilerController);
        return KategorilerController;
    }(baselistcontroller_1.default));
});
