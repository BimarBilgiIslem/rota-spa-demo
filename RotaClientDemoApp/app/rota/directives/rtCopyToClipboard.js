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
define(["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Directive
    function rtCopyToClipboardDirective(logger) {
        function link($scope, element, attrs) {
            element.bind('click', function () {
                if (attrs.rtCopyToClipboard) {
                    var $temp = $("<input>");
                    try {
                        $("body").append($temp);
                        $temp.val(attrs.rtCopyToClipboard).select();
                        document.execCommand("copy");
                        logger.console.log({ message: 'text copied to clipboard', data: attrs.rtCopyToClipboard });
                    }
                    catch (e) {
                        logger.console.error({ message: 'copying to clipboard failed', data: attrs.rtCopyToClipboard });
                    }
                    finally {
                        $temp.remove();
                    }
                }
                else {
                    logger.console.error({ message: 'copying to clipboard failed,no text provided' });
                }
            });
        }
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;
    }
    exports.rtCopyToClipboardDirective = rtCopyToClipboardDirective;
    rtCopyToClipboardDirective.$inject = ["Logger"];
    //#endregion
    //#region Register
    angular.module('rota.directives.rtcopytoclipboard', [])
        .directive('rtCopyToClipboard', rtCopyToClipboardDirective);
});
