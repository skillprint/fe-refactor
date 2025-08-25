
 oCONFIG = {
    game_id: "sumagi_2_r2",

    language_file :"language/en-us.xml",

    //debug helpers
    debug_trace: false,
    debug_stats: false,
    debug_panel: false,

    //format restrictions
    game_orientation: "either",
    game_ratio: {min:0.3, max: 2.5},

    support_checks: {webgl:false, canvas:true},
   
   min_dimensions:{"landscape":{"w":640,"h":400}, "portrait":{"w":400,"h":640}},
   
   second_on_clock: [30,45,60], //3,4,5...
    bonus_points_per_second: 1,
    rounds_per_difficulty_level: 5

};

