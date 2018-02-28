/*
 * Copyright 2017 Bimar Bilgi İşlem A.Ş.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["require", "exports", "moment"], function (require, exports, moment) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Reporting Service
    /**
     * Reporting service
     */
    var Reporting = (function () {
        function Reporting($rootScope, $http, $q, routing, config, common, localization, dialogs, logger, constants) {
            this.$rootScope = $rootScope;
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
                this.logger.console.warn({ message: this.constants.errors.NO_REPORT_URL_PROVIDED });
            if (!config.reportViewerUrl)
                this.logger.console.warn({ message: this.constants.errors.NO_REPORT_VIEWER_URL_PROVIDED });
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
            //extend defaults
            options = angular.extend({
                reportExportType: 2 /* Pdf */,
                reportDispositonType: 1 /* Attachment */
            }, options);
            //get url and convert filter to report params
            var reportEndpoint = this.config.reportControllerUrl + "/" + this.constants.server.ACTION_NAME_GET_REPORT;
            var reportParams = this.mapReportParams(options.filter);
            //get report
            this.$rootScope.$broadcast(this.constants.events.EVENT_START_FILEDOWNLOAD, {
                url: reportEndpoint,
                filter: {
                    options: {
                        reportName: options.reportName,
                        displayReportName: options.displayReportName,
                        reportExportType: options.reportExportType,
                        reportDispositonType: options.reportDispositonType
                    }, filter: { reportParams: reportParams }
                },
                inline: options.reportDispositonType === 0 /* Inline */
            });
            this.logger.console.log({ message: options.reportName + ' report downloaded' });
        };
        Reporting.injectionName = "Reporting";
        Reporting.$inject = ['$rootScope', '$http', '$q', 'Routing', 'Config', 'Common', 'Localization', 'Dialogs', 'Logger', 'Constants'];
        return Reporting;
    }());
    exports.Reporting = Reporting;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.reporting', []);
    module.service(Reporting.injectionName, Reporting);
});
