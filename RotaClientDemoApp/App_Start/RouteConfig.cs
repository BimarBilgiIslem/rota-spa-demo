using System.Web.Mvc;
using System.Web.Routing;

namespace RotaSPA_Client
{
    public partial class Startup
    {
        public void RegisterRoutes(RouteCollection routes)
        {
            AreaRegistration.RegisterAllAreas();

            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");            
                
            routes.MapRoute(
                namespaces: new[] { "RotaSPA_Client.Controllers" },
                name: "Default",
                url: "{*anything}", 
                defaults: new { controller = "Home", action = "Index" }
            );
        }
    }
}