    /*
      structure -> "node1.order, node1.X, node2.Y|node2.order, node2.X, node2.Y|...|?line1.sourceNode.order, line1.destinationNode.order, line1.direction|line1.sourceNode.order, line2.destinationNode.order, line2.direction|...|"
      to create your own levels you can use DD Node - level creator.capx file and paste the generated string here.
   */

 oCONFIG = {
   game_id: "coloring_pages_v1",
   level_template: {unlocked:false, plays:0, new_unlock:false, best:0},
   disable_sounds: true,
   user_template: {
      "game_id": "",
      "name": "",
      "is_mute": false,
      "seen_help": false,
      "uuid": 0,
      "progress":{},
      "thumbs":{},
      "colors":[],
      "color": {"r":255,"b":0,"g":0}
   },
  
    categories: [
      {"id":"animals", "pages":[
        {src:"media/puzzles/animal1.png"},
        {src:"media/puzzles/animal2.png"},
        {src:"media/puzzles/animal3.png"}
        ]},
      {"id":"arabic", "pages":[
        {src:"media/puzzles/arabic1.png"},
        {src:"media/puzzles/arabic2.png"},
        {src:"media/puzzles/arabic3.png"},
        {src:"media/puzzles/arabic4.png"},
        {src:"media/puzzles/arabic5.png"}
      ]},
      {"id":"florals", "pages":[
        {src:"media/puzzles/floral1.png"},
        {src:"media/puzzles/floral2.png"},
        {src:"media/puzzles/floral3.png"},
        {src:"media/puzzles/floral4.png"},
        {src:"media/puzzles/floral5.png"}
      ]},
      {"id":"gardens", "pages":[
        {src:"media/puzzles/garden1.png"},
        {src:"media/puzzles/garden2.png"},
        {src:"media/puzzles/garden3.png"},
        {src:"media/puzzles/garden4.png"}
      ]},
      {"id":"geometric", "pages":[
        {src:"media/puzzles/geometric1.png"},
        {src:"media/puzzles/geometric2.png"},
        {src:"media/puzzles/geometric3.png"},
        {src:"media/puzzles/geometric4.png"}
      ]},
      {"id":"mandalas", "pages":[
        {src:"media/puzzles/mandalas1.jpg"},
        {src:"media/puzzles/mandalas2.jpg"},
        {src:"media/puzzles/mandalas3.jpg"},
        {src:"media/puzzles/mandalas4.jpg"},
        {src:"media/puzzles/mandalas5.jpg"}
      ]},
      {"id":"oriental", "pages":[
        {src:"media/puzzles/oriental1.png"},
        {src:"media/puzzles/oriental2.png"},
        {src:"media/puzzles/oriental3.png"},
        {src:"media/puzzles/oriental4.png"},
        {src:"media/puzzles/oriental5.png"}
      ]}
    ],

    zoom_levels: [1.0, 1.5, 2.5, 4, 6],

   language_file :"language/en-us.xml",

   //debug helpers
   debug_trace: false,
   debug_stats: false,
   debug_panel: false,

   //format restrictions
   game_orientation: "either",
   game_ratio: {min:0.3, max: 2.5},

   support_checks: {webgl:false, canvas:true},
   min_area: (400 * 400)

};


