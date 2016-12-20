define(["require", "exports"], function (require, exports) {
    "use strict";
    var BaseConfig = (function () {
        function BaseConfig() {
        }
        BaseConfig.prototype.configure = function (config) {
            this.config = angular.extend(this.config, config);
        };
        BaseConfig.prototype.$get = function () {
            return this.config;
        };
        return BaseConfig;
    }());
    exports.BaseConfig = BaseConfig;
    //Export
});
