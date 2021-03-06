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
define(["require", "exports", "underscore.string"], function (require, exports, s) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var filter = function () {
        return function (value, type) {
            if (!value)
                return value;
            var result = value;
            switch (type) {
                case "uppercase":
                    result = value.turkishToUpper();
                    break;
                case "title":
                    result = s.titleize(value);
                    break;
                case "lowercase":
                    result = value.turkishToLower();
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
