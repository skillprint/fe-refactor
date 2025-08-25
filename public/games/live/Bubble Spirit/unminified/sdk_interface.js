/*
	SETTINGS
 */
const SDK_INTERFACE_SETTINGS = {

	isProd: true,
	debugLevel: 0,
	forceMockObject: true,

	// ads
	interstitial: {
		enabled: false, // enable/disable interstitial ads
		initial: true, // show initial ad
		preload: 250, // preload interval in ms
		retry: 2000, // timeout before retry after preload fail
		timout: 250, // timout before calling showRewarded()
		cooldown: 90, // time between ads
	},
	rewarded: {
		enabled: false, // enable/disable rewarded ads
		preload: 250, // preload interval in ms
		retry: 2000, // timeout before retry after preload fail
		timout: 250, // timout before calling showRewarded()
		reward: true // reward when in doubt
	},

	// files to load
	externalFiles: [],

	// features
	features: {
		auto_quality: false,
		copyright: false,
		credits: false,
		external_achievements: false,
		external_leaderboard: false,
		external_mute: false,
		external_pause: false,
		external_start: false,
		forced_mode: false,
		leaderboard: false,
		multiplayer: false,
		multiplayer_local: true,
		skip_title: false,
		skip_tutorial: false
	},

	// forced mode
	forced_mode: {

	},

	// misc
	aid: "A1234-5", // affiliate id
	name: "Famobi", // name of partner/customer
	branding_url: "",
	branding_image: "logo", // "logo" = transparent
	show_splash: false,
	menuless: true
};

const SDK_INTERFACE_OVERRIDES = {
	famobi: {

		/*
		getCurrentLanguage: function() {
			return "en";
		},
		*/

		/*
		setPreloadProgress: function(progress) {

		},
		*/

		/*
		gameReady: function() {

		},

		playerReady: function(progress) {

		},
		*/
	},
	famobi_analytics: {
		trackEvent: function(event, params) {

			return new Promise(function(resolve, reject) {
				switch(event) {

					/*
					case "EVENT_LEVELFAIL":
						if(params.reason !== "quit") {
							window.famobi.showAd(function() {

							})
						}
						break;
					*/

					default:
						// nothing to do
				}
				return resolve(event, params);
			});
		}
	}
}

const SDK_INTERFACE_PRELOAD_AD = function(type) {

	return new Promise(function(resolve, reject) {

		// DO YOUR MAGIC HERE!
		resolve(); // or reject()

	});
};

const SDK_INTERFACE_SHOW_AD = function() {

	return new Promise(function(resolve, reject) {

		// DO YOUR MAGIC HERE!
		alert("This is an ad!");
		resolve(); // or reject()

	});
};

const SDK_INTERFACE_REWARDED_AD = function() {

	return new Promise(function(resolve, reject) {

		// DO YOUR MAGIC HERE!
		if(confirm("Rewarded ad ended. Should a reward be granted?")) {
        	return resolve(true);
        } else {
        	return resolve(false);
        }
        // reject();
	});
};

const SDK_INTERFACE_MOCK_OBJECT = function() {
	return new Promise(function(resolve, reject) {

		// DO YOUR MAGIC HERE!
		resolve();
	});
};

const SDK_INTERFACE_INIT = function() {
	return new Promise(function(resolve, reject) {

		// DO YOUR MAGIC HERE!
		resolve();
	});
};

SDK_INTERFACE.init(SDK_INTERFACE_SETTINGS);
