var htmlToPlainText = function () {
    return function (text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
};
//Register
angular.module('rota.filters.htmltoplaintext', []).filter('htmltoplaintext', htmlToPlainText);
