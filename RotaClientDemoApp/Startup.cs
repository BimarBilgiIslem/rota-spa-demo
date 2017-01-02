using System.Configuration;
using System.Web.Http;
using System.Web.Routing;
using Microsoft.Owin;
using Owin;
using Thinktecture.IdentityServer.AccessTokenValidation;

[assembly: OwinStartup(typeof(RotaClientDemoApp.Startup))]

namespace RotaClientDemoApp
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //test
            var config = new HttpConfiguration();
            //Register server routes
            RegisterRoutes(RouteTable.Routes);

            ConfigureWebApi(config);
            app.UseWebApi(config);
        }
    }
}
