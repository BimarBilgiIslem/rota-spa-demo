define(["require", "exports"], function (require, exports) {
    "use strict";
    //#region Quick Menu Service
    /**
     * Quick Menu Service
     */
    var QuickMenus = (function () {
        function QuickMenus($rootScope, routing, caching, logger, localization) {
            var _this = this;
            this.routing = routing;
            this.caching = caching;
            this.logger = logger;
            this.localization = localization;
            //#region Props
            this.serviceName = "QuickMenu Service";
            this.actives = [];
            //get qucik menus from storage
            this.menus = this.caching.localStorage.get(QuickMenus.quickMenuStorageName) || [];
            //liste for state changes
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
                _this.setActives(toState.name, toParams);
            });
            //set intial active menus
            this.setActives(routing.current.name, routing.$stateParams);
        }
        //#endregion
        //#region Methods
        /**
         * Set active quick menus when state changes
         * @param state
         * @param params
         */
        QuickMenus.prototype.setActives = function (state, params) {
            this.actives = this.menus.filter(function (item) {
                return state === item.state && _.isEqual(params, item.params);
            });
        };
        /**
         * Add quick menu
         */
        QuickMenus.prototype.addQuickMenu = function () {
            var _this = this;
            if (!this.routing.current)
                return;
            if (this.menus.length >= QuickMenus.maxQuickMenuCount) {
                this.logger.toastr.warn({ message: this.localization.getLocal("rota.hizliemenuadetkisiti", QuickMenus.maxQuickMenuCount) });
                return;
            }
            if (this.actives.length) {
                this.actives.forEach(function (item) {
                    var index = _this.menus.indexOf(item);
                    index > -1 && _this.menus.splice(index, 1);
                });
            }
            else {
                this.menus.unshift({
                    state: this.routing.current.name,
                    params: angular.copy(this.routing.$stateParams),
                    label: this.routing.activeMenu.title,
                    icon: this.routing.activeMenu.menuIcon
                });
                this.logger.toastr.info({ message: this.localization.getLocal("rota.hizlimenueklendi", this.routing.activeMenu.title) });
            }
            this.caching.localStorage.store(QuickMenus.quickMenuStorageName, this.menus);
            this.setActives(this.routing.current.name, this.routing.$stateParams);
        };
        QuickMenus.quickMenuStorageName = "rota.quickmenus";
        QuickMenus.maxQuickMenuCount = 4;
        //#endregion
        //#region Init
        QuickMenus.$inject = ['$rootScope', 'Routing', 'Caching', 'Logger', 'Localization'];
        return QuickMenus;
    }());
    exports.QuickMenus = QuickMenus;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.quickmenu', []);
    module.service('QuickMenus', QuickMenus);
    //#endregion
});
