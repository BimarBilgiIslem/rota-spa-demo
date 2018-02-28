define(["require", "exports", "tslib", "rota/base/basecrudcontroller", "rota/base/decorators", "./kategori.api"], function (require, exports, tslib_1, basecrudcontroller_1, decorators_1, kategori_api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Your base crud controller.Replace IBaseCrudModel with your own model
     */
    var KategoriController = (function (_super) {
        tslib_1.__extends(KategoriController, _super);
        function KategoriController(bundle, kategoriApi) {
            var _this = 
            //configure options for your need
            _super.call(this, bundle) || this;
            _this.kategoriApi = kategoriApi;
            _this.crudPageOptions.crudButtonsVisibility.deleteButton = false;
            return _this;
        }
        //#region BaseCrudController
        KategoriController.prototype.getModel = function (modelFilter) {
            //return your model
            return this.kategoriApi.getById(modelFilter.id);
        };
        KategoriController.prototype.saveModel = function (options) {
            //save your model
            return this.kategoriApi.kategoriKaydet(options.jsonModel);
        };
        KategoriController.prototype.deleteModel = function (options) {
            //delete your model
            return this.kategoriApi.save(options.jsonModel);
        };
        //#endregion
        KategoriController.prototype.kategoriKontrol = function () {
            var _this = this;
            return this.kategoriApi.getList({ kategoriAdi: this.model.kategoriAdi })
                .then(function (kategorier) {
                if (kategorier.length > 0) {
                    return _this.common
                        .rejectedPromise({ message: 'Aynı isimle kategori tanımlıdır', logType: 2 /* Warn */ });
                }
            });
        };
        KategoriController.prototype.afterSaveModel = function (options) {
            this.routing.go('shell.content.kategoriler');
        };
        KategoriController = tslib_1.__decorate([
            decorators_1.Controller({
                registerName: 'kategoriController'
            }),
            tslib_1.__metadata("design:paramtypes", [Object, kategori_api_1.KategoriApi])
        ], KategoriController);
        return KategoriController;
    }(basecrudcontroller_1.default));
});
