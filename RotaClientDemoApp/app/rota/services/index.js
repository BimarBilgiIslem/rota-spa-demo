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
define(["require", "exports", "./logger.service", "./logger.exception", "./routing.service", "./dialogs.service", "./common.service", "./caching.service", "./localization.service", "./interceptors.service", "./titlebadges.service", "./security.service", "./validators.service", "./reporting.service", "./security.encoding.service", "./signalr.service"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //service module index
    angular.module('rota.services', [
        'rota.services.security',
        'rota.services.common',
        'rota.services.dialog',
        'rota.services.httpRequestTracker',
        'rota.services.caching',
        'rota.services.localization',
        'rota.services.log',
        'rota.services.titlebadges',
        'rota.services.routing',
        'rota.services.validators',
        'rota.services.reporting',
        'rota.services.security.encoding',
        'rota.services.signalr'
    ]);
});
