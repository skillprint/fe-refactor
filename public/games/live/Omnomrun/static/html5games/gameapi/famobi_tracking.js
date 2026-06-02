if (typeof window !== "undefined" && !window.famobi_tracking) {
    !function(a, b) {

        var tracking = {
            game: '',
            uidStorageId: 'trackingUid',
            uid: null,
            initializedUser: false,
            debug: false,
            version: 0,
            queue: [],
            currentPromise: Promise.resolve(),
            runDry: false
        };

        var EVENTS = {
            'LEVEL_START'	: 'event/level/start',
            'LEVEL_END'		: 'event/level/end',
            'LEVEL_UPDATE'	: 'event/level/update',
            'PING'          : 'event/ping',
            'AD'			: 'event/ad'
        }

        var EVENT_PARAMS = {
            'level':			'number', 	// The current level number
            'score':			'number', 	// Scores
            'stars':			'number', 	// Earned stars
            'movesAvailable':	'number', 	// Total number of available moves
            'movesLeft':		'number', 	// Moves left when the user finishes the level
            'success':			'boolean', 	// User has successfully solved the level
            'revives':			'number', 	// Number of ressurrections
            'powerups':			'object', 	// Powerups used in the level
            'jumpStarters':		'object', 	// Initial starting power ups used
            'data':				'object'	// Custom json object
        }

        function log() {
            if (tracking.debug)
                console.log.apply(this, arguments);
        }

        function initUser(preferredUid) {

            return Promise.resolve();
        }

            var storage = window.hasOwnProperty('famobi') ? window.famobi.localStorage : window.localStorage;
            var storedUid = storage.getItem(tracking.uidStorageId);

            if (storedUid !== null && storedUid !== undefined
            && storedUid !== 'null' && storedUid !== 'undefined') {

                log('tracking init - user id retrieved from storage', storedUid);
                return Promise.resolve(storedUid);

            } else {

                if(tracking.runDry) {

                }

                log('tracking init - no uid found in storage, requesting new user');

                return new Promise(function(resolve, reject) {

                    var xhttp = new XMLHttpRequest();

                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {

                            log('tracking init - response', this.response);

                            var data = JSON.parse(this.response).data;
                            splitTests = data.splitTests;
                            storage.setItem(tracking.uidStorageId, data.uid);

                            log('tracking initialized - new user id received', data.uid);

                            resolve(data.uid);
                        }
                    };

                    xhttp.addEventListener('error', function(e) {
                        log('tracking init - failed', e);
                        reject();
                    });

                    xhttp.open('POST', tracking.endpointUrl + 'event/user', true);
                    xhttp.setRequestHeader('Content-type', 'application/json');
                    xhttp.setRequestHeader('X-Version', tracking.version);
                    xhttp.setRequestHeader('X-Game', tracking.game);

                    if (preferredUid && (typeof preferredUid == 'string' && preferredUid.length > 0 || typeof preferredUid == 'number' && preferredUid > 0)) {
                        xhttp.setRequestHeader('X-User', preferredUid);
                    }

                    var data = {
                        'locale':(navigator.languages && navigator.languages.length)
                        ? navigator.languages[0]
                        : navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en'
                    };

                    xhttp.send(JSON.stringify(data));
                });
            }
        };

        function init(game, preferredUid, clientVersion, debug, trackAds, runDry) {

            if (debug) {
                tracking.debug = true;
                log('tracking init called');
            }

            if(!window.famobi.hasFeature("tracking") || runDry === true) {
                tracking.runDry = true;
            }

            if (tracking.initializedUser) {
                log('tracking init cancelled - already initialized');
                return;
            }

             if (typeof game === 'string' && game.length > 0) {
                tracking.game = game;
            } else {
                log('tracking init - game rejected, has to be valid string');
                return;
            }

            if (Number.isInteger(clientVersion)) {
                tracking.version = clientVersion;
            } else {
                log('tracking init - clientVersion rejected, has to be integer');
            }

            if (trackAds !== false && window.hasOwnProperty('famobi') && window.famobi.hasOwnProperty('adapters')) {
                window.famobi.adapters.add('ads', 'callback', trackingAdCallback);
            }

            initUser(preferredUid).then(function(id) {
                tracking.uid = id;
                tracking.initializedUser = true;
                processQueue();
            });

        };

        function trackingAdCallback(result) {

            log('adCallback event ', result);

			if ( result.adType != "rewarded" || result.rewardGranted == true ) {
				var _data = {
					'adType': result.adType,
					'fill': result.adDidLoad,
					'blocked': window.google == undefined
				};

				trackEvent('AD', _data);
			}
        }

        function trackEvent(event, data) {

            if (event in EVENTS)	{
                event = EVENTS[event];
            }

            log('queuing event', event, 'with data', data);

            if (typeof event !== 'string' || typeof data !== 'object' || data === null) {
                log('tracking event cancelled - wrong/missing parameters', 'event', event, 'data', data);
                return;
            }

            tracking.queue.push({'event': event, 'data': data});

            if (tracking.initializedUser)
                processQueue();
        }

        function sendRequest(event, data) {

            log('tracking event', event, 'with data', data);

            if(tracking.runDry) {
                return Promise.resolve();
            }

            return new Promise(function(resolve, reject) {
                var xhttp = new XMLHttpRequest();

                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4) {
                        resolve();
                    }
                };

                xhttp.addEventListener('error', function(e) {
                    log('tracking send request failed -', e);
                    reject();
                });

                setTimeout(reject, 10000);

                xhttp.open('POST', tracking.endpointUrl + event, true);
                xhttp.setRequestHeader('Content-type', 'application/json');
                xhttp.setRequestHeader('X-Game', tracking.game);
                xhttp.setRequestHeader('X-Version', tracking.version);
                xhttp.setRequestHeader('X-User', tracking.uid);
                xhttp.send(JSON.stringify(data));
            });

        }

        function processQueue() {
            console.log("sending data?");
            tracking.queue.forEach(function(queuedEvent) {
                tracking.currentPromise = tracking.currentPromise.then(function() {
                    return sendRequest(queuedEvent.event, queuedEvent.data)
                }, function() {
                    return sendRequest(queuedEvent.event, queuedEvent.data)
                });
            });
            tracking.queue = [];
        }

        b[a] = {
            'EVENTS': EVENTS,
            'trackEvent': trackEvent,
            'init': init
        }

    }('famobi_tracking', window);
}
