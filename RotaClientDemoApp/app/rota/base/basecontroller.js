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
define(["require", "exports", "tslib", "./injectableobject"], function (require, exports, tslib_1, injectableobject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Base controller for all controllers.
     * @description Form directive support,Logger shortcuts,Rota service references
     */
    var BaseController = (function (_super) {
        tslib_1.__extends(BaseController, _super);
        //#endregion
        //#region Init
        function BaseController(bundle) {
            var _this = _super.call(this, bundle) || this;
            /**
             * Flag that indcicates controller scope has been destroyed
             */
            _this.destroyed = false;
            //update options
            _this.options.formName = _this.options.formName || _this.constants.controller.DEFAULT_FORM_NAME;
            //set form watchers
            _this.$scope.$watch(_this.options.formName + ".$dirty", function (newValue) {
                _this.onFormDirtyFlagChanged(!!newValue);
            });
            _this.$scope.$watch(_this.options.formName + ".$invalid", function (newValue) {
                _this.onFormInvalidFlagChanged(!!newValue);
            });
            //init 
            _this.events = [];
            _this.on("$destroy", _this.destroy.bind(_this));
            //hook on state exiting
            if (_this.isAssigned(_this.onExit)) {
                _this.on(_this.constants.events.EVENT_STATE_CHANGE_START, function (event, toState, toParams, fromState) {
                    var menu = _this.routing.getActiveMenu(toState);
                    if (menu !== _this.routing.activeMenu) {
                        _this.onExit(event, toState, toParams, fromState);
                    }
                });
            }
            //Scroll
            if (_this.options.scrollToTop) {
                _this.$document.duScrollTop(0, 500);
            }
            //Current url 
            _this.stateInfo.url = _this.routing.currentUrl;
            return _this;
        }
        Object.defineProperty(BaseController.prototype, "notification", {
            //#region Props
            //#region Notification props
            /**
                    * Notification Service
                    * @returns {IBaseLogger}
                    */
            get: function () { return this.logger.notification; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseController.prototype, "toastr", {
            /**
             * Toastr Service
             * @returns {IBaseLogger}
             */
            get: function () { return this.logger.toastr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseController.prototype, "console", {
            /**
             * Console Service
             * @returns {IBaseLogger}
             */
            get: function () { return this.logger.console; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseController.prototype, "rtForm", {
            /**
             * Main form controller used with rtForm form directive
             */
            get: function () {
                if (!this.common.isAssigned(this.formScope))
                    return undefined;
                return this.formScope[this.options.formName];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseController.prototype, "isFormDisabled", {
            /**
            * Prop that if form is disabled
            * @returns {boolean}
            */
            get: function () {
                if (!this.common.isAssigned(this.rtForm))
                    return false;
                return this._isFormDisabled || false;
            },
            set: function (value) {
                this._isFormDisabled = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseController.prototype, "isFormDirty", {
            /**
             * Flag that if form is dirty
             * @returns {boolean}
             */
            get: function () {
                if (!this.common.isAssigned(this.rtForm))
                    return false;
                return this.rtForm.$dirty;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseController.prototype, "isFormValid", {
            /**
             * Flag that if form is valid
             * @returns {boolean}
             */
            get: function () {
                if (!this.common.isAssigned(this.rtForm))
                    return true;
                return this.rtForm.$valid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseController.prototype, "isFormInvalid", {
            /**
             * Flag that if form is invalid
             * @returns {boolean}
             */
            get: function () {
                if (!this.common.isAssigned(this.rtForm))
                    return false;
                return this.rtForm.$invalid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseController.prototype, "isFormPristine", {
            /**
             * Flag that if form is pristine
             * @returns {boolean}
             */
            get: function () {
                if (!this.common.isAssigned(this.rtForm))
                    return false;
                return this.rtForm.$pristine;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseController.prototype, "isFormPending", {
            /**
             * Flag that if form is pending
             * @returns {boolean}
             */
            get: function () {
                if (!this.common.isAssigned(this.rtForm))
                    return false;
                return this.rtForm['$pending'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Controller getting destroyed
         */
        BaseController.prototype.destroy = function () {
            this.destroyed = true;
            this.events.forEach(function (fn) {
                fn();
            });
            this.events = null;
        };
        /**
         * Init bundle
         * @param bundle
         */
        BaseController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            //options
            this.options = (bundle.options || {});
            //system
            this.$rootScope = bundle.services['$rootscope'];
            this.$scope = bundle.services['$scope'];
            this.$window = bundle.services["$window"];
            this.$stateParams = bundle.services["$stateparams"];
            this.$document = bundle.services["$document"];
            this.hotkeys = bundle.services["hotkeys"];
            this.$q = bundle.services['$q'];
            //rota
            this.logger = bundle.services["logger"];
            this.common = bundle.services["common"];
            this.dialogs = bundle.services["dialogs"];
            this.config = bundle.services["config"];
            this.routing = bundle.services["routing"];
            this.localization = bundle.services["localization"];
            this.stateInfo = bundle.services["stateinfo"];
            this.titlebadges = bundle.services["titlebadges"];
            this.constants = bundle.services["constants"];
        };
        /**
         * this method is called from decorator with all injections are available
         */
        BaseController.prototype.initController = function () {
        };
        //#endregion
        //#region Methods
        /**
         * Returns true if controller state is active
         */
        BaseController.prototype.isActiveState = function () {
            return this.routing.isActive(this.stateInfo.stateName);
        };
        /**
         * Check is value assigned
         * @param value Any value
         */
        BaseController.prototype.isAssigned = function (value) {
            return this.common.isAssigned(value);
        };
        /**
         * Register the event
         * @param eventName EventName
         * @param fn Function
         */
        BaseController.prototype.on = function (eventName, fn) {
            var offFn = this.$scope.$on(eventName, fn);
            this.events.push(offFn);
        };
        /**
         * Broadcast a event
         * @param eventName Event name
         * @param params Params
         */
        BaseController.prototype.broadcast = function (eventName) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            (_a = this.$scope).$broadcast.apply(_a, [eventName].concat(params));
            var _a;
        };
        /**
         * Check enum flag operation
         * @param value Enum flags
         * @param flag Value
         */
        BaseController.prototype.checkEnumFlag = function (value, flag) {
            return !!(value & flag);
        };
        /**
        * Validation service validate implementation
        */
        BaseController.prototype.applyValidatitons = function () {
            var _this = this;
            var resultDefer = this.$q.defer();
            //filter by crud flag
            var validatorsFiltered = _.filter(this.validators.validators, function (item) {
                return !!(item.triggerOn & 4 /* Action */);
            });
            //apply validations
            var validationResult = this.validators.applyValidations(validatorsFiltered);
            //convert pipiline exception
            validationResult.then(function () { resultDefer.resolve(); }, function (reason) {
                var msg = _this.localization.getLocal('rota.bilinmeyenhataolustu');
                if (reason) {
                    msg = reason.message || (reason.messageI18N && _this.localization.getLocal(reason.messageI18N));
                }
                resultDefer.reject({
                    title: _this.localization.getLocal('rota.validationhatasi'),
                    logType: 2 /* Warn */,
                    message: msg
                });
                _this.logger.console.warn({ message: 'validation failed' });
            });
            return resultDefer.promise;
        };
        /**
         * Show parse exception
         * @param error IParserException
         */
        BaseController.prototype.showParserException = function (error) {
            if (!error)
                return;
            var parserErrorMsg = error.message ||
                (error.messageI18N && this.localization.getLocal(error.messageI18N));
            if (this.common.isNullOrEmpty(parserErrorMsg))
                return;
            switch (error.logType) {
                case 1 /* Error */:
                    this.notification.error({ title: error.title, message: parserErrorMsg });
                    break;
                case 2 /* Warn */:
                    this.notification.warn({ title: error.title, message: parserErrorMsg });
                    break;
            }
        };
        //#endregion
        //#region Form Methods & Events
        /**
      * Form invalid flag changes
      * @param invalidFlag Invalid flag of main form
      * @description virtual method should be overriden
      */
        BaseController.prototype.onFormInvalidFlagChanged = function (invalidFlag) {
            //should be overriden
        };
        /**
        * Form dirty flag changes
        * @param dirtyFlag Dirty flag of main form
        * @description virtual method should be overriden
        */
        BaseController.prototype.onFormDirtyFlagChanged = function (dirtyFlag) {
            //should be overriden
        };
        /**
       * Initiliaze form controller using form scope object
       * @param forms
       * @description this is a hack method to prevent form controller being undefined
       * formScope is set from rtForm directive
       */
        BaseController.prototype.initFormScope = function (formScope) {
            this.formScope = formScope;
        };
        //#endregion
        //#region Bundle Services
        BaseController.injects = injectableobject_1.default.injects.concat(['$document', '$rootScope', '$scope', '$window', '$stateParams', '$q',
            'Logger', 'Common', 'Dialogs', 'Routing', 'Config', 'Localization', 'stateInfo', 'hotkeys', 'TitleBadges',
            'Constants']);
        return BaseController;
    }(injectableobject_1.default));
    exports.default = BaseController;
});
