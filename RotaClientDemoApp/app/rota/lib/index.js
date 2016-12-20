define(["require", "exports", "spinner", "bootstrap", "grid", "hotkeys", "scroll", "select", "ngcurrency", "./dateTimeInput", "./datetimepicker", "ct-ui-router-extras", "./underscore.mixed", "mfb", "imgcrop", "jws", "rsa", "jsonsanseval", "crypto", "i18n", "text", "json", "optional", "xdom", "toastr", "fileupload", "circleprogress", "ckeditor", "ng-ckeditor", "ngcontextmenu", "treeview"], function (require, exports) {
    "use strict";
    //#endregion
    //#region Register
    angular.module('rota.lib', [
        //Grid plugins
        //https://github.com/angular-ui/ui-grid
        'ui.grid', 'ui.grid.selection', 'ui.grid.pinning', 'ui.grid.pagination', 'ui.grid.exporter', 'ui.grid.grouping', 'ui.grid.resizeColumns',
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
        //https://github.com/iVantage/angular-ivh-treeview
        //Treeview 
        'ivh.treeview'
    ]);
});
//#endregion 
