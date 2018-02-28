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
define(["require", "exports", "underscore", "underscore.string", "moment"], function (require, exports, _, _s, moment) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Obserablemodel responsible for tracking property changes and managing modelState algorithm
     */
    var ObserableModel = (function () {
        function ObserableModel(initialValues, _parentModel) {
            this._parentModel = _parentModel;
            //set initial values
            this._id = 0;
            this._modelState = 1 /* Detached */;
            this._gui = _.uniqueId('model_');
            this._values = {};
            this._orginalValues = {};
            this._dataChangeEvents = [];
            this._isDirty =
                this.__readonly = false;
            if (!initialValues)
                return;
            this._orginalValues = initialValues instanceof ObserableModel ? initialValues.toJson() : initialValues;
            //init
            this.initProperties();
        }
        Object.defineProperty(ObserableModel.prototype, "id", {
            get: function () { return this._id; },
            set: function (value) {
                if (this._readonly)
                    return;
                this._id = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObserableModel.prototype, "modelState", {
            get: function () { return this._modelState; },
            set: function (value) {
                if (this._readonly)
                    return;
                var oldState = this._modelState;
                if (oldState === value)
                    return;
                switch (value) {
                    case 4 /* Added */:
                        this._id = 0;
                        //set all child as added
                        this.iterateNavigationalModels(function (model) { return model.modelState = 4 /* Added */; });
                        break;
                    case 8 /* Deleted */:
                        if (oldState === 1 /* Detached */)
                            return;
                        if (oldState === 4 /* Added */) {
                            value = 1 /* Detached */;
                            break;
                        }
                        if (this._id === 0)
                            throw new Error("id must be valid when state set to deleted");
                        if (oldState === 16 /* Modified */) {
                            this.revertOriginal();
                        }
                        //set all child as deleted
                        this.iterateNavigationalModels(function (model) { return model.modelState = 8 /* Deleted */; });
                        break;
                    case 16 /* Modified */:
                        if (oldState !== 2 /* Unchanged */)
                            return;
                    case 2 /* Unchanged */:
                        break;
                    case 1 /* Detached */:
                        break;
                }
                this._modelState = value;
                //call change event
                this.fireDataChangedEvent(value, "modelState", value, oldState);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObserableModel.prototype, "_readonly", {
            get: function () { return this.__readonly; },
            set: function (value) {
                if (this.__readonly === value)
                    return;
                //set childs
                _.each(this._values, function (childItem) {
                    if (_.isArray(childItem)) {
                        childItem._readonly = value;
                    }
                    else if (childItem instanceof ObserableModel) {
                        childItem._readonly = value;
                    }
                });
                this.__readonly = value;
            },
            enumerable: true,
            configurable: true
        });
        //#endregion
        //#region Methods
        /**
         * Iterate navigational models
         * @param cb Callback
         */
        ObserableModel.prototype.iterateNavigationalModels = function (cb) {
            _.each(this._values, function (childItem) {
                if (_.isArray(childItem)) {
                    _.each(childItem, function (item) {
                        if (item instanceof ObserableModel) {
                            cb(item);
                        }
                    });
                }
                else if (childItem instanceof ObserableModel) {
                    cb(childItem);
                }
            });
        };
        /**
         * get value depending on prop type
         * @param value Prop value
         */
        ObserableModel.prototype.mapProperty = function (value) {
            var _this = this;
            //if value is array,converto to ObserableModel array
            if (_.isArray(value)) {
                var subModels = [];
                //set parent model
                subModels.parentModel = this;
                //listen collection for signal of model is being changed
                subModels.subscribeCollectionChanged(function () {
                    _this.fireDataChangedEvent();
                });
                //iterate nested models
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var jsubModel = value_1[_i];
                    subModels.add(new ObserableModel(jsubModel, this));
                }
                return subModels;
            }
            else 
            //if value is literal obj,convert to ObserableModel
            if (_.isObject(value) && !_.isDate(value)) {
                var navModel = new ObserableModel(value, this);
                //register datachange event to notify parent model
                navModel.subscribeDataChanged(function (action, value, oldValue, key) {
                    _this.fireDataChangedEvent(action, value, oldValue, key);
                });
                return navModel;
            }
            //otherwise,return primitive type
            return this.extractValue(value);
        };
        /**
         * Extract value depending on value type
         * @param value
         */
        ObserableModel.prototype.extractValue = function (value) {
            //if value is date,create new date instance
            if (moment.isDate(value)) {
                return new Date(value);
            }
            //otherwise,return primitive type
            return value;
        };
        /**
         * Remove item setting Deleted state
         */
        ObserableModel.prototype.remove = function () {
            this.modelState = 8 /* Deleted */;
        };
        /**
         * Restore model to orgin values
         */
        ObserableModel.prototype.revertOriginal = function () {
            this.initProperties();
        };
        /**
        * Clone model with orginal values
        * @returns {IBaseCrudModel}
        */
        ObserableModel.prototype.cloneModel = function () {
            var newModel = new ObserableModel(this._orginalValues);
            return newModel;
        };
        /**
         * Convert model class to simple json object
         * @description Remove symbols which starts with _ and all functions
         */
        ObserableModel.prototype.toJson = function (onlyChanges) {
            var _this = this;
            var jsonModel = {}, modifiedProps = [];
            //get properties of this object itself
            var allValues = _.chain(this)
                .keys()
                .union(ObserableModel.stdFields)
                .filter(function (key) { return !_s.startsWith(key, '$$') && !_s.startsWith(key, '_'); })
                .reduce(function (memo, curr) {
                memo[curr] = _this[curr];
                return memo;
            }, {})
                .value();
            //convert literal obj recursively
            _.each(allValues, function (value, key) {
                if (_.isArray(value)) {
                    var jArray = _.chain(value)
                        .filter(function (item) { return item instanceof ObserableModel; })
                        .filter(function (item) { return item.modelState !== 1 /* Detached */; })
                        .map(function (item) { return item.toJson(onlyChanges); })
                        .filter(function (item) { return !_.isEmpty(item); })
                        .value();
                    if (!onlyChanges || jArray.length)
                        jsonModel[key] = jArray;
                }
                else if (value instanceof ObserableModel) {
                    if (value.modelState !== 1 /* Detached */) {
                        var navigationalModel = value.toJson(onlyChanges);
                        if (!onlyChanges || !_.isEmpty(navigationalModel)) {
                            jsonModel[key] = navigationalModel;
                        }
                    }
                }
                else {
                    if (!onlyChanges || _this.modelState === 4 /* Added */ || _this._orginalValues[key] !== value) {
                        jsonModel[key] = _this.extractValue(value);
                        modifiedProps.unshift(key);
                    }
                }
            });
            if (!_.isEmpty(jsonModel) && onlyChanges) {
                jsonModel[ObserableModel.idField] = this.id;
                if (this.modelState === 16 /* Modified */) {
                    jsonModel[ObserableModel.modifiedPropsField] = _.difference(modifiedProps, ObserableModel.stdFields);
                }
            }
            return jsonModel;
        };
        /**
        * Copy values to orjinalvalues
        */
        ObserableModel.prototype.acceptChanges = function () {
            this._orginalValues = this.toJson();
        };
        /**
         * Register datachanged callback recursively for model itself and all nested models
         * @param callback
         */
        ObserableModel.prototype.subscribeDataChanged = function (callback) {
            this._dataChangeEvents.push(callback);
        };
        /**
         * Fire data chanfed event
         * @param key Key
         * @param value Value
         * @param modelState modelstate of model
         */
        ObserableModel.prototype.fireDataChangedEvent = function (action, key, newValue, oldValue) {
            this._isDirty = true;
            if (this._dataChangeEvents) {
                for (var i = 0; i < this._dataChangeEvents.length; i++) {
                    this._dataChangeEvents[i].call(this, action, newValue, oldValue, key);
                }
            }
        };
        /**
         * Set all literal props to property
         * @param crudModel
         */
        ObserableModel.prototype.initProperties = function () {
            var _this = this;
            this._values = {};
            this._isDirty = false;
            //set standart field
            if (this._orginalValues[ObserableModel.idField])
                this._id = this._orginalValues[ObserableModel.idField];
            if (this._orginalValues[ObserableModel.modelStateField])
                this._modelState = this._orginalValues[ObserableModel.modelStateField];
            //remove standart fields
            var purgedModel = _.omit(this._orginalValues, ObserableModel.stdFields);
            //define prop map 
            var modelPropsMap = _.mapObject(purgedModel, function (value, key) {
                //convert array or nav props to obserable
                _this._values[key] = _this.mapProperty(value);
                var propMap = {
                    enumerable: true,
                    configurable: true,
                    get: function () { return _this._values[key]; },
                    set: function (newValue) {
                        //return if readonly
                        if (_this._readonly)
                            return;
                        var oldValue = _this._values[key];
                        //check equality
                        if (!_.isEqual(oldValue, newValue)) {
                            _this._values[key] = newValue;
                            //set modelState
                            _this.modelState = 16 /* Modified */;
                            //call datachanged event
                            _this.fireDataChangedEvent(16 /* Modified */, key, newValue, oldValue);
                        }
                    }
                };
                return propMap;
            });
            //extend object with crud model props
            Object.defineProperties(this, modelPropsMap);
        };
        //#region Statics
        ObserableModel.idField = "id";
        ObserableModel.modelStateField = "modelState";
        ObserableModel.modifiedPropsField = "modifiedProperties";
        ObserableModel.stdFields = [ObserableModel.idField, ObserableModel.modelStateField];
        return ObserableModel;
    }());
    exports.default = ObserableModel;
});
