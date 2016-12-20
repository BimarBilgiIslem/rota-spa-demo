<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ReportViewer.aspx.cs" Inherits="RotaClientDemoApp.ReportViewer.ReportViewer" %>

<%@ Register Assembly="Microsoft.ReportViewer.WebForms, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91"
    Namespace="Microsoft.Reporting.WebForms" TagPrefix="rsweb" %>
<!DOCTYPE html>


<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title></title>
</head>
<body>

    <div style="width: auto;">
        <form id="form1" runat="server" style="width: 100%; height: 100%;">
            <asp:ScriptManager ID="ScriptManager1" runat="server"></asp:ScriptManager>
            <rsweb:ReportViewer ID="mainReportViewer" runat="server" Width="100%" Height="100%" AsyncRendering="False"
                SizeToReportContent="True">
            </rsweb:ReportViewer>
        </form>
    </div>

</body>
</html>
