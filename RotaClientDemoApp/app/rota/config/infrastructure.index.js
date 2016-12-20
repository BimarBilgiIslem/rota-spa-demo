define(["require", "exports", "./config", "./constants", "../base/index", "../services/index", "../directives/index", "../filters/index", "../extensions/index", "../shell/shell.controller"], function (require, exports) {
    "use strict";
    angular.module('rota', [
        'rota.constants',
        'rota.services',
        'rota.config',
        'rota.directives',
        'rota.filters',
        'rota.shell',
        /*lib & core loaded in vendor.index*/
        'rota.lib',
        'rota.core'
    ]);
});
