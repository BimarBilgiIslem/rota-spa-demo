var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "rota/config/app", "rota/base/basecrudcontroller", "./kategori.api"], function (require, exports, app_1, basecrudcontroller_1) {
    "use strict";
    //#endregion
    /**
     * Your base crud controller.Replace IBaseCrudModel with your own model
     */
    var KategoriController = (function (_super) {
        __extends(KategoriController, _super);
        function KategoriController(bundle) {
            //configure options for your need
            _super.call(this, bundle, {});
            this.crudPageOptions.crudButtonsVisibility.deleteButton = false;
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
        return KategoriController;
    }(basecrudcontroller_1.BaseCrudController));
    //#region Register
    app_1.App.addController("kategoriController", KategoriController, "kategoriApi", "CurrentUser", "CurrentCompany");
});
//#endregion 
