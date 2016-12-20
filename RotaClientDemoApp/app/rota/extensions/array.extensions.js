define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
    * Delete item of array
    * @param args Iterator function or item itself to be deleted
    */
    Array.prototype["delete"] = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args.length === 0)
            return null;
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
});
