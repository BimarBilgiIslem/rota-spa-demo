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
    //#region draggableModal
    //http://stackoverflow.com/a/36201892/1016147
    function draggableModalDirective() {
        function link($scope, element) {
            var canmaximized = element.parent().hasClass('canmaximized');
            var draggableStr = "draggableModal";
            var header = $(".modal-header", element);
            header.on('mousedown', function (mouseDownEvent) {
                var modalDialog = element;
                var offset = header.offset();
                modalDialog.addClass(draggableStr).parents().on('mousemove', function (mouseMoveEvent) {
                    $("." + draggableStr, modalDialog.parents()).offset({
                        top: mouseMoveEvent.pageY - (mouseDownEvent.pageY - offset.top),
                        left: mouseMoveEvent.pageX - (mouseDownEvent.pageX - offset.left)
                    });
                }).on('mouseup', function () {
                    modalDialog.removeClass(draggableStr);
                });
            });
            if (canmaximized) {
                header.on('dblclick', function () {
                    element.parent().toggleClass('modal-fullscreen');
                });
            }
        }
        //#region Directive Definition
        var directive = {
            restrict: 'AC',
            link: link
        };
        return directive;
        //#endregion
    }
    exports.draggableModalDirective = draggableModalDirective;
    //#endregion
    //#region Register
    angular.module('rota.directives.rtdraggablemodal', [])
        .directive('modalDialog', draggableModalDirective);
});
