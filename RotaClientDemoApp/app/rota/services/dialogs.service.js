define(["require", "exports", "tslib"], function (require, exports, tslib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    //#region Dialog Service
    /**
     * Dialog service
     */
    var Dialogs = (function () {
        function Dialogs($rootScope, $q, $modal, routing, config, routeconfig, common, loader, localization, constants) {
            this.$rootScope = $rootScope;
            this.$q = $q;
            this.$modal = $modal;
            this.routing = routing;
            this.config = config;
            this.routeconfig = routeconfig;
            this.common = common;
            this.loader = loader;
            this.localization = localization;
            this.constants = constants;
            this.serviceName = 'Dialog Service';
            //set settings for style
            this.dialogStyleSettings = (_a = {},
                _a[1 /* Error */] = {
                    windowClass: "modal-dialog-error",
                    iconName: "minus-circle",
                    defaultTitle: localization.getLocal("rota.titleerror")
                },
                _a[2 /* Warn */] = {
                    windowClass: "modal-dialog-warn",
                    iconName: "exclamation-triangle",
                    defaultTitle: localization.getLocal("rota.titlewarn")
                },
                _a[0 /* Info */] = {
                    windowClass: "modal-dialog-info",
                    iconName: "info-circle",
                    defaultTitle: localization.getLocal("rota.titleinfo")
                },
                _a[3 /* Success */] = {
                    windowClass: "modal-dialog-success",
                    iconName: "check-square-o",
                    defaultTitle: localization.getLocal("rota.titlesuccess")
                },
                _a[4 /* Question */] = {
                    windowClass: "modal-dialog-question",
                    iconName: "question-circle",
                    defaultTitle: localization.getLocal("rota.onay")
                },
                _a);
            var _a;
        }
        //#region Dialogs
        /**
         * Show modal
         * @param options Modal options
         */
        Dialogs.prototype.showModal = function (options) {
            var _this = this;
            if (this.common.isNullOrEmpty(options.templateUrl) &&
                this.common.isNullOrEmpty(options.absoluteTemplateUrl)) {
                throw new Error(this.constants.errors.MISSING_TEMPLATE_URL);
            }
            //#region Init options
            //default options
            var defaultModalOptions = {
                keyboard: true,
                backdrop: 'static',
                size: 'md',
                animation: false,
                isMaximized: false,
                viewPortSize: false,
                canMaximized: false,
                bindToController: true,
                controllerAs: this.constants.routing.CONTROLLER_ALIAS_NAME,
                templateUrl: '',
                windowClass: ''
            };
            //merge default options
            var modalOptions = tslib_1.__assign({}, defaultModalOptions, options);
            //#endregion
            //#region Custom styles
            //sidebar
            if (options.isSideBar) {
                modalOptions.windowClass += " " + (options.sideBarPosition || "left");
                modalOptions.animation = modalOptions.backdrop = true;
            }
            //viewport h
            if (options.viewPortSize) {
                modalOptions.windowClass += " viewport";
            }
            //fullscreen
            if (options.isMaximized) {
                modalOptions.windowClass += " modal-fullscreen";
            }
            //can be toggled to maximized
            if (options.canMaximized) {
                modalOptions.windowClass += " canmaximized";
            }
            if ((options.isMaximized || options.canMaximized) && options.isSideBar) {
                throw new Error("sidebar and maximized features can not be used at the same time");
            }
            //#endregion
            //resolve data
            modalOptions.resolve = {
                instanceOptions: function () { return modalOptions.instanceOptions; },
                stateInfo: function () {
                    return {
                        isNestedState: true,
                        stateName: _this.routing.current.name
                    };
                }
            };
            //#region Template and controller
            if (!this.common.isNullOrEmpty(modalOptions.absoluteTemplateUrl)) {
                return this.$modal.open(tslib_1.__assign({}, modalOptions, { templateUrl: modalOptions.absoluteTemplateUrl })).result;
            }
            //set default controller name if not provided
            if (!modalOptions.controller || !modalOptions.controllerUrl) {
                modalOptions.controller = this.constants.controller.DEFAULT_MODAL_CONTROLLER_NAME;
                modalOptions.controllerUrl = this.constants.controller.DEFAULT_MODAL_CONTROLLER_PATH;
            }
            //load controller file
            return this.loader.resolve([modalOptions.templateUrl, modalOptions.controllerUrl], options.host).then(function (result) {
                return _this.$modal.open(tslib_1.__assign({}, modalOptions, { template: result[0] })).result;
            });
            //#endregion
        };
        /**
         * Show simple dialog with ok button
         * @param options Dialog options
         */
        Dialogs.prototype.showDialog = function (options) {
            var _this = this;
            var modalOptions = {
                templateUrl: 'modalSimpleDialog.tpl.html',
                controller: ['$scope', '$uibModalInstance', 'options',
                    function ($scope, $modalInstance, options) {
                        $scope.title = options.title || _this.dialogStyleSettings[options.dialogType].defaultTitle;
                        $scope.message = options.message || '';
                        $scope.iconName = _this.dialogStyleSettings[options.dialogType || 0 /* Info */].iconName;
                        $scope.okText = options.okText || _this.localization.getLocal('rota.ok');
                        $scope.ok = function () { $modalInstance.close('ok'); };
                    }],
                keyboard: true,
                backdrop: 'static',
                animation: false,
                windowClass: "alert-dialog " + this.dialogStyleSettings[options.dialogType || 0 /* Info */].windowClass,
                resolve: {
                    options: function () {
                        return {
                            title: options.title,
                            message: options.message,
                            okText: options.okText,
                            dialogType: options.dialogType
                        };
                    }
                }
            };
            return this.$modal.open(modalOptions).result;
        };
        /**
         * Show confirm dialog with ok,cancel buttons
         * @param options Confirm options
         */
        Dialogs.prototype.showConfirm = function (options) {
            var _this = this;
            var modalOptions = {
                templateUrl: 'modalDialog.tpl.html',
                controller: options.controller || ['$scope', '$uibModalInstance', 'options',
                    function ($scope, $modalInstance, options) {
                        $scope.title = options.title || _this.localization.getLocal('rota.onay');
                        $scope.message = options.message || '';
                        $scope.okText = options.okText || _this.localization.getLocal('rota.ok');
                        $scope.cancelText = options.cancelText || _this.localization.getLocal('rota.iptal');
                        $scope.cancel2Text = options.cancel2Text;
                        $scope.iconName = _this.dialogStyleSettings[options.dialogType || 4 /* Question */].iconName;
                        $scope.ok = function () { $modalInstance.close('ok'); };
                        $scope.cancel = function (reason) { $modalInstance.dismiss(reason); };
                    }],
                keyboard: true,
                backdrop: 'static',
                animation: false,
                windowClass: "modal-confirm alert-dialog " + this.dialogStyleSettings[options.dialogType || 4 /* Question */].windowClass,
                resolve: {
                    options: function () {
                        return {
                            title: options.title,
                            message: options.message,
                            okText: options.okText,
                            cancelText: options.cancelText,
                            cancel2Text: options.cancel2Text,
                            dialogType: options.dialogType
                        };
                    }
                }
            };
            return this.$modal.open(modalOptions).result;
        };
        /**
         * Show progress based on percent value
         * @param options Progress dialog options
         */
        Dialogs.prototype.showProgress = function (options) {
            var _this = this;
            var modalOptions = {
                templateUrl: 'modalProgress.tpl.html',
                controller: ['$scope', '$timeout', '$uibModalInstance', 'options',
                    function ($scope, $timeout, $modalInstance, options) {
                        $modalInstance.percent =
                            $scope.percent = options.percent || 0;
                        $scope.$watch(function () { return $modalInstance.percent; }, function (value) {
                            $scope.percent = value;
                            if (value >= 100) {
                                $timeout(function () {
                                    $modalInstance.dismiss();
                                }, 500);
                            }
                        });
                        $scope.title = options.title || _this.localization.getLocal('rota.lutfenbekleyiniz');
                    }],
                keyboard: false,
                backdrop: 'static',
                animation: false,
                windowClass: 'modal-progress',
                resolve: {
                    options: function () {
                        return {
                            title: options.title,
                            percent: options.percent
                        };
                    }
                }
            };
            return this.$modal.open(modalOptions);
        };
        /**
         * Show prompt dialog
         * @param options Prompt options
         */
        Dialogs.prototype.showPrompt = function (options) {
            var _this = this;
            var modalOptions = {
                templateUrl: 'modalPromptDialog.tpl.html',
                controller: ['$scope', '$uibModalInstance', 'options',
                    function ($scope, $modalInstance, options) {
                        $scope.title = options.title || '';
                        $scope.subTitle = options.subTitle || '';
                        $scope.value = { val: options.initValue || '' };
                        $scope.okText = options.okText || _this.localization.getLocal('rota.ok');
                        $scope.cancelText = options.cancelText || _this.localization.getLocal('rota.iptal');
                        $scope.ok = function () { $modalInstance.close($scope.value.val); };
                        $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
                    }],
                keyboard: true,
                backdrop: 'static',
                animation: false,
                windowClass: 'prompt-modal',
                resolve: {
                    options: function () {
                        return {
                            title: options.title,
                            subTitle: options.subTitle,
                            initValue: options.initValue,
                            okText: options.okText,
                            cancelText: options.cancelText
                        };
                    }
                }
            }; //Sonuc
            return this.$modal.open(modalOptions).result;
        };
        /**
         * Shows image cropping modal
         */
        Dialogs.prototype.showImageCropping = function (options) {
            var _this = this;
            var modalOptions = {
                templateUrl: 'modalImageCropping.tpl.html',
                controller: ['$scope', '$uibModalInstance', 'options', 'Upload',
                    function ($scope, $modalInstance, options, uploader) {
                        $scope.imageFile = options.imageFile;
                        $scope.areaType = options.areaType || 'circle';
                        $scope.cropActionText = options.cropActionText || _this.localization.getLocal('rota.kirp');
                        $scope.crop = function () {
                            if ($scope.croppedDataUrl) {
                                var blobImage = uploader.jsonBlob($scope.croppedDataUrl);
                                $modalInstance.close({ image: blobImage, croppedDataUrl: $scope.croppedDataUrl });
                            }
                        };
                        $scope.dismiss = function () {
                            $modalInstance.dismiss();
                        };
                    }],
                keyboard: true,
                backdrop: 'static',
                windowClass: 'cropping-modal',
                animation: false,
                resolve: {
                    options: function () {
                        return options;
                    }
                }
            };
            return this.$modal.open(modalOptions).result;
        };
        /**
         * Show file upload dialog
         * @param options FileUpload options
         */
        Dialogs.prototype.showFileUpload = function (options) {
            var _this = this;
            var modalOptions = {
                templateUrl: 'modalFileUpload.tpl.html',
                controller: ['$scope', '$uibModalInstance', 'options', 'Upload',
                    function ($scope, $modalInstance, options, uploader) {
                        $scope.model = {};
                        $scope.title = options.title || _this.localization.getLocal('rota.yenidosya');
                        $scope.allowedExtensions = options && options.allowedExtensions;
                        $scope.sendText = (options && options.sendText) || _this.localization.getLocal('rota.gonder');
                        $scope.showImageCroppingArea = options.showImageCroppingArea;
                        $scope.sendFile = function () {
                            //if cropped image defined
                            if ($scope.showImageCroppingArea && $scope.model.croppedDataUrl) {
                                var image = uploader.dataUrltoBlob($scope.model.croppedDataUrl, $scope.model.file.name);
                                $modalInstance.close({ image: image, croppedDataUrl: $scope.model.croppedDataUrl });
                            }
                            else {
                                //single normal file
                                if ($scope.model.file) {
                                    $modalInstance.close($scope.model.file);
                                }
                            }
                        };
                        $scope.dismiss = function () {
                            $modalInstance.dismiss();
                        };
                    }],
                keyboard: true,
                backdrop: 'static',
                animation: false,
                windowClass: 'fileupload-modal',
                resolve: {
                    options: function () {
                        return options;
                    }
                }
            };
            return this.$modal.open(modalOptions).result;
        };
        /**
         * Show SSRS report
         * @param options Options
         */
        Dialogs.prototype.showReport = function (options) {
            var _this = this;
            var modalOptions = {
                templateUrl: 'reportDialog.tpl.html',
                controller: ['$scope', '$uibModalInstance', 'Common', 'options',
                    function ($scope, $modalInstance, common, options) {
                        $scope.reportViewerUrl = common.appendAccessTokenToUrl(options.reportViewerUrl + "?reportName=" + options.reportName);
                        $scope.title = options.title || _this.localization.getLocal('rota.raporonizleme');
                        $scope.message = options.message;
                        $scope.okText = options.okText || _this.localization.getLocal('rota.raporukapat');
                        $scope.ok = function () { $modalInstance.close('ok'); };
                        $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
                    }],
                keyboard: true,
                backdrop: 'static',
                animation: false,
                size: 'lg',
                windowClass: 'report-modal',
                resolve: {
                    options: function () {
                        return options;
                    }
                }
            };
            return this.$modal.open(modalOptions).result;
        };
        Dialogs.injectionName = "Dialogs";
        Dialogs.$inject = ['$rootScope', '$q', '$uibModal', 'Routing', 'Config', 'RouteConfig', 'Common',
            'Loader', 'Localization', 'Constants'];
        return Dialogs;
    }());
    exports.Dialogs = Dialogs;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.dialog', ['ui.bootstrap']);
    module.service(Dialogs.injectionName, Dialogs);
    module.run([
        '$templateCache', function ($templateCache) {
            //#region Add templates to cache
            $templateCache.put('reportDialog.tpl.html', '    <div class="modal-header">' +
                '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
                '        <h4><i class="fa fa-folder-open-o"></i>&nbsp;{{title}}</h4>' +
                '        <p ng-show="message" class="muted">{{message}}</p>' +
                '    </div>' +
                '    <div class="modal-body">' +
                '        <iframe src="{{reportViewerUrl}}" style="border: transparent;width:100%;height:600px"></iframe>' +
                '    </div>' +
                '    <div class="modal-footer">' +
                '        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
                '    </div>');
            $templateCache.put('modalSimpleDialog.tpl.html', '    <div class="modal-header">' +
                '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
                '        <h4><i ng-class="[\'fa\', \'fa-\'+iconName]"></i>&nbsp;{{title}}</h4>' +
                '    </div>' +
                '    <div class="modal-body">' +
                '       <div class="alert-icon">' +
                '           <i ng-class="[\'fa\',\'fa-3x\', \'fa-\'+iconName]"></i>' +
                '       </div>' +
                '       <div class="alert-message">' +
                '           <p>{{message}}</p>' +
                '       </div>' +
                '    </div>' +
                '    <div class="modal-footer">' +
                '        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
                '    </div>');
            //Template olarak cache'de sakla
            $templateCache.put('modalDialog.tpl.html', '    <div class="modal-header">' +
                '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel(\'dismiss\')">&times;</button>' +
                '        <h4><i ng-class="[\'fa\', \'fa-\'+iconName]"></i>&nbsp;{{title}}</h4>' +
                '    </div>' +
                '    <div class="modal-body">' +
                '       <div class="alert-icon">' +
                '           <i ng-class="[\'fa\',\'fa-3x\', \'fa-\'+iconName]"></i>' +
                '       </div>' +
                '       <div class="alert-message">' +
                '           <p>{{message}}</p>' +
                '       </div>' +
                '    </div>' +
                '    <div class="modal-footer">' +
                '        <button class="btn btn-default" data-ng-click="cancel(\'cancel\')">{{cancelText}}</button>' +
                '        <button ng-if="cancel2Text" class="btn btn-info" data-ng-click="cancel(\'cancel2\')">{{cancel2Text}}</button>' +
                '        <button class="btn btn-primary" autofocus data-ng-click="ok()">{{okText}}</button>' +
                '    </div>');
            //Template olarak cache'de sakla
            $templateCache.put('modalPromptDialog.tpl.html', '    <div class="modal-header">' +
                '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
                '        <h4><i class="fa fa-question-circle"></i>&nbsp;{{title}}</h4>' +
                '    </div>' +
                '    <div class="modal-body">' +
                '           <div class="row">' +
                '               <div class="col-md-12">' +
                '                   <div class="form-group">' +
                '                       <label for="lblValue">{{subTitle}}</label>' +
                '                       <input id="lblValue" type="text" class="form-control" ng-model="value.val" autofocus/>' +
                '                   </div>' +
                '               </div>' +
                '           </div>' +
                '    </div>' +
                '    <div class="modal-footer">' +
                '        <button class="btn btn-default" data-ng-click="cancel()">{{cancelText}}</button>' +
                '        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
                '    </div>');
            //Please wait template'i cacheDe sakla
            $templateCache.put('modalProgress.tpl.html', '<div>' +
                '<div class="modal-body">' +
                '<h1>{{title}}</h1>' +
                '<div class="progress progress-sm progress-striped active">' +
                '<div class="progress-bar" role="progressbar" style="width: {{percent}}%"></div>' +
                '</div>' +
                '</div>' +
                '</div>');
            //
            $templateCache.put('modalFileUpload.tpl.html', '   <form class="form-horizontal" name="formUpload" ng-submit="sendFile()" novalidate>' +
                '       <div class="modal-header">' +
                '           <h4><i class="fa fa-file"></i>&nbsp;{{::title}}</h4>' +
                '       </div>' +
                '       <div class="modal-body">' +
                '          <div class="row">' +
                '              <div class="col-md-12">' +
                '                 <rt-file-upload ng-diabled="true" ng-model="model.file" required accept="{{allowedExtensions}}"></rt-file-upload>' +
                '                 <div ng-if="showImageCroppingArea && model.file" class="cropArea margin-top-5">' +
                '                     <img-crop area-type="square" image="model.file | ngfDataUrl" result-image="model.croppedDataUrl" ng-init="model.croppedDataUrl=\'\'"></img-crop>' +
                '                 </div>' +
                '              </div>' +
                '          </div>' +
                '       </div>' +
                '       <div class="modal-footer">' +
                '           <button type="button" class="btn btn-default" data-ng-click="dismiss()" i18n="rota.iptal">' +
                '           </button><button type="submit" class="btn btn-success" ng-disabled="formUpload.$invalid">{{sendText}}</button>' +
                '       </div>' +
                '   </form>');
            $templateCache.put('modalImageCropping.tpl.html', '    <div class="modal-header">' +
                '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
                '        <h4><i class="fa fa-image"></i>&nbsp;{{::"rota.kirptitle" | i18n}}</h4>' +
                '    </div>' +
                '    <div class="modal-body">' +
                '       <div class="cropArea">' +
                '           <img-crop area-type="square" image= "imageFile | ngfDataUrl" result-image="croppedDataUrl" ng-init="croppedDataUrl=\'\'"></img-crop>' +
                '       </div>' +
                '    </div>' +
                '    <div class="modal-footer">' +
                '        <button type="button" class="btn btn-default" data-ng-click="dismiss()" i18n="rota.iptal">' +
                '        <button class="btn btn-primary" data-ng-click="crop()">{{cropActionText}}</button>' +
                '    </div>');
            //#endregion
        }
    ]);
});
