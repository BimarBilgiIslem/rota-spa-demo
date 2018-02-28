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

//#region Imports
import BaseModalController from './basemodalcontroller';
import { Controller } from "./decorators";
import constants = require('config/constants');
//#endregion
/**
 * Default modal controller used by showModal() of Dialogs service
 */
@Controller({
    initializeModel: true,
    registerName: constants.controller.DEFAULT_MODAL_CONTROLLER_NAME
})
class DefaultModalController<TModel extends IBaseModel> extends BaseModalController<TModel> {
    //#region InjcetableObject
    /**
    * Update bundle
    * @param bundle IBundle
    */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        //Inject optional custom services if any
        if (this.instanceOptions.services) {
            this.instanceOptions.services.forEach((service): void => {
                this.defineService(service.instanceName, this.$injector.get(service.injectionName));
            });
        }
    }
    //#endregion

}

export { DefaultModalController }