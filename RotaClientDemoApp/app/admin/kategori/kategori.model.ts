interface IKategori extends IBaseCrudModel {
    kategoriAdi: string;
    ustKategoriId?: number;
    ustKategoriAdi?: string;
}

interface IKategoriFilter extends IBaseListModelFilter {
    kategoriAdi?: string;
    ustKategoriId?: number;
}

