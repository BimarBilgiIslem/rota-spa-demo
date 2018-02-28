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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Creates custom validators used by controllers.
     */
    var Validators = (function () {
        //#endregion
        //#region Init
        function Validators(common, constants) {
            this.common = common;
            this.constants = constants;
            this.validators = [];
        }
        //#endregion
        //#region Methods
        /**
        * Add new validation
        * @param item Validation Item
        * @description Adding order will be used if not order prop defined,
        * name prop is handy for dynamic validation enable/disable etc
        */
        Validators.prototype.addValidation = function (item) {
            if (!item.func)
                throw new Error(this.constants.errors.NO_VALIDATION_FUNC_DEFINED);
            //#region Defaults
            if (!item.order) {
                item.order = this.validators.length + 1;
            }
            if (!item.enabled) {
                item.enabled = true;
            }
            if (!item.triggerOn) {
                item.triggerOn = 4 /* Action */ | 2 /* Changes */;
            }
            //#endregion
            this.validators.push(item);
            return this;
        };
        /**
        * Get validation object by name
        * @param name Validation name
        */
        Validators.prototype.getValidation = function (name) {
            return _.findWhere(this.validators, { name: name });
        };
        /**
        * Remove validation by name
        * @param name Validation name
        */
        Validators.prototype.removeValidation = function (name) {
            var validator = _.findWhere(this.validators, { name: name });
            var validatorIndex = this.validators.indexOf(validator);
            if (validatorIndex > -1) {
                this.validators.slice(validatorIndex, 1);
            }
        };
        /**
        * This method is called internally as validation pipline in process
        * @returns it will return failed validation result if any
        * @description Validators is sorted and filtered by enabled prop
        */
        Validators.prototype.applyValidations = function (validators) {
            //filter
            var validatorsToApply = validators || this.validators;
            var filteredValidators = _.where(validatorsToApply, { enabled: true });
            var sortedValidators = _.sortBy(filteredValidators, 'order');
            //run 
            return this.runChainableValidations(sortedValidators);
        };
        /**
        * This method is called internally to get run all validators
        * @param validators Registered validators
        */
        Validators.prototype.runChainableValidations = function (validators) {
            var _this = this;
            var result = this.common.promise();
            //iterate chainable methods
            for (var i = 0; i < validators.length; i++) {
                result = (function (promise, validator) {
                    return promise.then(function () {
                        return _this.runValidation(validator, 4 /* Action */);
                    });
                })(result, validators[i]);
            }
            return result;
        };
        /**
         * Run validator
         * @param validator Validator
         */
        Validators.prototype.runValidation = function (validator, triggerOn, value) {
            var args = { modelValue: value, triggeredOn: triggerOn, validator: validator };
            return validator.func.call(this.controller, args);
        };
        Validators.injectionName = "Validators";
        return Validators;
    }());
    exports.Validators = Validators;
    //#region Injection
    Validators.$inject = ['Common', 'Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.validators', []);
    module.service(Validators.injectionName, Validators);
});
