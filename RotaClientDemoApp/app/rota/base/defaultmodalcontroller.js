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
define(["require", "exports", "tslib", "./basemodalcontroller", "./decorators", "config/constants"], function (require, exports, tslib_1, basemodalcontroller_1, decorators_1, constants) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    /**
     * Default modal controller used by showModal() of Dialogs service
     */
    var DefaultModalController = (function (_super) {
        tslib_1.__extends(DefaultModalController, _super);
        function DefaultModalController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //#region InjcetableObject
        /**
        * Update bundle
        * @param bundle IBundle
        */
        DefaultModalController.prototype.initBundle = function (bundle) {
            var _this = this;
            _super.prototype.initBundle.call(this, bundle);
            //Inject optional custom services if any
            if (this.instanceOptions.services) {
                this.instanceOptions.services.forEach(function (service) {
                    _this.defineService(service.instanceName, _this.$injector.get(service.injectionName));
                });
            }
        };
        DefaultModalController = tslib_1.__decorate([
            decorators_1.Controller({
                initializeModel: true,
                registerName: constants.controller.DEFAULT_MODAL_CONTROLLER_NAME
            })
        ], DefaultModalController);
        return DefaultModalController;
    }(basemodalcontroller_1.default));
    exports.DefaultModalController = DefaultModalController;
});
