var __snds, __utils, BlitWindow, __localscaver, __input;
var GameManager, SceneManager, GameWorld, GameGUI;
var RaceGame, TriviaGame;
var ControlsPanel;
var update_cover;

var oVARS, oCONFIG, oUSER, oASSETS;

var SCENE;

var BACKGROUND, OVERLAY, SCREENS, MESSAGES, CONTROLS, FONTLOADER;
var GAME, GUI;

var oSTAGE = {};
var oASSETS = {};

//createjs
var stage;
var canvas_screens;
var comp, images, ss;

var update_queue = [];
var actives = [];
var active_stages = [];

var window_in_background = false;

var stats;
var loader;

var clock = new THREE.Clock(true);
var document_blurred = false;
var audio_music;

var music_playing = null;
let background_texture;
var date_msg;

var LOADER;

var seen_help = false;

var recipe_lookups = {};

var game_start_time = null;

//------------------------------------
// skillprint app proxy
//------------------------------------

function spLogEvent(o) {
  trace("logEvent()");
  trace(o);

  try {
    logEvent(o);
  } catch (e) {
    trace("logEvent Error");
  }
}

function spQuitApp() {
  trace("quitApp()");
  try {
    quitApp();
  } catch (e) {
    trace("quitApp Error");
  }
}

//------------------------------------
// init
//------------------------------------


function doInit(){  
  trace("doInit()");
  BlitLanguage.doLoadLanguage(oCONFIG.language_file, doPrep, null);
}

function doInit2() {
  trace("doInit2()");
  LOADER = new LoaderScreen();

  // debug panel
  if (window.Stats && oCONFIG.debug_stats) {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }

  //blit toolkit
  __utils = new BlitTools();
  __snds = new myNameSpace.BlitSounds();

  BlitWindow = new _BlitWindow();
  BlitFader = new _BlitFader({ div_name: "fader" });
  BlitSaver = new _BlitSaver({ game_key: oCONFIG.game_id });
  BlitInputs = new _BlitInputs({
    target: "wrapper",
    allowKeyDefaults: false,
    propagationLevel: 1,
  });

  //audio
  audio_music = document.getElementById("audio_music");
  update_cover = document.getElementById("cover");
  document.getElementById("canvas_popups").style.display = "none";

  //parse query string
  oVARS = __utils.getQueryString();

  //user
  oUSER = oVARS.reset == 1 ? {} : BlitSaver.doGetData("user");
  oUSER = oUSER || {};

  let user_template = {
    "game_id": oCONFIG.game_id,
    "name": "",
    "is_mute": false,
    "seen_help": false,
    "uuid": __utils.guid(),
  }

  var user_data_ok = true;

  for (i in user_template) {
    if (!oUSER.hasOwnProperty(i)) {
        user_data_ok = false;
        break;
    }
  }

  if(oUSER.game_id != oCONFIG.game_id){
      user_data_ok = false;
  }
  
  if (!user_data_ok) {
    oUSER = user_template;
    BlitSaver.doSaveData("user", oUSER);
  }

  doProcessLib();
}

//------------------------------------
// process animate files
//------------------------------------

function doProcessLib() {
  trace("doProcessLib()");

  comp = AdobeAn.getComposition("35A5558F002BB0439538A2940A14BBA4");

  var lib = comp.getLibrary();
  var manifest = lib.properties.manifest;

  //overright images found in lang file
  for (var i = 0; i < lib.properties.manifest.length; i++) {
    var id = lib.properties.manifest[i].id;
    if (oLANG_IMAGES[id]) {
      lib.properties.manifest[i].src = oLANG_IMAGES[id];
    }
  }
  handleComplete({}, comp);
}

function handleComplete(evt, comp) {
  lib = comp.getLibrary();
  images = comp.getImages();

  //begin
  BlitWindow.doInitFocusManager(doLoseFocus, doGetFocus);
  BlitWindow.doInitResizer(BlitWindow.doWindowResize);

  //init createjs
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", doFrameLoop);

  window.addEventListener("click", function () {
    window.focus();
  });

  doPreloadAssets();
}

var doPlayMusic = function (which) {
  if (which == null) {
    return;
  }

  music_playing = which;
  var start_music_loop = {};
  start_music_loop.track = which;
  start_music_loop.forget = false;
  start_music_loop.doUpdate = function () {
    if (createjs.Sound.activePlugin.context.state == "running") {
      __snds.playSound(this.track, "music", -1, 0.25);
      this.forget = true;
    } else {
      createjs.Sound.activePlugin.context.resume();
    }
  };
  actives.push(start_music_loop);
};

function doLoseFocus() {
  __snds.forceMute();
  window_in_background = true;
  GameWorld?.doPause();
}

