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
     * Base controller for widgets
     */
    var BaseWidgetController = (function (_super) {
        tslib_1.__extends(BaseWidgetController, _super);
        function BaseWidgetController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(BaseWidgetController.prototype, "widgetPageOptions", {
            /**
           * Widget controller options
           */
            get: function () { return this.options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseWidgetController.prototype, "model", {
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
        BaseWidgetController.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this.refreshPromise) {
                this.$timeout.cancel(this.refreshPromise);
            }
        };
        /**
         * Update bundle
         * @param bundle IBundle
         */
        BaseWidgetController.prototype.initBundle = function (bundle) {
            _super.prototype.initBundle.call(this, bundle);
            this.widget = bundle.services["widget"];
            this.$timeout = bundle.services["$timeout"];
        };
        //#endregion
        //#region Methods
        /**
         * Refresh widget
         */
        BaseWidgetController.prototype.refreshWidget = function () {
            this.initModel();
        };
        /**
        * @abstract Abstract get model method
        * @param args Optional params
        */
        BaseWidgetController.prototype.getModel = function (modelFilter) {
            return this.common.promise();
        };
        /**
         * Loaded Model
         * @param model Model
         */
        BaseWidgetController.prototype.loadedModel = function (model) {
            var _this = this;
            _super.prototype.loadedModel.call(this, model);
            //set refresh interval
            if (this.widget.refreshInterval) {
                //check min refresh interval time
                if (this.widget.refreshInterval < this.constants.dashboard.MIN_WIDGET_REFRESH_INTERVAL) {
                    this.widget.refreshInterval = this.constants.dashboard.MIN_WIDGET_REFRESH_INTERVAL;
                    this.logger.console.warn({
                        message: this.widget.widgetName + " widget refresh interval time set to min " + this.widget.refreshInterval
                    });
                }
                this.refreshPromise = this.$timeout(function () {
                    _this.refreshWidget();
                }, this.widget.refreshInterval);
            }
        };
        BaseWidgetController.defaultOptions = {
            registerName: null,
            initializeModel: true
        };
        //#endregion
        //#region Init
        /**
         * Custom injections
         */
        BaseWidgetController.injects = basemodelcontroller_1.default.injects.concat(['$timeout', 'widget']);
        return BaseWidgetController;
    }(basemodelcontroller_1.default));
    exports.default = BaseWidgetController;
});
