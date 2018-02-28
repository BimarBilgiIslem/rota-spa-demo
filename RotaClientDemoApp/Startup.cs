using System.Configuration;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Routing;
using IdentityServer3.AccessTokenValidation;
using Microsoft.Owin;
using Microsoft.Owin.Security.OAuth;
using Owin;
using System.IdentityModel.Tokens;
using System.Collections.Generic;

[assembly: OwinStartup(typeof(RotaSPA_Client.Startup))]

namespace RotaSPA_Client
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //set session available
            RequireAspNetSession(app);
            JwtSecurityTokenHandler.InboundClaimTypeMap = new Dictionary<string, string>();
            app.UseIdentityServerBearerTokenAuthentication(new IdentityServerBearerTokenAuthenticationOptions
            {
                Authority = ConfigurationManager.AppSettings["authority"],
                RequiredScopes = new[] { "rotaapi", "login" },
                TokenProvider = new QueryStringOAuthBearerProvider("access_token")
            });

            var config = new HttpConfiguration();
            //Register server routes
            RegisterRoutes(RouteTable.Routes);
            //Configure WebApi
            ConfigureWebApi(config);
            //Enable SignalR
            app.MapSignalR();
            //Use webapi
            app.UseWebApi(config);
        }
    }

    public class QueryStringOAuthBearerProvider : OAuthBearerAuthenticationProvider
    {
        readonly string _name;

        public QueryStringOAuthBearerProvider(string name)
        {
            _name = name;
        }

        public override Task RequestToken(OAuthRequestTokenContext context)
        {
            var value = context.Request.Query.Get(_name);

            if (!string.IsNullOrEmpty(value))
            {
                context.Token = value;
            }

            return Task.FromResult<object>(null);
        }
    }
}
