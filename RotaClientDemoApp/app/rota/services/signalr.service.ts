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

import { Hub } from "./signalr.hub";

class PushService implements IPushService {
    //#region Props
    serviceName = "PushService";
    static injectionName = "PushService";
    //#endregion

    //#region Init
    static $inject = ["Config", "Logger", "Common"];
    constructor(private config: IMainConfig, private logger: ILogger, private common: ICommon) {
    }

    connectToHub<TMethods>(hubName: string, options: IHubOptions): IHub<TMethods> {
        if (this.common.isNullOrEmpty(hubName)) throw new Error("hub name must be provided");

        options = angular.extend({
            rootPath: this.config.pushServicePath,
            logging: this.config.debugMode,
            errorHandler: this.config.debugMode && this.errorHandler.bind(this),
            useSharedConnection: true
        }, options);

        return new Hub<TMethods>(hubName, options);
    }

    errorHandler(error: SignalR.ConnectionError): void {
        this.logger.toastr.error({ message: error.message });
        this.logger.console.error({ message: error.message, data: error });
    }
}

//#region Register
var module: ng.IModule = angular.module('rota.services.signalr', []);
module.service(PushService.injectionName, PushService);
//#endregion

export { PushService }