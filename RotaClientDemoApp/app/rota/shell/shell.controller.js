define(["require", "exports", "../services/routing.service", "../config/config", "../services/logger.service"], function (require, exports) {
    "use strict";
    //#endregion
    //#region Shell Controller
    /**
     * Shell controller
     */
    var ShellController = (function () {
        //#endregion
        //#region Init
        function ShellController($rootScope, $scope, $location, $window, hotkey, uploader, securityConfig, routing, config, logger, titleBadges, localization, security, dialogs, caching, routeConfig, constants) {
            this.$rootScope = $rootScope;
            this.$scope = $scope;
            this.$location = $location;
            this.$window = $window;
            this.hotkey = hotkey;
            this.uploader = uploader;
            this.securityConfig = securityConfig;
            this.routing = routing;
            this.config = config;
            this.logger = logger;
            this.titleBadges = titleBadges;
            this.localization = localization;
            this.security = security;
            this.dialogs = dialogs;
            this.caching = caching;
            this.routeConfig = routeConfig;
            this.constants = constants;
            //init settings
            this.setSpinner();
            this.setActiveMenuListener();
            this.setTitleBadgesListener();
            this.setDebugPanel();
            //initial vars
            if (config.homePageOptions) {
                this.bgImageUrl = config.homePageOptions.imageUri &&
                    { 'background-image': "url(" + config.homePageOptions.imageUri + ")" };
                this.vidOptions = config.homePageOptions.videoOptions;
                this.isHomePage = $location.url() === config.homePageOptions.url;
            }
            $rootScope.appTitle = '';
            $rootScope.forms = {};
            $scope.supportedLanguages = this.config.supportedLanguages;
            $scope.currentLanguage = localization.currentLanguage;
            $scope.currentUser = security.currentUser;
            $scope.currentCompany = security.currentCompany;
            $scope.authorizedCompanies = securityConfig.authorizedCompanies;
            if (securityConfig.avatarUri)
                $scope.avatarUri = securityConfig.avatarUri;
        }
        Object.defineProperty(ShellController.prototype, "isBusy", {
            get: function () { return this._isBusy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShellController.prototype, "spinnerOptions", {
            get: function () { return this._spinnerOptions; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShellController.prototype, "activeMenu", {
            get: function () { return this._activeMenu; },
            enumerable: true,
            configurable: true
        });
        //#endregion
        //#region Shell Methods
        /**
         * Set debug panel visibility
         */
        ShellController.prototype.setDebugPanel = function () {
            var _this = this;
            this.$scope.enableDebugPanel = this.config.debugMode && window.__globalEnvironment.showModelDebugPanel;
            if (this.$scope.enableDebugPanel) {
                this.$scope.$on(this.config.eventNames.modelLoaded, function (e, model) {
                    if (_.isArray(model))
                        _this.$scope.modelInDebug = model;
                    else
                        _this.$scope.modelInDebug = model.toJson &&
                            model.toJson();
                });
            }
        };
        /**
       * Set spinner settings
       */
        ShellController.prototype.setSpinner = function () {
            var _this = this;
            //register main spinner events
            this.$rootScope.$on(this.config.eventNames.ajaxStarted, function () {
                _this._isBusy = true;
            });
            this.$rootScope.$on(this.config.eventNames.ajaxFinished, function () {
                _this._isBusy = false;
            });
            //spinner settings
            this._spinnerOptions = this.constants.controller.DEFAULT_SPINNER_OPTIONS;
        };
        /**
         * Set active menu & app title
         */
        ShellController.prototype.setActiveMenuListener = function () {
            var _this = this;
            this.$scope.$watch(function () { return _this.routing.activeMenu; }, function (menu) {
                _this._activeMenu = menu;
                //set app title
                _this.$rootScope.appTitle = menu ? (menu.title + " - " + _this.config.appTitle) : _this.config.appTitle;
                //set full screen
                _this.fullScreen = menu && menu.isFullScreen;
            });
        };
        /**
         * Set title badges
         */
        ShellController.prototype.setTitleBadgesListener = function () {
            var _this = this;
            this.$rootScope.$on(this.config.eventNames.menuChanged, function (e, menu) {
                if (_this.config.homePageOptions)
                    _this.isHomePage = _this.$location.url() === _this.config.homePageOptions.url;
            });
        };
        /**
        * Refresh state
        */
        ShellController.prototype.refresh = function () {
            this.routing.reload();
        };
        /**
         * Change current language
         * @param $event Event
         * @param lang Language to be changed to
         */
        ShellController.prototype.changeLanguage = function ($event, lang) {
            this.localization.currentLanguage = lang;
            $event.preventDefault();
        };
        /**
         * Logoff
         */
        ShellController.prototype.logOff = function () {
            var _this = this;
            this.dialogs.showConfirm({ message: this.localization.getLocal('rota.cikisonay') }).then(function () {
                _this.security.logOff();
            });
        };
        /**
         * Change selected company
         * @param companyId
         */
        ShellController.prototype.setCompany = function (company) {
            this.caching.sessionStorage.store(this.constants.security.STORAGE_NAME_ROLE_ID, company.roleId);
            this.caching.sessionStorage.store(this.constants.security.STORAGE_NAME_COMPANY_ID, company.id);
            //redirect to home page
            this.$window.location.replace("");
        };
        /**
         * Change profile picture
         */
        ShellController.prototype.changeAvatar = function () {
            var _this = this;
            if (!this.securityConfig.avatarUploadUri)
                throw new Error(this.constants.errors.NO_AVATAR_URI_PROVIDED);
            this.dialogs.showFileUpload({
                allowedExtensions: this.constants.controller.ALLOWED_AVATAR_EXTENSIONS,
                showImageCroppingArea: true,
                title: this.localization.getLocal('rota.fotosec'),
                sendText: this.localization.getLocal('rota.fotodegistir')
            }).then(function (file) {
                _this.uploader.upload({
                    url: _this.securityConfig.avatarUploadUri,
                    method: 'POST',
                    data: { file: file.image }
                }).then(function () {
                    _this.logger.toastr.success({ message: _this.localization.getLocal('rota.fotodegistirildi') });
                    _this.$window.location.reload();
                });
            });
        };
        return ShellController;
    }());
    //#endregion
    //#region Injection
    ShellController.$inject = ['$rootScope', '$scope', '$location', '$window', 'hotkeys', 'Upload', 'SecurityConfig', 'Routing', 'Config', 'Logger',
        'TitleBadges', 'Localization', 'Security', 'Dialogs', 'Caching', 'RouteConfig', 'Constants'];
    //#endregion
    //#region Register
    var module = angular.module('rota.shell', []);
    module.controller('ShellController', ShellController);
});
//#endregion
