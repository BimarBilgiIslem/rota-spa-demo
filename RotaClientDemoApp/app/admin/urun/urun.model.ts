interface IUrun extends IBaseCrudModel {
    urunAdi: string;
    kodu: string;
    kategoriId: number;
    altKategoriId?: number;
    birimFiyat?: number;
    urunResmi?: string;
    stokMiktari?: number;
    kayitEdenKullaniciId: number;
    yayinlanmaTarihi?: Date;
    iliskiliUrunler: IBaseListModel<IIliskiliUrun>;
    ekliDosyalar: IBaseListModel<IEkliDosya>;
}


interface IEkliDosya extends IFileModel {

}

interface IIliskiliUrun extends IBaseCrudModel {
    urunId: number;
    iliskiliUrunId: number;
}

interface IUrunFilter extends IBaseModelFilter {
    urunAdi?: string;
    kodu?: string;
}

interface IUrunApi extends IBaseCrudApi<IUrun> {
    minStokMiktari: number;
}