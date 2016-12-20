var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../base/baseconfig", "angular"], function (require, exports, baseconfig_1, angular) {
    "use strict";
    //#endregion
    //#region Server Configuration Environtment
    var module = angular.module('rota.config', []);
    //Get environment and make it constant to be available thru app
    var env = window.__globalEnvironment;
    if (env) {
        var _env = angular.copy(env);
        module.constant('Environment', _env);
    }
    else {
        throw new Error('no server config found');
    }
    //#endregion
    //#region Config
    var Config = (function (_super) {
        __extends(Config, _super);
        function Config(environments, constants) {
            _super.call(this);
            var config = {
                //Main app settings
                appVersion: constants.APP_VERSION,
                appTitle: constants.APP_TITLE,
                debugMode: environments.debugging,
                defaultApiPrefix: constants.server.DEFAULT_API_PREFIX,
                supportedLanguages: [{ code: 'tr-tr', fullname: 'Türkçe' }, { code: 'en-us', fullname: 'English' }],
                serverExceptionLoggingEnabled: false,
                showCompanyName: true,
                datetimeFormat: {
                    timeFormat: constants.localization.TIME_FORMAT,
                    dateFormat: constants.localization.DATE_FORMAT,
                    monthFormat: constants.localization.MONTH_FORMAT,
                    yearFormat: constants.localization.YEAR_FORMAT,
                    datePickerTimeMinStep: constants.localization.MIN_STEP
                },
                //Event names
                eventNames: {
                    userLoginChanged: constants.events.EVENT_LOGIN_CHANGED,
                    ajaxFinished: constants.events.EVENT_AJAX_FINISHED,
                    ajaxStarted: constants.events.EVENT_AJAX_STARTED,
                    loginRequired: constants.events.EVENT_LOGIN_REQIRED,
                    menuChanged: constants.events.EVENT_MENU_CHANGED,
                    modelLoaded: constants.events.EVENT_MODEL_LOADED
                },
                //Grid settings
                gridDefaultPageSize: constants.grid.GRID_DEFAULT_PAGE_SIZE,
                gridDefaultOptionsName: constants.grid.GRID_DEFAULT_OPTIONS_NAME,
                gridFullFeatureList: constants.grid.GRID_FULL_FEATUTE_LIST,
                gridStandartFeatureList: constants.grid.GRID_STANDART_FEATURE_LIST,
                //Crud page stuffs
                autoSaveInterval: constants.controller.DEFAULT_AUTOSAVE_INTERVAL,
                postOnlyModelChanges: false,
                defaultFormName: constants.controller.DEFAULT_FORM_NAME,
                defaultNewItemParamValue: constants.controller.DEFAULT_NEW_ITEM_PARAM_VALUE,
                defaultNewItemParamName: constants.controller.DEFAULT_NEW_ITEM_PARAM_NAME,
                //Reportings
                reportViewerUrl: environments.reportViewerUrl,
                reportControllerUrl: environments.reportControllerUrl
            };
            this.config = config;
        }
        return Config;
    }(baseconfig_1.BaseConfig));
    exports.Config = Config;
    //#endregion
    //#region Injection
    Config.$inject = ['Environment', 'Constants'];
    //#endregion
    //#region Register
    module.provider('Config', Config);
    //#endregion
});
