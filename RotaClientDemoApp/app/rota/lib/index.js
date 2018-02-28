define(["require", "exports", "spinner", "grid", "hotkeys", "scroll", "select", "ng-currency", "./dateTimeInput", "./datetimepicker", "ct-ui-router-extras", "./underscore.mixed", "mfb", "imgcrop", "i18n", "text", "json", "optional", "xdom", "toastr", "fileupload", "circleprogress", "ng-ckeditor", "ngcontextmenu", "uimask"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Register
    angular.module('rota.lib', [
        //Grid plugins
        //https://github.com/angular-ui/ui-grid
        'ui.grid', 'ui.grid.selection', 'ui.grid.pinning', 'ui.grid.pagination', 'ui.grid.exporter',
        'ui.grid.grouping', 'ui.grid.resizeColumns', 'ui.grid.saveState', 'ui.grid.moveColumns',
        'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.expandable',
        //Datetime picker
        //https://github.com/dalelotts/angular-bootstrap-datetimepicker
        'ui.dateTimeInput',
        'ui.bootstrap.datetimepicker',
        //Dropdown select-ui
        //https://github.com/angular-ui/ui-select
        'ui.select',
        //Hotkeys keyboard support
        //https://github.com/chieffancypants/angular-hotkeys/
        'cfp.hotkeys',
        //ui-router plugins - sticky states for modal support
        //https://github.com/christopherthielen/ui-router-extras
        //'ct.ui.router.extras.previous',
        'ct.ui.router.extras.sticky',
        'ct.ui.router.extras.dsr',
        //Scroll
        //https://github.com/oblador/angular-scroll
        'duScroll',
        //Currency directive
        //https://github.com/aguirrel/ng-currency
        'ng-currency',
        //https://github.com/nobitagit/ng-material-floating-button
        'ng-mfb',
        //Image cropping
        //https://github.com/alexk111/ngImgCrop
        'ngImgCrop',
        //Svg circluar progressbar
        //https://github.com/crisbeto/angular-svg-round-progressbar
        'angular-svg-round-progressbar',
        //RichEditor ckEditor for angular
        //https://github.com/miamarti/ng.ckeditor
        'ng.ckeditor',
        //Context Menu
        //https://github.com/Wildhoney/ngContextMenu
        'ngContextMenu',
        //Mask
        //https://github.com/angular-ui/ui-mask
        'ui.mask'
    ]);
});
//#endregion 
