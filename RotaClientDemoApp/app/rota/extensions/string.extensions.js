define(["require", "exports"], function (require, exports) {
    "use strict";
    String.prototype.isNullOrEmpty = function () {
        return this === null || this.length === 0;
    };
});
