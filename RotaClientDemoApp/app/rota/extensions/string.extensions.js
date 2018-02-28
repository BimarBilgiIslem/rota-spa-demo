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
    String.prototype.isNullOrEmpty = function () {
        return this === null || this.length === 0;
    };
    String.prototype.startsWith = function (starts) {
        return s.startsWith(this, starts);
    };
    String.prototype.contains = function (needle) {
        return s.contains(this, needle);
    };
    String.prototype.turkishToLower = function () {
        var string = this;
        var letters = { "İ": "i", "I": "ı", "Ş": "ş", "Ğ": "ğ", "Ü": "ü", "Ö": "ö", "Ç": "ç" };
        string = string.replace(/(([İIŞĞÜÇÖ]))/g, function (letter) { return letters[letter]; });
        return string.toLowerCase();
    };
    String.prototype.turkishToUpper = function () {
        var string = this;
        var letters = { "i": "İ", "ş": "Ş", "ğ": "Ğ", "ü": "Ü", "ö": "Ö", "ç": "Ç", "ı": "I" };
        string = string.replace(/(([iışğüçö]))/g, function (letter) { return letters[letter]; });
        return string.toUpperCase();
    };
});
