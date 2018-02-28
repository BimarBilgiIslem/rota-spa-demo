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

import * as $ from "jquery";

//#region Interfaces
interface ICopyToClipboardAttributes extends ng.IAttributes {
    rtCopyToClipboard: string;
}
//#endregion

//#region Directive
function rtCopyToClipboardDirective(logger: ILogger) {
    function link($scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ICopyToClipboardAttributes): void {
        element.bind('click',
            () => {
                if (attrs.rtCopyToClipboard) {
                    const $temp = $("<input>");
                    try {
                        $("body").append($temp);
                        $temp.val(attrs.rtCopyToClipboard).select();
                        document.execCommand("copy");
                        logger.console.log({ message: 'text copied to clipboard', data: attrs.rtCopyToClipboard });
                    } catch (e) {
                        logger.console.error({ message: 'copying to clipboard failed', data: attrs.rtCopyToClipboard });
                    } finally {
                        $temp.remove();
                    }
                } else {
                    logger.console.error({ message: 'copying to clipboard failed,no text provided' });
                }
            });
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        link: link
    };
    return directive;
}

rtCopyToClipboardDirective.$inject = ["Logger"];
//#endregion

//#region Register
angular.module('rota.directives.rtcopytoclipboard', [])
    .directive('rtCopyToClipboard', rtCopyToClipboardDirective);
//#endregion

export { rtCopyToClipboardDirective }