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

//#region import
import * as moment from "moment";
//#endregion


//#region Directive
function idleTimeoutDirective(document: ng.IDocumentService,
    $rootScope: IRotaRootScope,
    $interval: ng.IIntervalService,
    securityConfig: ISecurityConfig,
    dialogs: IDialogs,
    security: ISecurity,
    localization: ILocalization,
    common: ICommon,
    config: IMainConfig) {

    function link(scope: ng.IScope, elem: ng.IAugmentedJQuery, attr: ng.IAttributes) {
        let elapsedTime = 0;
        const timerStep = 1000 * 5;
        let timerPromise: ng.IPromise<any>;

        if (securityConfig.logOffWhenIdleTimeout) {
            document.on("mousemove click keypress",
                () => {
                    elapsedTime = 0;
                });


            const timesOut = () => {
                let countDownPromise: ng.IPromise<any>;
                let countDown: number = 0;

                $interval.cancel(timerPromise);

                const appTitle = $rootScope.appTitle;
                $rootScope.appTitle = localization.getLocal("rota.cikisyapiliyor");
                common.setFavIcon(config.warnFavIconName);

                dialogs.showConfirm({
                    dialogType: DialogType.Warn,
                    controller: ['$scope', '$uibModalInstance', 'options',
                        ($scope: IConfirmScope, $modalInstance: ng.ui.bootstrap.IModalServiceInstance) => {
                            $scope.title = localization.getLocal('rota.bostacalismabaslik');
                            $scope.okText = localization.getLocal('rota.kullanmayadevamet');
                            $scope.cancelText = localization.getLocal("rota.logout");
                            $scope.ok = () => { $modalInstance.close('ok'); };
                            $scope.cancel = () => { $modalInstance.dismiss(''); };

                            const getRemainingTimeMsg = () => {
                                const restTime = moment
                                    .duration((securityConfig.idleLogoffCountDown - countDown) / 1000, "seconds")
                                    .humanize();

                                return localization.getLocal('rota.bostacalismauyarisi', restTime);
                            }

                            $scope.message = getRemainingTimeMsg();

                            countDownPromise = $interval(() => {
                                countDown += timerStep;

                                if (countDown >= securityConfig.idleLogoffCountDown) {
                                    $interval.cancel(countDownPromise);
                                    security.logOff();
                                }

                                $scope.message = getRemainingTimeMsg();

                            }, timerStep);
                        }]
                }).then(() => {
                    timerPromise = startTimer();
                },
                    () => {
                        security.logOff();
                    }).finally(() => {
                        countDown = elapsedTime = 0;
                        $interval.cancel(countDownPromise);
                        $rootScope.appTitle = appTitle;
                        common.setFavIcon();
                    });
            }

            const startTimer = (): ng.IPromise<any> => {
                return $interval(() => {
                    if (elapsedTime >= securityConfig.idleTimeout) {
                        timesOut();
                    } else {
                        elapsedTime += timerStep;
                    }
                },
                    timerStep);
            }

            timerPromise = startTimer();
        }
    }

    const directive = <ng.IDirective>{
        restrict: 'AE',
        link: link
    };
    return directive;
}

idleTimeoutDirective.$inject = ["$document", "$rootScope", "$interval", "SecurityConfig",
    "Dialogs", "Security", "Localization", "Common", "Config"];
//#endregion

//#region Register
angular.module('rota.directives.rtidletimeout', [])
    .directive('rtIdleTimeout', idleTimeoutDirective);
//#endregion

export { idleTimeoutDirective }