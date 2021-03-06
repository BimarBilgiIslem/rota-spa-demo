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
    function fileUploadDirective(localization, logger, config) {
        function link(scope, element, attrs, modelCtrl) {
            scope.maxUploadSize = config.maxFileUploadSize;
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
            scope.uploadFiles = function (files) {
                if (!files || !files.length)
                    return;
                //upload de
                files.forEach(function (file) {
                    //check ext
                    if (checkExt(file.name)) {
                        //create model for upload progress
                        scope.uploadedFile = {
                            name: file.name,
                            isLoaded: false,
                            loading: true
                        };
                        /*
                            Note : if onUploaded event defined,it is supposed to send the file to server and return cacheKey.
                                   model value will set the cacheKey.if there is no onUploaded event,just hit the file to the model value
                        */
                        if (scope.onUploaded) {
                            //call uploaded event
                            var updateResult = scope.onUploaded({ file: file });
                            //result
                            updateResult.then(function (result) {
                                scope.uploadedFile.isLoaded = true;
                                modelCtrl.$setViewValue(result.newUid);
                            }, function () {
                                //fail
                            }, function (args) {
                                scope.uploadedFile.total = args.total;
                                scope.uploadedFile.loaded = args.loaded;
                            });
                        }
                        else {
                            modelCtrl.$setViewValue(file);
                        }
                        return;
                    }
                });
            };
        }
        //Directive definition
        var directive = {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                ngDisabled: '=?',
                accept: '@',
                onUploaded: '&?'
            },
            link: link,
            template: '<div class="rt-file-upload"><div class="input-group">' +
                '<input ng-model="uploadedFile.name" readonly type="text" class="form-control" ph-i18n="rota.dosyaseciniz"/>' +
                '<div class="progress-wrapper" ng-show="uploadedFile.loading && !uploadedFile.isLoaded"><round-progress color="#337ab7" max="uploadedFile.total" ' +
                'current="uploadedFile.loaded" radius="9" stroke="3"></round-progress></div>' +
                '<span class="input-group-btn">' +
                '<button type="button" ngf-multiple="false" ngf-select-disabled=ngDisabled ngf-accept=accept ' +
                'ngf-select="uploadFiles($files)" ngf-max-size=maxUploadSize class="btn btn-primary" tooltip-append-to-body="true" uib-tooltip="{{::\'rota.tt_dosyasecmekicintiklayiniz\' | i18n}}">' +
                '<i class="fa fa-upload"></i>' +
                '</button></span>' +
                '</div></div>'
        };
        return directive;
    }
    exports.fileUploadDirective = fileUploadDirective;
    fileUploadDirective.$inject = ['Localization', 'Logger', 'Config'];
    //#endregion
    //#region Register
    var module = angular.module('rota.directives.rtfileupload', ['ngFileUpload']);
    module.directive('rtFileUpload', fileUploadDirective);
});
