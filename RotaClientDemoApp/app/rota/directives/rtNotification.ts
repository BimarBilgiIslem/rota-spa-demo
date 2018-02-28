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

//#region Interfaces
interface INotificationAttributes extends ng.IAttributes {
    notificationLayout: NotifitionLayoutAttr;
}

type NotifitionLayoutAttr = "content" | "top" | "modal";

interface INotificationScope extends ng.IScope {
    remove(notify: INotify): void;
    notifications: INotify[];
    removeAll(): void;
}
//#endregion

//#region Directive
function notificationDirective($filter: ng.IFilterService, logger: ILogger) {
    const directive = <ng.IDirective>{
        restrict: 'AE',
        scope: {
            notificationLayout: '='
        },
        replace: true,
        templateUrl: (elem: ng.IAugmentedJQuery, attr: INotificationAttributes) => {
            return attr.notificationLayout === "top" ? "rota/rtNotification-top.tpl.html" : "rota/rtNotification-content.tpl.html";
        },
        link: (scope: INotificationScope, elem: ng.IAugmentedJQuery, attr: INotificationAttributes) => {

            let notificationLayout: NotificationLayout;
            switch (attr.notificationLayout) {
                case "content":
                    notificationLayout = NotificationLayout.Content;
                    break;
                case "top":
                    notificationLayout = NotificationLayout.Top;
                    break;
                case "modal":
                    notificationLayout = NotificationLayout.Modal;
                    break;
                default:
            }

            scope.remove = notify => {
                logger.notification.removeNotification(notify);
            }

            scope.removeAll = () => {
                logger.notification.removeAll(true);
            }

            scope.$watchCollection(() => logger.notification.notifications, notifications => {
                scope.notifications = $filter("filter")(notifications,
                    { notificationLayout: notificationLayout || NotificationLayout.Content });
            });
        }
    };
    return directive;
}
notificationDirective.$inject = ['$filter', 'Logger'];
//#endregion

//#region Register
angular.module('rota.directives.rtnotification', [])
    .directive('rtNotification', notificationDirective)
    .run([
        '$templateCache', ($templateCache: ng.ITemplateCacheService) => {
            $templateCache.put('rota/rtNotification-content.tpl.html',
                '<div>' +
                '<a class="pull-right label label-warning margin-bottom-5" ng-show="notifications.length > 1" ng-click="removeAll()">' +
                '<i class="fa fa-close"></i> {{::"rota.hepsinikapat" | i18n}}</a>' +
                '<div class="clearfix"></div>' +
                '<div ng-class="[\'alert alert-block\', \'alert-\'+notification.style]" ' +
                'ng-repeat="notification in notifications">' +
                '<a class="close" ng-click="$parent.remove(notification)" href="">×</a>' +
                '<h4 class="alert-heading"><i class="fa-fw fa fa-{{notification.icon}}"></i>{{notification.title}}</h4>' +
                '<p ng-bind-html="notification.message"></p></div></div>');
            $templateCache.put('rota/rtNotification-top.tpl.html',
                '<div class="rt-notifications"><div class="notifications-container" ng-if="notifications.length" >' +
                '<div class="{{notification.style}}" ng-repeat="notification in notifications">' +
                '<span class="message" ng-bind-html="notification.message"></span>' +
                '<span class="glyphicon glyphicon-remove close-click" ng-click="$parent.remove(notification)"></span>' +
                '</div></div></div>');
        }
    ]);
//#endregion


export { notificationDirective }