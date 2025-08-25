////////////////////////////////////////////////////////////
// ADS
////////////////////////////////////////////////////////////
var adsData = {callback:null, param:null};

 /*!
 * 
 * DOCUMENT READY
 * 
 */
$(function() {
	 initAds();
	 resizeAds();
	 
	 $(window).resize(function(){
		resizeAds();
	 });
});

/*!
 * 
 * ADS PLACEHOLDER - This is the function that runs to insert ads placeholder and events
 * 
 */
function toggleGameAds(con, callback, param){
	switch(con){
		case 'play':
			if ($.isFunction(window[callback])) {
				adsData.callback = callback;
				adsData.param = param;
			}else{
				adsData.callback = null;
				adsData.param = null;
			}
			$('#adHolder').fadeIn();
		break;
		
		case 'stop':
			if ($.isFunction(window[adsData.callback])) {
				window[adsData.callback](adsData.param);
				adsData.callback = null;
				adsData.param = null;
			}
			$('#adHolder').fadeOut();
		break;
	}
}

function resizeAds(){
	setTimeout(function() {
		$('#adHolder').css('width', $('canvas').css('width'));
		$('#adHolder').css('height', $('canvas').css('height'));
		
		$('#adHolder').css('left', (offset.left/2));
		$('#adHolder').css('top', (offset.top/2));
	}, 200);
}


/*!
 * 
 * START INSERT ADS BELOW - This is the function that runs to display your ads
 * 
 */

function initAds(){
	
	
	$('#adClose').off().on('click', function(e) {
		toggleGameAds('stop');
	});	
}