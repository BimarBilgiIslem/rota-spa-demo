using RotaSPA_Client.Models;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Http;

namespace RotaSPA_Client.Controllers
{
    public class KategoriController : ApiController
    {
        public static readonly IDictionary<int, Kategori> Kategori = new Dictionary<int, Kategori>()
        {
            {1, new Kategori() {Id = 1, KategoriAdi = "Elektronik",UstKategoriId =null }},
            {2, new Kategori() {Id = 2, KategoriAdi = "Oyuncak",UstKategoriId =null}},
            {3, new Kategori() {Id = 3, KategoriAdi = "Hırdavat",UstKategoriId =null}},
            {4, new Kategori() {Id = 4, KategoriAdi = "Beyaz Eşya",UstKategoriId =1}},
            {5, new Kategori() {Id = 5, KategoriAdi = "Akülü arabalar",UstKategoriId =2}}
        };

        [HttpPost]
        public IHttpActionResult SaveChanges(Kategori model)
        {
            if (model.ModelState == EntityState.Deleted)
            {
                if (!Kategori.ContainsKey(model.Id)) return NotFound();

                Kategori.Remove(model.Id);
                return Ok();
            }

            model.ModelState = EntityState.Unchanged;
            if (Kategori.ContainsKey(model.Id))
            {
                Kategori[model.Id] = model;
            }
            else
            {
                model.Id = (Kategori.Count > 0 ? Kategori.Keys.Max() : 0) + 1;
                Kategori.Add(model.Id, model);
            }

            return Ok(new { entity = model });
        }

        [HttpGet]
        public IHttpActionResult ListeyiAl([FromUri]KategoriFilter filter)
        {
            var list = (from row in Kategori.Values
                        where (!filter.UstKategoriId.HasValue || row.UstKategoriId == filter.UstKategoriId) &&
                        (filter.KategoriAdi == null || row.KategoriAdi.StartsWith(filter.KategoriAdi))
                        select row).ToList();
            return Ok(list);
        }

        [HttpGet]
        public IHttpActionResult GetModelById(int id)
        {
            return Ok(Kategori[id]);
        }
    }
}