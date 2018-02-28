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
define(["require", "exports", "underscore.string"], function (require, exports, _s) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Injectable class must be overriden by controllers and services to get access of registered dependencies
     */
    var InjectableObject = (function () {
        //#endregion
        //#region Init
        function InjectableObject(bundle) {
            var services = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                services[_i - 1] = arguments[_i];
            }
            this.initBundle(bundle);
        }
        /**
         * Resolve services
         * @param bundle Injected services
         */
        InjectableObject.prototype.initBundle = function (bundle) {
            this.$injector = bundle.services['$injector'];
            this.currentUser = bundle.services["currentuser"];
            this.currentCompany = bundle.services["currentcompany"];
        };
        /**
         * Dynamically define service on controller
         * @param serviceName Service name
         * @param serviceInstance Service Instance
         */
        InjectableObject.prototype.defineService = function (serviceName, serviceInstance) {
            var propName = _s.decapitalize(serviceName);
            Object.defineProperty(this, propName, {
                get: function () {
                    return serviceInstance;
                }
            });
        };
        /**
         * Service names to be injected
         */
        InjectableObject.injects = ['$injector', 'CurrentUser', 'CurrentCompany'];
        return InjectableObject;
    }());
    exports.default = InjectableObject;
});
