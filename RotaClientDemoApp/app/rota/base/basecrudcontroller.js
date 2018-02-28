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
define(["require", "exports", "tslib", "./basemodelcontroller", "./obserablemodel"], function (require, exports, tslib_1, basemodelcontroller_1, obserablemodel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Base CRUD page implementing save,update,delete processes
     * @description This base class should be inherited for all controllers using restful services
     * @abstract This is abstract controller class that must be inherited
     * @param {TModel} is your custom model view.
     */
    var BaseCrudController = (function (_super) {
        tslib_1.__extends(BaseCrudController, _super);
        //#endregion
        //#endregion
        //#endregion
        //#region Init
        /**
         * Constructor
         * @param bundle Service Bundle
         * @param options User options
         */
        function BaseCrudController(bundle) {
            var _this = 
            //call base constructor
            _super.call(this, bundle) || this;
            //update options
            var parsers = {
                saveParsers: [_this.checkAuthority.bind(_this), _this.applyValidatitons.bind(_this), _this.beforeSaveModel.bind(_this)],
                deleteParsers: [_this.checkAuthority.bind(_this), _this.beforeDeleteModel.bind(_this)]
            };
            _this.crudPageOptions.parsers = _this.crudPageOptions.parsers || parsers;
            _this.crudPageOptions.postOnlyModelChanges = _this.common.iif(_this.crudPageOptions.postOnlyModelChanges, _this.config.postOnlyModelChanges);
            _this.crudPageFlags = { isCloning: false, isDeleting: false, isSaving: false, isNew: true };
            //set readonly
            _this.crudPageOptions.readOnly = _this.isFormDisabled = (_this.crudPageOptions.readOnly &&
                (!_this.common.isDefined(_this.$stateParams.readonly) || _this.$stateParams.readonly))
                || _this.$stateParams.preview;
            //set form is new/edit mode
            _this.isNew = _this.id === _this.crudPageOptions.newItemParamValue;
            return _this;
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
        /**
         * Update bundle
         * @param bundle IBundle
         */
        BaseCrudController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.$interval = bundle.services["$interval"];
            this.$timeout = bundle.services["$timeout"];
            this.caching = bundle.services["caching"];
        };
        //#endregion
        //#region Model Methods
        /**
        * Revert back all changes
        */
        BaseCrudController.prototype.revertBack = function () {
            if (this.isNew) {
                if (this.$window.history.length) {
                    this.routing.goBack();
                }
                else {
                    this.initNewModel(this.crudPageFlags.isCloning);
                }
            }
            else {
                //model revert
                this.model.revertOriginal();
                this.logger.console.log({ message: 'model reverted to original' });
                //ui revert
                this.resetForm(this.model);
                this.notification.removeAll();
                this.clearDirty();
                this.logger.toastr.info({ message: this.localization.getLocal('rota.degisikliklergerialindi') });
            }
        };
        /**
         * Reset form
         * @description Set modelState param and form to pristine state
         * @param model Model
         */
        BaseCrudController.prototype.resetForm = function (model) {
            this.isModelDirty = model && (model.modelState === 4 /* Added */);
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
            return clonedModel || { modelState: 4 /* Added */ };
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
            this.isFormDisabled =
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
                _this.showParserException(error);
            });
            //final step,reset flags
            saveResult.finally(function () {
                _this.cloningBadge.show =
                    _this.crudPageFlags.isCloning =
                        _this.crudPageFlags.isSaving =
                            _this.isFormDisabled = false;
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
            var parseResult = this.common.runPromises(this.crudPageOptions.parsers.saveParsers, options);
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
                            _this.crudPageFlags.isCloning =
                                _this.isNew = false;
                            //set model from result of saving
                            if (_this.isAssigned(data.entity)) {
                                //call loadedModel
                                _this.loadedModel(_this.model = _this.setModel(data.entity));
                                defer.resolve(_this.model);
                            }
                            else {
                                defer.reject({ message: 'no model returned', logType: 2 /* Warn */ });
                            }
                            //show messages
                            if (options.showMessage) {
                                _this.toastr.success({ message: options.message || _this.localization.getLocal("rota.succesfullyprocessed") });
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
            //already in progress,stop it
            if (this.autoSavePromise)
                this.stopAutoSave();
            //Only actived in new mode 
            if (this.isNew) {
                this.autoSavePromise = this.$interval(this.autoSaveModel.bind(this), this.config.autoSaveInterval);
            }
            else {
                //watch model changes
                //this.model.subscribeDataChanged(() => {
                //    if (!this.autoSavePromise)
                //        this.autoSavePromise = this.$interval(this.autoSaveModel.bind(this), this.config.autoSaveInterval);
                //});
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
            this.caching.localStorage.store(this.stateInfo.url, this.model.toJson(), false);
            this.logger.console.info({ message: "model autosaved", data: this.model });
            this.$timeout(function () {
                _this.autoSavingBadge.show = false;
            }, 1000);
        };
        /**
         * Restore model from cache
         */
        BaseCrudController.prototype.restoreAutoSavedModel = function () {
            var _this = this;
            var autoSavedModel = this.caching.localStorage.get(this.stateInfo.url, null, false);
            if (this.common.isNotEmptyObject(autoSavedModel)) {
                return this.dialogs.showConfirm({
                    title: this.localization.getLocal('rota.otomatikkayit'),
                    message: this.localization.getLocal('rota.otomatikkayityuklensinmi'),
                    okText: this.localization.getLocal('rota.otomatikkayityukle')
                })
                    .then(function () {
                    return autoSavedModel;
                })
                    .finally(function () {
                    _this.caching.localStorage.remove(_this.stateInfo.url);
                });
            }
            return this.common.rejectedPromise();
        };
        //#endregion
        //#region Authorization
        BaseCrudController.prototype.checkAuthority = function (options) {
            //TODO:Will be considered afterwards
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
                message: this.localization.getLocal("rota.deleteconfirm"),
                title: this.localization.getLocal("rota.deleteconfirmtitle")
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
            var parseResult = this.common.runPromises(this.crudPageOptions.parsers.deleteParsers, options);
            parseResult.then(function () {
                //set modelstate as deleted
                _this.model.modelState = 8 /* Deleted */;
                //call delete method
                var deleteResult = _this.deleteModel(options);
                deleteResult.then(function () {
                    deferDelete.resolve();
                    //message
                    if (options.showMessage) {
                        _this.toastr.success({ message: _this.localization.getLocal("rota.succesfullyprocessed") });
                    }
                });
                //fail delete
                deleteResult.catch(function (response) {
                    deferDelete.reject(response.data || response);
                });
            });
            //fail parsers
            parseResult.catch(function (result) {
                deferDelete.reject(result);
                return result;
            });
            //return delete promise
            return deferDelete.promise;
        };
        /**
         * Before delete event
         */
        BaseCrudController.prototype.beforeDeleteModel = function (options) { return undefined; };
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
        * Register event that catch model dirty while quiting
        */
        BaseCrudController.prototype.onExit = function (event, toState, toParams, fromState) {
            var _this = this;
            if (!this.crudPageOptions.checkDirtyOnExit)
                return;
            //check form is valid
            if (this.isFormValid && this.isModelDirty && this.model.modelState !== 8 /* Deleted */) {
                //stop state exiting
                event.preventDefault();
                //confirm save changes 
                this.dialogs.showConfirm({
                    title: this.localization.getLocal("rota.crudonaybaslik"),
                    message: this.localization.getLocal("rota.crudonay"),
                    okText: this.localization.getLocal("rota.kaydetvecik"),
                    cancelText: this.localization.getLocal("rota.iptal"),
                    cancel2Text: this.localization.getLocal("rota.cikis"),
                    dialogType: 2 /* Warn */
                }).then(function () {
                    //save and go to state
                    _this.initSaveModel().then(function () {
                        _this.routing.go(toState.name, toParams);
                    });
                }).catch(function (reason) {
                    if (reason === "cancel2") {
                        _this.resetForm();
                        _this.routing.go(toState.name, toParams);
                    }
                });
            }
        };
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
        BaseCrudController.prototype.chooseModelSource = function (modelFilter) {
            var _this = this;
            if (this.isNew) {
                if (this.crudPageOptions.autoSave) {
                    //fallback to default method if user ignored to restore the cached model
                    return this.restoreAutoSavedModel().catch(function () {
                        return _this.common.promise(_this.newModel(_this.crudPageFlags.isCloning && _this.model._orginalValues));
                    });
                }
                return this.common.promise(this.newModel(this.crudPageFlags.isCloning && this.model._orginalValues));
            }
            else {
                return this.getModel(modelFilter);
            }
        };
        /**
         * Convert literal to obserable model
         * @param model
         */
        BaseCrudController.prototype.setModel = function (model) {
            if (!this.isAssigned(model))
                return;
            //create new obserable model 
            return new obserablemodel_1.default(model);
        };
        /**
         * Do some stuff after model loaded
         * @param model Model
         */
        BaseCrudController.prototype.loadedModel = function (model) {
            var _this = this;
            //model not found in edit mode
            if (!this.isNew && !this.isAssigned(model)) {
                this.logger.console.log({ message: "no such an item found with id " + this.id });
                this.notification.warn({
                    message: this.localization.getLocal("rota.modelbulunamadi"),
                    isSticky: true, autoHideDelay: 6000
                });
                this.initNewModel();
                return;
            }
            _super.prototype.loadedModel.call(this, model);
            //set cloning warning & notify
            if (this.crudPageFlags.isCloning) {
                //set modelstate to Added if cloning
                model.modelState = 4 /* Added */;
                //set UI cloning
                this.toastr.info({ message: this.localization.getLocal("rota.kayitkopyalandi") });
                this.cloningBadge.show = true;
            }
            //set model chnages event for edit mode
            if (!this.isNew) {
                //set readonly
                model._readonly = this.crudPageOptions.readOnly;
                //track prop changes
                model.subscribeDataChanged(function () {
                    _this.isModelDirty =
                        _this.dirtyBadge.show = true;
                });
            }
            //autoSave process
            if (this.crudPageOptions.autoSave && !this.crudPageOptions.readOnly)
                this.startAutoSave();
            //readonly warning message
            if (this.crudPageOptions.readOnly && !this.isNew && !this.$stateParams.preview) {
                this.logger.notification.info({ message: this.localization.getLocal("rota.okumamoduuyari") });
            }
            //set badges
            //dont touch any badge if preview mode is active
            if (!this.$stateParams.preview) {
                this.$timeout(function () {
                    _this.editmodeBadge.show = !_this.isNew && !_this.crudPageOptions.readOnly;
                    _this.newmodeBadge.show = _this.isNew;
                    _this.readOnlyBadge.show = _this.crudPageOptions.readOnly && !_this.isNew;
                    _this.dirtyBadge.show = model.modelState === 4 /* Added */;
                }, 0);
            }
            //reset form
            this.resetForm(model);
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
            //replace the url with new id
            var params = this.common.extend(this.$stateParams, (_a = {}, _a[this.crudPageOptions.newItemParamName] = id, _a));
            return this.routing.changeUrl(params);
            var _a;
        };
        //#region Statics,Members,Props
        //#region Static
        BaseCrudController.defaultOptions = {
            scrollToTop: true,
            checkDirtyOnExit: true,
            enableStickyCrudButtons: true,
            registerName: null,
            initializeModel: true,
            crudButtonsVisibility: {
                newButton: true,
                deleteButton: true,
                revertBackButton: true,
                copyButton: true,
                saveButton: true,
                saveContinueButton: true
            },
            changeIdParamOnSave: true,
            autoSave: false,
            readOnly: false
        };
        /**
         * Custom injections
         */
        BaseCrudController.injects = basemodelcontroller_1.default.injects.concat(['$interval', '$timeout', 'Caching']);
        return BaseCrudController;
    }(basemodelcontroller_1.default));
    //Export
    exports.default = BaseCrudController;
});
