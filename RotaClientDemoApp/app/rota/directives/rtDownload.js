define(["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#endregion
    //#region Download file within IFrame or window
    function downloadDirective($compile, constants, common) {
        var targetContainerName = "targetContainer";
        var formId = "rtDownload.Form";
        var hiddenStyle = "position:fixed;display:none;top:-1px;left:-1px;";
        function link(scope, element, attrs) {
            //#region Get Elems
            /**
             * Get IFrame in which download process will processed
             * @param name
             */
            var getIFrame = function () {
                var iFrame = $('iframe#fileDownloadFrame');
                if (!(iFrame && iFrame.length > 0)) {
                    iFrame = $("<iframe id='fileDownloadFrame'\n                                    name='" + targetContainerName + "' \n                                    src='about:blank'\n                                    style='" + hiddenStyle + "'/>");
                    //append document node as global
                    document.body.appendChild(iFrame[0]);
                }
                return iFrame[0];
            };
            /**
             * Get form elem targeted to iframe
             * @param options
             * @param target
             */
            var getForm = function (url, context) {
                //remove previous form
                $("form#" + formId, context).remove();
                //add token to url
                var secureLink = common.appendAccessTokenToUrl(url);
                return $("<form method='POST' \n                            id=" + formId + "  \n                            action='" + secureLink + "' \n                            style='" + hiddenStyle + "'\n                            target='" + targetContainerName + "'/>");
            };
            //#endregion
            //#region Download methods
            var startDownload = function (options) {
                if (common.isNullOrEmpty(options.url))
                    throw "download url is missing";
                //get container in which download process will occur
                var container = (options.inline === true) ? document.body : getIFrame();
                if (container) {
                    var formElem_1 = getForm(options.url, container);
                    //set form body params
                    if (common.isNotEmptyObject(options.filter)) {
                        var filterArray = common.serializeAsNameValuePairs(options.filter);
                        filterArray.forEach(function (item) { return formElem_1.append("<input type='hidden' name='" + item.name + "' value='" + item.value + "'/>"); });
                    }
                    //append elements
                    container.appendChild(formElem_1[0]);
                    if (options.inline) {
                        window.open('about:blank', targetContainerName, 'height=950, width=950, status=yes, resizable=yes, scrollbars=yes,' +
                            ' toolbar=no, location=no, menubar=no left=0, top=10');
                    }
                    //actual start
                    formElem_1.submit();
                }
            };
            //#endregion
            //#region Starters
            if (common.isNullOrEmpty(attrs.rtDownload)) {
                /**
                * Listen for download options event
                * Element usage
                */
                scope.$on(constants.events.EVENT_START_FILEDOWNLOAD, function (e, options) {
                    e.preventDefault();
                    if (!options)
                        return;
                    startDownload(options);
                });
            }
            else {
                /**
                 * Attribute usage
                 */
                element.bind('click', function (e) {
                    e.preventDefault();
                    if (common.isNullOrEmpty(attrs.rtDownload))
                        return;
                    startDownload({ url: attrs.rtDownload });
                });
            }
            //#endregion
            /**
             * recompile
             */
            $compile(element.contents())(scope);
        }
        //#region Directive Definition
        var directive = {
            restrict: 'AE',
            link: link,
            scope: {
                options: '=?'
            }
        };
        return directive;
        //#endregion
    }
    exports.downloadDirective = downloadDirective;
    //#region Injections
    downloadDirective.$inject = ["$compile", "Constants", "Common"];
    //#endregion
    //#endregion
    //#region Register
    angular.module('rota.directives.rtdownload', [])
        .directive('rtDownload', downloadDirective);
});
