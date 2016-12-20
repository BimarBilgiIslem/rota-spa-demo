using System.Web.Mvc;

namespace RotaClientDemoApp.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult SignIn()
        {
            return View();
        }

        public ActionResult Signout()
        {
            return View();
        }
    }
}