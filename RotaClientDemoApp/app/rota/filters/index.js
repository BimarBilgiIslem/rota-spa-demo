define(["require", "exports", "./rtI18n", "./rtCrudList", "./rtTextCase", "./rtHtmltoPlainText"], function (require, exports) {
    "use strict";
    angular.module('rota.filters', [
        'rota.filters.i18n',
        'rota.filters.crudlist',
        'rota.filters.textcase',
        'rota.filters.htmltoplaintext'
    ]);
});
