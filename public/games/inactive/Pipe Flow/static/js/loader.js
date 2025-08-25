////////////////////////////////////////////////////////////
// CANVAS LOADER
////////////////////////////////////////////////////////////

 /*!
 * 
 * START CANVAS PRELOADER - This is the function that runs to preload canvas asserts
 * 
 */
function initPreload(){
	toggleLoader(true);
	
	checkMobileEvent();
	
	$(window).resize(function(){
		resizeGameFunc();
	});
	resizeGameFunc();
	
	loader = new createjs.LoadQueue(false);
	manifest=[
			{src:'assets/background.png', id:'background'},
			{src:'assets/logo.png', id:'logo'},
			{src:'assets/button_start.png', id:'buttonStart'},
			
			{src:'assets/item_logo.png', id:'itemLogo'},
			
			{src:'assets/item_select.png', id:'itemSelect'},
			{src:'assets/button_prev.png', id:'buttonPrev'},
			{src:'assets/button_next.png', id:'buttonNext'},
			{src:'assets/icon_lock.png', id:'iconLevelLock'},
			{src:'assets/icon_level.png', id:'iconLevel'},
			
			{src:'assets/item_timer_bg.png', id:'itemTimerBg'},
			{src:'assets/item_complete_bg.png', id:'itemCompleteBg'},
			{src:'assets/button_retry.png', id:'buttonRetry'},
			
			{src:'assets/button_confirm.png', id:'buttonConfirm'},
			{src:'assets/button_cancel.png', id:'buttonCancel'},
			{src:'assets/item_exit.png', id:'itemExit'},
			
			{src:'assets/item_result.png', id:'itemResult'},
			{src:'assets/button_facebook.png', id:'buttonFacebook'},
			{src:'assets/button_twitter.png', id:'buttonTwitter'},
			{src:'assets/button_whatsapp.png', id:'buttonWhatsapp'},
			{src:'assets/button_nextlevel.png', id:'buttonNextLevel'},
			{src:'assets/button_quitgame.png', id:'buttonQuitGame'},
			{src:'assets/button_fullscreen.png', id:'buttonFullscreen'},
			{src:'assets/button_sound_on.png', id:'buttonSoundOn'},
			{src:'assets/button_sound_off.png', id:'buttonSoundOff'},
			{src:'assets/button_exit.png', id:'buttonExit'},
			{src:'assets/button_settings.png', id:'buttonSettings'}];
			
	for(var n=0; n<pipeColors.length; n++){
		manifest.push({src:pipeColors[n].assets[0], id:'pipeHole'+n});
		manifest.push({src:pipeColors[n].assets[1], id:'pipeConnect'+n});
		manifest.push({src:pipeColors[n].assets[2], id:'pipeStraight'+n});
		manifest.push({src:pipeColors[n].assets[3], id:'pipeCorner'+n});
		manifest.push({src:pipeColors[n].assets[4], id:'pipeDivide'+n});
		manifest.push({src:pipeColors[n].assets[5], id:'pipeConnecting'+n});
	}
	
	soundOn = true;
	if($.browser.mobile || isTablet){
		if(!enableMobileSound){
			soundOn=false;
		}
	}
	
	if(soundOn){
		manifest.push({src:'assets/sounds/music_main.ogg', id:'musicMain'});
		manifest.push({src:'assets/sounds/music_game.ogg', id:'musicGame'});
		manifest.push({src:'assets/sounds/button.ogg', id:'soundClick'});
		manifest.push({src:'assets/sounds/result.ogg', id:'soundResult'});
		manifest.push({src:'assets/sounds/complete.ogg', id:'soundComplete'});
		manifest.push({src:'assets/sounds/pipe_01.ogg', id:'soundPipe1'});
		manifest.push({src:'assets/sounds/pipe_02.ogg', id:'soundPipe2'});
		manifest.push({src:'assets/sounds/pipe_03.ogg', id:'soundPipe3'});
		manifest.push({src:'assets/sounds/water_01.ogg', id:'soundWater1'});
		manifest.push({src:'assets/sounds/water_02.ogg', id:'soundWater2'});
		manifest.push({src:'assets/sounds/water_03.ogg', id:'soundWater3'});
		manifest.push({src:'assets/sounds/water_04.ogg', id:'soundWater4'});
		
		createjs.Sound.alternateExtensions = ["mp3"];
		loader.installPlugin(createjs.Sound);
	}
	
	loader.addEventListener("complete", handleComplete);
	loader.addEventListener("fileload", fileComplete);
	loader.addEventListener("error",handleFileError);
	loader.on("progress", handleProgress, this);
	loader.loadManifest(manifest);
}

/*!
 * 
 * CANVAS FILE COMPLETE EVENT - This is the function that runs to update when file loaded complete
 * 
 */
function fileComplete(evt) {
	var item = evt.item;
	//console.log("Event Callback file loaded ", evt.item.id);
}

/*!
 * 
 * CANVAS FILE HANDLE EVENT - This is the function that runs to handle file error
 * 
 */
function handleFileError(evt) {
	console.log("error ", evt);
}

/*!
 * 
 * CANVAS PRELOADER UPDATE - This is the function that runs to update preloder progress
 * 
 */
function handleProgress() {
	$('#mainLoader span').html('LOADING '+Math.round(loader.progress/1*100));
}

/*!
 * 
 * CANVAS PRELOADER COMPLETE - This is the function that runs when preloader is complete
 * 
 */
function handleComplete() {
	toggleLoader(false);
	initMain();
};

/*!
 * 
 * TOGGLE LOADER - This is the function that runs to display/hide loader
 * 
 */
function toggleLoader(con){
	if(con){
		$('#mainLoader').show();
	}else{
		$('#mainLoader').hide();
	}
}