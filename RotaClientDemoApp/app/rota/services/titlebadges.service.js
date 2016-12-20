define(["require", "exports"], function (require, exports) {
    "use strict";
    //#region TitleBadge Service
    /**
     * TitleBadge Service
     */
    var TitleBadges = (function () {
        function TitleBadges(localization) {
            this.localization = localization;
            //#region Props
            this.serviceName = "TitleBadges Service";
            this.initBadges();
        }
        /**
         * Create all badges
         */
        TitleBadges.prototype.initBadges = function () {
            this.badges = {};
            this.badges[0 /* Editmode */] = {
                color: 'info',
                icon: 'edit',
                description: this.localization.getLocal('rota.kayitduzeltme')
            };
            this.badges[1 /* Newmode */] = {
                color: 'info',
                icon: 'plus',
                description: this.localization.getLocal('rota.yenikayit')
            };
            this.badges[4 /* Cloning */] = {
                color: 'danger',
                icon: 'copy',
                description: this.localization.getLocal('rota.kopyalaniyor')
            };
            this.badges[6 /* Invalid */] = {
                color: 'danger',
                icon: 'exclamation',
                description: this.localization.getLocal('rota.zorunlualanlarvar')
            };
            this.badges[5 /* Dirty */] = {
                color: 'success',
                icon: 'pencil',
                description: this.localization.getLocal('rota.duzeltiliyor')
            };
            this.badges[2 /* Recordcount */] = {
                color: 'success',
                icon: 'reorder',
                description: this.localization.getLocal('rota.kayitsayisi') + " 0"
            };
            this.badges[3 /* Selectedcount */] = {
                color: 'danger',
                icon: 'check'
            };
            this.badges[7 /* AutoSaving */] = {
                color: 'success',
                icon: 'floppy-o',
                description: this.localization.getLocal('rota.otomatikkayitediliyor')
            };
            this.badges[8 /* Readonly */] = {
                color: 'warning',
                icon: 'eye',
                description: this.localization.getLocal('rota.sadeceokuma')
            };
        };
        //#endregion
        //#region Methods
        /**
         * Hide all badges
         */
        TitleBadges.prototype.clearBadges = function () {
            for (var i = 0 /* Editmode */; i <= 8 /* Readonly */; i++) {
                this.badges[i].show = false;
            }
        };
        //#endregion
        //#region Init
        TitleBadges.$inject = ['Localization'];
        return TitleBadges;
    }());
    exports.TitleBadges = TitleBadges;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.titlebadges', []);
    module.service('TitleBadges', TitleBadges);
    //#endregion
});
