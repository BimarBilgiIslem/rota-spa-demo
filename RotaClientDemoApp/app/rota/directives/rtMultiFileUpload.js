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
define(["require", "exports", "../base/obserablemodel"], function (require, exports, obserablemodel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Directive
    function multiFileUploadDirective($parse, $q, localization, logger, common, constants, config) {
        //link fn
        function link(scope, element, attrs, modelCtrl) {
            var files = [];
            var models;
            var fileIdPropGetter = $parse(attrs.fileidProp);
            scope.maxUploadSize = config.maxFileUploadSize;
            //#region Methods
            /**
             * Check extension
             * @param name File Name
             */
            var checkExt = function (name) {
                if (!scope.accept) {
                    return true;
                }
                var extensions = scope.accept.replace(/\./g, '').split(',');
                var ext = name.split('.').pop().toLowerCase();
                if (extensions.indexOf(ext) === -1) {
                    logger.toastr.warn({ message: localization.getLocal('rota.invalidfiletypemessage', scope.accept, name) });
                    return false;
                }
                return true;
            };
            /**
             * Upload files
             * @param files
             */
            var uploadFiles = function (addedFiles) {
                var pArray = [];
                addedFiles.forEach(function (file) {
                    //check ext
                    if (!checkExt(file.name))
                        return;
                    //set file model
                    var fileModel = new obserablemodel_1.default({ name: file.name });
                    var uploadedFile = {
                        name: file.name,
                        downloadLink: '',
                        icon: common.getFaIcon(file.name.split('.').pop()),
                        isLoaded: false
                    };
                    //add model to list
                    models.add(fileModel);
                    files.unshift({
                        $model: fileModel,
                        $uploadedFile: uploadedFile
                    });
                    //call uploaded event
                    var updateResult = scope.onUploaded({ file: file });
                    //result
                    updateResult.then(function (result) {
                        uploadedFile.isLoaded = true;
                        fileModel.cacheKey = result.newUid;
                    }, function () {
                        //fail
                    }, function (args) {
                        uploadedFile.total = args.total;
                        uploadedFile.loaded = args.loaded;
                    });
                    pArray.push(updateResult);
                });
                return $q.all(pArray);
            };
            /**
             * Refresh ngModel
             */
            var refreshModel = function () {
                var model = files.map(function (file) {
                    return file.$model;
                });
                modelCtrl.$setViewValue(model);
            };
            //#endregion
            //#region Scope Methods
            /**
            * Watch ngModel and update list
            */
            modelCtrl.$formatters.push(function (modelFiles) {
                if (!common.isAssigned(modelFiles))
                    return;
                if (!common.isArray(modelFiles))
                    throw new Error(constants.errors.MODEL_EXPECTED_AS_ARRAY);
                models = modelFiles;
                files = modelFiles.map(function (file) {
                    return {
                        $model: file,
                        $uploadedFile: {
                            name: file.name,
                            icon: common.getFaIcon(file.name.split('.').pop()),
                            downloadLink: scope.downloadLink && (common.updateQueryStringParameter(scope.downloadLink, "fileId", fileIdPropGetter(file))),
                            isLoaded: true
                        }
                    };
                });
                return modelFiles;
            });
            /**
             * Upload files
             * @param files Selected files
             */
            scope.uploadFiles = function (files) {
                if (!files || !files.length)
                    return;
                //upload 
                uploadFiles(files).finally(function () {
                    refreshModel();
                });
            };
            /**
             * Remove file model
             * @param file IFileModel
             */
            scope.remove = function (file) {
                try {
                    file.$model.remove();
                }
                finally {
                    refreshModel();
                }
            };
            /**
             * Internal files
             */
            files = [];
            /**
             * Visible items
             */
            Object.defineProperty(scope, 'visibleItems', {
                configurable: false,
                get: function () {
                    return _.filter(files, function (item) { return item.$model.modelState !== 8 /* Deleted */ &&
                        item.$model.modelState !== 1 /* Detached */; });
                }
            });
            //#endregion
        }
        //#region Directive definition
        //Directive definition
        var directive = {
            restrict: 'E',
            require: 'ngModel',
            link: link,
            scope: {
                onUploaded: '&?',
                ngDisabled: '=?',
                downloadLink: '@',
                accept: '@'
            },
            template: '<ul class="list-group rt-multi-file-upload">' +
                '<li class="list-group-item text-center" ng-hide=ngDisabled>' +
                '<a uib-tooltip="{{::\'rota.dosyaekleaciklama\' | i18n}}" ngf-drag-over-class="bold" href ngf-drop="uploadFiles($files)" class="badge alert-info selector" ' +
                'ngf-select-disabled=ngDisabled ngf-select="uploadFiles($files)" ngf-multiple="true" ngf-accept=accept ngf-max-size=maxUploadSize>' +
                '<i class="fa fa-paperclip"></i>&nbsp;{{::\'rota.yenidosyaekle\' | i18n}}</a></li>' +
                '<li class="list-group-item rota-animate-rt-multiselect" ng-repeat="file in visibleItems">' +
                '<a href rt-download="{{file.$uploadedFile.downloadLink}}"><i ng-class="[\'fa\', \'fa-fw\', \'fa-\' + file.$uploadedFile.icon]"></i>&nbsp;{{file.$uploadedFile.name}}</a>' +
                '<a ng-hide="ngDisabled || !file.$uploadedFile.isLoaded" uib-tooltip="{{::\'rota.tt_sil\' | i18n}}" tooltip-append-to-body="true" href class="pull-right" ng-click="remove(file)"><i class="fa fa-minus-circle text-danger"></i></a>' +
                '<div ng-hide="file.$uploadedFile.isLoaded" class="pull-right"><round-progress color="#45ccce" max="file.$uploadedFile.total" ' +
                'current="file.$uploadedFile.loaded" radius="9" stroke="3"></round-progress></div>' +
                '</li></ul>'
        };
        //#endregion
        return directive;
    }
    exports.multiFileUploadDirective = multiFileUploadDirective;
    multiFileUploadDirective.$inject = ['$parse', '$q', 'Localization', 'Logger', 'Common', 'Constants', 'Config'];
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtmultifileupload', ['ngFileUpload']);
    module.directive('rtMultiFileUpload', multiFileUploadDirective);
});
