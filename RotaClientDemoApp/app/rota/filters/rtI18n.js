var i18NFilter = [
    'Localization', function (localization) {
        return function (key) { return localization.getLocal(key) || 'Resource (' + key + ')'; };
    }
];
//Register
angular.module('rota.filters.i18n', []).filter('i18n', i18NFilter);