function doReEnableSound() {
  createjs.Sound.activePlugin.context.resume();
  window.removeEventListener("touchstart", doReEnableSound);
  __snds.unforceMute();
  doPlayMusic(__snds.getNowPlaying("music"));

  if (!GameWorld) {
    __snds.unforceMute();
  } else if (!GameWorld.is_paused) {
    __snds.unforceMute();
  }
}

function doGetFocus() {
  window_in_background = false;
  doPlayMusic(music_playing);
  if (!GameWorld) {
    __snds.unforceMute();
  } else if (!GameWorld.is_paused) {
    __snds.unforceMute();
  }
}

//------------------------------------
// frame loop
//------------------------------------

function doFrameLoop(event) {

  if (stats) {
    stats.begin();
  }

  //update all actives
  for (var i = 0; i < actives.length; i++) {
    if (actives[i].purge || actives[i].forget) {
      actives.splice(i, 1);
    } else if (actives[i].doUpdate) {
      actives[i].doUpdate();
    } else {
      actives.splice(i, 1);
    }
  }

  //update active stages
  for (var i = 0; i < active_stages.length; i++) {
    if (active_stages[i].forget) {
      active_stages.splice(i, 1);
      continue;
    }
    __utils.doUpdateCreateJsStage(active_stages[i], event);
  }

  if (stats) {
    stats.end();
  }
}

//------------------------------------
// loaders
//------------------------------------

function doPreloadAssets() {

  FONTLOADER = new FontLoader();

  for (var i = 0; i < lib.properties.manifest.length; i++) {
    var ok = true;
    var asset_id = lib.properties.manifest[i].id;
    for (var ii = 0; ii < assets_additional.manifest.length; ii++) {
      if (asset_id == assets_additional.manifest[ii].id) {
        ok = false;
        break;
      }
    }
    if (ok) {
      assets_preload.manifest.push(lib.properties.manifest[i]);
    }
  }

  //add in and tutorial images
  for (var s in oLANG) {
    var o = oLANG[s];
    if (o.type == "instruction_mobile" && platform.isMobile) {
      assets_preload.manifest.push({ src: o.img, id: o.id });
    } else if (o.type == "instruction_desktop" && !platform.isMobile) {
      assets_preload.manifest.push({ src: o.img, id: o.id });
    }
  }

  //load all assets up front
  __utils.doLoadAssets(assets_preload);
  __utils.doLoad3dAssets(assets_threejs, oASSETS);

  var loader_obj = {};
  loader_obj.doUpdate = function () {
    var prog = (assets_preload.progress + assets_threejs.progress) / 2;
    trace(prog);

    LOADER.doUpdateBar(prog);
    if (assets_preload.loaded && assets_threejs.loaded) {
      this.forget = true;
      FONTLOADER.doDestroy();
      LOADER.doDestroy();
      doStart();
    }
  };
  actives.push(loader_obj);
}

//------------------------------------
// start
//------------------------------------

function doStart() {

  createjs.CSSPlugin.install();
  __snds.init();
  BlitWindow.doWindowResize();

  //process any spritesheets
  ss = comp.getSpriteSheet();
  var ssMetadata = lib.ssMetadata;
  for (i = 0; i < ssMetadata.length; i++) {
    ss[ssMetadata[i].name] = new createjs.SpriteSheet({
      images: [images[ssMetadata[i].name]],
      frames: ssMetadata[i].frames,
    });
  }

  ControlsPanel = new BlitControls("canvas_mute", {hide_fullscreen: true});

  if (typeof quitApp === "function") {
    AppQuit = new GlobalQuit("canvas_quit");
    oCONFIG.debug_trace = false;
  }


  GameManager = new SumagiGameManager();

  SceneManager = new TitleScene();
  setTimeout(doContinueLoadingAssest, 2000);
}

function doContinueLoadingAssest() {
  __utils.doLoadAssets(assets_additional);
}

//--------------------------------
// Finish loading
//--------------------------------

function doFinishLoading(callback) {
  if (
    assets_preload.loaded &&
    assets_additional.loaded &&
    assets_threejs.loaded
  ) {
    callback();
    return;
  }

  LOADER = new LoaderScreen();

  var loader_obj = {};
  loader_obj.frames_loaded = 0;
  loader_obj.doUpdate = function () {
    var prog = (assets_additional.progress + assets_threejs.progress) * 0.5;
    LOADER.doUpdateBar(prog);
    if (assets_additional.loaded && assets_threejs.loaded) {
      this.frames_loaded++;
      if (this.frames_loaded > 1) {
        this.forget = true;
        callback();
        LOADER.doDestroy();
      }
    }
  };
  actives.push(loader_obj);
}
