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
define(["require", "exports", "moment"], function (require, exports, moment) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Directive
    function idleTimeoutDirective(document, $rootScope, $interval, securityConfig, dialogs, security, localization, common, config) {
        function link(scope, elem, attr) {
            var elapsedTime = 0;
            var timerStep = 1000 * 5;
            var timerPromise;
            if (securityConfig.logOffWhenIdleTimeout) {
                document.on("mousemove click keypress", function () {
                    elapsedTime = 0;
                });
                var timesOut_1 = function () {
                    var countDownPromise;
                    var countDown = 0;
                    $interval.cancel(timerPromise);
                    var appTitle = $rootScope.appTitle;
                    $rootScope.appTitle = localization.getLocal("rota.cikisyapiliyor");
                    common.setFavIcon(config.warnFavIconName);
                    dialogs.showConfirm({
                        dialogType: 2 /* Warn */,
                        controller: ['$scope', '$uibModalInstance', 'options',
                            function ($scope, $modalInstance) {
                                $scope.title = localization.getLocal('rota.bostacalismabaslik');
                                $scope.okText = localization.getLocal('rota.kullanmayadevamet');
                                $scope.cancelText = localization.getLocal("rota.logout");
                                $scope.ok = function () { $modalInstance.close('ok'); };
                                $scope.cancel = function () { $modalInstance.dismiss(''); };
                                var getRemainingTimeMsg = function () {
                                    var restTime = moment
                                        .duration((securityConfig.idleLogoffCountDown - countDown) / 1000, "seconds")
                                        .humanize();
                                    return localization.getLocal('rota.bostacalismauyarisi', restTime);
                                };
                                $scope.message = getRemainingTimeMsg();
                                countDownPromise = $interval(function () {
                                    countDown += timerStep;
                                    if (countDown >= securityConfig.idleLogoffCountDown) {
                                        $interval.cancel(countDownPromise);
                                        security.logOff();
                                    }
                                    $scope.message = getRemainingTimeMsg();
                                }, timerStep);
                            }]
                    }).then(function () {
                        timerPromise = startTimer_1();
                    }, function () {
                        security.logOff();
                    }).finally(function () {
                        countDown = elapsedTime = 0;
                        $interval.cancel(countDownPromise);
                        $rootScope.appTitle = appTitle;
                        common.setFavIcon();
                    });
                };
                var startTimer_1 = function () {
                    return $interval(function () {
                        if (elapsedTime >= securityConfig.idleTimeout) {
                            timesOut_1();
                        }
                        else {
                            elapsedTime += timerStep;
                        }
                    }, timerStep);
                };
                timerPromise = startTimer_1();
            }
        }
        var directive = {
            restrict: 'AE',
            link: link
        };
        return directive;
    }
    exports.idleTimeoutDirective = idleTimeoutDirective;
    idleTimeoutDirective.$inject = ["$document", "$rootScope", "$interval", "SecurityConfig",
        "Dialogs", "Security", "Localization", "Common", "Config"];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtidletimeout', [])
        .directive('rtIdleTimeout', idleTimeoutDirective);
});
