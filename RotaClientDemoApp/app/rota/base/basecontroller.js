var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./injectableobject"], function (require, exports, injectableobject_1) {
    "use strict";
    //#endregion
    /**
     * Base controller for all controllers.
     * @description Form directive support,Logger shortcuts,Rota service references
     */
    var BaseController = (function (_super) {
        __extends(BaseController, _super);
        //#endregion
        //#region Init
        function BaseController(bundle, options) {
            var _this = this;
            _super.call(this, bundle);
            this.options = options;
            /**
             * Flag that indcicates controller scope has been destroyed
             */
            this.destroyed = false;
            this.options = angular.extend({ formName: this.constants.controller.DEFAULT_FORM_NAME }, options);
            //set form watchers
            this.$scope.$watch(this.options.formName + ".$dirty", function (newValue) {
                _this.onFormDirtyFlagChanged(!!newValue);
            });
            this.$scope.$watch(this.options.formName + ".$invalid", function (newValue) {
                _this.onFormInvalidFlagChanged(!!newValue);
            });
            //init 
            this.events = [];
            this.on("$destroy", this.destroy.bind(this));
            //save localization
            this.storeLocalization();
            //Scroll
            if (this.options.scrollToTop) {
                this.$document.duScrollTop(0, 500);
            }
            //Current url 
            this.stateInfo.url = this.routing.currentUrl;
            //clear all notificaitons
            if (!this.stateInfo.isNestedState) {
                this.logger.notification.removeAll();
                this.titlebadges.clearBadges();
            }
        }
        Object.defineProperty(BaseController.prototype, "notification", {
            //#region Props
            //#region Notification services
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
         * Store localized value for performance issues
         * @description Must be overriden overrided classes
         */
        BaseController.prototype.storeLocalization = function () {
        };
        /**
         * Init bundle
         * @param bundle
         */
        BaseController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            //system
            this.$rootScope = bundle.systemBundles['$rootscope'];
            this.$scope = bundle.systemBundles['$scope'];
            this.$window = bundle.systemBundles["$window"];
            this.$stateParams = bundle.systemBundles["$stateparams"];
            this.$document = bundle.systemBundles["$document"];
            this.hotkeys = bundle.systemBundles["hotkeys"];
            //rota
            this.logger = bundle.systemBundles["logger"];
            this.common = bundle.systemBundles["common"];
            this.dialogs = bundle.systemBundles["dialogs"];
            this.config = bundle.systemBundles["config"];
            this.routing = bundle.systemBundles["routing"];
            this.localization = bundle.systemBundles["localization"];
            this.stateInfo = bundle.systemBundles["stateinfo"];
            this.titlebadges = bundle.systemBundles["titlebadges"];
            this.constants = bundle.systemBundles["constants"];
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
        //#endregion
        //#region Form methods
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
        //#endregion
        //#region Bundle Services
        BaseController.injects = injectableobject_1.InjectableObject.injects.concat(['$document', '$rootScope', '$scope', '$window', '$stateParams',
            'Logger', 'Common', 'Dialogs', 'Routing', 'Config', 'Localization', 'stateInfo', 'hotkeys', 'TitleBadges', 'Constants']);
        return BaseController;
    }(injectableobject_1.InjectableObject));
    exports.BaseController = BaseController;
});
