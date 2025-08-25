//These assets are loaded before the Title screen
var assets_preload = {
  loaded: false,
  progress: 0,
  manifest: [
    { src: "media/sounds/snd_click.mp3", id: "snd_click" },
    { src: "media/sounds/snd_bonk.mp3", id: "snd_popup" },
    {src:"media/sounds/music.mp3", data: {
      audioSprite: [
          {id:"music_title_loop", startTime:0, duration:16260},
          {id:"music_game_loop", startTime:16260, duration:40660}
      ]
    }},
  ],
};

//These assets are after Title screen
var assets_additional = {
  loaded: false,
  progress: 0,
  manifest: [
    { src: "media/sounds/snd_click_2.mp3", id: "snd_click_2" },
    { src: "media/sounds/out.mp3", id: "snd_bad" },
    { src: "media/sounds/timeup.mp3", id: "timeup" },
    { src: "media/sounds/wrong.mp3", id: "wrong" },
    { src: "media/sounds/correct_2.mp3", id: "correct"},
    { src: "media/sounds/winner.mp3", id: "winner"},
    { src: "media/sounds/timeup.mp3", id: "timeup"}
  ],
};

//Threejs models and textures
var assets_threejs = {
  loaded: true,
  progress: 1,
  loadTime: 0,
  manifest: [],
};



function doSetMaterialOverrides(){
  trace("doSetMaterialOverrides()");
  let  material_overrides = {
      "labels.png": {transparent:true, blending: THREE.FlatShading, side: THREE.FrontSide},
      "shadow.png": {transparent:true, opacity:0.3, blending: THREE.FlatShading, side: THREE.FrontSide}
   }

    for(var asset_name in oASSETS) {
      var asset = oASSETS[asset_name];
      if(!asset.traverse){continue;}
      asset.traverse(function(node){
          if(node instanceof THREE.Mesh){
            try{
                var map_name = node.material.map.name;
                if(material_overrides[map_name]){
              for(var s in material_overrides[map_name]) {
                switch(s){
                  case "minFilter":
                    node.material.map[s] = material_overrides[map_name][s];
                    break;
                  default:
                    node.material[s] = material_overrides[map_name][s];
                    break;
                }

                
              }
                }
            }catch(e){}
          }
      });
    }


}
