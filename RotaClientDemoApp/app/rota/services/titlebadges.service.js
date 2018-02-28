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
    //#region TitleBadge Service
    /**
     * TitleBadge Service
     */
    var TitleBadges = (function () {
        function TitleBadges($rootScope, localization, constants) {
            var _this = this;
            this.$rootScope = $rootScope;
            this.localization = localization;
            this.constants = constants;
            //#region Props
            this.serviceName = "TitleBadges Service";
            this.initBadges();
            //clear badges when state changes
            $rootScope.$on(constants.events.EVENT_STATE_CHANGE_SUCCESS, function () {
                _this.clearBadges();
            });
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
                description: this.localization.getLocal('rota.yeni')
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
                description: this.localization.getLocal('rota.duzeltiliyor'),
                hiddenDescOnMobile: true
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
        TitleBadges.injectionName = "TitleBadges";
        //#endregion
        //#region Init
        TitleBadges.$inject = ['$rootScope', 'Localization', 'Constants'];
        return TitleBadges;
    }());
    exports.TitleBadges = TitleBadges;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.titlebadges', []);
    module.service(TitleBadges.injectionName, TitleBadges);
});
