
 oCONFIG = {
    game_id: "sorting_1.2",

    language_file :"language/en-us.xml",

    //debug helpers
    debug_trace: false,
    debug_stats: false,
    debug_panel: false,
    debug_quickstart: false,

    //format restrictions
    game_orientation: "either",
    game_ratio: {min:0.3, max: 2.5},

    support_checks: {webgl:true, canvas:true},

     min_dimensions:{"landscape":{"w":640,"h":400}, "portrait":{"w":400,"h":640}},

    items: [
      {id:0, shape:0, color:0, name:"apple", use_shape_with:[1,2,3], use_color_with:[1,2,3]},
      {id:1, shape:1, color:1, name:"banana", use_shape_with:[0,2,3], use_color_with:[0,3]},
      {id:2, shape:2, color:2, name:"pear", use_shape_with:[0,1,3], use_color_with:[0,3]},
      {id:3, shape:3, color:3, name:"cherries", use_shape_with:[0,1,2], use_color_with:[0,1,2]},
      {id:4, shape:0, color:2, name:"apple_green", use_shape_with:[1,2,3], use_color_with:[0,3]},
      {id:5, shape:3, color:0, name:"cherries_red", use_shape_with:[0,1,2], use_color_with:[1,2,3]}
    ],
    seconds_on_clock: 30

};

