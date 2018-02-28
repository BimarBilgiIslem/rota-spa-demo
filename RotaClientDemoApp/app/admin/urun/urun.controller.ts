/* author      : sercan.gurbuz
 * date        : 10/18/2016 10:44:29 AM 
 */
//#region Imports
import BaseCrudController from "rota/base/basecrudcontroller";
import { Controller } from "rota/base/decorators";
//moment
import * as moment from "moment";
//Fiziksel olarak api dosyalarını define dependency listesine ekliyoruz
import { UrunApi } from "./urun.api"
import { KategoriApi } from "../kategori/kategori.api"
//#endregion
const DEFAULT_IMAGE_URI = "content/img/default.jpg";
/**
 * Your base crud controller.Replace IBaseCrudModel with your own model
 */
@Controller<ICrudPageOptions>({ registerName: 'urunController' })
class UrunController extends BaseCrudController<IUrun> {
    //#region Genel değişkenler
    //Sabitler
    defaultImgUri = DEFAULT_IMAGE_URI;
    //Diger global değişkenler
    altKategoriler: IKategori[];
    stokDurumuPanelBg: string;
    yeniKategoriModalAyarlari: IModalOptions;
    minYayinlanmaTarihi: Date;
    //#endregion

    //#region Init
    constructor(bundle: IBundle, private urunApi: UrunApi, private kategoriApi: KategoriApi, ) {
        //configure options for your need
        super(bundle);
        //Yeni kategori modal ayarlari
        this.yeniKategoriModalAyarlari = {
            templateUrl: 'admin/kategori/kategori.modal.html',
            instanceOptions: { services: [{ instanceName: 'kategoriApi', injectionName: KategoriApi.injectionName }] }
        }
        //custom validators
        this.validators.addValidation({ func: this.stokMiktariKontrol, triggerOn: TriggerOn.Action })
            .addValidation({ func: this.urunKoduKontrolu, triggerOn: TriggerOn.Blur, name: 'urunKoduKontrolu' });
        //Neler orneklendi
        const whatIncluded = [
            "Form <b>input</b> kullanımları (text,number,currency,editor)",
            "<b>rtSelect</b> combobox olarak kullanımı,fire-onchange ve newItemOptions modal örneği",
            "<b>Cascading rtSelect</b> örneği - Seçilen kategori'ye göre altKategori'leri dolduryoruz",
            "<b>rtMultiSelect</b> kullanımı",
            "<b>Custom panel header</b>",
            "<b>rtMultiFileUpload</b> kullanımı",
            "<b>moment.js</b> örneği",
            "<b>BaseCrudController event'leri</b> (getModel,loadedModel,saveModel,beforeSaveModel)",
            "<b>Custom Validations</b> (BeforeSaveModel event ve Validators servisi)",
            "<b>rtCallout ve rtValidator</b> kullanımı",
            "<b>Tooltip ve popover</b> kullanımları - <a href='http://angular-ui.github.io/bootstrap/' target='_blank'>Angular Bootstrap</a>",
            "<b>uib-tabset kullanımı</b> - <a href='http://angular-ui.github.io/bootstrap/' target='_blank'>Angular Bootstrap</a>",
            "<b>File upload ve Image croping</b>",
            "<b>ShowConfirm,ShowPrompt,ShowModal</b> kullanımı - Dialogs servisi"
        ];
        this.logger.notification.info({
            message: whatIncluded.join('<br/>'),
            title: 'Bu sayfadaki örnekler'
        });
    }
    //#endregion

    //#region Validasyon Methodlari
    /**
     * Aynı urun kod varmi validasyonu
     * @param args {IValidationArgs}
     */
    urunKoduKontrolu(args: IValidationArgs): IP<IValidationResult> {
        if (!args.modelValue || args.modelValue.length === 0) return this.common.promise();

        return this.urunApi.getList<IUrunFilter>({ kodu: args.modelValue })
            .then((urunler) => {
                if (urunler.length > 0)
                    return this.common.rejectedPromise<IValidationResult>({
                        message: "Aynı kod'a sahip başka urun bulunmaktadir"
                    });
                return this.common.promise();
            });
    }
    /**
     * Stok miktari validasyon methodu
     * @description Modal da verilen cevaba gore modal promise resolve veya reject olur.Buna gore save işlemi devam eder veya kesilir.
     */
    stokMiktariKontrol(args: IValidationArgs): IP<IValidationResult> {
        if (this.model.stokMiktari <= this.urunApi.minStokMiktari) {
            return this.dialogs.showConfirm({
                message: 'Minumum stok miktarının altinda miktar girdiniz.Devam etmek istiyormusunuz ?',
                title: 'Min stok uyarısı'
            });
        }
    }
    //#endregion

