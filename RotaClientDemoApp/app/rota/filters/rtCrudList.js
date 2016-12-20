var crudListFilter = ['$filter', function ($filter) {
        return function (list) {
            return $filter('filter')(list, function (item) {
                return item.modelState !== 8 /* Deleted */ && item.modelState !== 1 /* Detached */;
            });
        };
    }];
//Register
angular.module('rota.filters.crudlist', []).filter('crudlist', crudListFilter);
