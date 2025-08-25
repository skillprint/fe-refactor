
 oCONFIG = {
    game_id: "stacks_v2",

    language_file :"language/en-us.xml",

    //debug helpers
    debug_trace: false,
    debug_stats: false,
    debug_panel: false,
    debug_quickstart: true,

    //format restrictions
    game_orientation: "either",
    game_ratio: {min:.3, max: 2.5},
    hide_fullscreen: true,

    levels: 8,

    support_checks: {webgl:true, canvas:true},

    disk_config: [
         [4,6,8],
         [3,5,7,9],
         [2,4,6,8,10],
         [1,3,5,7,9,11],
         [3,4,5,6,7,8,9],
         [3,4,5,6,7,8,9,10],
         [2,3,4,5,6,7,8,9,10],
         [2,3,4,5,6,7,8,9,10,11],
         [1,2,3,4,5,6,7,8,9,10,11]
      ]

};