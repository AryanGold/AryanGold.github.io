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

                // Check if embed code is valid, for example must have URL to script...
                if (!whencastEmbedCode || !whencastEmbedCode.length || whencastEmbedCode.search('https://cdn.whenhub.com/v1/embed.js') < 0)
                {
                    return;
                }

                // Inject modifed the embed script for for with dynamically loading in Angular..
                var modifiedEmbedCode = whencastEmbedCode.replace('https://cdn.whenhub.com/v1/embed.js', 'AryanGold/scripts/embed.js');

                $mdDialog.hide(modifiedEmbedCode);
            };
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////
    }
    

})();

