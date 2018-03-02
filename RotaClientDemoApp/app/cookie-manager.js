define(["require", "exports", "es6-promise"], function (require, exports) {
    "use strict";
    /**
     * OIDC client manager wrapper
     */
    var CookieManager = (function () {
        function CookieManager() {
        }
        //#endregion
        //#region Methods
        CookieManager.userRenewed = function (callback) {
        };
        CookieManager.init = function (settings) {
            CookieManager.instance = {
                events: {
                    addUserLoaded: function (callback) {
                    }
                },
                signinRedirect: function () {
                },
                signoutRedirect: function () {
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function () {
                        debugger;
                        if (this.readyState == 4 && this.status == 200) {
                            location.replace('/Account/Login?returnurl=' + encodeURI(location.pathname + location.hash));
                        }
                    };
                    xhttp.open("POST", "/api/sample/LogOff", true);
                    xhttp.send();
                }
            };
            CookieManager.user = { profile: {} };
            return new Promise(function (resolve) {
                resolve(CookieManager.user);
            });
        };
        return CookieManager;
    }());
    return CookieManager;
});
