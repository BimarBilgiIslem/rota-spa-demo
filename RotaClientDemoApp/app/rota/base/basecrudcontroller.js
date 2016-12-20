var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './basemodelcontroller', "../services/validators.service", "./obserablemodel"], function (require, exports, basemodelcontroller_1, validators_service_1, obserablemodel_1) {
    "use strict";
    //#endregion
    /**
     * Base CRUD page implementing save,update,delete processes
     * @description This base class should be inherited for all controllers using restful services
     * @abstract This is abstract controller class that must be inherited
     * @param {TModel} is your custom model view.
     */
    var BaseCrudController = (function (_super) {
        __extends(BaseCrudController, _super);
        /**
         * Constructor
         * @param bundle Service Bundle
         * @param options User options
         */
        function BaseCrudController(bundle, options) {
            //call base constructor
            _super.call(this, bundle, BaseCrudController.extendOptions(bundle, options));
            //get new instance of validator service
            //TODO:Validators class can be initialzed with new
            this.validators = this.$injector.instantiate(validators_service_1.Validators);
            this.validators.controller = this;
            //set default options
            var parsers = {
                saveParsers: [this.checkAuthority, this.applyValidatitons, this.beforeSaveModel],
                deleteParsers: [this.checkAuthority, this.applyValidatitons, this.beforeDeleteModel]
            };
            this.options = this.common.extend(this.options, { parsers: parsers });
            this.crudPageFlags = { isCloning: false, isDeleting: false, isSaving: false, isNew: true };
            //set readonly
            this.crudPageOptions.readOnly = this.crudPageOptions.readOnly &&
                (!this.common.isDefined(this.$stateParams.readonly) || this.$stateParams.readonly);
            //set form is new/edit mode
            this.isNew = this.id === this.crudPageOptions.newItemParamValue;
            //register catch changes
            if (this.crudPageOptions.checkDirtyOnExit) {
                this.registerDirtyCheckEvent();
            }
            //initialize getting model
            this.initModel();
        }
        Object.defineProperty(BaseCrudController.prototype, "model", {
            //#endregion
            //#region Props
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
        Object.defineProperty(BaseCrudController.prototype, "crudPageOptions", {
            /**
             * Crud Page options
             * @returns {ICrudFormOptions}
             */
            get: function () { return this.options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCrudController.prototype, "id", {
            /**
             * Get id value
             * @description should be 'new' for new mode and number for edit mode
             * @returns {string | number}
             */
            get: function () {
                var idValue = this.$stateParams[this.crudPageOptions.newItemParamName];
                return this.isNew ? idValue : +idValue;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCrudController.prototype, "isNew", {
            /**
           * Get if the page is in new state mode
           * @returns {boolean}
           */
            get: function () { return this.crudPageFlags.isNew; },
            set: function (value) {
                this.crudPageFlags.isNew = value;
                if (!this.stateInfo.isNestedState) {
                    this.editmodeBadge.show = !value && !this.crudPageOptions.readOnly;
                    this.newmodeBadge.show = value;
                    this.readOnlyBadge.show = this.crudPageOptions.readOnly && !value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCrudController.prototype, "editmodeBadge", {
            //#region Badge Shortcuts
            /**
            * Edit Mode badge
            * @returns {ITitleBadge}
            */
            get: function () { return this.titlebadges.badges[0 /* Editmode */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCrudController.prototype, "newmodeBadge", {
            /**
            * New Mode badge
            * @returns {ITitleBadge}
            */
            get: function () { return this.titlebadges.badges[1 /* Newmode */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCrudController.prototype, "dirtyBadge", {
            /**
            * Dirty badge
            * @returns {ITitleBadge}
            */
            get: function () { return this.titlebadges.badges[5 /* Dirty */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCrudController.prototype, "invalidBadge", {
            /**
            * Invalid badge
            * @returns {ITitleBadge}
            */
            get: function () { return this.titlebadges.badges[6 /* Invalid */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCrudController.prototype, "cloningBadge", {
            /**
              * Copying badge
              * @returns {ITitleBadge}
              */
            get: function () { return this.titlebadges.badges[4 /* Cloning */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCrudController.prototype, "autoSavingBadge", {
            /**
             * AutoSaving badge
             * @returns {}
             */
            get: function () { return this.titlebadges.badges[7 /* AutoSaving */]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCrudController.prototype, "readOnlyBadge", {
            /**
            * Readonly badge
            * @returns {}
            */
            get: function () { return this.titlebadges.badges[8 /* Readonly */]; },
            enumerable: true,
            configurable: true
        });
        //#endregion
        //#endregion
        //#endregion
        //#region Init
        /**
         * Extend crud page options with user options
         * @param bundle Service Bundle
         * @param options User options
         */
        BaseCrudController.extendOptions = function (bundle, options) {
            var configService = bundle.systemBundles["config"];
            var crudOptions = angular.merge({}, BaseCrudController.defaultOptions, {
                newItemParamName: configService.defaultNewItemParamName,
                newItemParamValue: configService.defaultNewItemParamValue,
                postOnlyModelChanges: configService.postOnlyModelChanges
            }, options);
            return crudOptions;
        };
        /**
         * Update bundle
         * @param bundle IBundle
         */
        BaseCrudController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.$interval = bundle.systemBundles["$interval"];
            this.$timeout = bundle.systemBundles["$timeout"];
            this.caching = bundle.systemBundles["caching"];
        };
        /**
         * Register event that catch model dirty while quiting
         */
        BaseCrudController.prototype.registerDirtyCheckEvent = function () {
            var _this = this;
            this.on('$stateChangeStart', function (event, toState, toParams, fromState) {
                var getMenu = function () {
                    var menu = toState.hierarchicalMenu;
                    while (menu && menu.isNestedState) {
                        menu = menu.parentMenu;
                    }
                    return menu;
                };
                var menu = getMenu();
                if (menu !== _this.routing.activeMenu && _this.isModelDirty &&
                    _this.model.modelState !== 8 /* Deleted */ && _this.isFormValid) {
                    event.preventDefault();
                    _this.dialogs.showConfirm({
                        message: BaseCrudController.localizedValues.crudonay,
                        cancelText: BaseCrudController.localizedValues.onayHayir,
                        okText: BaseCrudController.localizedValues.onayEvet
                    }).then(function () {
                        //save and go to state
                        _this.initSaveModel().then(function () {
                            _this.routing.go(toState.name, toParams);
                        });
                    }).catch(function () {
                        _this.resetForm();
                        _this.routing.go(toState.name, toParams);
                    });
                }
            });
        };
        /**
         * Store localized value for performance issues (called in basecontroller)
         */
        BaseCrudController.prototype.storeLocalization = function () {
            if (BaseCrudController.localizedValues)
                return;
            BaseCrudController.localizedValues = {
                crudonay: this.localization.getLocal('rota.crudonay'),
                kayitkopyalandi: this.localization.getLocal('rota.kayitkopyalandı'),
                modelbulunamadi: this.localization.getLocal('rota.modelbulunamadi'),
                succesfullyprocessed: this.localization.getLocal('rota.succesfullyprocessed'),
                validationhatasi: this.localization.getLocal('rota.validationhatasi'),
                bilinmeyenhata: this.localization.getLocal('rota.bilinmeyenhataolustu'),
                silmeonay: this.localization.getLocal('rota.deleteconfirm'),
                silmeonaybaslik: this.localization.getLocal('rota.deleteconfirmtitle'),
                kayitbasarisiz: this.localization.getLocal('rota.kayitbasarisiz'),
                okumamoduuyari: this.localization.getLocal('rota.okumamoduuyari'),
                onayEvet: this.localization.getLocal('rota.evet'),
                onayHayir: this.localization.getLocal('rota.hayir')
            };
        };
        //#endregion
        //#region Model Methods
        /**
        * Revert back all changes
        */
        BaseCrudController.prototype.revertBack = function () {
            this.model.revertOriginal();
            this.logger.console.log({ message: 'model reverted to original' });
            this.resetForm(this.model);
            this.notification.removeAll();
            this.logger.toastr.info({ message: this.localization.getLocal('rota.degisikliklergerialindi') });
        };
        /**
         * Reset form
         * @description Set modelState param and form to pristine state
         * @param model Model
         */
        BaseCrudController.prototype.resetForm = function (model) {
            this.isModelDirty =
                this.dirtyBadge.show = model && (model.modelState === 4 /* Added */);
            //check form controller initialized
            if (this.isAssigned(this.rtForm)) {
                this.rtForm.$setPristine();
            }
        };
        /**
        * Initialize new model
        * @param cloning Cloning flag
        */
        BaseCrudController.prototype.initNewModel = function (cloning) {
            var _this = this;
            //chnage url
            var changeUrlPromise = this.changeUrl(this.crudPageOptions.newItemParamValue);
            return changeUrlPromise.then(function () {
                _this.isNew = true;
                _this.notification.removeAll();
                //init model
                return _this.initModel(cloning);
            });
        };
        /**
       * New model event
       * @param clonedModel Model to be cloned
       */
        BaseCrudController.prototype.newModel = function (clonedModel) {
            if (clonedModel) {
                clonedModel.id = 0;
                clonedModel.modelState = 4 /* Added */;
                return clonedModel;
            }
            return { modelState: 4 /* Added */ };
        };
        //#endregion
        //#region Save Methods
        /**
         * Save model and continue to saving new model
         */
        BaseCrudController.prototype.initSaveAndContinue = function () {
            var _this = this;
            var saveModelResult = this.initSaveModel({ goon: true });
            return saveModelResult.then(function () {
                return _this.initNewModel();
            });
        };
        /**
        * Save Model
        * @param options Save Options
        */
        BaseCrudController.prototype.initSaveModel = function (options) {
            var _this = this;
            //init saving
            options = this.common.extend({
                isNew: this.isNew,
                goon: false,
                showMessage: true,
                redirectHandled: false
            }, options);
            this.crudPageFlags.isSaving = true;
            this.notification.removeAll(true);
            //validate and save model 
            var saveResult = this.parseAndSaveModel(options);
            saveResult.then(function (model) {
                //if it gets here,saving is completed
                //Finally run after save event
                _this.afterSaveModel(options);
                //if its in new mode or returned model's id different than param id and not goon,then change url for edit mode
                if (!options.redirectHandled && (options.isNew || _this.id !== model.id) && !options.goon) {
                    _this.changeUrl(_this.model.id);
                }
            });
            //if there is error in save response,dispacth errorModel method
            saveResult.catch(function (error) {
                if (_this.common.isNullOrEmpty(error.message))
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
            //final step,reset flags
            saveResult.finally(function () {
                if (_this.crudPageFlags.isCloning && !_this.stateInfo.isNestedState)
                    _this.cloningBadge.show = false;
                _this.crudPageFlags.isCloning =
                    _this.crudPageFlags.isSaving = false;
                _this.logger.console.log({ message: 'save process completed' });
            });
            //return promise to let rt-button know that saving process is finished
            return saveResult;
        };
        /**
         * Validate parsers methods and call save method
         * @param options Save options
         */
        BaseCrudController.prototype.parseAndSaveModel = function (options) {
            var _this = this;
            var defer = this.$q.defer();
            //iterate save pipeline
            var parseResult = this.initParsers(this.crudPageOptions.parsers.saveParsers, options);
            //save if validation parsers resolved
            if (this.isAssigned(parseResult)) {
                parseResult.then(function () {
                    //convert obserable to json literal model
                    options.jsonModel = _this.model.toJson(_this.crudPageOptions.postOnlyModelChanges);
                    //call user savemodel method
                    var saveResult = _this.saveModel(options);
                    if (_this.isAssigned(saveResult)) {
                        //success
                        saveResult.then(function (data) {
                            //check if saveModel return response
                            if (!_this.isAssigned(data)) {
                                defer.reject({ message: 'no response data returned', logType: 2 /* Warn */ });
                                return;
                            }
                            //model is not 'new' anymore
                            _this.isNew = false;
                            //set model from result of saving
                            if (_this.isAssigned(data.entity)) {
                                //call loadedModel
                                _this.loadedModel(_this.model = _this.setModel(data.entity));
                                defer.resolve(data.entity);
                            }
                            else {
                                defer.reject({ message: 'no model returned', logType: 2 /* Warn */ });
                            }
                            //show messages
                            if (options.showMessage) {
                                _this.toastr.success({ message: options.message || BaseCrudController.localizedValues.succesfullyprocessed });
                                if (data.infoMessages && data.infoMessages.length)
                                    _this.toastr.info({ message: data.infoMessages.join('</br>') });
                                if (data.warningMessages && data.warningMessages.length)
                                    _this.toastr.warn({ message: data.warningMessages.join('</br>') });
                            }
                        });
                        //fail save
                        saveResult.catch(function (response) {
                            defer.reject(response.data || response);
                        });
                    }
                    else {
                        defer.reject({ message: 'no response returned', logType: 2 /* Warn */ });
                    }
                });
                //fail parsers
                parseResult.catch(function (result) {
                    defer.reject(result);
                });
            }
            else {
                defer.reject({ message: 'no response returned from parsers', logType: 2 /* Warn */ });
            }
            return defer.promise;
        };
        /**
         * Before save event
         * @param options Save options
         */
        BaseCrudController.prototype.beforeSaveModel = function (options) { return undefined; };
        /**
         * After save event
         * @param options Save options
         */
        BaseCrudController.prototype.afterSaveModel = function (options) { };
        //#endregion
        //#region Auto Save Methods
        /**
         * Start autoSaving process
         */
        BaseCrudController.prototype.startAutoSave = function () {
            var _this = this;
            //already in progress,stop it
            if (this.autoSavePromise)
                this.stopAutoSave();
            if (this.isNew) {
                this.autoSavePromise = this.$interval(this.autoSaveModel.bind(this), this.config.autoSaveInterval);
            }
            else {
                //watch model changes
                this.model.subscribeDataChanged(function () {
                    if (!_this.autoSavePromise)
                        _this.autoSavePromise = _this.$interval(_this.autoSaveModel.bind(_this), _this.config.autoSaveInterval);
                });
            }
        };
        /**
         * Stop autosaving
         */
        BaseCrudController.prototype.stopAutoSave = function () {
            this.caching.localStorage.remove(this.stateInfo.url);
            this.$interval.cancel(this.autoSavePromise);
            this.autoSavePromise = null;
            this.autoSavingBadge.show = false;
        };
        /**
         * Auto save model to storage
         */
        BaseCrudController.prototype.autoSaveModel = function () {
            var _this = this;
            this.autoSavingBadge.show = true;
            this.caching.localStorage.store(this.stateInfo.url, this.model.toJson());
            this.logger.console.info({ message: "model autosaved", data: this.model });
            this.$timeout(function () {
                _this.autoSavingBadge.show = false;
            }, 1000);
        };
        //#endregion
        //#region Validation
        BaseCrudController.prototype.applyValidatitons = function (options) {
            var _this = this;
            var resultDefer = this.$q.defer();
            //filter by crud flag
            var validatorsFilteredByCrudFlag = _.filter(this.validators.validators, function (item) {
                var crudFlagOk = false;
                if (!item.crudFlag ||
                    (_this.crudPageFlags.isSaving && options.isNew && item.crudFlag & 1 /* Create */) ||
                    (_this.crudPageFlags.isSaving && !options.isNew && item.crudFlag & 2 /* Update */) ||
                    (_this.crudPageFlags.isDeleting && item.crudFlag & 4 /* Delete */)) {
                    crudFlagOk = true;
                }
                return crudFlagOk && !!(item.triggerOn & 4 /* Action */);
            });
            //apply validations
            var validationResult = this.validators.applyValidations(validatorsFilteredByCrudFlag);
            //convert pipiline exception
            validationResult.then(function () { resultDefer.resolve(); }, function (reason) {
                var msg = BaseCrudController.localizedValues.bilinmeyenhata;
                if (reason) {
                    msg = reason.message || (reason.messageI18N && _this.localization.getLocal(reason.messageI18N));
                }
                resultDefer.reject({
                    title: BaseCrudController.localizedValues.validationhatasi,
                    logType: 2 /* Warn */,
                    message: msg
                });
            });
            return resultDefer.promise;
        };
        //#endregion
        //#region Authorization
        BaseCrudController.prototype.checkAuthority = function (options) {
            return this.common.promise();
        };
        //#endregion
        //#region Delete Model
        /**
          * Init deletion of model
          * @param options Delete options
          */
        BaseCrudController.prototype.initDeleteModel = function (options) {
            var _this = this;
            //init deleting
            options = angular.extend({
                key: this.model.id, confirm: true,
                showMessage: true, model: this.model,
                jsonModel: this.model.toJson(this.crudPageOptions.postOnlyModelChanges)
            }, options);
            //confirm
            var confirmResult = options.confirm ? this.dialogs.showConfirm({
                message: BaseCrudController.localizedValues.silmeonay,
                title: BaseCrudController.localizedValues.silmeonaybaslik
            }) : this.common.promise();
            //confirm result
            confirmResult.then(function () {
                _this.crudPageFlags.isDeleting = true;
                var deleteResult = _this.parseAndDeleteModel(options);
                //call aftersave method
                deleteResult.then(function () {
                    _this.afterDeleteModel(options);
                });
                //if there is error in save response,dispacth errorModel method
                deleteResult.catch(function (error) {
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
                //set deleted flag
                deleteResult.finally(function () {
                    _this.resetForm();
                    _this.crudPageFlags.isDeleting = false;
                });
                return deleteResult;
            });
            return confirmResult;
        };
        /**
         *  Validate parsers methods and call delete method
         * @param options Delete options
         */
        BaseCrudController.prototype.parseAndDeleteModel = function (options) {
            var _this = this;
            var deferDelete = this.$q.defer();
            //validate and delete model if valid
            var parseResult = this.initParsers(this.crudPageOptions.parsers.deleteParsers, options);
            parseResult.then(function () {
                //set modelstate as deleted
                _this.model.modelState = 8 /* Deleted */;
                //call delete method
                var deleteResult = _this.deleteModel(options);
                deleteResult.then(function () {
                    deferDelete.resolve();
                    //message
                    if (options.showMessage) {
                        _this.toastr.success({ message: BaseCrudController.localizedValues.succesfullyprocessed });
                    }
                });
                //fail delete
                deleteResult.catch(function (response) {
                    deferDelete.reject(response.data);
                });
            });
            //fail parsers
            parseResult.catch(function (result) {
                deferDelete.reject(result);
            });
            //return delete promise
            return deferDelete.promise;
        };
        /**
         * Before delete event
         */
        BaseCrudController.prototype.beforeDeleteModel = function () { return this.common.promise(); };
        /**
         * After delete event
         * @param options
         */
        BaseCrudController.prototype.afterDeleteModel = function (options) { };
        /**
         * User delete method
         * @param options Delete options
         */
        BaseCrudController.prototype.deleteModel = function (options) {
            return this.common.promise();
        };
        //#endregion
        //#region BaseController
        /**
        * Form invalid flag changes
        * @param invalidFlag Invalid flag of main form
        * @description virtual method should be overriden
        */
        BaseCrudController.prototype.onFormInvalidFlagChanged = function (invalidFlag) {
            this.invalidBadge.show = invalidFlag;
        };
        /**
        * Controller getting destroyed
        */
        BaseCrudController.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            //clear autosave handle
            if (this.crudPageOptions.autoSave)
                this.stopAutoSave();
        };
        //#endregion
        //#region BaseModelController Methods
        /**
         * Init crud model
         * @param cloning Cloning flag
         */
        BaseCrudController.prototype.initModel = function (cloning) {
            //reset flags
            this.crudPageFlags.isSaving =
                this.crudPageFlags.isDeleting = false;
            this.crudPageFlags.isCloning = cloning;
            return _super.prototype.initModel.call(this, { id: this.id });
        };
        /**
         * Set model getter method
         * @param modelFilter Model Filter
         * @description Overriden baseFormController's to pass cloned copy
         */
        BaseCrudController.prototype.defineModel = function (modelFilter) {
            var _this = this;
            if (this.crudPageOptions.autoSave) {
                var autoSavedModel_1 = this.caching.localStorage.get(this.stateInfo.url);
                if (this.common.isNotEmptyObject(autoSavedModel_1)) {
                    return this.dialogs.showConfirm({
                        title: this.localization.getLocal('rota.otomatikkayit'),
                        message: this.localization.getLocal('rota.otomatikkayityuklensinmi'),
                        okText: this.localization.getLocal('rota.otomatikkayityukle')
                    })
                        .then(function () {
                        return autoSavedModel_1;
                    }, function () {
                        return _this.isNew
                            ? _this.newModel(_this.crudPageFlags.isCloning && _this.model._orginalValues)
                            : _this.getModel(modelFilter);
                    })
                        .finally(function () {
                        _this.caching.localStorage.remove(_this.stateInfo.url);
                    });
                }
            }
            return this.isNew
                ? this.newModel(this.crudPageFlags.isCloning && this.model._orginalValues)
                : this.getModel(modelFilter);
        };
        /**
         * Convert literal to obserable model
         * @param model
         */
        BaseCrudController.prototype.setModel = function (model) {
            var _this = this;
            //delete prev reference 
            if (this.model)
                delete this._model;
            //create new obserable model 
            var oModel = new obserablemodel_1.ObserableModel(model);
            //set model chnages event for edit mode
            if (!this.isNew) {
                //set readonly
                oModel._readonly = this.crudPageOptions.readOnly;
                //track prop changes
                oModel.subscribeDataChanged(function () {
                    _this.isModelDirty =
                        _this.dirtyBadge.show = true;
                });
            }
            return (oModel);
        };
        /**
         * Do some stuff after model loaded
         * @param model Model
         */
        BaseCrudController.prototype.loadedModel = function (model) {
            _super.prototype.loadedModel.call(this, model);
            //model not found in edit mode
            if (!this.isNew && !this.stateInfo.isNestedState && !this.isAssigned(model)) {
                this.notification.error({ message: BaseCrudController.localizedValues.modelbulunamadi });
                this.initNewModel();
                return;
            }
            //set cloning warning & notify
            if (this.crudPageFlags.isCloning) {
                this.toastr.info({ message: BaseCrudController.localizedValues.kayitkopyalandi });
                if (!this.stateInfo.isNestedState) {
                    this.cloningBadge.show = true;
                }
            }
            this.resetForm(model);
            //autoSave process
            if (this.crudPageOptions.autoSave && !this.crudPageOptions.readOnly)
                this.startAutoSave();
            //readonly warning message
            if (this.crudPageOptions.readOnly && !this.isNew) {
                this.logger.notification.info({ message: BaseCrudController.localizedValues.okumamoduuyari });
            }
        };
        //#endregion   
        //#region Utils
        /**
         * Clears dirsty flag
         */
        BaseCrudController.prototype.clearDirty = function () {
            this.isModelDirty =
                this.dirtyBadge.show = false;
        };
        /**
        * Chnage url depending on new/edit modes
        * @param id "New" or id
        */
        BaseCrudController.prototype.changeUrl = function (id) {
            if (!this.crudPageOptions.changeIdParamOnSave)
                return this.common.promise();
            //get id param obj
            var idParam = {};
            idParam[this.crudPageOptions.newItemParamName] = id;
            //replace the url with new id
            var params = this.common.extend(this.$stateParams, idParam);
            return this.routing.go(this.routing.current.name, params, { notify: false, reload: false });
        };
        //#region Statics,Members,Props
        //#region Static
        BaseCrudController.defaultOptions = {
            scrollToTop: true,
            checkDirtyOnExit: true,
            crudButtonsVisibility: {
                newButton: true,
                deleteButton: true,
                revertBackButton: true,
                copyButton: true,
                saveButton: true,
                saveContinueButton: true
            },
            generateNewItemValue: true,
            changeIdParamOnSave: true,
            autoSave: false,
            readOnly: false
        };
        /**
         * Custom injections
         */
        BaseCrudController.injects = basemodelcontroller_1.BaseModelController.injects.concat(['$interval', '$timeout', 'Caching']);
        return BaseCrudController;
    }(basemodelcontroller_1.BaseModelController));
    exports.BaseCrudController = BaseCrudController;
    //Export
});
