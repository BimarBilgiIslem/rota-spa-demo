define(["require", "exports", "moment"], function (require, exports, moment) {
    "use strict";
    //#endregion
    //#region Reporting Service
    /**
     * Reporting service
     */
    var Reporting = (function () {
        function Reporting($http, $q, routing, config, common, localization, dialogs, logger, constants) {
            this.$http = $http;
            this.$q = $q;
            this.routing = routing;
            this.config = config;
            this.common = common;
            this.localization = localization;
            this.dialogs = dialogs;
            this.logger = logger;
            this.constants = constants;
            this.serviceName = 'Reporting Service';
            if (!config.reportControllerUrl)
                throw new Error(this.constants.errors.NO_REPORT_URL_PROVIDED);
            if (!config.reportViewerUrl)
                throw new Error(this.constants.errors.NO_REPORT_VIEWER_URL_PROVIDED);
        }
        /**
         * Convert literak filter obj to ReportParams array
         * @param filter Report Filter obj
         */
        Reporting.prototype.mapReportParams = function (filter) {
            var _this = this;
            var reportParams = _.reduce(filter, function (memo, value, key) {
                if (_.isArray(value)) {
                    //SSRS expect a array with one item at least so add zero as default item
                    var expectedArrayParam = value.length ? value : [0];
                    memo = memo.concat(_.map(expectedArrayParam, function (item) { return { name: key, value: item }; }));
                }
                else if (_.isDate(value))
                    memo.push({ name: key, value: moment(value).format(_this.config.datetimeFormat.timeFormat) });
                else
                    memo.push({ name: key, value: value });
                return memo;
            }, []);
            return reportParams;
        };
        /**
         * Export/Downlaod report as specified mimetype
         * @param options Report generate options
         */
        Reporting.prototype.downloadReport = function (options) {
            var _this = this;
            //extend defaults
            options = angular.extend({ reportExportType: 2 /* Pdf */, reportDispositonType: 1 /* Attachment */ }, options);
            //get url
            var generateReportUrl = this.config.reportControllerUrl + "/" + this.constants.server.ACTION_NAME_GENERATE_REPORT +
                "?reportName=" + options.reportName + "&reportExportType=" + options.reportExportType;
            //convert filter to array
            var reportParams = this.mapReportParams(options.filter);
            //generate report
            var generateReportPromise = this.$http.post(generateReportUrl, reportParams);
            return generateReportPromise.then(function () {
                var getReportUrl = _this.config.reportControllerUrl + "/" + _this.constants.server.ACTION_NAME_GET_REPORT +
                    "?displayReportName=" + options.displayReportName + "&reportDispositonType=" + options.reportDispositonType;
                switch (options.reportDispositonType) {
                    case 1 /* Attachment */:
                        window.location.replace(getReportUrl);
                        break;
                    case 0 /* Inline */:
                        window.open(getReportUrl, null, 'height=950, width=950, status=yes, resizable=yes, scrollbars=yes,' +
                            ' toolbar=no, location=no, menubar=no left=0, top=10');
                        break;
                }
                _this.logger.console.log({ message: options.reportName + ' report downloaded/viewed' });
            });
        };
        /**
         * Show ReportViewer
         * @param reportName Actual SSRS Report Name
         * @param options Report Options
         */
        Reporting.prototype.showReport = function (options) {
            var _this = this;
            var paramResponsePromise;
            if (!_.isEmpty(options.filter)) {
                //convert filter to array params
                var reportParams = this.mapReportParams(options.filter);
                paramResponsePromise = this.$http.post(this.config.reportControllerUrl + "/" +
                    this.constants.server.ACTION_NAME_SET_REPORT_FILTERS, reportParams);
            }
            return this.common.makePromise(paramResponsePromise).then(function () {
                _this.logger.console.log({ message: options.reportName + ' report opened in reportviewer' });
                return _this.dialogs.showReport({
                    message: options.message,
                    title: options.title,
                    okText: options.okText,
                    windowClass: options.windowClass,
                    reportName: options.reportName,
                    reportViewerUrl: _this.config.reportViewerUrl
                });
            });
        };
        Reporting.$inject = ['$http', '$q', 'Routing', 'Config', 'Common', 'Localization', 'Dialogs', 'Logger', 'Constants'];
        return Reporting;
    }());
    exports.Reporting = Reporting;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.reporting', []);
    module.service('Reporting', Reporting);
    //#endregion
});
