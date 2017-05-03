(function () {
    function Whencast() {

        var self = this;
        self.debug = false;
        self.options = {};
        self.items = []; // track all whencasts on page
        self.pageUrl = '';
        self.initialized = false;
        self.rendered = false;
        self.hostPageUrl = location.href;

        /* Responds to messages sent from the Whencast iframe          */
        /* Fires custom events that the containing page can respond to */
        self._messageListener = function (event) {
            self.log('=> _messageListener');
            var message = {};
            try {
                if (event.data.indexOf('action') > -1) {
                    message = JSON.parse(event.data);
                }
            } catch (e) {
                // Suppress error
            }

            if (message.action) {
                var frameElement = document.getElementById(message.id);
                if (frameElement === null) return;
                self.log('message: ' + message.id + ' - ' + message.action);
                switch (message.action) {
                    case 'FULLSCREEN':
                        self._toggleFullscreen(frameElement, 'wh-fullscreen', 'wh-embed wh-fullscreen');
                        break;
                    case 'OPENTAB':
                        window.open(frameElement.src);
                        break;
                    case 'OPEN_URL':
                        window.open(message.url);
                        break;
                    case 'AUTH_WINDOW':
                        window.open(message.url, 'AuthWindow', 'width=450, height=600');
                        break;
                    case 'HEIGHT':
                        var newHeight = parseInt(message.height) + 75;
                        frameElement.style.minHeight = newHeight + 'px';
                        break;
                    case 'WHENCAST_LOADED':
                        document.dispatchEvent(new CustomEvent('whenHub.loadJson', {
                            detail: message
                        }));
                        break;
                    case 'WHENCAST_STARTED':
                        document.dispatchEvent(new CustomEvent('whenHub.whencastStarted', {
                            detail: message
                        }));
                        break;
                    case 'WHENCAST_READY':
                        document.dispatchEvent(new CustomEvent('whenHub.whencastReady', {
                            detail: message
                        }));
                        break;
                    case 'SCHEDULE_UPDATED':
                        document.dispatchEvent(new CustomEvent('whenHub.scheduleUpdated', {
                            detail: message
                        }));
                        break;
                    case 'SCHEDULE_EVENT_EDIT':
                        document.dispatchEvent(new CustomEvent('whenHub.scheduleEventEdit', {
                            detail: message
                        }));
                        break;
                    case 'SCHEDULE_EVENT_FOCUS': //TODO: Wireup from player
                        document.dispatchEvent(new CustomEvent('whenHub.scheduleEventFocus', {
                            detail: message
                        }));
                        break;
                    case 'LOGIN_COMPLETED': //TODO: Wireup from player
                        break;
                    case 'SCHEDULE_LOADED':
                        document.dispatchEvent(new CustomEvent('whenHub.scheduleLoaded', {
                            detail: message
                        }));
                        break;
                    case 'GET_SCHEDULE_META_DATA':
                        document.dispatchEvent(new CustomEvent('whenHub.loadScheduleMetaData', {
                            detail: message
                        }));
                        /* Instantly fire the SCHEDULE_META_DATA response message in case parent page isn't listening for
                            event: whenHub.loadScheduleMetaData. Causes player to instantly start rendering.
                        */
                        document.getElementById(message.id).contentWindow.postMessage(JSON.stringify({
                            action: 'SCHEDULE_META_DATA',
                            data: false
                        }), '*');
                        break;
                }
            }
            self.log('<= _messageListener');

        };


        self.setIfMissing = function (items, key, defaultValue) {

            if (!items.hasOwnProperty(key)) {
                items[key] = defaultValue;
            }
        };


        // Called by render
        self._init = function () {

            self.log('=> _init');
            // Prevents running if script is called multiple times on page
            if (self.initialized) {
                self.log('Already initialized');
                return false;
            }

            /* Locate all script elements on the page with attribute rel="whenhub" */
            /* There should only be one...this one. Used to get host URL                */
            var scriptNode = document.querySelector('script[src="https://cdn.whenhub.com/v1/embed.js"]'); // Production scenario
            if (scriptNode === null) {
                scriptNode = document.querySelector('script[src$="AryanGold/scripts/embed.js"]'); // All other scenarios
                if (scriptNode === null) {
                    self.log('scriptNode test failed');
                    return false;
                }
            } // Can't continue if we can't locate self-reference (i.e. embed) script on page

            self.initialized = true;
            var scriptSrc = scriptNode.getAttribute('src');
            self.pageUrl = scriptSrc.replace('embed.js', 'player/player.html');
			// Jarikus add:
            self.pageUrl = 'https://cdn.whenhub.com/v1/player/player.html';

            self.log('pageUrl: ' + self.pageUrl);

            // Register message listeners
            if (window.addEventListener) {
                addEventListener("message", function (event) {
                    self._messageListener(event);
                }, false);
            } else {
                attachEvent("onmessage", function (event) {
                    self._messageListener(event);
                });
            }
            self.log('<= _init');
            return true;
        };

        // Called by _renderAll
        self.render = function (node, options) {
            self.log('=> render');
            // Property Precedence:   options > global object > attributes

            if (node !== null) {

                var elid = node.getAttribute('data-whencast');

                if ((typeof elid === 'string') && (elid !== '')) {

                    var allOptions = {};
                    allOptions['element-id'] = elid;

                    // elid could be a global object name containing property values
                    var idIsObject = (typeof elid !== 'undefined') && (elid !== null) && (typeof window[elid] === 'object') && (window[elid] !== null);

                    if (!self.initialized) {
                        if (!self._init()) {
                            return;
                        }
                    }

                    // Read in options passed through the "options" parameter
                    if ((typeof options === 'object') && (options !== null)) {
                        for (var o in options) {
                            if (options.hasOwnProperty(o)) {
                                allOptions[o.toLowerCase()] = options[o];
                            }
                        }
                    }

                    // If global object exists then add values not passed as parameters
                    if (idIsObject) {
                        var wcOptions = window[elid];
                        for (var w in wcOptions) {
                            if (wcOptions.hasOwnProperty(w)) {
                                var h = wcOptions[w];
                                if ((typeof h === 'string') || (typeof h === 'number') || (typeof h === 'boolean')) {
                                    var key = w.toLowerCase();
                                    if (!allOptions.hasOwnProperty(key)) {
                                        allOptions[key] = h;
                                    }
                                }
                            }
                        }
                    }

                    // Get all data parameters
                    [].forEach.call(node.attributes, function (attr) {
                        if (/^data-/.test(attr.name)) {
                            var lowerName = attr.name.replace('data-', '').toLowerCase();
                            if (lowerName !== 'whencast') {
                                // Don't override any values passed in "options" or in global object paramter
                                if (!allOptions.hasOwnProperty(lowerName)) {
                                    allOptions[lowerName] = attr.value;
                                }
                            }
                        }
                    });


                    allOptions['host-page-url'] = encodeURIComponent(self.hostPageUrl);
                    // Serialize options into querystring
                    var qs = '';
                    for (var o in allOptions) {
                        if (allOptions.hasOwnProperty(o)) {
                            qs += (qs === '' ? '?' : '&') + o + '=' + allOptions[o];
                        }
                    }

                    var iframe = document.createElement('iframe');
                    iframe.setAttribute('src', self.pageUrl + qs);
                    iframe.id = allOptions['element-id'];
                    iframe.setAttribute('class', 'whencast-player');
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.minHeight = "300px";
                    iframe.style.border = '0';
                    iframe.style.marginBottom = '0';
                    iframe.style.padding = '0';
                    iframe.style.display = 'block';
                    iframe.style.border = '1px solid #e7e7e7';
                    iframe.style.backgroundColor = '#fff';
                    iframe.setAttribute('allowFullscreen', 'true');
                    iframe.setAttribute('oallowfullscreen', 'true');
                    iframe.setAttribute('msallowfullscreen', 'true');
                    iframe.setAttribute('webkitAllowFullScreen', 'true');
                    iframe.setAttribute('mozallowfullscreen', 'true');


                    // Swap out placeholder DIV with IFRAME
                    var iframeHeight = node.clientHeight;
                    node.parentNode.replaceChild(iframe, node);

                    if (!/iPhone|iPod|Android|IEMobile|BlackBerry/.test(navigator.userAgent)) {
                        iframe.style.height = String(iframeHeight - 30) + 'px';
                    } else {
                        iframe.style.height = String(200 - 30) + 'px';
                    }

                    var linkback = document.createElement('a');
                    linkback.setAttribute('href', 'https://www.whenhub.com');
                    linkback.setAttribute('target', '_new');
                    linkback.setAttribute('class', 'whencast-link');
                    linkback.style.cursor = 'pointer';
                    linkback.style.textAlign = 'right';
                    linkback.style.fontSize = '12px';
                    linkback.style.display = 'block';
                    linkback.style.color = 'black';
                    linkback.style.padding = '3px';
                    linkback.style.textDecoration = 'underline';
                    linkback.innerText = 'Create your own Whencast';
                    iframe.parentNode.insertBefore(linkback, iframe.nextSibling);

                }
            }
            self.log('<= render');

        };

        /* Finds all DIV elements on the page with data-whencast attributes and renders an iframe inside that element */
        self.renderAll = function () {
			
            self.log('=> renderAll');
            /* We render only once no matter how many times renderAll is called */
            if (!self.rendered) {
                var placeholders = document.querySelectorAll('div[data-whencast]');
                for (var p = 0; p < placeholders.length; p++) {
                    var el = placeholders[p];
                    self.render(el, {});
                }
                self.rendered = true;
            }
            self.log('<= renderAll');
        };

        self.refresh = function (el) {
            try {
                // Reach deep in and reload
                el.querySelectorAll('iframe')[0].contentWindow.document.querySelectorAll('iframe')[0].contentWindow.location.reload();
            } catch (e) {}
        };

        self._toggleFullscreen = function (i) {


            if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {

                if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                    // exit full-screen
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                } else {
                    // go full-screen
                    if (i.requestFullscreen) {
                        i.requestFullscreen();
                    } else if (i.webkitRequestFullscreen) {
                        i.webkitRequestFullscreen();
                    } else if (i.mozRequestFullScreen) {
                        i.mozRequestFullScreen();
                    } else if (i.msRequestFullscreen) {
                        i.msRequestFullscreen();
                    }
                }
            }
        };

        self.log = function (m) {
            if (self.debug) {
                console.log(m);
            }
        }


    }

    if (!window.WHENCAST) {
        // TODO : Add refresh capability
        window.WHENCAST = new Whencast();
			
        // Initialize whencasts on page after DOM is ready
        //document.addEventListener('DOMContentLoaded', window.WHENCAST.renderAll);
        // Jarikus: run manually, because we load this sscript dynamically in AngularJS...
        window.WHENCAST.renderAll();
    }

})();