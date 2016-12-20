define(["require", "exports", "../base/obserablemodel", "underscore.string"], function (require, exports, obserablemodel_1, _s) {
    "use strict";
    //#region Common Service
    var Common = (function () {
        //#region Init
        function Common($q, $filter, config) {
            this.$q = $q;
            this.$filter = $filter;
            this.config = config;
            this.serviceName = "Common Service";
            /**
             * Gets unique number
             */
            this._uniqueNumber = 100;
        }
        //#endregion
        //#region Promise Utils
        /**
         * Return promise with provided arg
         * @param p Arg
         */
        Common.prototype.promise = function (p) {
            return this.$q.when(p);
        };
        /**
         * Return rejected promise with reason
         * @param reason Arg
         */
        Common.prototype.rejectedPromise = function (reason) {
            var d = this.$q.defer();
            d.reject(reason);
            return d.promise;
        };
        /**
         * Return promise with provided arg if its not thenable
         * @param value Arg
         */
        Common.prototype.makePromise = function (value) {
            return this.isPromise(value) ? value : this.promise(value);
        };
        /**
         * Check whether or not provided param is promise
         * @param value Arg
         */
        Common.prototype.isPromise = function (value) {
            return value && angular.isFunction(value.then);
        };
        //#endregion
        //#region Path Utils
        /**
         * Check whether or not provided value ends with html extension
         * @param value Arg
         */
        Common.prototype.isHtml = function (value) {
            if (!this.isAssigned(value))
                return false;
            return value.indexOf('html', value.length - 4) > -1;
        };
        /**
         * Extract file name from full path
         * @param path File full path
         */
        Common.prototype.extractFileName = function (path) {
            var fname = path.split('/').pop();
            var dotIndex = fname.indexOf('.');
            if (dotIndex > -1)
                return fname.substr(0, dotIndex);
            else
                return fname;
        };
        /**
         * Add prefix/suffix slash's
         * @param path Path
         */
        Common.prototype.addSlash = function (path) {
            return this.addPrefixSlash(this.addTrailingSlash(path));
        };
        /**
         * Add trailing slash
         * @param path Path
         */
        Common.prototype.addTrailingSlash = function (path) {
            var sonChar = path && path[path.length - 1];
            if (sonChar === '/')
                return path;
            else
                return path + '/';
        };
        /**
         * Add prefix slash
         * @param path Path
         */
        Common.prototype.addPrefixSlash = function (path) {
            var ilkChar = path && path[0];
            if (ilkChar === '/')
                return path;
            else
                return '/' + path;
        };
        //#endregion
        //#region String Utils
        /**
         * Guard method checks for string
         * @param value Any object
         */
        Common.prototype.isString = function (value) {
            return angular.isString(value);
        };
        /**
         * Checks string value is not empty or null
         * @param value
         */
        Common.prototype.isNullOrEmpty = function (value) {
            if (this.isAssigned(value)) {
                var v = value.trim();
                return v === "";
            }
            return true;
        };
        //#endregion
        //#region Utils
        /**
         * Check if request is restfull service request
         * @param config Rewurst config
         * @returns {boolean}
         */
        Common.prototype.isApiRequest = function (config) {
            if (config.method === "GET" || config.method === "POST") {
                return _s.startsWith(config.url, this.config.defaultApiPrefix);
            }
            return false;
        };
        /**
         * Get FontAwesome icon name on file extension
         * @param fileExtension File extension
         */
        Common.prototype.getFaIcon = function (fileExtension) {
            fileExtension = fileExtension.toLowerCase();
            switch (fileExtension) {
                case "pdf":
                    return "file-pdf-o";
                case "xls":
                case "xlsx":
                    return "file-excel-o";
                case "doc":
                case "docx":
                    return "file-word-o";
                case "jpeg":
                case "jpg":
                case "png":
                    return "file-image-o";
                case "rar":
                case "zip":
                    return "file-zip-o";
                case "txt":
                    return "file-text-o";
                case "mp3":
                case "wav":
                    return "file-audio-o";
                default:
                    return "file-o";
            }
        };
        /**
         * Safe apply
         * @param $scope Scope
         * @param fn Optional method
         */
        Common.prototype.safeApply = function ($scope, fn) {
            var phase = $scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                if (fn) {
                    $scope.$eval(fn);
                }
            }
            else {
                if (fn) {
                    $scope.$apply(fn);
                }
                else {
                    $scope.$apply();
                }
            }
        };
        /**
        * Put prefix to all values in curly brackets defined in value
        * @param value String Value
        * @param prefix Prefix
        */
        Common.prototype.updateExpressions = function (value, prefix) {
            return value.replace(/\{{(.*?]*)\}}/g, function (match, value) {
                return "{{" + prefix + "." + value + "}}";
            });
        };
        /**
         * Filter array using "or" operator
         * @param list List to be filtered
         * @param fields Fields seperated with comma
         * @param keyword Search Keyword
         */
        Common.prototype.filterArray = function (list, fields, keyword) {
            var _this = this;
            var result = [];
            fields.split(',').forEach(function (filterName) {
                var filter = {};
                filter[filterName] = keyword;
                var filteredList = _this.$filter('filter')(list, filter);
                filteredList.forEach(function (item) {
                    if (result.indexOf(item) === -1) {
                        result.unshift(item);
                    }
                });
            });
            return result;
        };
        /**
         * Check that value is assigned and not empty object
         * @param value Value to be evuluated
         */
        Common.prototype.isNotEmptyObject = function (value) {
            return this.isAssigned(value) && !_.isEmpty(value);
        };
        /**
         * Set model's property to some value incursivly
         * @param model Model
         * @param fieldName Field name
         * @param defaultValue Value
         */
        Common.prototype.setModelValue = function (model, fieldName, defaultValue) {
            var _this = this;
            if (!this.isAssigned(model))
                return;
            for (var field in model) {
                if (model.hasOwnProperty(field)) {
                    if (this.isArray(model[field])) {
                        model[field].forEach(function (item) {
                            _this.setModelValue(item, fieldName, defaultValue);
                        });
                    }
                    else {
                        if (field === fieldName) {
                            model[field] = defaultValue;
                        }
                    }
                }
            }
        };
        Common.prototype.getUniqueNumber = function () {
            return this._uniqueNumber = this._uniqueNumber + 1;
        };
        /**
         * Extend TSource
         * @param source Source of TSource
         * @param destinations Destinations of any
         */
        Common.prototype.extend = function (source) {
            var extensions = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                extensions[_i - 1] = arguments[_i];
            }
            return angular.extend.apply(angular, [source || {}].concat(extensions));
        };
        /**
         * Merge source with all destinations
         * @param source Source of TSource
         * @param destinations Destinations of any
         */
        Common.prototype.merge = function (source, extension) {
            return source = this.extend(source, extension);
        };
        /**
         * Return true if value nor null and undefined
         * @param value Any object
         */
        Common.prototype.isAssigned = function (value) {
            return value !== undefined && value !== null;
        };
        /**
         * Guard method checks for array objects
         * @param value Any object
         */
        Common.prototype.isArray = function (value) {
            return value instanceof Array;
        };
        /**
         * Guard method checks for function
         * @param value
         */
        Common.prototype.isFunction = function (value) {
            return angular.isFunction(value);
        };
        /**
         * Guard method checks for defined
         * @param value
         */
        Common.prototype.isDefined = function (value) {
            return angular.isDefined(value);
        };
        /**
         * Convert html to plain text
         * @param html Html
         */
        Common.prototype.htmlToPlaintext = function (html) {
            if (!html)
                return '';
            return html.replace(/<[^>]+>/gm, '');
        };
        /**
         * PreventDefault utility method
         * @param $event Angular event
         */
        Common.prototype.preventClick = function (event) {
            if (!event)
                return false;
            event.preventDefault && event.preventDefault();
            event.stopPropagation && event.stopPropagation();
            return false;
        };
        /**
        * Convert object to generic array
        * @param obj Object to convert
        */
        Common.prototype.convertObjToArray = function (obj) {
            var result = new Array();
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    result.push(obj[prop]);
                }
            }
            return result;
        };
        /**
         * Convert Enum obj to Array for binding
         * @param value Enum object
         */
        Common.prototype.convertEnumToArray = function (value) {
            var result = [];
            for (var item in value) {
                if (value.hasOwnProperty(item) && /^\d+$/.test(item)) {
                    var key = parseInt(item);
                    var text = value[item];
                    result.push({ key: key, text: text });
                }
            }
            return result;
        };
        /**
         * Generate unique number
         */
        Common.prototype.getRandomNumber = function () {
            return ((Date.now() + Math.random()) * Math.random()).toString().replace(".", "");
        };
        //#endregion
        //#region Model Utils
        /**
         * Get new crud model
         * @param props
         */
        Common.prototype.newCrudModel = function () {
            var props = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                props[_i - 0] = arguments[_i];
            }
            return this.extend.apply(this, [{ id: 0, modelState: 1 /* Detached */ }].concat(props));
        };
        /**
         * Get new obserable model
         * @param initalValues
         */
        Common.prototype.newObserableModel = function (initalValues) {
            return new obserablemodel_1.ObserableModel(initalValues);
        };
        /**
         * Check whether model is valid crudModel
         * @param model
         */
        Common.prototype.isCrudModel = function (model) {
            return this.isAssigned(model) && this.isAssigned(model.modelState);
        };
        Common.prototype.isObserableModel = function (model) {
            return this.isAssigned(model) && this.isAssigned(model._gui);
        };
        return Common;
    }());
    exports.Common = Common;
    //#endregion
    //#region Injection
    Common.$inject = ['$q', '$filter', 'Config'];
    //#endregion
    //#region Register
    var module = angular.module('rota.services.common', [])
        .service('Common', Common);
    //#endregion
});
