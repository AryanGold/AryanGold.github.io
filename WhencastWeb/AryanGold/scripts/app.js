
(function ()
{
    //'use strict';

    officeAddin = angular.module('officeAddin', [
        'ngRoute',
        'ngAnimate',
        'ngMaterial',
        'material.svgAssetsCache'
    ])
    // Configure theme of Angulat material, details: https://material.angularjs.org/latest/Theming/01_introduction
    .config(function ($mdThemingProvider)
    {
        $mdThemingProvider.theme('default')
          .primaryPalette('cyan')
    })
    // Uses for dynamically loading HTML and scripts, details: http://stackoverflow.com/questions/18340872/how-do-you-use-sce-trustashtmlstring-to-replicate-ng-bind-html-unsafe-in-angu
    .filter('HTML_filter_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
    }]);


    isOfficeInited = false;
    isStuffsInited = false;
    isThreejsInited = false;
    isAddinOpened = false;     // 'isAddinOpened' = false when add-in just inserted, and true if PowerPoint presentation file opened with add-in

    // when Office has initalized, manually bootstrap the app
    // 'runReason' - see https://dev.office.com/reference/add-ins/shared/office.initialize
    Office.initialize = function (runReason)
    {
        console.log('>>> Office inited, reason[' + runReason + ']');
        isOfficeInited = true;

        // 'isAddinOpened' = false when add-in just inserted, and true if PowerPoint presentation file opened with add-in
        if (runReason === Office.InitializationReason.DocumentOpened)
        {
            isAddinOpened = true;
        }

        $(document).ready(function ()
        {
            ////////////////////////////////////////////////////////////////////////
            // Check whether angular alreay boostraped or not, (it may bootraped in HTML tag see 'index.html').
            // http://stackoverflow.com/questions/28392439/check-if-angularjs-module-is-bootstrapped
            var element = angular.element(document.querySelector('#container'));

            //This will be truthy if initialized and falsey otherwise.
            var isInitialized = element.injector();
            if (!isInitialized)
            {
                angular.bootstrap(document.getElementById('container'), ['officeAddin']);

                console.log('>>> Angular bootstrapped manually');
            }

            initOthers();
        });
    };

    function initOthers()
    {
        // If we already inited
        if (isStuffsInited)
        {
            return;
        }
        isStuffsInited = true;


        // Auto-ppen main dialog
        if (!isAddinOpened)
        {
            angular.element(document.getElementById('mainContainer')).scope().showMainDialog();
        }
    };


    // Run it here for works in Chrome in Apache server for debug only
    $(document).ready(function ()
    {
        // If we run in brouser, without Office - allow work with app in brouser too.
        initOthers();
    });

})();