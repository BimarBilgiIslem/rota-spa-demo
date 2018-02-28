using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using Microsoft.Reporting.WebForms;
using Microsoft.Reporting.WebForms.Internal.Soap.ReportingServices2005.Execution;
using RotaSPA_Client.Controllers;
using ReportParameter = Microsoft.Reporting.WebForms.ReportParameter;

namespace RotaSPA_Client
{
    public partial class ReportViewer : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (IsPostBack) return;

            mainReportViewer.ServerReport.ReportServerUrl =
                new Uri(ConfigurationManager.AppSettings["ReportServiceUrl"]);
            mainReportViewer.ServerReport.ReportPath =
                ConfigurationManager.AppSettings["ALPReportPaths"] + "/" + Request.QueryString["reportName"];

            mainReportViewer.ProcessingMode = ProcessingMode.Remote;
            mainReportViewer.ShowParameterPrompts = false;
            mainReportViewer.ShowRefreshButton = false;
            mainReportViewer.ShowWaitControlCancelLink = false;
            mainReportViewer.ShowBackButton = false;
            mainReportViewer.ShowCredentialPrompts = false;
            //Set params
            var sessionParams = HttpContext.Current.Session[ReportController.SessionReportName] as ParameterValue[];
            if (sessionParams != null)
            {
                var parametersCollection = sessionParams.Select(parameter => new ReportParameter(parameter.Name, parameter.Value, false)).ToList();
                mainReportViewer.ServerReport.SetParameters(parametersCollection);
            }

            mainReportViewer.ServerReport.Refresh();
        }
    }
}