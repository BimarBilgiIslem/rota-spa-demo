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
define(["require", "exports", "../base/obserablemodel"], function (require, exports, obserablemodel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Set readonly prop of array
     */
    Object.defineProperty(Array.prototype, "_readonly", {
        enumerable: false,
        configurable: true,
        get: function () {
            return this.__readonly;
        },
        set: function (value) {
            if (this.__readonly === value)
                return;
            //set all child models readonly 
            _.each(this, function (item) { return item._readonly = value; });
            this.__readonly = value;
        }
    });
    /**
     * Revert all items to original values
     */
    Array.prototype["revertOriginal"] = function () {
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var oModel = _a[_i];
            if (oModel.modelState === 4 /* Added */ ||
                oModel.modelState === 1 /* Detached */) {
                this.remove(oModel);
                continue;
            }
            oModel.revertOriginal();
        }
    };
    /**
    * Find model in collection by id
    * @param id Model id
    * @returns {IBaseCrudModel}
    */
    Array.prototype["findById"] = function (id) {
        var item = _.findWhere(this, { id: id });
        return item;
    };
    /**
     * Find model in collection by gui
     * @param gui Gui
     * @returns {IBaseCrudModel}
     */
    Array.prototype["findByGui"] = function (gui) {
        var item = _.findWhere(this, { gui: gui });
        return item;
    };
    /**
    * Delete model by id
    * @param id Model id
    * @returns {IBaseListModel<TModel>}
    */
    Array.prototype["deleteById"] = function (id) {
        var _this = this;
        var items = _.where(this, { id: id });
        items.forEach(function (item) {
            var index = _this.indexOf(item);
            index > -1 && _this.splice(index, 1);
        });
        return this;
    };
    /**
     * Remove model from collection either deleting or marking deleted
     * @param model
     * @returns {IBaseListModel<TModel>}
     */
    Array.prototype["remove"] = function (model) {
        model.remove();
        return this;
    };
    /**
    * Remove model by id
    * @param id Model id
    * @returns {IBaseListModel<TModel>}
    */
    Array.prototype["removeById"] = function (id) {
        var _this = this;
        var items = _.where(this, { id: id });
        items.forEach(function (item) {
            _this.remove(item);
        });
        return this;
    };
    /**
    * Remove all items
    * @returns {IBaseListModel<TModel>}
    */
    Array.prototype["removeAll"] = function () {
        var _this = this;
        this.forEach(function (item) {
            _this.remove(item);
        });
        return this;
    };
    /**
     * Add new item to collection and return
     * @returns {IBaseCrudModel}
     */
    Array.prototype["new"] = function (values) {
        var item = new obserablemodel_1.default(values);
        this.add(item);
        return item;
    };
    /**
    * Add item to list
    * @param item TModel
    */
    Array.prototype["add"] = function (model) {
        //Check same unique gui literally same obj
        if (this.any(function (a) { return a._gui === model._gui; }))
            return this;
        //convert literal to obserable 
        if (!(model instanceof obserablemodel_1.default)) {
            model = new obserablemodel_1.default(model, this.parentModel);
        }
        //set readonly - this is hack for rtMultiSelect.
        model._readonly = this._readonly;
        //Return if readonly
        if (this._readonly)
            return this;
        //validation
        if (this.any(function (a) { return a.id === model.id && a.id !== 0; })) {
            throw new Error("cannot be added to list with the same unique id (" + model.id + ")");
        }
        //register model changes event
        var self = this;
        model.subscribeDataChanged(function (action) {
            if (self._collectionChangedEvents) {
                for (var i = 0; i < self._collectionChangedEvents.length; i++) {
                    var callbackItem = self._collectionChangedEvents[i];
                    callbackItem.call(self, action, this);
                }
            }
        });
        //add item to array
        this.push(model);
        //set added if detached
        if (model.modelState === 1 /* Detached */) {
            model.acceptChanges();
            model.modelState = 4 /* Added */;
        }
        return this;
    };
    /**
     * Register callback event for all collection changes
     * @param callback Callback method
     */
    Array.prototype["subscribeCollectionChanged"] = function (callback) {
        if (!this._collectionChangedEvents)
            this._collectionChangedEvents = [];
        this._collectionChangedEvents.push(callback);
    };
});
