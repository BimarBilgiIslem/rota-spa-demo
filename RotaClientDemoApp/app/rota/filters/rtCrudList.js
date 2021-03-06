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
var crudListFilter = ['$filter', function ($filter) {
        return function (list) {
            return $filter('filter')(list, function (item) {
                return item.modelState !== 8 /* Deleted */ && item.modelState !== 1 /* Detached */;
            });
        };
    }];
//Register
angular.module('rota.filters.crudlist', []).filter('crudlist', crudListFilter);
