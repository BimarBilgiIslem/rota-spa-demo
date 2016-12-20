/* author      : sercan.gurbuz
 * date        : 10/18/2016 10:44:09 AM 
 */
//#region Imports
import { App } from "rota/config/app";
import { BaseListController } from "rota/base/baselistcontroller";
import "./kategori.api"
//#endregion

/**
 * Your base list controller.Replace IBaseModel and IBaseModelFilter with your own models
 */
class KategorilerController extends BaseListController<IKategori, IKategoriFilter> {

    kategoriApi: IKategoriApi;

    constructor(bundle: IBundle) {
        //configure options for your need
        super(bundle, {
            editState: 'shell.content.kategori', pagingEnabled: false,
            initializeModel: true, storeFilterValues: true
        });
        this.listPageOptions.listButtonVisibility.deleteSelected = false;

        //Neler orneklendi
        const whatIncluded = [
            "Liste buttonlarini invisible yapmak",
            "Grid delete butonunu kaldirmak (Kullanım crud-buttons'ları icinde aynı şeklide)"
        ];
        this.logger.notification.info({
            message: whatIncluded.join('<br/>'),
            title: 'Bu sayfadaki örnekler'
        });
    }

    //#region BaseListController
    getGridColumns(options: IGridOptions<IKategori>): uiGrid.IColumnDef[] {
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
    }

    getModel(modelFilter?: IKategoriFilter): IP<IBaseListModel<IKategori>> {
        //return your model here
        return this.kategoriApi.listeyiAl(modelFilter);
    }
    //#endregion
}
//#region Register
App.addController("kategorilerController", KategorilerController, "kategoriApi");
//#endregion