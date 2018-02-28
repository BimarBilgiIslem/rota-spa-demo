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
    /**
     * Find model by its id
     * @param id
     * @returns {}
     */
    Array.prototype.findById = function (id) {
        var item = _.findWhere(this, { id: id });
        return item;
    };
    /**
     * Find index of provided predicate
     * @param callback Iterator function
     * @returns {number}
     */
    Array.prototype.findIndex = function (callback) {
        return _.findIndex(this, callback);
    };
    /**
    * Delete item of array
    * @param args Iterator function or item itself to be deleted
    */
    Array.prototype.delete = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0)
            return;
        if (_.isFunction(args[0])) {
            var result = _.filter(this, args[0]);
            result.forEach(function (item) {
                _this.delete(item);
            });
        }
        else {
            var index = this.indexOf(args[0]);
            index > -1 && this.splice(index, 1);
        }
    };
    /**
     * Delete item by its id field
     * @param id
     * @returns {}
     */
    Array.prototype.deleteById = function (id) {
        var _this = this;
        var items = _.where(this, { id: id });
        items.forEach(function (item) {
            var index = _this.indexOf(item);
            index > -1 && _this.splice(index, 1);
        });
        return this;
    };
    /**
     * Get count in the list pass the iterator truth test.
     * @param callback Iterator fuction
     * @returns {number}
     */
    Array.prototype.count = function (callback) {
        var items = this.where(this, callback);
        return items !== null ? items.length : 0;
    };
    /**
     *  Returns true if any of the values in the list pass the iterator truth test.
     * @param fn Iterator function
     * @returns {boolean}
     */
    Array.prototype.any = function (callback) {
        return _.some(this, callback);
    };
    /**
     * Filter the list in the list pass the iterator truth test.
      * @param callback Iterator function
     * @returns {IBaseListModel<TModel>}
     */
    Array.prototype.where = function (callback) {
        return _.filter(this, callback);
    };
    /**
     * Returns the first element of the list pass the iterator truth test.
      * @param callback Iterator function
     * @returns {IBaseListModel}
     */
    Array.prototype.firstOrDefault = function (callback) {
        var result = this;
        if (callback)
            result = this.where(callback);
        return result[0];
    };
    /**
     * Sum values returned from iteration function
     * @param callBack Iteration function
     * @returns {number}
     */
    Array.prototype.sum = function (callBack) {
        return _.reduce(this, function (total, item, index, list) {
            total += callBack(item, index, list);
            return total;
        }, 0);
    };
    /**
     * Extract a array with provided property name
     * @returns {Array<any>}
     */
    Array.prototype.pluck = function (propName) {
        return _.pluck(this, propName);
    };
});
