/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
(function () {
    'use strict';

    angular.module('officeAddin').controller('indexController', IndexController);
  
    function IndexController($scope, $timeout, $mdSidenav, $log, $mdDialog)
    {
        $scope.test = '';
        $scope.whenCastEmbedCode = '';

        //////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////
        // Main dialog, contain all apps main UI
        // based on: https://material.angularjs.org/latest/demo/dialog
        $scope.showMainDialog = function (ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'AryanGold/pages/mainDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            })
            .then(function (embedCode) {
                // Inserted data
                $scope.whenCastEmbedCode = embedCode;
            }, function () {
                // cancelled the dialog;
            });
        };

        function DialogController($scope, $mdDialog) {
            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            // Run when pressed the 'Insert' button 
            $scope.answer = function (answer)
            {
                // String of Whencast embed code
                var whencastEmbedCode = $('#whenCastEmbedCode').val();

                // For testing..
                //whencastEmbedCode = '<div data-whencast="58f62ab929b535158cd5ac8b" data-schedule-id="58f62ab929b535158cd5ac8a"></div><script src="https://cdn.whenhub.com/v1/embed.js"></script><noscript><a href="https://studio.whenhub.com/schedules/58f62ab929b535158cd5ac8a"><img src="http://tm.whn.is/s/58f62ab929b535158cd5ac8a" /></a></noscript>';

                // Validate and prepare Whencast embed code.
                var modifiedEmbedCode = validateAndPrepare_embedCode(whencastEmbedCode);
                if (!modifiedEmbedCode)
                {
                    return;
                }

                // Store Whencast embed code to document
                saveEmbedCodeToDocument(whencastEmbedCode);

                $mdDialog.hide(modifiedEmbedCode);  // this store embed code in  "$scope.showMainDialog = function (ev) { then..."
            };
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////

        ///////////////////////////////////////////////
        // Insert Whencast from document, usually used during open document where already stored Whencast
        $scope.loadWhencastFromDocument = function ()
        {
            // Load Whencast embed code from document
            var whencastEmbedCode = loadEmbedCodeFromDocument();

            // Validate and prepare Whencast embed code.
            var modifiedEmbedCode = validateAndPrepare_embedCode(whencastEmbedCode);
            if (!modifiedEmbedCode)
            {
                console.log('>>> Not found Whencast embed code in the current document');
                $scope.showMainDialog();    // If not found Whencast embed code in the current document then open dialog for insert embed code

                return;
            }

            // Use delay before update $scope variable, because the function loadWhencastFromDocument() may called before IndexController initialize.
            // And we must wait a little for complete initialize IndexController.
            $timeout(function ()
            {
                $scope.whenCastEmbedCode = modifiedEmbedCode;
            }, 500);
        };
        ///////////////////////////////////////////////

        // Validate and prepare Whencast embed code. Return prepared embed code if success
        function validateAndPrepare_embedCode(_whencastEmbedCode) {
            // Check if embed code is valid, for example must have URL to script...
            if (!_whencastEmbedCode || !_whencastEmbedCode.length || _whencastEmbedCode.search('https://cdn.whenhub.com/v1/embed.js') < 0) {
                return 0;
            }

            // Inject modifed the embed script for for with dynamically loading in Angular..
            var modifiedEmbedCode = _whencastEmbedCode.replace('https://cdn.whenhub.com/v1/embed.js', 'AryanGold/scripts/embed.js');

            return modifiedEmbedCode;
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////
        // Store/load Whencast embed code to document
        // https://dev.office.com/docs/add-ins/develop/persisting-add-in-state-and-settings
        function saveEmbedCodeToDocument(whencastEmbedCode)
        {
            // First save to memory only!
            Office.context.document.settings.set('whencastEmbedCode', whencastEmbedCode);

            // Save from memory to the document
            Office.context.document.settings.saveAsync(function (asyncResult)
            {
                if (asyncResult.status == Office.AsyncResultStatus.Failed)
                {
                    console.log('>>> Embed code save failed. Error: ' + asyncResult.error.message);
                }
                else
                {
                    console.log('>>> Embed code saved');
                }
            });
        }
        // Before call this function first time, need also refresh data from document to memory, details:
        // https://dev.office.com/reference/add-ins/shared/settings.refreshasync
        function loadEmbedCodeFromDocument()
        {
            return Office.context.document.settings.get('whencastEmbedCode');
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////


    }
    

})();

