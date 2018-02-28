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
define(["require", "exports", "underscore.string"], function (require, exports, s) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Directive
    function avatarDirective($compile, $http, currentUser, securityconfig, common, constants) {
        function link(scope, element) {
            var avatarFallBack = function () {
                if (securityconfig.useFirstLetterAvatar) {
                    var firstLetters = currentUser.fullname.split(' ').map(function (value) { return value[0]; }).join('');
                    return "<div ng-class=\"['avatar-firstletter', 'avatar-'+size]\">" + firstLetters + "</div>";
                }
                var fullName = s.titleize(currentUser.fullname);
                return "<span class=\"avatar-fullname\"><i class=\"fa fa-user\"></i> " + fullName + "</span>";
            };
            var compile = function (content) {
                element.append(content);
                $compile(element.contents())(scope);
            };
            scope.size = scope.size || "medium";
            if (securityconfig.avatarProviderUri) {
                //load img with preimage
                var defaultAvatarPath = "" + (common.addTrailingSlash(constants.style.IMG_BASE_PATH) +
                    constants.style.DEFAULT_AVATAR_NAME.replace('{size}', scope.size));
                var imgElem_1 = $("<img ng-class=\"['img-circle', 'avatar-'+size]\" src=\"" + defaultAvatarPath + "\" alt=\"user avatar\" />");
                compile(imgElem_1);
                /**
                * Update src
                * @param src
                */
                var updateSrc_1 = function (src) {
                    $(imgElem_1).fadeOut(350, function () {
                        $(imgElem_1).attr('src', src).fadeIn(350);
                    });
                };
                //get avatar from remote service
                var context = {
                    username: scope.userName || currentUser.name,
                    userid: scope.userId || currentUser.id,
                    size: scope.size,
                    shortsize: scope.size.charAt(0)
                };
                var uri = common.format(securityconfig.avatarProviderUri, context);
                //Get img depending on fetch type
                //this is a must for uris which run with NTLM authentication or apis
                switch (securityconfig.avatarFetchType) {
                    case 1 /* GetRequest */:
                        var avatarProm = $http.get(encodeURI(uri), { responseType: 'blob', showSpinner: false });
                        avatarProm.then(function (response) {
                            if (response.data) {
                                var url = window.URL || window.webkitURL;
                                var src = url.createObjectURL(response.data);
                                //replace src attr of img elem
                                updateSrc_1(src);
                            }
                        });
                        break;
                    case 0 /* ImgSrc */:
                        updateSrc_1(uri);
                        break;
                    default:
                }
            }
            else {
                compile(avatarFallBack());
            }
        }
        var directive = {
            restrict: 'AE',
            link: link,
            scope: {
                userId: '@',
                userName: '@',
                size: '@'
            }
        };
        return directive;
    }
    exports.avatarDirective = avatarDirective;
    avatarDirective.$inject = ['$compile', '$http', 'CurrentUser', 'SecurityConfig', 'Common', 'Constants'];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtavatar', [])
        .directive('rtAvatar', avatarDirective);
});
