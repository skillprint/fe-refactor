
 oCONFIG = {
    game_id: "sweet_memory",
    level_template: {unlocked:false, plays:0, new_unlock:false, best:0},
    user_template: {
        "game_id": "",
        "name": "",
        "is_mute": false,
        "seen_help": false,
        "seen_complete": false,
        "uuid": 0,
        "progress": []
     },

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

    min_dimensions:{"landscape":{"w":500,"h":420}, "portrait":{"w":0,"h":500}},

    points_per_match: 10,
    bonus_points_per_second: 2,
    levels:[
      {pairs: 2, time:30},
      {pairs: 4, time:60},
      {pairs: 6, time:90},
      {pairs: 8, time:120},
      {pairs: 10, time:150},
      {pairs: 12, time:180}
    ]

};

