interface IKategori extends IBaseCrudModel {
    kategoriAdi: string;
    ustKategoriId?: number;
    ustKategoriAdi?: string;
}

interface IKategoriFilter extends IBaseModelFilter {
    kategoriAdi?: string;
    ustKategoriId?: number;
}

interface IKategoriApi extends IBaseCrudApi<IKategori> {
    listeyiAl(filter: IKategoriFilter): IP<IKategori[]>;
    kategoriKaydet(model: IKategori): IP<ICrudServerResponseData>;
}