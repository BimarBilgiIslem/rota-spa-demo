/* author      : sercan.gurbuz
 * date        : 10/18/2016 10:44:29 AM 
 */
//#region Imports
import BaseCrudController from "rota/base/basecrudcontroller";
import { Controller } from "rota/base/decorators";

import { KategoriApi } from "./kategori.api"
//#endregion

/**
 * Your base crud controller.Replace IBaseCrudModel with your own model
 */
@Controller<ICrudPageOptions>({
    registerName: 'kategoriController'
})
class KategoriController extends BaseCrudController<IKategori> {
    kategoriAdi: string;

    currentUser: IUser;
    currentCompany: ICompany;

    constructor(bundle: IBundle, private kategoriApi: KategoriApi) {
        //configure options for your need
        super(bundle);
        this.crudPageOptions.crudButtonsVisibility.deleteButton = false;
    }

    //#region BaseCrudController
    getModel(modelFilter: IBaseFormModelFilter): ng.IPromise<IKategori> {
        //return your model
        return this.kategoriApi.getById(modelFilter.id);
    }

    saveModel(options: ISaveOptions): ng.IPromise<ICrudServerResponseData> {
        //save your model
        return this.kategoriApi.kategoriKaydet(options.jsonModel as IKategori);
    }

    deleteModel(options: IDeleteOptions): IP<any> {
        //delete your model
        return this.kategoriApi.save(options.jsonModel as IKategori);
    }
    //#endregion

    kategoriKontrol(): IP<any> {
        return this.kategoriApi.getList<IKategoriFilter>({ kategoriAdi: this.model.kategoriAdi })
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
}