define(["require", "exports", "./logger.service", "./logger.exception", "./routing.service", "./dialogs.service", "./common.service", "./caching.service", "./localization.service", "./interceptors.service", "./titlebadges.service", "./security.service", "./validators.service", "./reporting.service", "./security.encoding.service"], function (require, exports) {
    "use strict";
    //service module index
    angular.module('rota.services', [
        'rota.services.log',
        'rota.services.common',
        'rota.services.dialog',
        'rota.services.httpRequestTracker',
        'rota.services.caching',
        'rota.services.localization',
        'rota.services.titlebadges',
        'rota.services.routing',
        'rota.services.security',
        'rota.services.validators',
        'rota.services.reporting',
        'rota.services.security.encoding'
    ]);
});
