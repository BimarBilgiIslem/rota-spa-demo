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
import "es6-promise";
/**
 * OIDC client manager wrapper
 */
class CookieManager {
    //#region Props
    static instance: Oidc.UserManager;
    static user: Oidc.User;
    //#endregion
    
    //#region Methods
    static userRenewed(callback: (...ev: any[]) => void): void {

    }

    static init(settings: IOidcSettings): Promise<Oidc.User> {
        CookieManager.instance = {
            events: {
                addUserLoaded: (callback: (...ev: any[]) => void) => {
                }
            },
            signinRedirect: () => {
            },
            signoutRedirect: () => {
                const xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        location.replace('/Account/Login?returnurl=' + encodeURI(location.pathname + location.hash));
                    }
                };
                xhttp.open("POST", "/api/sample/LogOff", true);
                xhttp.send();
            }
        } as Oidc.UserManager;

        CookieManager.user = { profile: {} } as Oidc.User;

        return new Promise<Oidc.User>((resolve) => {
            resolve(CookieManager.user);
        });
    }
    //#endregion
}

export = CookieManager;