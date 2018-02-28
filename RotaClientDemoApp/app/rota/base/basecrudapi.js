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
define(["require", "exports", "tslib", "./baseapi"], function (require, exports, tslib_1, baseapi_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Base Crud Api for all api services
     * @description Please refer to the static endpoint names defined below for info
     */
    var BaseCrudApi = (function (_super) {
        tslib_1.__extends(BaseCrudApi, _super);
        function BaseCrudApi() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
        * Update bundle
        * @param bundle IBundle
        */
        BaseCrudApi.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.$rootScope = bundle.services["$rootscope"];
        };
        //#endregion
        //#region Standart Crud Methods
        /**
         * Make a get request to fetch all models filtered
         * @param filter Optional filter
         * @param controller Optional filter
         * @returns {ng.IPromise<TModel[]>}
         */
        BaseCrudApi.prototype.getList = function (filter, controller) {
            return this.get({
                action: this.config.crudActionNames.getList,
                controller: controller,
                params: filter
            });
        };
        /**
        * Make a get request to fetch all models filtered and paged
       * @param filter Optional filter
        * @param controller Optional filter
        * @returns {ng.IPromise<IPagingListModel<TModel>>}
        */
        BaseCrudApi.prototype.getPagedList = function (filter, controller) {
            return this.get({
                action: this.config.crudActionNames.getPagedList,
                controller: controller,
                params: filter
            });
        };
        /**
        * Make a get request to get model by id
        * @param id Unique id
        * @param controller Optional controller
        * @returns {ng.IPromise<TModel>}
        */
        BaseCrudApi.prototype.getById = function (id, controller) {
            if (!id || id <= 0 || !this.common.isNumber(id)) {
                this.logger.console.error({ message: 'getById/id param must be number but received ' + id });
                return this.common.promise();
            }
            return this.get({
                action: this.config.crudActionNames.getById,
                controller: controller,
                params: { id: id }
            });
        };
        /**
        * Make a post request to save model
        * @param model Model
        * @param controller Optional controller
        * @returns {ng.IPromise<ICrudServerResponseData>}
        */
        BaseCrudApi.prototype.save = function (model, controller) {
            return this.post({
                action: this.config.crudActionNames.save,
                controller: controller, data: model
            });
        };
        /**
        * Make a post request to delete model
        * @param id Unique id
        * @param controller Optional controller
        * @returns {ng.IPromise<any>}
        */
        BaseCrudApi.prototype.delete = function (id, controller) {
            return this.post({ url: this.getAbsoluteUrl(this.config.crudActionNames.delete, controller) + '?id=' + id });
        };
        /**
         * Export model with provided filter
         * @param filter Filter and export options
         * @param controller Optional controller
         */
        BaseCrudApi.prototype.exportList = function (filter, controller) {
            var url = "" + this.getAbsoluteUrl(this.config.crudActionNames.exportList, controller);
            //starts download in global rtDownload
            this.$rootScope.$broadcast(this.constants.events.EVENT_START_FILEDOWNLOAD, { url: url, filter: filter });
        };
        //#endregion
        //#region Init
        /**
         * Note that $rootScope is injected to communicate
           with global rtDownload located in content page for exporting model
         */
        BaseCrudApi.injects = baseapi_1.default.injects.concat(['$rootScope']);
        return BaseCrudApi;
    }(baseapi_1.default));
    //export
    exports.default = BaseCrudApi;
});
