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
define(["require", "exports", "tslib", "./basemodelcontroller"], function (require, exports, tslib_1, basemodelcontroller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Base List Controller
     * @description This base class should be inherited for all controllers using restful services
     * @param {TModel} is your custom model view.
     */
    var BaseListController = (function (_super) {
        tslib_1.__extends(BaseListController, _super);
        //#endregion
        //#region Init
        /**
         * Constructor
         * @param bundle Service bundle
         * @param options List page user options
         */
        function BaseListController(bundle) {
            var _this = _super.call(this, bundle) || this;
            //options update
            _this.listPageOptions.pageSize =
                _this.listPageOptions.pageSize || _this.config.gridDefaultPageSize;
            _this.listPageOptions.elementToScroll =
                _this.listPageOptions.elementToScroll || (_this.common.isMobileOrTablet() && "grid_" + _this.config.gridDefaultOptionsName);
            //init filter object 
            _this.filterStorageName = "storedfilter_" + _this.stateInfo.stateName;
            _this.gridLayoutStorageName = "storedgridlayout_" + _this.stateInfo.stateName;
            //as filter obj could be initialzed after super in ancestor controllers,initFilter must be here
            _this.initFilter();
            return _this;
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
        /**
         * Update bundle
         * @param bundle IBundle
         */
        BaseListController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.uigridconstants = bundle.services["uigridconstants"];
            this.uigridexporterconstants = bundle.services["uigridexporterconstants"];
            this.caching = bundle.services["caching"];
            this.$timeout = bundle.services["$timeout"];
            this.$interval = bundle.services["$interval"];
            this.loader = bundle.services["loader"];
        };
        //#endregion
        //#region BaseModelController methods
        /**
         * this method is called from decorator with all injections are available
         */
        BaseListController.prototype.initController = function () {
            //set refresh grid process
            if (this.listPageOptions.enableRefresh)
                this.initRefresh();
            //init grid 
            this.initGrid();
            //init data
            if (this.listPageOptions.initializeModel)
                this.initSearchModel();
        };
        /**
         * Initialize model
         * @param modelFilter Model filter
         * @description modelFilter is only available in case its called from initSearchModel.
         * in case its called from Controller decorator,initModel is called with this.filter without pager params
         */
        BaseListController.prototype.initModel = function (modelFilter) {
            var _this = this;
            var resultDefer = this.$q.defer();
            this.logger.notification.removeAll();
            //validation process
            var validationResult = this.applyValidatitons();
            //success
            validationResult.then(function () {
                _super.prototype.initModel.call(_this, modelFilter || _this.filter).then(function (result) {
                    return resultDefer.resolve(result);
                });
            });
            //has error
            validationResult.catch(function (error) {
                _this.showParserException(error);
                resultDefer.reject();
            });
            return resultDefer.promise;
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
                this.toastr.warn({ message: this.localization.getLocal('rota.kayitbulunamadi') });
            }
            //store filter 
            if (this.listPageOptions.storeFilterValues) {
                this.saveFilter(this.filter);
            }
        };
        //#endregion
        //#region Grid methods
        //#region Default Methods
        /**
        * Get default buttons
        */
        BaseListController.prototype.getDefaultGridButtons = function (hiddenOnMobile) {
            var _this = this;
            var buttons = [];
            var getButtonColumn = function (name, template) {
                var btn = {
                    name: name,
                    cellClass: 'col-align-center',
                    width: '35',
                    displayName: '',
                    enableColumnMenu: false,
                    cellTemplate: template
                };
                if (hiddenOnMobile) {
                    btn.visible = !_this.common.isMobileOrTablet();
                }
                return btn;
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
            return {
                showEditButton: true,
                showDeleteButton: true,
                enableColumnMoving: true,
                enableColumnResizing: true,
                rowTemplateAttrs: [],
                //Row selection
                enableRowHeaderSelection: false,
                enableRowSelection: false,
                enableSelectAll: true,
                multiSelect: false,
                enableRowClickToEdit: this.common.isMobileOrTablet(),
                enableRowDoubleClickToEdit: !this.common.isMobileOrTablet(),
                //Row Edit
                enableCellEdit: false,
                enableCellEditOnFocus: false,
                //Data
                data: [],
                //Pager
                paginationPageSizes: [25, 50, 75, 150],
                paginationPageSize: this.listPageOptions.pageSize,
                useExternalPagination: true,
                //Export
                exporterSuppressColumns: [],
                exporterAllDataFn: function () {
                    var result = _this.initSearchModel(_this.getPager(1, _this.gridOptions.totalItems));
                    return result.then(function (result) {
                        _this.gridOptions.useExternalPagination = false;
                        if (_this.listPageOptions.pagingEnabled) {
                            return result.data;
                        }
                        return result;
                    });
                },
                exporterCsvFilename: 'myFile.csv',
                exporterPdfDefaultStyle: { fontSize: 9 },
                exporterPdfTableStyle: { margin: [3, 3, 3, 3] },
                exporterPdfTableHeaderStyle: { fontSize: 8, bold: true, italics: true, color: '#096ce5' },
                exporterPdfHeader: { text: this.routing.activeMenu.localizedTitle, style: 'headerStyle' },
                exporterPdfFooter: function (currentPage, pageCount) {
                    return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
                },
                exporterPdfCustomFormatter: function (docDefinition) {
                    docDefinition.styles.headerStyle = { fontSize: 15, bold: true, color: '#457ABB' };
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
        BaseListController.prototype.getPager = function (pageIndex, pageSize) {
            var pager = {};
            //if paging disabled,set max values
            if (!this.listPageOptions.pagingEnabled) {
                pageIndex = 1, pageSize = this.constants.grid.GRID_MAX_PAGE_SIZE;
            }
            pager.pageIndex = pageIndex || this.gridOptions.paginationCurrentPage || 1;
            pager.pageSize = pageSize || this.gridOptions.paginationPageSize ||
                this.listPageOptions.pageSize;
            return pager;
        };
        //#endregion
        /**
        * Initialize grid
        */
        BaseListController.prototype.initGrid = function () {
            var _this = this;
            //get default options
            var options = this.getDefaultGridOptions();
            //merge user-defined cols
            this.gridOptions = angular.extend(options, {
                columnDefs: this.getGridColumns(options).map(function (col) {
                    if (col.hiddenOnMobile)
                        col.visible = !_this.common.isMobileOrTablet();
                    return col;
                })
            });
            //Set rowFormatter attrs if assigned
            if (this.isAssigned(this.gridOptions.rowFormatter)) {
                this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_ROW_FORMATTER_ATTR);
            }
            if (this.gridOptions.showContextMenu) {
                this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_CONTEXT_MENU_ATTR);
                if (!this.gridOptions.multiSelect) {
                    this.gridOptions.enableRowSelection = true;
                }
            }
            if (this.gridOptions.enableRowClickToEdit) {
                this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_ROW_CLICK_EDIT_ATTR);
            }
            if (this.gridOptions.enableRowDoubleClickToEdit && !this.common.isMobileOrTablet()) {
                this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_ROW_DOUBLE_CLICK_EDIT_ATTR);
            }
            //Set row template
            if (this.gridOptions.rowTemplateAttrs.length) {
                this.gridOptions.rowTemplate = this.constants.grid.GRID_CUSTOM_ROW_TEMPLATE
                    .replace('{0}', this.gridOptions.rowTemplateAttrs.join(' '));
            }
            //add default button cols
            var defaultButtons = this.getDefaultGridButtons(this.gridOptions.hiddenActionButtonsOnMobile);
            this.gridOptions.columnDefs = this.gridOptions.columnDefs.concat(defaultButtons);
            //Remove edit-delete buttons from exporting
            if (this.gridOptions.showEditButton)
                this.gridOptions.exporterSuppressColumns.push('edit-button');
            if (this.gridOptions.showDeleteButton)
                this.gridOptions.exporterSuppressColumns.push('delete-button');
            //set pagination
            this.gridOptions.enablePagination =
                this.gridOptions.enablePaginationControls = this.listPageOptions.pagingEnabled;
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
                        _this.initSearchModel(_this.getPager(currentPage, pageSize));
                });
            }
            //register datachanges
            gridApi.grid.registerDataChangeCallback(function (grid) {
                //set rc badge
                _this.recordcountBadge.show = true;
                _this.recordcountBadge.description = _this.localization.getLocal("rota.kayitsayisi") + " " +
                    (_this.listPageOptions.pagingEnabled ? _this.gridOptions.totalItems.toString() : _this.gridData.length.toString());
            }, [this.uigridconstants.dataChange.ROW]);
            //register selection changes
            if (this.isAssigned(gridApi.selection) && this.gridOptions.multiSelect) {
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
            //restore - only columns defined in column options 
            //for mobile view are permitted so skipped for mobile/ tablet
            if (!this.common.isMobileOrTablet()) {
                this.$timeout(function () {
                    try {
                        var storedState = _this.caching.localStorage
                            .get(_this.gridLayoutStorageName);
                        if (storedState) {
                            gridApi.saveState.restore(_this.$rootScope, storedState);
                        }
                    }
                    catch (e) {
                        _this.removeGridLayout();
                        _this.logger.console.error({ message: 'grid layout restoring failed' });
                    }
                });
            }
        };
        /**
         * Clear all data and filters
         */
        BaseListController.prototype.clearAll = function () {
            this.clearGrid();
            this.filter = this.getFilter();
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
        //#endregion
        //#region List Model methods
        /**
        * Starts getting model and binding
        * @param pager Paging pager
        */
        BaseListController.prototype.initSearchModel = function (pager) {
            var _this = this;
            var filter = this.filter;
            if (this.listPageOptions.pagingEnabled) {
                filter = this.common.extend(filter, pager || this.getPager(1));
            }
            this.isFormDisabled = true;
            //get data
            return this.initModel(filter).finally(function () { return _this.isFormDisabled = false; });
        };
        //#endregion
        //#region rtListButtons Button Clicks
        /**
        * Go detail state with id param provided
        * @param id
        */
        BaseListController.prototype.goToDetailState = function (id, entity, row, $event) {
            this.common.preventClick($event);
            if (!this.isAssigned(this.listPageOptions.editState)) {
                this.logger.console.warn({ message: 'listPageOptions.editState is not defined' });
                return this.common.promise();
            }
            return this.routing.go(this.listPageOptions.editState, (_a = {}, _a[this.listPageOptions.newItemParamName] = id, _a));
            var _a;
        };
        /**
         * Init deletion model by unique key
         * @param id Unique id
         */
        BaseListController.prototype.initDeleteModel = function (id, entity, $event) {
            var _this = this;
            this.common.preventClick($event);
            if (!this.isAssigned(id))
                return;
            var confirmText = this.localization.getLocal("rota.deleteconfirm");
            var confirmTitleText = this.localization.getLocal("rota.deleteconfirmtitle");
            return this.dialogs.showConfirm({ message: confirmText, title: confirmTitleText }).then(function () {
                //call delete model
                var deleteResult = _this.deleteModel(id, entity);
                //removal of model depends on whether result is promise or void
                if (_this.common.isPromise(deleteResult)) {
                    return deleteResult.then(function () {
                        _this.gridData.deleteById(id);
                        _this.gridOptions.totalItems--;
                    }, function (error) {
                        if (!error)
                            return;
                        switch (error.logType) {
                            case 1 /* Error */:
                                _this.notification.error({ title: error.title, message: error.message });
                                break;
                            case 2 /* Warn */:
                                _this.notification.warn({ title: error.title, message: error.message });
                                break;
                            default:
                        }
                    });
                }
                _this.gridData.deleteById(id);
                return;
            });
        };
        /**
         * Delete Model
         * @param id Unique key
         * @description Remove item from grid datasource.Must be overrided to implament your deletion logic and call super.deleteModel();
         */
        BaseListController.prototype.deleteModel = function (id, entity) {
            return undefined;
        };
        /**
         * Init deletetion of selected rows
         */
        BaseListController.prototype.initDeleteSelectedModels = function () {
            var _this = this;
            if (!this.gridSeletedRows.length)
                return undefined;
            var confirmText = this.localization.getLocal("rota.onaysecilikayitlarisil");
            var confirmTitleText = this.localization.getLocal("deleteconfirmtitle");
            return this.dialogs.showConfirm({ message: confirmText, title: confirmTitleText }).then(function () {
                var keyArray = _this.gridSeletedRows.pluck("id");
                //call delete model
                var deleteResult = _this.deleteModel(keyArray, _this.gridSeletedRows);
                //removal of model depends on whether result is promise or void
                if (_this.common.isPromise(deleteResult)) {
                    return deleteResult.then(function () {
                        keyArray.forEach(function (key) {
                            _this.gridData.deleteById(key);
                        });
                        _this.selectedcountBadge.show = false;
                    });
                }
                keyArray.forEach(function (key) {
                    _this.gridData.deleteById(key);
                });
                return undefined;
            });
        };
        //#endregion
        //#region Filter Methods
        /**
         * Remove filter
         */
        BaseListController.prototype.removeFilter = function () {
            this.caching.cachers[this.listPageOptions.storefilterLocation].remove(this.filterStorageName);
            this.filter = this.getFilter();
            if (this.listPageOptions.showMesssage) {
                this.logger.toastr.info({ message: this.localization.getLocal("rota.filtresilindi") });
            }
        };
        /**
         * Save filter values
         */
        BaseListController.prototype.saveFilter = function (filter) {
            var purgedFilters = _.omit(filter || this.filter, ["pageIndex", "pageSize"]);
            if (!_.isEmpty(purgedFilters)) {
                this.caching.cachers[this.listPageOptions.storefilterLocation].store(this.filterStorageName, purgedFilters);
            }
        };
        /**
         * Filter restore
         */
        BaseListController.prototype.getFilter = function () {
            var filter;
            if (this.listPageOptions.storeFilterValues) {
                filter = this.caching.cachers[this.listPageOptions.storefilterLocation]
                    .get(this.filterStorageName);
            }
            return filter || {};
        };
        /**
         * Init filter obj
         */
        BaseListController.prototype.initFilter = function () {
            var _this = this;
            this.filter = {};
            //store filter
            var urls = this.caching.localStorage.get(this.constants.controller.STORAGE_NAME_STORED_FILTER_URL) || [];
            if (!this.listPageOptions.storeFilterValues)
                this.listPageOptions.storeFilterValues = urls.indexOf(this.routing.current.name) > -1;
            //get filter obj
            this.filter = this.getFilter();
            //watch store filter
            this.$scope.$watch('vm.listPageOptions.storeFilterValues', function (value, oldValue) {
                if (oldValue !== value) {
                    var index = urls.indexOf(_this.routing.current.name);
                    if (value) {
                        index === -1 && urls.push(_this.routing.current.name);
                    }
                    else {
                        index > -1 && urls.splice(index, 1);
                    }
                    if (urls.length === 0) {
                        _this.caching.localStorage.remove(_this.constants.controller.STORAGE_NAME_STORED_FILTER_URL);
                    }
                    else {
                        _this.caching.localStorage.store(_this.constants.controller.STORAGE_NAME_STORED_FILTER_URL, urls);
                    }
                }
            });
        };
        //#endregion
        //#region Layout Methods
        /**
         * Save grid layout
         */
        BaseListController.prototype.saveGridLayout = function () {
            try {
                var savedState = this.gridApi.saveState.save();
                this.caching.localStorage.store(this.gridLayoutStorageName, savedState);
                this.logger.toastr.info({ message: this.localization.getLocal("rota.gridlayoutkaydedildi") });
            }
            catch (e) {
                this.logger.toastr.error({ message: this.localization.getLocal("rota.gridlayoutkayithata") });
            }
        };
        /**
         * Remove stored grid layout
         */
        BaseListController.prototype.removeGridLayout = function () {
            this.caching.localStorage.remove(this.gridLayoutStorageName);
            this.routing.reload();
        };
        //#endregion
        //#region Export Grid
        /**
        * Export grid
        * @param {string} rowTypes which rows to export, valid values are uiGridExporterConstants.ALL,
        * @param {string} colTypes which columns to export, valid values are uiGridExporterConstants.ALL,
        */
        BaseListController.prototype.exportGrid = function (rowType, exportType) {
            var _this = this;
            //default export button action
            if (!exportType) {
                exportType = 2 /* Pdf */;
                if (this.checkEnumFlag(this.listPageOptions.modelExports, 1 /* Excel */))
                    exportType = 1 /* Excel */;
                else if (this.checkEnumFlag(this.listPageOptions.modelExports, 2 /* Pdf */))
                    exportType = 2 /* Pdf */;
                else if (this.checkEnumFlag(this.listPageOptions.modelExports, 4 /* Csv */))
                    exportType = 4 /* Csv */;
            }
            //warn user for possible delay
            var warnDelay = this.common.promise();
            if (rowType === this.uigridexporterconstants.ALL) {
                warnDelay = this.dialogs.showConfirm({ message: this.localization.getLocal("rota.tumdataexportonay") });
            }
            //load grid export dependencies,pdfMake and its fonts
            var pdfMakeLoad = this.common.promise();
            if (exportType === 2 /* Pdf */) {
                pdfMakeLoad = this.loader.resolve("lib/vfs_fonts");
            }
            //export
            this.$q.all([warnDelay, pdfMakeLoad]).then(function () {
                switch (exportType) {
                    case 4 /* Csv */:
                        _this.gridApi.exporter.csvExport(rowType, _this.uigridexporterconstants.ALL);
                        break;
                    case 2 /* Pdf */:
                        _this.gridApi.exporter.pdfExport(rowType, _this.uigridexporterconstants.ALL);
                        break;
                    case 1 /* Excel */:
                        var filter = _this.filter;
                        //get filter with paging values
                        filter = angular.extend(filter, _this.getPager(null, rowType === _this.uigridexporterconstants.ALL && _this.constants.grid.GRID_MAX_PAGE_SIZE));
                        //obtain grid fields and header text for server generation
                        var gridExportMeta = _this.gridOptions.columnDefs.reduce(function (memo, curr) {
                            if (curr.displayName) {
                                memo.headers.push(encodeURIComponent(curr.displayName));
                                memo.fields.push((curr.field || curr.name).toLowerCase());
                            }
                            return memo;
                        }, {
                            fields: [],
                            headers: [],
                            exportType: exportType,
                            fileName: _this.common.slugify(_this.routing.activeMenu.localizedTitle) + ".xlsx"
                        });
                        var exportModel = { options: gridExportMeta, filter: filter };
                        //call export model
                        _this.onExportModel(exportModel);
                        break;
                    default:
                        _this.gridApi.exporter.pdfExport(rowType, _this.uigridexporterconstants.ALL);
                        break;
                }
            });
        };
        /**
         * Export model
         * @param filter Filter
         */
        BaseListController.prototype.onExportModel = function (filter) {
            throw new Error("onExportModel is not implemented");
        };
        //#endregion
        //#region Refresh Grid
        BaseListController.prototype.initRefresh = function () {
            var _this = this;
            var autoRefreshPromise;
            this.$scope.$watch('vm.listPageOptions.refreshInterval', function (value, oldValue) {
                if (oldValue !== value) {
                    autoRefreshPromise && _this.$interval.cancel(autoRefreshPromise);
                    if (angular.isNumber(value)) {
                        autoRefreshPromise = _this.$interval(function () {
                            if (_this.listPageOptions.showMesssage) {
                                _this.logger.toastr.info({ message: _this.localization.getLocal("rota.refreshinprogress") });
                            }
                            _this.initSearchModel();
                        }, value * 60 * 1000);
                    }
                }
            });
        };
        //#region Props
        //#region Statics
        /**
         * List Page options
         */
        BaseListController.defaultOptions = {
            initializeModel: true,
            scrollToTop: true,
            pagingEnabled: true,
            registerName: null,
            showMesssage: true,
            modelExports: 2 /* Pdf */,
            storeFilterValues: false,
            storefilterLocation: 1 /* SessionStorage */,
            enableStickyListButtons: true,
            listButtonVisibility: {
                newButton: true,
                searchButton: true,
                clearButton: true,
                exportButton: true,
                deleteSelected: true,
                storeFilter: true,
                storeGridLayout: true
            }
        };
        //#endregion
        //#endregion
        //#region Bundle Services
        BaseListController.injects = basemodelcontroller_1.default.injects.concat(['$timeout', '$interval', 'uiGridConstants',
            'uiGridExporterConstants', 'Caching', 'Loader']);
        return BaseListController;
    }(basemodelcontroller_1.default));
    exports.default = BaseListController;
});
