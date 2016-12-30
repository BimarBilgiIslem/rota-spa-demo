using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace RotaSPA_Client.Models
{
    public class BaseModel
    {
        public int Id { get; set; }
        public bool IsActive { get; set; }
        public EntityState ModelState { get; set; }

        public BaseModel()
        {
            Id = 0;
            ModelState = EntityState.Unchanged;
        }
    }

    public class Urun : BaseModel
    {
        public string UrunAdi { get; set; }
        public string Kodu { get; set; }
        public int KategoriId { get; set; }
        public int AltKategoriId { get; set; }
        public decimal BirimFiyat { get; set; }
        public string UrunResmi { get; set; }
        public string Aciklama { get; set; }
        public int StokMiktari { get; set; }
        public DateTime YayinlanmaTarihi { get; set; }
        public List<IliskiliUrun> IliskiliUrunler { get; set; }
        public List<DemoFile> EkliDosyalar { get; set; }
    }

    public class DemoFile : BaseModel
    {
        public byte[] FileContent { get; set; }
        public string Name { get; set; }
        public string CacheKey { get; set; }
    }

    public class IliskiliUrun : BaseModel
    {
        public int UrunId { get; set; }
        public int IliskiliUrunId { get; set; }
    }

    public class UrunFilter
    {
        public string UrunAdi { get; set; }
        public string Kodu { get; set; }
        public int? KategoriId { get; set; }
    }

    public class Kategori : BaseModel
    {
        public string KategoriAdi { get; set; }
        public int? UstKategoriId { get; set; }
    }

    public class KategoriFilter
    {
        public string KategoriAdi { get; set; }
        public int? UstKategoriId { get; set; }
    }
}