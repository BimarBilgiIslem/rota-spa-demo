var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./basemodelcontroller"], function (require, exports, basemodelcontroller_1) {
    "use strict";
    //#endregion
    /**
     * Base List Controller
     * @description This base class should be inherited for all controllers using restful services
     * @param {TModel} is your custom model view.
     */
    var BaseListController = (function (_super) {
        __extends(BaseListController, _super);
        /**
         * Constructor
         * @param bundle Service bundle
         * @param options List page user options
         */
        function BaseListController(bundle, options) {
            //merge options with defaults
            _super.call(this, bundle, BaseListController.extendOptions(bundle, options));
            //set badge
            if (!this.stateInfo.isNestedState) {
                this.recordcountBadge.show = true;
                this.recordcountBadge.description = BaseListController.localizedValues.kayitsayisi + " 0";
            }
            //init filter object 
            this.filter = this.listPageOptions.storeFilterValues ?
                this.caching.sessionStorage.get(this.routing.currentUrl) || {} : {};
            //set grid features
            this.initGrid();
        }
        Object.defineProperty(BaseListController.prototype, "recordcountBadge", {
            //#endregion
            //#region Members
            /**
            * Recourd count badge
            * @returns {ITitleBadge}
            */
            get: function () { return this.titlebadges.badges[2 /* Recordcount */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseListController.prototype, "selectedcountBadge", {
            /**
             * Selected Recourd count badge
             * @returns {ITitleBadge}
             */
            get: function () { return this.titlebadges.badges[3 /* Selectedcount */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseListController.prototype, "listPageOptions", {
            /**
             * List controller options
             */
            get: function () { return this.options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseListController.prototype, "model", {
            /**
             * Model object
             * @returns {TModel}
             */
            get: function () { return this._model; },
            set: function (value) {
                if (this.isAssigned(value)) {
                    this._model = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseListController.prototype, "gridApi", {
            /**
             * Grid Api
             * @returns {uiGrid.IGridApi} Grid Api
             */
            get: function () { return this._gridApi; },
            set: function (value) { this._gridApi = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseListController.prototype, "gridOptions", {
            /**
             * Grid options
             * @returns {uiGrid.IGridOptions} Grid options
             */
            get: function () { return this._gridOptions; },
            set: function (value) { this._gridOptions = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseListController.prototype, "gridData", {
            /**
             * Grid data
             * @returns {IBaseListModel<TModel>}
             */
            get: function () { return this.gridOptions.data; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseListController.prototype, "gridSeletedRows", {
            /**
             * Selected rows
             * @returns {}
             */
            get: function () {
                if (this.isAssigned(this.gridApi) && this.isAssigned(this.gridApi.selection)) {
                    return this.gridApi.selection.getSelectedRows();
                }
                return [];
            },
            enumerable: true,
            configurable: true
        });
        //#endregion
        //#region Init
        /**
         * Extend crud page options with user options
         * @param bundle Service Bundle
         * @param options User options
         */
        BaseListController.extendOptions = function (bundle, options) {
            var configService = bundle.systemBundles["config"];
            var listOptions = angular.merge({}, BaseListController.defaultOptions, {
                newItemFieldName: configService.defaultNewItemParamName,
                pageSize: configService.gridDefaultPageSize
            }, options);
            return listOptions;
        };
        /**
         * Update bundle
         * @param bundle IBundle
         */
        BaseListController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.uigridconstants = bundle.systemBundles["uigridconstants"];
            this.uigridexporterconstants = bundle.systemBundles["uigridexporterconstants"];
            this.caching = bundle.systemBundles["caching"];
        };
        /**
         * Store localized value for performance issues (called in basecontroller)
         */
        BaseListController.prototype.storeLocalization = function () {
            if (BaseListController.localizedValues)
                return;
            BaseListController.localizedValues = {
                kayitbulunamadi: this.localization.getLocal('rota.kayitbulunamadi'),
                deleteconfirm: this.localization.getLocal('rota.deleteconfirm'),
                deleteconfirmtitle: this.localization.getLocal('rota.deleteconfirmtitle'),
                deleteselected: this.localization.getLocal('rota.onaysecilikayitlarisil'),
                kayitsayisi: this.localization.getLocal('rota.kayitsayisi')
            };
        };
        /**
         * Check if model is null ,set it empty array for grid
         * @param model Model
         */
        BaseListController.prototype.setModel = function (model) {
            var modelData = this.listPageOptions.pagingEnabled ? model.data : model;
            if (this.common.isArray(modelData)) {
                return model;
            }
            throw new Error(this.constants.errors.MODEL_EXPECTED_AS_ARRAY);
        };
        /**
         * Override loadedMethod to show notfound message
         * @param model Model
         */
        BaseListController.prototype.loadedModel = function (model) {
            //set grid datasource
            if (this.listPageOptions.pagingEnabled) {
                this.gridOptions.totalItems = model.total || 0;
                this.gridOptions.data = model.data;
                _super.prototype.loadedModel.call(this, model.data);
            }
            else {
                this.gridOptions.data = model;
                _super.prototype.loadedModel.call(this, model);
            }
            //set warnings and recordcount 
            var recCount = 0;
            if (model) {
                if (this.listPageOptions.pagingEnabled) {
                    recCount = model.total;
                    if (!this.common.isDefined(recCount)) {
                        throw new Error(this.constants.errors.NO_TOTAL_PROP_PROVIDED);
                    }
                }
                else {
                    recCount = model.length;
                }
            }
            if (recCount === 0 && this.isActiveState() && this.listPageOptions.showMesssage) {
                this.toastr.warn({ message: BaseListController.localizedValues.kayitbulunamadi });
            }
        };
        //#endregion
        //#region Grid methods
        //#region Default Methods
        /**
        * Get default buttons
        */
        BaseListController.prototype.getDefaultGridButtons = function () {
            var buttons = [];
            var getButtonColumn = function (name, template) {
                return {
                    name: name,
                    cellClass: 'col-align-center',
                    width: '30',
                    displayName: '',
                    enableColumnMenu: false,
                    cellTemplate: template
                };
            };
            //edit button
            if (this.gridOptions.showEditButton) {
                var editbutton = getButtonColumn('edit-button', this.constants.grid.GRID_EDIT_BUTTON_HTML);
                buttons.push(editbutton);
            }
            //delete button
            if (this.gridOptions.showDeleteButton) {
                var editbutton = getButtonColumn('delete-button', this.constants.grid.GRID_DELETE_BUTTON_HTML);
                buttons.push(editbutton);
            }
            return buttons;
        };
        /**
        * Default grid options
        */
        BaseListController.prototype.getDefaultGridOptions = function () {
            var _this = this;
            //ui-grid/ui-grid-row
            return {
                showEditButton: true,
                showDeleteButton: true,
                enableColumnMoving: true,
                enableColumnResizing: true,
                rowTemplateAttrs: [],
                //Row selection
                enableRowSelection: false,
                enableSelectAll: true,
                multiSelect: true,
                //Data
                data: [],
                //Pager
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: this.listPageOptions.pageSize,
                useExternalPagination: true,
                //Export
                exporterSuppressColumns: [],
                exporterAllDataFn: function () {
                    var result = _this.initSearchModel(_this.getDefaultPagingFilter(1, _this.gridOptions.totalItems));
                    return result.then(function () {
                        _this.gridOptions.useExternalPagination = false;
                    });
                },
                exporterCsvFilename: 'myFile.csv',
                exporterPdfDefaultStyle: { fontSize: 9 },
                exporterPdfTableStyle: { margin: [5, 5, 5, 5] },
                exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
                exporterPdfHeader: { text: this.routing.activeMenu.title, style: 'headerStyle' },
                exporterPdfFooter: function (currentPage, pageCount) {
                    return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
                },
                exporterPdfCustomFormatter: function (docDefinition) {
                    docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
                    docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
                    return docDefinition;
                },
                exporterPdfOrientation: 'portrait',
                exporterPdfPageSize: 'A4',
                exporterPdfMaxGridWidth: 450,
                onRegisterApi: function (gridApi) {
                    _this.gridApi = gridApi;
                    _this.onRegisterGridApi(gridApi);
                }
            };
        };
        /**
         * Get paging filter obj depending on params
         */
        BaseListController.prototype.getDefaultPagingFilter = function (pageIndex, pageSize) {
            var filter = {};
            filter[this.constants.grid.GRID_PAGE_INDEX_FIELD_NAME] = pageIndex || 1;
            filter[this.constants.grid.GRID_PAGE_SIZE_FIELD_NAME] = pageSize || this.listPageOptions.pageSize;
            return filter;
        };
        //#endregion
        /**
        * Initialize grid
        */
        BaseListController.prototype.initGrid = function () {
            //get default options
            var options = this.getDefaultGridOptions();
            //merge user-defined cols
            this.gridOptions = angular.extend(options, { columnDefs: this.getGridColumns(options) });
            //Set rowFormatter attrs if assigned
            if (this.isAssigned(this.gridOptions.rowFormatter)) {
                this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_ROW_FORMATTER_ATTR);
            }
            if (this.isAssigned(this.gridOptions.showContextMenu)) {
                this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_CONTEXT_MENU_ATTR);
            }
            //Set row template
            if (this.gridOptions.rowTemplateAttrs.length) {
                this.gridOptions.rowTemplate = this.constants.grid.GRID_CUSTOM_ROW_TEMPLATE
                    .replace('{0}', this.gridOptions.rowTemplateAttrs.join(' '));
            }
            //add default button cols
            var defaultButtons = this.getDefaultGridButtons();
            this.gridOptions.columnDefs = this.gridOptions.columnDefs.concat(defaultButtons);
            //Remove edit-delete buttons from exporting
            if (this.gridOptions.showEditButton)
                this.gridOptions.exporterSuppressColumns.push('edit-button');
            if (this.gridOptions.showDeleteButton)
                this.gridOptions.exporterSuppressColumns.push('delete-button');
            //set pagination
            this.gridOptions.enablePagination =
                this.gridOptions.enablePaginationControls = this.listPageOptions.pagingEnabled;
            //load initially if enabled
            if (this.listPageOptions.initializeModel) {
                this.initSearchModel();
            }
        };
        /**
         * Register grid api
         * @param gridApi
         */
        BaseListController.prototype.onRegisterGridApi = function (gridApi) {
            var _this = this;
            //register paging event if enabled
            if (this.listPageOptions.pagingEnabled) {
                gridApi.pagination.on.paginationChanged(this.$scope, function (currentPage, pageSize) {
                    if (_this.gridOptions.useExternalPagination)
                        _this.initSearchModel(_this.getDefaultPagingFilter(currentPage, pageSize));
                });
            }
            //register datachanges
            if (!this.stateInfo.isNestedState) {
                gridApi.grid.registerDataChangeCallback(function (grid) {
                    _this.recordcountBadge.description = BaseListController.localizedValues.kayitsayisi + " " +
                        (_this.listPageOptions.pagingEnabled ? _this.gridOptions.totalItems.toString() : _this.gridData.length.toString());
                }, [this.uigridconstants.dataChange.ROW]);
                //register selection changes
                if (this.isAssigned(gridApi.selection)) {
                    var selChangedFn_1 = function () {
                        _this.selectedcountBadge.show = !!_this.gridSeletedRows.length;
                        _this.selectedcountBadge.description = _this.gridSeletedRows.length.toString();
                    };
                    gridApi.selection.on.rowSelectionChanged(this.$scope, function (row) {
                        selChangedFn_1();
                    });
                    gridApi.selection.on.rowSelectionChangedBatch(this.$scope, function (rows) {
                        selChangedFn_1();
                    });
                }
            }
        };
        /**
         * Clear all data and filters
         */
        BaseListController.prototype.clearAll = function () {
            this.clearGrid();
            this.filter = {};
            if (this.listPageOptions.storeFilterValues) {
                this.caching.sessionStorage.remove(this.routing.currentUrl);
            }
        };
        /**
         * Clear grid
         */
        BaseListController.prototype.clearGrid = function () {
            this.gridOptions.data = [];
        };
        /**
         * Clear selected rows
         */
        BaseListController.prototype.clearSelectedRows = function () {
            this.gridApi.selection.clearSelectedRows();
        };
        /**
         * Export grid
         * @param {string} rowTypes which rows to export, valid values are uiGridExporterConstants.ALL,
         * @param {string} colTypes which columns to export, valid values are uiGridExporterConstants.ALL,
         */
        BaseListController.prototype.exportGrid = function (rowType, colTypes) {
            var _this = this;
            if (rowType === "all") {
                this.dialogs.showConfirm({ message: this.localization.getLocal("rota.tumdataexportonay") }).then(function () {
                    _this.gridApi.exporter[colTypes](rowType, _this.uigridexporterconstants.ALL);
                });
                return;
            }
            this.gridApi.exporter[colTypes](rowType, this.uigridexporterconstants.ALL);
        };
        //#endregion
        //#region List Model methods
        /**
        * Starts getting model and binding
        * @param pager Paging pager
        */
        BaseListController.prototype.initSearchModel = function (pager) {
            var filter = this.filter;
            if (this.listPageOptions.pagingEnabled) {
                filter = angular.extend(filter, pager || this.getDefaultPagingFilter());
            }
            return this.initModel(filter);
        };
        //#endregion
        //#region Button Clicks
        /**
        * Go detail state with id param provided
        * @param id
        */
        BaseListController.prototype.goToDetailState = function (id) {
            var params = {};
            if (this.common.isAssigned(id)) {
                params[this.listPageOptions.newItemFieldName] = id;
                //store filter values if any
                if (this.listPageOptions.storeFilterValues) {
                    var purgedFilters = _.omit(this.filter, [this.constants.grid.GRID_PAGE_INDEX_FIELD_NAME,
                        this.constants.grid.GRID_PAGE_SIZE_FIELD_NAME]);
                    if (!_.isEmpty(purgedFilters))
                        this.caching.sessionStorage.store(this.routing.currentUrl, purgedFilters);
                }
            }
            return this.routing.go(this.listPageOptions.editState, params);
        };
        /**
         * Init deletion model by unique key
         * @param id Unique id
         */
        BaseListController.prototype.initDeleteModel = function (id) {
            var _this = this;
            if (id === undefined || id === null || !id)
                return undefined;
            var confirmText = BaseListController.localizedValues.deleteconfirm;
            var confirmTitleText = BaseListController.localizedValues.deleteconfirmtitle;
            return this.dialogs.showConfirm({ message: confirmText, title: confirmTitleText }).then(function () {
                //call delete model
                var deleteResult = _this.deleteModel(id);
                //removal of model depends on whether result is promise or void
                if (_this.common.isPromise(deleteResult)) {
                    return deleteResult.then(function () {
                        _this.gridData.deleteById(id);
                        _this.gridOptions.totalItems--;
                    });
                }
                _this.gridData.deleteById(id);
                return undefined;
            });
        };
        /**
         * Delete Model
         * @param id Unique key
         * @description Remove item from grid datasource.Must be overrided to implament your deletion logic and call super.deleteModel();
         */
        BaseListController.prototype.deleteModel = function (id) {
            return undefined;
        };
        /**
         * Init deletetion of selected rows
         */
        BaseListController.prototype.initDeleteSelectedModels = function () {
            var _this = this;
            if (!this.gridSeletedRows.length)
                return undefined;
            var confirmText = BaseListController.localizedValues.deleteselected;
            var confirmTitleText = BaseListController.localizedValues.deleteconfirmtitle;
            return this.dialogs.showConfirm({ message: confirmText, title: confirmTitleText }).then(function () {
                var keyArray = _.pluck(_this.gridSeletedRows, 'id');
                //call delete model
                var deleteResult = _this.deleteModel(keyArray);
                //removal of model depends on whether result is promise or void
                if (_this.common.isPromise(deleteResult)) {
                    return deleteResult.then(function () {
                        keyArray.forEach(function (key) {
                            _this.gridData.deleteById(key);
                        });
                    });
                }
                keyArray.forEach(function (key) {
                    _this.gridData.deleteById(key);
                });
                return undefined;
            });
        };
        /**
         * List Page options
         */
        BaseListController.defaultOptions = {
            initializeModel: true,
            scrollToTop: true,
            pagingEnabled: true,
            editState: undefined,
            showMesssage: true,
            listButtonVisibility: {
                newButton: true,
                searchButton: true,
                clearButton: true,
                exportButton: true,
                deleteSelected: true
            },
            storeFilterValues: false
        };
        //#endregion
        //#endregion
        //#region Bundle Services
        BaseListController.injects = basemodelcontroller_1.BaseModelController.injects.concat(['uiGridConstants', 'uiGridExporterConstants', 'Caching']);
        return BaseListController;
    }(basemodelcontroller_1.BaseModelController));
    exports.BaseListController = BaseListController;
});
