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
//#region Profile Controller
/**
 * Profile controller
 */
var ProfileController = (function () {
    //#region Init
    function ProfileController($rootScope, $location, $window, routing, config, dialogs, constants, currentUser, currentCompany, routeconfig, security, securityconfig, uploader, logger, localization, hotkey, common) {
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.$window = $window;
        this.routing = routing;
        this.config = config;
        this.dialogs = dialogs;
        this.constants = constants;
        this.currentUser = currentUser;
        this.currentCompany = currentCompany;
        this.routeconfig = routeconfig;
        this.security = security;
        this.securityconfig = securityconfig;
        this.uploader = uploader;
        this.logger = logger;
        this.localization = localization;
        this.hotkey = hotkey;
        this.common = common;
        //format user link
        if (config.profileLinkUri) {
            this.profileLink = encodeURI(common.format(config.profileLinkUri, this.currentUser));
        }
    }
    //#endregion
    //#region Methods
    /**
    * Change company
    * @param company Currently selected company
    */
    ProfileController.prototype.setCompany = function (company) {
        this.security.setCompany(company);
    };
    /**
    * Change profile picture
    */
    ProfileController.prototype.changeAvatar = function () {
        var _this = this;
        if (!this.securityconfig.avatarUploadUri)
            throw new Error(this.constants.errors.NO_AVATAR_URI_PROVIDED);
        //format uri interpolated with currentUser
        var uri = this.common.format(this.securityconfig.avatarUploadUri, this.currentUser);
        this.dialogs.showFileUpload({
            allowedExtensions: this.constants.controller.ALLOWED_AVATAR_EXTENSIONS,
            showImageCroppingArea: true,
            title: this.localization.getLocal('rota.fotosec'),
            sendText: this.localization.getLocal('rota.fotodegistir')
        }).then(function (file) {
            _this.uploader.upload({
                url: uri,
                method: 'POST',
                data: { file: file.image }
            }).then(function () {
                _this.logger.toastr.success({ message: _this.localization.getLocal('rota.fotodegistirildi') });
                _this.routing.reloadBrowser();
            });
        }, function () {
            _this.logger.toastr.error({ message: _this.localization.getLocal("rota.fotodegistirhata") });
        });
    };
    /**
     * Show feedback form
     */
    ProfileController.prototype.showFeedBackForm = function () {
        this.dialogs.showModal({
            bindToController: false,
            controllerAs: null,
            windowClass: 'feedback-form',
            sideBarPosition: "left",
            isSideBar: true,
            absoluteTemplateUrl: this.routeconfig.templates.feedback,
            controller: [
                '$scope', '$http', '$uibModalInstance', 'Config', 'Logger', 'Localization', 'CurrentUser',
                function ($scope, $http, $uibModalInstance, config, logger, localization, user) {
                    $scope.model = {};
                    $scope.submit = function () {
                        $scope.responseInProcess = true;
                        $http.post(config.feedBackProviderUrl, {
                            message: $scope.model.message,
                            rate: $scope.model.rate,
                            username: user.name,
                            userid: user.id,
                            email: user.email
                        }, { showSpinner: false }).then(function () {
                            logger.notification.info({
                                autoHideDelay: 3500,
                                notificationLayout: 1 /* Top */,
                                message: localization.getLocal('rota.geribildirimbasarili')
                            });
                            $uibModalInstance.close();
                        }, function () {
                            logger.toastr.error({
                                message: localization.getLocal('rota.geribildirimhata')
                            });
                        }).finally(function () {
                            $scope.responseInProcess = false;
                        });
                    };
                }
            ]
        });
    };
    /**
     * Go to help link if helpLinkUri provided
     */
    ProfileController.prototype.goToHelpLink = function () {
        var helpUri = encodeURI(this.common.format(this.config.helpLinkUri, this.routing.activeMenu));
        location.replace(helpUri);
    };
    /**
     * Logoff
     */
    ProfileController.prototype.logOff = function () {
        var _this = this;
        this.dialogs.showConfirm({
            message: this.localization.getLocal('rota.cikisonay'),
            okText: this.localization.getLocal('rota.cikis')
        }).then(function () {
            _this.security.logOff();
        });
    };
    /**
     * Change current language
     * @param $event Event
     * @param lang Language to be changed to
     */
    ProfileController.prototype.changeLanguage = function (lang) {
        this.localization.currentLanguage = lang;
    };
    /**
     * Toggle cheatsheet
     * @returns {}
     */
    ProfileController.prototype.toggleCheatSheet = function () {
        this.hotkey.toggleCheatSheet();
    };
    return ProfileController;
}());
//#region Injection
ProfileController.$inject = ['$rootScope', '$location', '$window', 'Routing', 'Config',
    'Dialogs', 'Constants', 'CurrentUser', 'CurrentCompany', 'RouteConfig',
    'Security', 'SecurityConfig', 'Upload', 'Logger', 'Localization', 'hotkeys', 'Common'];
//#endregion
//#endregion
//#region Profile Controller for Modal 
var ProfileModalController = (function (_super) {
    __extends(ProfileModalController, _super);
    //#endregion
    //#region Init
    function ProfileModalController($rootScope, $location, $window, routing, config, dialogs, constants, currentUser, currentCompany, routeconfig, security, securityconfig, uploader, logger, localization, hotkey, common, $modalInstance) {
        var _this = _super.call(this, $rootScope, $location, $window, routing, config, dialogs, constants, currentUser, currentCompany, routeconfig, security, securityconfig, uploader, logger, localization, hotkey, common) || this;
        _this.$modalInstance = $modalInstance;
        //init menus
        _this.currentMenus = routing.navMenus;
        _this.initiated = true;
        return _this;
    }
    //#endregion
    //#region Methods
    ProfileModalController.prototype.close = function () {
        this.$modalInstance.dismiss();
    };
    /**
     * Change nested menus
     * @param menu Parent menu to be actiavted
     */
    ProfileModalController.prototype.displayNextLevel = function (menu) {
        if (!menu) {
            this.currentMenus = this.routing.navMenus;
            this.parentMenu = null;
            return;
        }
        if (menu.subtree && menu.subtree.length) {
            this.currentMenus = menu.subtree;
            this.parentMenu = menu;
        }
        else {
            this.$modalInstance.dismiss();
        }
    };
    return ProfileModalController;
}(ProfileController));
//#region Injection
ProfileModalController.$inject = ProfileController.$inject.concat('$uibModalInstance');
//#endregion
//#endregion
//#region Register
var module = angular.module('rota.shell.profile', []);
module.controller('ProfileController', ProfileController)
    .controller('ProfileModalController', ProfileModalController);
//#endregion
