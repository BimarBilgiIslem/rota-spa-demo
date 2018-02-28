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
    //#endregion
    //#region Directive
    function validatorDirective(common, constants, localization) {
        function link(scope, element, attrs, ngModelCnt) {
            if (!common.isNullOrEmpty(attrs.rtValidator)) {
                var vm = scope[constants.routing.CONTROLLER_ALIAS_NAME];
                if (vm) {
                    var validators_1 = vm.validators;
                    if (!validators_1)
                        throw new Error(constants.errors.NO_VALIDATORS_DEFINED);
                    var validator_1 = validators_1.getValidation(attrs.rtValidator);
                    if (!validator_1)
                        throw new Error(constants.errors.NO_VALIDATOR_DEFINED.replace('{0}', attrs.rtValidator));
                    if (!validator_1.enabled)
                        return;
                    //register asyncvalidators when changes occured
                    if (validator_1.triggerOn & 2 /* Changes */) {
                        ngModelCnt.$asyncValidators[attrs.rtValidator] = function (modelValue, viewValue) {
                            //ignore initial validation
                            if (!ngModelCnt.$dirty)
                                return common.promise();
                            var value = modelValue || viewValue;
                            return validators_1.runValidation(validator_1, 2 /* Changes */, value)
                                .catch(function (result) {
                                scope[attrs.rtValidator] = result.message ||
                                    (result.messageI18N && localization.getLocal(result.messageI18N));
                                return common.rejectedPromise();
                            });
                        };
                    }
                    //register blur event 
                    if (validator_1.triggerOn & 1 /* Blur */) {
                        //element must be input type
                        var inputElem = element[0] instanceof HTMLInputElement ? element : element.find('input');
                        inputElem && $(inputElem).bind('blur', function () {
                            var value = ngModelCnt.$modelValue || ngModelCnt.$viewValue;
                            //first set pending status 
                            if (common.isNullOrEmpty(value)) {
                                ngModelCnt.$setValidity(attrs.rtValidator, true);
                                return;
                            }
                            validators_1.runValidation(validator_1, 1 /* Blur */, value)
                                .then(function () {
                                ngModelCnt.$setValidity(attrs.rtValidator, true);
                            }, function (result) {
                                scope[attrs.rtValidator] = result.message ||
                                    (result.messageI18N && localization.getLocal(result.messageI18N));
                                ngModelCnt.$setValidity(attrs.rtValidator, false);
                            });
                        });
                        //reset validation when model set to pristine
                        scope.$watch(function () { return ngModelCnt.$pristine; }, function (pristine) {
                            if (pristine) {
                                ngModelCnt.$setValidity(attrs.rtValidator, true);
                            }
                        });
                    }
                }
            }
        }
        var directive = {
            restrict: 'A',
            require: '?ngModel',
            link: link
        };
        return directive;
    }
    exports.validatorDirective = validatorDirective;
    validatorDirective.$inject = ['Common', 'Constants', 'Localization'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtvalidator', [])
        .directive('rtValidator', validatorDirective);
});
