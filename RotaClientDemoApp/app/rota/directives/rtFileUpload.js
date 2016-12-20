define(["require", "exports"], function (require, exports) {
    "use strict";
    //#endregion
    //#region Directive
    function fileUploadDirective(localization, logger) {
        function compile(tElement, tAttrs) {
            var $file = $('input[type=file]', tElement);
            //Model
            $file.attr('ng-model', tAttrs.ngModel);
            //Accept
            if (angular.isDefined(tAttrs.accept)) {
                $file.attr('accept', tAttrs.accept);
            }
            //Min Size
            if (angular.isDefined(tAttrs.minSize)) {
                $file.attr('ngf-min-size', tAttrs.minSize);
            }
            //Max Size
            if (angular.isDefined(tAttrs.maxSize)) {
                $file.attr('ngf-max-size', tAttrs.maxSize);
            }
            //Required
            if (angular.isDefined(tAttrs.required)) {
                $file.attr('required', '');
            }
            return function (scope, element, attrs, modelCtrl) {
                var checkExt = function (name) {
                    if (!attrs.accept) {
                        return true;
                    }
                    var extensions = attrs.accept.replace(/\./g, '').split(',');
                    var ext = name.split('.').pop().toLowerCase();
                    if (extensions.indexOf(ext) === -1) {
                        logger.toastr.warn({ message: localization.getLocal('rota.invalidfiletypemessage', attrs.accept, name) });
                        return false;
                    }
                    return true;
                };
                scope.$watch(attrs.ngModel, function (file) {
                    if (file) {
                        if (checkExt(file.name)) {
                            scope.selfile = file;
                            return;
                        }
                    }
                    scope.selfile = null;
                });
            };
        }
        //Directive definition
        var directive = {
            restrict: 'E',
            require: 'ngModel',
            compile: compile,
            template: '<div class="input-group rt-file-upload">' +
                '<input ng-model="selfile.name" readonly type="text" class="form-control"' +
                'ph-i18n="rota.dosyaseciniz"/><span class="input-group-btn">' +
                '<div class="fileUpload btn btn-primary" ' +
                'uib-tooltip="{{::\'rota.tt_dosyasecmekicintiklayiniz\' | i18n}}"> ' +
                '<i class="fa fa-upload"></i><input type="file" name="file" ngf-select class="upload"></div></span></div>'
        };
        return directive;
    }
    exports.fileUploadDirective = fileUploadDirective;
    fileUploadDirective.$inject = ['Localization', 'Logger'];
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtfileupload', ['ngFileUpload']);
    module.directive('rtFileUpload', fileUploadDirective);
    //#endregion
});
