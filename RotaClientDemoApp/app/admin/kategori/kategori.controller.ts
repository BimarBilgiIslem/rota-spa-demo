/* author      : sercan.gurbuz
 * date        : 10/18/2016 10:44:29 AM 
 */
//#region Imports
import { App } from "rota/config/app";
import { BaseCrudController } from "rota/base/basecrudcontroller";
import "./kategori.api"
//#endregion

/**
 * Your base crud controller.Replace IBaseCrudModel with your own model
 */
class KategoriController extends BaseCrudController<IKategori> {
    kategoriApi: IKategoriApi;
    kategoriAdi: string;

    currentUser: IUser;
    currentCompany: ICompany;

    constructor(bundle: IBundle) {
        //configure options for your need
        super(bundle, {});
        this.crudPageOptions.crudButtonsVisibility.deleteButton = false;
    }

    //#region BaseCrudController
    getModel(modelFilter: IBaseFormModelFilter): ng.IPromise<IKategori> {
        //return your model
        return this.kategoriApi.getById(modelFilter.id);
    }

    saveModel(options: ISaveOptions): ng.IPromise<ICrudServerResponseData | IParserException> {
        //save your model
        return this.kategoriApi.kategoriKaydet(options.jsonModel as IKategori);
    }

    deleteModel(options: IDeleteOptions): IP<any> {
        //delete your model
        return this.kategoriApi.save(options.jsonModel as IKategori);
    }
    //#endregion

    kategoriKontrol(): IP<any> {
        return this.kategoriApi.getList({ kategoriAdi: this.model.kategoriAdi })
            .then((kategorier) => {
                if (kategorier.length > 0) {
                    return this.common
                        .rejectedPromise<IParserException>({ message: 'Aynı isimle kategori tanımlıdır', logType: LogType.Warn });
                }
            });
    }


    afterSaveModel(options: ISaveOptions): void {
        this.routing.go('shell.content.kategoriler');
    }

    //beforeSaveModel(options: ISaveOptions): angular.IPromise<any> {
    //    return this.kategoriKontrol();

    //}
}
//#region Register
App.addController("kategoriController", KategoriController, "kategoriApi", "CurrentUser", "CurrentCompany");
//#endregion