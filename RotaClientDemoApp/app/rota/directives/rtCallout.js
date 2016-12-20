define(["require", "exports", "moment"], function (require, exports, moment) {
    "use strict";
    //#endregion
    //#region Directive
    function calloutDirective($position, $timeout, $filter, common, constants, localization, config) {
        //#region Localization
        var zorunlualan = localization.getLocal('rota.zorunlualan');
        var maxuzunluk = localization.getLocal('rota.maxuzunluk');
        var minuzunluk = localization.getLocal('rota.minuzunluk');
        var hatalimail = localization.getLocal('rota.hatalimail');
        var hataliurl = localization.getLocal('rota.hataliurl');
        var hatalisayi = localization.getLocal('rota.hatalisayi');
        var hatalipattern = localization.getLocal('rota.hatalipattern');
        var hatalitariharaligimin = localization.getLocal('rota.hatalitariharaligimin');
        var hatalitariharaligimax = localization.getLocal('rota.hatalitariharaligimax');
        var hatalidegermin = localization.getLocal('rota.hatalidegermin');
        var hatalidegermax = localization.getLocal('rota.hatalidegermax');
        //#endregion
        var arrowSize = 6;
        function link(scope, element, attrs, ngModelCnt) {
            var $elem = $(element), $calloutElem = $('<div class="rt-callout"></div>');
            $elem.after($calloutElem);
            var updateCallout = function (msg) {
                $timeout(function () {
                    $calloutElem.html(msg);
                    var ttPosition = $position.positionElements(element, $calloutElem, 'top-left');
                    $calloutElem.css({
                        visibility: msg.length && ngModelCnt.$dirty ? 'visible' : 'hidden',
                        top: (ttPosition.top - arrowSize) + 'px', left: ttPosition.left + 'px'
                    });
                }, 0);
            };
            scope.$watch(function () { return ngModelCnt.$error; }, function (value) {
                var hasError = common.isNotEmptyObject(value), errorMessages = [];
                if (hasError) {
                    for (var key in value) {
                        if (value.hasOwnProperty(key)) {
                            switch (key) {
                                case "required":
                                    errorMessages.unshift(zorunlualan);
                                    break;
                                case "minlength":
                                    errorMessages.unshift(minuzunluk.replace('{0}', attrs.ngMinlength));
                                    break;
                                case "maxlength":
                                    errorMessages.unshift(maxuzunluk.replace('{0}', attrs.ngMaxlength));
                                    break;
                                case "email":
                                    errorMessages.unshift(hatalimail);
                                    break;
                                case "url":
                                    errorMessages.unshift(hataliurl);
                                    break;
                                case "number":
                                    errorMessages.unshift(hatalisayi);
                                    break;
                                case "pattern":
                                    errorMessages.unshift(hatalipattern);
                                    break;
                                case "daterange":
                                    if (attrs.minDate)
                                        errorMessages.unshift(hatalitariharaligimin
                                            .replace('{0}', moment(scope.$eval(attrs.minDate)).format(config.datetimeFormat
                                            .timeFormat)));
                                    if (attrs.maxDate)
                                        errorMessages.unshift(hatalitariharaligimax
                                            .replace('{0}', moment(scope.$eval(attrs.maxDate)).format(config.datetimeFormat
                                            .timeFormat)));
                                    break;
                                case "min":
                                    //ngCurrency
                                    errorMessages.unshift(hatalidegermin.replace('{0}', $filter('currency')(attrs.minValue || constants.MIN_NUMBER_VALUE, '', 0)));
                                    break;
                                case "max":
                                    //ngCurrency
                                    errorMessages.unshift(hatalidegermax.replace('{0}', $filter('currency')(attrs.maxValue || constants.MAX_NUMBER_VALUE, '', 0)));
                                    break;
                                case attrs.rtValidator:
                                    errorMessages.unshift(scope[attrs.rtValidator]);
                                    break;
                            }
                        }
                    }
                }
                updateCallout(errorMessages.join('</br>'));
            }, true);
        }
        var directive = {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };
        return directive;
    }
    exports.calloutDirective = calloutDirective;
    calloutDirective.$inject = ['$uibPosition', '$timeout', '$filter', 'Common', 'Constants', 'Localization', 'Config'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtcallout', [])
        .directive('rtCallout', calloutDirective);
    //#endregion
});
