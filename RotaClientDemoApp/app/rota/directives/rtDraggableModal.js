define(["require", "exports"], function (require, exports) {
    "use strict";
    //#region draggableModal 
    //http://stackoverflow.com/a/36201892/1016147
    function draggableModalDirective() {
        function link($scope, element) {
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
    //NOTE:modalDialog is class name of uib-modal itself
    //#endregion
});
