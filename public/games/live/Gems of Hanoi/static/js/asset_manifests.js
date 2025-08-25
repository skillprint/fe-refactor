
//These assets are loaded before the Title screen
var assets_preload = {
	loaded: false,
	progress: 0,
	manifest: [
		{src:"media/fonts/Roboto-Regular.woff", id:"RobotoRegular"},
    {src:"media/fonts/Roboto-Bold.woff", id:"RobotoBold"},
		{src:"media/sounds/snd_click.mp3", id:"snd_click"},
		{src:"media/sounds/snd_bonk.mp3", id:"snd_popup"}
		]
};


//These assets are after Title screen
var assets_additional = {
	loaded: false,
	progress: 0,
	manifest: [
		{src:"media/sounds/snd_click_2.mp3", id:"snd_click_2"},
		{src:"media/sounds/out.mp3", id:"snd_bad"},
		{src:"media/sounds/snd_game_complete.mp3", id:"snd_game_complete"},
		{src:"media/sounds/win.mp3", id:"snd_good"}
	]
};

//Threejs models and textures
var assets_threejs = {
  loaded: false,
  progress: 0,
  loadTime: 0,
  manifest: [
		{src:"media/images/background.jpg", name:"background", type:"texture"},
		{src:"media/images/black.png", name:"black_fader", type:"texture"},
		{src:"media/models/stack.fbx", type:"static_fbx", id:"stacks", flat_shading:true, vertexColors:false}
  ]
};