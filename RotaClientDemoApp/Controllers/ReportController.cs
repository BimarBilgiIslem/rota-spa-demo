using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using Microsoft.Reporting.WebForms.Internal.Soap.ReportingServices2005.Execution;

namespace RotaSPA_Client.Controllers
{
    public enum ReportExportTypes
    {
        None, Excel, Pdf, Html, Word, Excelopenxml
    }

    public enum ReportDispositonTypes
    {
        Inline, Attachment
    }

    [System.Web.Http.Authorize]
    public class ReportController : ApiController
    {
        #region Static Props
        public static string SessionReportName = "reportParams";
        private const string SessionReport = "reportStore";
        private const string ReportParamsCulture = "tr-TR";
        static readonly string ReportLocalPath = ConfigurationManager.AppSettings["ALPReportPaths"];
        static readonly string ReportServiceUrl = ConfigurationManager.AppSettings["ReportServiceUrl"];
        static readonly string ReportServiceName = ConfigurationManager.AppSettings["ReportServiceName"];
        static readonly string ReportUser = ConfigurationManager.AppSettings["ReportUser"];
        static readonly string ReportPass = ConfigurationManager.AppSettings["ReportPass"];
        static readonly string ReportDomain = ConfigurationManager.AppSettings["ReportDomain"];
        #endregion

        #region Actions

        [System.Web.Http.HttpPost]
        public void SetReportParameters(ParameterValue[] filters)
        {
            HttpContext.Current.Session[SessionReportName] = filters;
        }

        [System.Web.Http.HttpPost]
        public void GenerateReport([FromBody]ParameterValue[] filters, string reportName, ReportExportTypes reportExportType = ReportExportTypes.Pdf)
        {
            HttpContext.Current.Session[SessionReport] = GetReport(reportName, reportExportType, filters);
        }

        /// <summary>
        /// Get report from session and download on client
        /// </summary>
        /// <param name="displayReportName">Downloaded report name</param>
        /// <param name="reportDispositonType">Report dispositon type,default attachment</param>
        /// <returns></returns>
        [AllowAnonymous]
        public HttpResponseMessage GetReport(string displayReportName,
            ReportDispositonTypes reportDispositonType = ReportDispositonTypes.Attachment)
        {
            if (string.IsNullOrEmpty(displayReportName)) return Request.CreateResponse(HttpStatusCode.BadRequest);
            var cachedReport = HttpContext.Current.Session[SessionReport] as byte[];
            if (cachedReport == null) return Request.CreateResponse(HttpStatusCode.BadRequest);

            var mimeType = MimeMapping.GetMimeMapping(displayReportName);
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(new MemoryStream(cachedReport))
            };
            response.Content.Headers.ContentDisposition =
                new ContentDispositionHeaderValue(reportDispositonType == ReportDispositonTypes.Attachment ? "attachment" : "inline")
                { FileName = HttpUtility.UrlEncode(displayReportName, System.Text.Encoding.UTF8) };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
            return response;
        }

        #endregion

        #region Methods
        /// <summary>
        /// Get report with format
        /// </summary>
        /// <param name="reportName">Actual Report Name</param>
        /// <param name="filters">Report Filters</param>
        /// <param name="reportExportType">Report Format</param>
        /// <returns></returns>
        public static byte[] GetReport(string reportName, ReportExportTypes reportExportType = ReportExportTypes.Pdf,
            ParameterValue[] filters = null)
        {
            var rs = new ReportExecutionService();
            //set report name
            var reportAbsoluteName = ReportLocalPath + "/" + reportName;
            //set ssrs service uri
            rs.Url = ReportServiceUrl + "/" + ReportServiceName;
            //set authentication
            rs.Credentials = CredentialCache.DefaultCredentials;
            var nc = new NetworkCredential(ReportUser, ReportPass, ReportDomain);
            rs.Credentials = nc;

            //set render args
            string deviceInfo = null;
            var format = reportExportType.ToString().ToUpper();

            if (format == "HTML")
            {
                deviceInfo = @"<DeviceInfo><Toolbar>False</Toolbar></DeviceInfo>";
                format = "HTML4.0";
            }
            //load report
            rs.LoadReport(reportAbsoluteName, null);
            //set filters
            if (filters != null)
                rs.SetExecutionParameters(filters, ReportParamsCulture);

            Warning[] warnings;
            string[] streamIDs;
            string extension;
            string mimeType;
            string encoding;
            var results = rs.Render(format, deviceInfo, out extension, out encoding, out mimeType, out warnings,
                out streamIDs);
            return results;
        }

        #endregion
    }
}