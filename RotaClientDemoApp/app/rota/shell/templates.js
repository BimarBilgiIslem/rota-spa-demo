define(["require", "exports", "text!./views/badges.html", "text!./views/breadcrumb.html", "text!./views/content.html", "text!./views/current-company.html", "text!./views/error404.html", "text!./views/error500.html", "text!./views/feedback.html", "text!./views/header-action-buttons.html", "text!./views/header.html", "text!./views/nav-menu-mobile.html", "text!./views/shell.html", "text!./views/title.html", "text!./views/user-profile.html"], function (require, exports, badges, breadcrumb, content, currentCompany, error404, error500, feedback, headerActionButtons, header, navMenuMobile, shell, title, userProfile) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Register
    var module = angular.module('rota.shell.templates', []);
    exports.module = module;
    module.run([
        '$templateCache', 'Constants', function ($templateCache, constants) {
            $templateCache.put(constants.routing.TEMPLATES.error404, error404);
            $templateCache.put(constants.routing.TEMPLATES.error500, error500);
            $templateCache.put(constants.routing.TEMPLATES.title, title);
            $templateCache.put(constants.routing.TEMPLATES.shell, shell);
            $templateCache.put(constants.routing.TEMPLATES.header, header);
            $templateCache.put(constants.routing.TEMPLATES.navmenumobile, navMenuMobile);
            $templateCache.put(constants.routing.TEMPLATES.badges, badges);
            $templateCache.put(constants.routing.TEMPLATES.actions, headerActionButtons);
            $templateCache.put(constants.routing.TEMPLATES.breadcrumb, breadcrumb);
            $templateCache.put(constants.routing.TEMPLATES.content, content);
            $templateCache.put(constants.routing.TEMPLATES.currentcompany, currentCompany);
            $templateCache.put(constants.routing.TEMPLATES.feedback, feedback);
            $templateCache.put(constants.routing.TEMPLATES.userprofile, userProfile);
        }
    ]);
});
