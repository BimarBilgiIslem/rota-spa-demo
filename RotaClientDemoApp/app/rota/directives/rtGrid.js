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
define(["require", "exports", "underscore"], function (require, exports, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Ui-Grid wrapper
    function gridDirective(config, common) {
        function compile(cElement, cAttrs) {
            var optionsName = common.isNullOrEmpty(cAttrs.gridOptions) ? config.gridDefaultOptionsName : cAttrs.gridOptions;
            var gridFeatures = config.gridStandartFeatureList.join(' ');
            if (cAttrs.gridFeatureList) {
                var customFeatures = cAttrs.gridFeatureList.split(' ');
                var existingFeatures = _.intersection(config.gridStandartFeatureList, customFeatures);
                if (existingFeatures.length > 0)
                    throw existingFeatures.join(",") + " features existing in standart grid definition";
                gridFeatures = config.gridStandartFeatureList.concat(customFeatures).join(' ');
            }
            var htmlMarkup = "<div id=\"grid_" + optionsName + "\" class=\"grid\" ui-grid=\"" + optionsName + "\" " + gridFeatures + "></div>";
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
    //#region RightClick Selection
    /**
     * This directive is to activate (select) the row on which context menu is clicked
     */
    function gridRightClickSelectionDirective() {
        function link(scope, element) {
            element.bind('contextmenu', function (event) {
                scope.$apply(function () {
                    var selectedRow = scope.$parent.$parent.row;
                    //only single selection active
                    if (selectedRow && selectedRow.grid) {
                        selectedRow.grid.api.selection.clearSelectedRows();
                        selectedRow.setSelected(true);
                    }
                });
            });
        }
        //#region Directive Definition
        var directive = {
            link: link
        };
        return directive;
        //#endregion
    }
    //#endregion
    //#region Register
    angular.module('rota.directives.rtgrid', [])
        .directive('rtGrid', gridDirective)
        .directive('rtGridRightClickSel', gridRightClickSelectionDirective)
        .run(["i18nService", "Localization", function (i18nService, localization) {
            //i18nService service ui-grid localization service - not defined in .d file
            var lang = localization.currentLanguage.code.substr(0, 2);
            i18nService.setCurrentLang(lang);
        }]);
});
