define(["require", "exports"], function (require, exports) {
    "use strict";
    //#region Directive
    function reportButtonsDirective(reporting) {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {
                reportName: '@',
                filters: '='
            },
            link: function (scope, elem, attrs) {
                scope.onClick = function (type) {
                    switch (type) {
                        case "reportviewer":
                            reporting.showReport({ reportName: scope.reportName, filter: scope.filters });
                            break;
                        case "indirpdf":
                            reporting.downloadReport({
                                reportName: scope.reportName, displayReportName: scope.reportName + ".pdf",
                                filter: scope.filters, reportExportType: 2 /* Pdf */
                            });
                            break;
                        case "indirxls":
                            reporting.downloadReport({
                                reportName: scope.reportName, displayReportName: scope.reportName + ".xls",
                                filter: scope.filters, reportExportType: 1 /* Excel */
                            });
                            break;
                        case "indirword":
                            reporting.downloadReport({
                                reportName: scope.reportName, displayReportName: scope.reportName + ".doc",
                                filter: scope.filters, reportExportType: 4 /* Word */
                            });
                            break;
                        case "indirhtml":
                            reporting.downloadReport({
                                reportName: scope.reportName, displayReportName: scope.reportName + ".html",
                                filter: scope.filters, reportExportType: 3 /* Html */
                            });
                            break;
                        case "gosterpdf":
                            reporting.downloadReport({
                                reportName: scope.reportName, displayReportName: scope.reportName + ".pdf",
                                filter: scope.filters, reportExportType: 2 /* Pdf */,
                                reportDispositonType: 0 /* Inline */
                            });
                            break;
                        case "gosterxls":
                            reporting.downloadReport({
                                reportName: scope.reportName, displayReportName: scope.reportName + ".xls",
                                filter: scope.filters, reportExportType: 1 /* Excel */,
                                reportDispositonType: 0 /* Inline */
                            });
                            break;
                        default:
                    }
                };
            },
            template: '<div class="btn-group">' +
                '<rt-button size="sm" color="info" icon="external-link" click="onClick(\'reportviewer\')" text-i18n="rota.raporgoster"></rt-button>' +
                '<button type="button" class="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown">' +
                '<span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button>' +
                '<ul class="dropdown-menu">' +
                '<li class="dropdown-header" i18n="rota.indir"></li>' +
                '<li><a href ng-click="onClick(\'indirpdf\')">' +
                '<i class="fa fa-file-pdf-o fa-fw"></i>&nbsp;{{::"rota.indirpdf" | i18n}}' +
                '</a></li>' +
                '<li><a href ng-click="onClick(\'indirxls\')">' +
                '<i class="fa fa-file-excel-o fa-fw"></i>&nbsp;{{::"rota.indirxls" | i18n}}' +
                '</a></li>' +
                '<li><a href ng-click="onClick(\'indirword\')">' +
                '<i class="fa fa-file-word-o fa-fw"></i>&nbsp;{{::"rota.indirword" | i18n}}' +
                '</a></li>' +
                '<li><a href ng-click="onClick(\'indirhtml\')">' +
                '<i class="fa fa-file-code-o fa-fw"></i>&nbsp;{{::"rota.indirhtml" | i18n}}' +
                '</a></li>' +
                '<li class="dropdown-header" i18n="rota.goster"></li>' +
                '<li><a href ng-click="onClick(\'gosterpdf\')">' +
                '<i class="fa fa-file-pdf-o fa-fw"></i>&nbsp;{{::"rota.indirpdf" | i18n}}' +
                '</a></li>' +
                '</ul></div>'
        };
        return directive;
    }
    exports.reportButtonsDirective = reportButtonsDirective;
    reportButtonsDirective.$inject = ['Reporting'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtreportbuttons', [])
        .directive('rtReportButtons', reportButtonsDirective);
    //#endregion
});
