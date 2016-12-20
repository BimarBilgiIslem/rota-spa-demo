define(["require", "exports"], function (require, exports) {
    "use strict";
    //#endregion
    //#region Ui-Grid wrapper
    function gridDirective(config, common) {
        function compile(cElement, cAttrs) {
            var optionsName = common.isNullOrEmpty(cAttrs.gridOptions) ? config.gridDefaultOptionsName : cAttrs.gridOptions;
            var featureList;
            switch (cAttrs.gridFeatureList) {
                case "standart":
                case null:
                case undefined:
                    featureList = config.gridStandartFeatureList;
                    break;
                case "full":
                    featureList = config.gridFullFeatureList;
                    break;
                default:
                    featureList = cAttrs.gridFeatureList;
            }
            var htmlMarkup = "<div class=\"grid\" ui-grid=\"" + optionsName + "\" " + featureList + "></div>";
            cElement.append(htmlMarkup);
            return function () {
            };
        }
        //#region Directive Definition
        var directive = {
            restrict: 'E',
            replace: true,
            compile: compile
        };
        return directive;
        //#endregion
    }
    exports.gridDirective = gridDirective;
    //#region Injections
    gridDirective.$inject = ['Config', 'Common'];
    //#endregion
    //#endregion
    //#region Register
    angular.module('rota.directives.rtgrid', [])
        .directive('rtGrid', gridDirective)
        .run(["i18nService", "Localization", function (i18nService, localization) {
            //i18nService service ui-grid localization service - not defined in .d file
            var lang = localization.currentLanguage.code.substr(0, 2);
            i18nService.setCurrentLang(lang);
        }]);
    //#endregion
});
