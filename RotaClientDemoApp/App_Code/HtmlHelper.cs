using System.Configuration;
using System.Web.Mvc;

namespace RotaSPA_Client.Helper
{
    public static class HtmlExtensions
    {
        public static bool IsReleaseBuild(this HtmlHelper helper)
        {
#if DEBUG
            return false;
#else
            return true;
#endif
        }

        public static string GetSetting(this HtmlHelper helper, string key, string defaultValue = "")
        {
            return ConfigurationManager.AppSettings[key] ?? defaultValue;
        }
    }
}