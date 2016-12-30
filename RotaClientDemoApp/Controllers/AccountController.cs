using System;
using System.Web.Http;
using RotaIdentity.Helper.Models;

namespace RotaSPA_Client.Controllers
{  
    [RoutePrefix("api/Account")]
    public class AccountController : ApiController
    {
        [HttpPost, Route("Login"), AllowAnonymous]
        public RotaLoginResponse Login([FromBody] RotaLoginCredentials credentials)
        {
            var rotaLoginResponse = new RotaLoginResponse { IsError = true, ErrorDescription = "login failed" };
            try
            {
                ValidateUser(credentials, ref rotaLoginResponse);
            }
            catch (Exception e)
            {
                rotaLoginResponse.ErrorDescription = e.Message;
            }
            return rotaLoginResponse;
        }

        private void ValidateUser(RotaLoginCredentials credentials, ref RotaLoginResponse rotaLoginResponse)
        {
            rotaLoginResponse.FullName = "Edukkan Demo User";
            rotaLoginResponse.Email = "infoq@edukkan.com.tr";
            rotaLoginResponse.UserId = 99;
            rotaLoginResponse.UserName = "demo.user";
            rotaLoginResponse.LanguageId = 1;
            rotaLoginResponse.IsError = false;
        }
    }
}