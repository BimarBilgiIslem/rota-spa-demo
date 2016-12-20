define(["require", "exports", "underscore.string"], function (require, exports, s) {
    "use strict";
    var filter = function () {
        return function (value, type) {
            if (!value)
                return value;
            var result = value;
            switch (type) {
                case "uppercase":
                    result = value.toLocaleUpperCase();
                    break;
                case "title":
                    result = s.titleize(value);
                    break;
                case "lowercase":
                    result = value.toLocaleLowerCase();
                    break;
                case "capitalize":
                    result = s.capitalize(value);
                    break;
            }
            return result;
        };
    };
    //Register
    angular.module('rota.filters.textcase', []).filter('textcase', filter);
});
