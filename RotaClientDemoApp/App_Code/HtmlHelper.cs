using System;
using System.Configuration;
using System.IO;
using System.Web.Mvc;
using System.Xml;

namespace RotaClientDemoApp.Helper
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

        public static string GetAppVersion(this HtmlHelper helper)
        {
            var filePath = AppDomain.CurrentDomain.BaseDirectory + "/Buildinfo.config";
            if (File.Exists(filePath))
            {
                XmlDocument xml = new XmlDocument();
                xml.Load(filePath);

                XmlNamespaceManager nsMgr = new XmlNamespaceManager(xml.NameTable);
                nsMgr.AddNamespace("ns", "http://schemas.microsoft.com/VisualStudio/DeploymentEvent/2013/06");
                var node = xml.SelectSingleNode("/ns:DeploymentEvent/ns:SourceControl/ns:TfsSourceControl/ns:ProjectVersionSpec", nsMgr);
                if (node != null) return node.InnerText;
            }
            return "";
        }
    }
}