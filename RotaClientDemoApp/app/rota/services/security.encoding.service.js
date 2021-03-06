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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Base64 Service
    /**
     * Base64 Encoding Service
     */
    var Base64 = (function () {
        function Base64() {
            this.serviceName = "Base64 Service";
            this.PADCHAR = '=';
            this.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        }
        Base64.prototype.getByte = function (s, i) {
            var x = s.charCodeAt(i);
            return x;
        };
        Base64.prototype.getByte64 = function (s, i) {
            var idx = this.ALPHA.indexOf(s.charAt(i));
            return idx;
        };
        Base64.prototype.decode = function (s) {
            var pads = 0, i, b10, imax = s.length, x = [];
            s = String(s);
            if (imax === 0) {
                return s;
            }
            if (s.charAt(imax - 1) === this.PADCHAR) {
                pads = 1;
                if (s.charAt(imax - 2) === this.PADCHAR) {
                    pads = 2;
                }
                imax -= 4;
            }
            for (i = 0; i < imax; i += 4) {
                b10 = (this.getByte64(s, i) << 18) | (this.getByte64(s, i + 1) << 12) | (this.getByte64(s, i + 2) << 6) | this.getByte64(s, i + 3);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 255, b10 & 255));
            }
            switch (pads) {
                case 1:
                    b10 = (this.getByte64(s, i) << 18) | (this.getByte64(s, i + 1) << 12) | (this.getByte64(s, i + 2) << 6);
                    x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 255));
                    break;
                case 2:
                    b10 = (this.getByte64(s, i) << 18) | (this.getByte64(s, i + 1) << 12);
                    x.push(String.fromCharCode(b10 >> 16));
                    break;
            }
            return x.join('');
        };
        Base64.prototype.encode = function (s) {
            s = String(s);
            var i, b10, x = [], imax = s.length - s.length % 3;
            if (s.length === 0) {
                return s;
            }
            for (i = 0; i < imax; i += 3) {
                b10 = (this.getByte(s, i) << 16) | (this.getByte(s, i + 1) << 8) | this.getByte(s, i + 2);
                x.push(this.ALPHA.charAt(b10 >> 18));
                x.push(this.ALPHA.charAt((b10 >> 12) & 63));
                x.push(this.ALPHA.charAt((b10 >> 6) & 63));
                x.push(this.ALPHA.charAt(b10 & 63));
            }
            switch (s.length - imax) {
                case 1:
                    b10 = this.getByte(s, i) << 16;
                    x.push(this.ALPHA.charAt(b10 >> 18) + this.ALPHA.charAt((b10 >> 12) & 63) + this.PADCHAR + this.PADCHAR);
                    break;
                case 2:
                    b10 = (this.getByte(s, i) << 16) | (this.getByte(s, i + 1) << 8);
                    x.push(this.ALPHA.charAt(b10 >> 18) + this.ALPHA.charAt((b10 >> 12) & 63) + this.ALPHA.charAt((b10 >> 6) & 63) + this.PADCHAR);
                    break;
            }
            return x.join('');
        };
        Base64.injectionName = "Base64";
        return Base64;
    }());
    exports.Base64 = Base64;
    //#endregion
    //#region Register
    var module = angular.module('rota.services.security.encoding', []);
    module.service(Base64.injectionName, Base64);
});
