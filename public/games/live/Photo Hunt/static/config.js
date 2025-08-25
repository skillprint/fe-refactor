
 oCONFIG = {
    game_id: "photohunt_1",

    language_file :"language/en-us.xml",
    puzzles_file: "puzzles/puzzles.xml",

    //debug helpers
    debug_trace: false,
    debug_stats: false,
    debug_panel: false,
    debug_quickstart: false,

    //format restrictions
    game_orientation: "either",
    game_ratio: {min:0.3, max: 2.5},

    support_checks: {webgl:true, canvas:true},

    min_dimensions:{"landscape":{"w":500,"h":420}, "portrait":{"w":0,"h":500}},

    levels: 12,
    seconds_on_clock: 30, //overridded by puzzles
    tilt_seconds: 1, 
    tilt_misses: 3

};

