//These assets are loaded before the Title screen
var assets_preload = {
  loaded: false,
  progress: 0,
  manifest: [
    { src: "media/sounds/snd_click.mp3", id: "snd_click" },
    { src: "media/sounds/snd_bonk.mp3", id: "snd_popup" },
    { src: "media/sounds/snd_click_2.mp3", id: "snd_click_2" }
  ],
};

//These assets are after Title screen
var assets_additional = {
  loaded: false,
  progress: 0,
  manifest: [
    { src: "media/sounds/snd_match.mp3", id: "snd_correct" },
    { src: "media/sounds/snd_wrong.mp3", id: "snd_wrong" },
    { src: "media/sounds/snd_select.mp3", id: "snd_select" }
  ],
};

//Threejs models and textures
var assets_threejs = {
  loaded: true,
  progress: 0,
  loadTime: 0,
  manifest: [],
};


function doSetMaterialOverrides(){
  let  material_overrides = {}

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