    //#region BaseCrudController
    /**
     * Model datayi dolduran abstract event
     * @description Sadece edit modda çalişir
     * @param modelFilter
     */
    getModel(modelFilter: IBaseFormModelFilter): ng.IPromise<IUrun> {
        //return your model
        return this.urunApi.getById(modelFilter.id);
    }
    /**
     * Kaydet butonuna basinca çalişan event,
     * @description this.initSaveModel() ile manuel tetiklenebilir
     * @param options Save options
     */
    saveModel(options: ISaveOptions): ng.IPromise<ICrudServerResponseData> {
        //save your model
        return this.urunApi.save(options.jsonModel as IUrun);
    }
    /**
     * Delete butonuna baislinca çalişan event
     * @param options Delete Options
     */
    deleteModel(options: IDeleteOptions): ng.IPromise<any> {
        //delete your model
        return this.urunApi.save(options.jsonModel as IUrun);
    }
    /**
    * Save işleminden once çalişan event
    * @description Bu methodda modele custom assignmentlar yapılabilir,veya validasyon eklenebilir.
    * @param options Save options
    */
    beforeSaveModel(options: ISaveOptions): any {
        //Set user id 
        this.model.kayitEdenKullaniciId = this.currentUser.id;
    }
    /**
     * Model new modda ise bu event tetiklenir.
     * @description Yeni kayit inital degerlerin atilmasinda kullanilabilir.
     * @param clonedModel Eger kopyalama yapılıyorsa clonedModel true gelir
     */
    newModel(clonedModel?: IUrun): IUrun {
        const model = super.newModel(clonedModel) as IUrun;
        model.birimFiyat = 0;
        model.stokMiktari = 1;
        model.yayinlanmaTarihi = new Date();
        model.iliskiliUrunler = [];
        model.ekliDosyalar = [];
        this.minYayinlanmaTarihi = moment().add(-1, "m").toDate();
        return model;
    }
    /**
     * Model yuklendikten sonra çalişan event (New veya Edit modda çalişir)
     * @param model Model
     */
    loadedModel(model: IUrun): void {
        //Varsayilan default image path
        this.model.urunResmi = model.urunResmi || DEFAULT_IMAGE_URI;
        //Stok durumuna gore panel rengi değiştir
        this.stokDurumuPanelBg = "default";
        if (!this.isNew)
            this.stokDurumuPanelBg = this.urunApi.minStokMiktari >= model.stokMiktari ? "danger" : "info";
        //base methodu cagirmayi unutmayin !!!
        super.loadedModel(model);
    }
    //#endregion

    //#region Methodlar
    urunKategoriUyumKontrol(args: IMultiSelectedEventArgs): IP<any> {
        //Eger hepsini ekle secildiyse işlem yapmıyoruz,
        //NOT : Batch ekleme butonlarini "hideButtons" attr ekleyerek kaldirabilirz
        if (args.isBatchProcess) return;

        if ((args.$selectItem as IUrun).kategoriId !== this.model.kategoriId) {
            return this.dialogs.showConfirm({
                message: 'Eklediginiz ilişkili ürün farkli bir kategoriden.' +
                'Yinede eklemek istiyormusunuz ?'
            });
        }
    }
    /**
     * Ürun resmini siler ve manuel kayit işlemini tetikler
     */
    urunResmiSil(): void {
        this.dialogs.showConfirm({ message: 'Resmi silmek istediğinize eminmisiniz ?' })
            .then(() => {
                this.model.urunResmi = "content/img/default.jpg";
                this.initSaveModel();
            });
    }
    /**
     * Ürün resmi yukler
     */
    urunResmiYukle(): void {
        this.dialogs.showFileUpload({
            allowedExtensions: '.png,.jpg',
            showImageCroppingArea: true,
            title: 'Ürün resmi seçiniz...',
            sendText: 'Kırp ve kaydet'
        }).then((file): void => {
            this.model.urunResmi = (file as ICroppedImageUploadResult).croppedDataUrl;
        });
    }
    /**
     * rtSelect Cascading ornegi icin altKategorileri yukler
     * @param args
     */
    altKatgorileriYukle(args: ISelectedEventArgs): void {
        this.model.altKategoriId = null;
        this.altKategoriler = [];

        if (!args.modelValue) return;

        this.kategoriApi.listeyiAl({ ustKategoriId: args.modelValue })
            .then((kategoriler) => {
                this.altKategoriler = kategoriler;
            });
    }
    /**
     * Stok miktarini değiştirir ve cache'e atar
     */
    minStokMiktariniDegistir(): void {
        this.dialogs.showPrompt({
            title: 'Stok Ayarları', subTitle: 'Min stok miktarını giriniz',
            okText: 'Güncelle', cancelText: 'İptal', initValue: this.urunApi.minStokMiktari.toString()
        })
            .then((value) => {
                this.urunApi.minStokMiktari = parseInt(value);
                this.logger.toastr.info({ message: 'Stok miktarı değiştirildi' });
            });
    }

    buyukResim(): void {
        this.dialogs.showModal({
            templateUrl: 'admin/urun/urun.modal.html',
            size: 'lg',
            instanceOptions: { params: { urunResmi: this.model.urunResmi } }
        });
    }
    //#endregion
}