interface ISepetim extends Array<{
    urunId: number;
    urunAdi: string;
    adet: number;
}> {
}

interface IVitrinApi {
    sepetim: ISepetim;
    sepeteEkle(urun: IUrun, adet: number): void;
}