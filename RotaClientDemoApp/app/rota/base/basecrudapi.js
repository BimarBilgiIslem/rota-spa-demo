var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./baseapi"], function (require, exports, baseapi_1) {
    "use strict";
    //#endregion
    /**
     * Base Crud Api for all api services
     * @description Please refer to the static endpoint names defined below for info
     */
    var BaseCrudApi = (function (_super) {
        __extends(BaseCrudApi, _super);
        //#region Init
        function BaseCrudApi(bundle, controller, moduleId) {
            _super.call(this, bundle, controller, moduleId);
        }
        //#endregion
        //#region Utils
        //#endregion
        //#region Standart Crud Methods
        /**
         * Make a get request to fetch all models filtered
         * @param filter Optional filter
         * @param controller Optional filter
         * @returns {ng.IPromise<TModel[]>}
         */
        BaseCrudApi.prototype.getList = function (filter, controller) {
            return this.get({ action: this.constants.server.ACTION_NAME_LIST, controller: controller, params: filter });
        };
        /**
        * Make a get request to fetch all models filtered and paged
       * @param filter Optional filter
        * @param controller Optional filter
        * @returns {ng.IPromise<IPagingListModel<TModel>>}
        */
        BaseCrudApi.prototype.getPagedList = function (filter, controller) {
            return this.get({ action: this.constants.server.ACTION_NAME_PAGED_LIST, controller: controller, params: filter });
        };
        /**
        * Make a get request to get model by id
        * @param id Unique id
        * @param controller Optional controller
        * @returns {ng.IPromise<TModel>}
        */
        BaseCrudApi.prototype.getById = function (id, controller) {
            return this.get({ action: this.constants.server.ACTION_NAME_GET_BY_ID, controller: controller, params: { id: id } });
        };
        /**
        * Make a post request to save model
        * @param model Model
        * @param controller Optional controller
        * @returns {ng.IPromise<ICrudServerResponseData>}
        */
        BaseCrudApi.prototype.save = function (model, controller) {
            return this.post({ action: this.constants.server.ACTION_NAME_SAVE, controller: controller, data: model });
        };
        /**
        * Make a post request to delete model
        * @param id Unique id
        * @param controller Optional controller
        * @returns {ng.IPromise<any>}
        */
        BaseCrudApi.prototype.delete = function (id, controller) {
            return this.post({ url: this.getAbsoluteUrl(this.constants.server.ACTION_NAME_DELETE, controller) + '?id=' + id });
        };
        return BaseCrudApi;
    }(baseapi_1.BaseApi));
    exports.BaseCrudApi = BaseCrudApi;
});
