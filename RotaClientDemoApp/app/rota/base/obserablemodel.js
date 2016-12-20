var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore", "underscore.string", "moment"], function (require, exports, _, _s, moment) {
    "use strict";
    /**
     * Obserablemodel responsible for tracking property changes and managing modelState algorithm
     */
    var ObserableModel = (function (_super) {
        __extends(ObserableModel, _super);
        function ObserableModel(initialValues) {
            _super.call(this);
            //set initial values
            this._id = 0;
            this._modelState = 1 /* Detached */;
            this._gui = _.uniqueId('model_');
            this._values =
                this._orginalValues = {};
            this._dataChangeEvents = [];
            this.__readonly = false;
            if (!initialValues)
                return;
            this._orginalValues = (initialValues instanceof ObserableModel) ?
                initialValues.toJson() : initialValues;
            if (initialValues[ObserableModel.idField])
                this._id = initialValues[ObserableModel.idField];
            if (initialValues[ObserableModel.modelStateField])
                this._modelState = initialValues[ObserableModel.modelStateField];
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
                        this._values[ObserableModel.idField] = 0;
                        break;
                    case 8 /* Deleted */:
                        if (oldState === 1 /* Detached */)
                            return;
                        if (oldState === 4 /* Added */) {
                            value = 1 /* Detached */;
                            break;
                        }
                        if (this._values[ObserableModel.idField] === 0)
                            throw new Error("id must be valid when state set to deleted");
                        //set all child models state
                        _.each(this._values, function (childItem) {
                            if (_.isArray(childItem)) {
                                _.each(childItem, function (item) {
                                    if (item.modelState)
                                        item.modelState = value;
                                });
                            }
                        });
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
                //set child array 
                _.chain(this._values)
                    .filter(function (item) { return _.isArray(item); })
                    .each(function (item) { return item._readonly = value; });
                this.__readonly = value;
            },
            enumerable: true,
            configurable: true
        });
        //#endregion
        //#region Methods
        ObserableModel.prototype.extractValue = function (value) {
            if (moment.isDate(value)) {
                return new Date(value);
            }
            return value;
        };
        /**
         * Extend model with source param
         * @param source Source Model
         */
        ObserableModel.prototype.extendModel = function (source) {
            this._id = source.id;
            this._modelState = source.modelState;
            this.initProperties(source.toJson());
            this.fireDataChangedEvent(this.modelState);
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
            //bind events for nested fresh models
            var _loop_1 = function(event_1) {
                var subCollections = _.filter(this_1._values, function (item) { return _.isArray(item); });
                _.each(subCollections, function (items) {
                    items.subscribeCollectionChanged(event_1);
                });
            };
            var this_1 = this;
            for (var _i = 0, _a = this._dataChangeEvents; _i < _a.length; _i++) {
                var event_1 = _a[_i];
                _loop_1(event_1);
            }
        };
        /**
        * Clone model with orginal values
        * @returns {IBaseCrudModel}
        */
        ObserableModel.prototype.cloneModel = function () {
            var newModel = new ObserableModel(this._values);
            return newModel;
        };
        /**
         * Convert model class to simple json object
         * @description Remove symbols which starts with _ and all functions
         */
        ObserableModel.prototype.toJson = function (onlyChanges) {
            var _this = this;
            var jsonModel = {}, modifiedProps = [];
            //get properties 
            var allValues = _.chain(this)
                .keys()
                .union(ObserableModel.stdFields)
                .filter(function (key) { return !_s.startsWith(key, '$$') && !_s.startsWith(key, '_'); })
                .reduce(function (memo, curr) {
                memo[curr] = _this[curr];
                return memo;
            }, {})
                .value();
            //convert literal obj recursivly
            _.each(allValues, function (value, key) {
                if (_.isArray(value)) {
                    var jArray = _.chain(value)
                        .filter(function (item) { return item.modelState !== 1 /* Detached */; })
                        .map(function (item) { return item.toJson(onlyChanges); })
                        .filter(function (item) { return !_.isEmpty(item); })
                        .value();
                    if (!onlyChanges || jArray.length)
                        jsonModel[key] = jArray;
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
                jsonModel[ObserableModel.modifiedPropsField] = _.difference(modifiedProps, ObserableModel.stdFields);
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
            //register dataChanged event for nested models
            var subCollections = _.filter(this._values, function (item) { return _.isArray(item); });
            _.each(subCollections, function (items) {
                items.subscribeCollectionChanged(callback);
            });
        };
        /**
         * Fire data chanfed event
         * @param key Key
         * @param value Value
         * @param modelState modelstate of model
         */
        ObserableModel.prototype.fireDataChangedEvent = function (action, key, newValue, oldValue) {
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
        ObserableModel.prototype.initProperties = function (values) {
            var _this = this;
            this._values = {};
            //remove standart fields
            var purgedModel = _.omit(values || this._orginalValues, ObserableModel.stdFields);
            //define prop map 
            var modelPropsMap = _.mapObject(purgedModel, function (value, key) {
                //check array
                if (_.isArray(value)) {
                    var subModels_1 = [];
                    _.each(value, function (jModel) { subModels_1.add(new ObserableModel(jModel)); });
                    _this._values[key] = subModels_1;
                }
                else {
                    //set private 
                    _this._values[key] = _this.extractValue(value);
                }
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
    }(Object));
    exports.ObserableModel = ObserableModel;
});
