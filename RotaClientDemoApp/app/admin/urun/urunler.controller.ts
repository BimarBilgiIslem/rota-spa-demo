﻿/* author      : sercan.gurbuz
 * date        : 10/18/2016 10:44:09 AM 
 */
//#region Imports
import BaseListController from "rota/base/baselistcontroller";
import { Controller } from "rota/base/decorators";

import { UrunApi } from "./urun.api"
import { KategoriApi } from "../kategori/kategori.api"
//#endregion

/**
 * Your base list controller.Replace IBaseModel and IBaseModelFilter with your own models
 */
@Controller<IListPageOptions>({
    registerName: 'urunlerController',
    editState: 'shell.content.urun',
    pagingEnabled: false,
    storeFilterValues: true
})
class UrunlerController extends BaseListController<IUrun, IUrunFilter> {
    constructor(bundle: IBundle,
        private urunApi: UrunApi,
        private kategoriApi: KategoriApi) {
        //configure options for your need
        super(bundle);
        //Neler orneklendi
        const whatIncluded = [
            "Filtre ile Listeleme sayfası örneği",
            "Filtre saklama",
            "<b>Grid context menu</b> örnegi",
            "<b>ui-grid</b> custom cell formatting",
            "<b>ui-grid</b> custom row formmating işlemi <a href='http://ui-grid.info/docs/#/tutorial/317_custom_templates' target='_blank'>ui-grid custom template</a>"
        ];
        this.notification.info({
            message: whatIncluded.join('<br/>'),
            title: 'Bu sayfadaki örnekler'
        });
    }

    rowFormatter(row: uiGrid.IGridRowOf<IUrun>): boolean {
        return row.entity.stokMiktari <= this.urunApi.minStokMiktari;
    }

    //#region BaseListController
    getGridColumns(options: IGridOptions<IUrun>): uiGrid.IColumnDef[] {
        options.showContextMenu = true;
        options.rowFormatter = (row) => {
            return row.entity.stokMiktari <= this.urunApi.minStokMiktari ? 'kritikStokMiktari' : '';
        }
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
    }

    getModel(modelFilter?: IUrunFilter): IP<IBaseListModel<IUrun>> {
        //return your model here
        return this.urunApi.getList(modelFilter);
    }
    //#endregion
}
