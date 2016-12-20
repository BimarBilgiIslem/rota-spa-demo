define(["require", "exports"], function (require, exports) {
    "use strict";
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
                        $(element).bind('blur', function () {
                            var value = ngModelCnt.$modelValue || ngModelCnt.$viewValue;
                            validators_1.runValidation(validator_1, 1 /* Blur */, value)
                                .then(function () {
                                ngModelCnt.$setValidity(attrs.rtValidator, true);
                            }, function (result) {
                                scope[attrs.rtValidator] = result.message ||
                                    (result.messageI18N && localization.getLocal(result.messageI18N));
                                ngModelCnt.$setValidity(attrs.rtValidator, false);
                            });
                        });
                    }
                }
            }
        }
        var directive = {
            restrict: 'A',
            require: 'ngModel',
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
    //#endregion
});
