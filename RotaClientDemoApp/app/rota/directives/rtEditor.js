define(["require", "exports"], function (require, exports) {
    "use strict";
    //#region rtEditor
    function editorDirective(localization) {
        var directive = {
            restrict: 'EA',
            require: 'ngModel',
            template: '<ng-ckeditor ng-config="config" ng-model="ngModel" ng-disabled="ngDisabled" skin="moono" remove-buttons="Image" remove-plugins="iframe,flash,smiley"></ng-ckeditor>',
            link: function (scope, elem, attrs) {
                scope.config = {
                    language: localization.currentLanguage && localization.currentLanguage.code.substr(0, 2)
                };
            },
            scope: {
                ngModel: '=',
                ngDisabled: '='
            }
        };
        return directive;
    }
    exports.editorDirective = editorDirective;
    editorDirective.$inject = ['Localization'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rteditor', [])
        .directive('rtEditor', editorDirective);
    //#endregion
});
