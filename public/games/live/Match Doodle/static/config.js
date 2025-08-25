
 oCONFIG = {
    game_id: "matchdoodle_v1",
    level_template: {},
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

    doodles:[
      'item_01.png',
      'item_02.png',
      'item_03.png',
      'item_04.png',
      'item_05.png',
      'item_06.png',
      'item_07.png',
      'item_08.png',
      'item_09.png',
      'item_10.png',
      'item_11.png',
      'item_12.png',
      'item_13.png',
      'item_14.png',
      'item_15.png',
      'item_16.png',
      'item_17.png',
      'item_18.png',
      'item_19.png',
      'item_20.png',
      'item_21.png',
      'item_22.png',
      'item_23.png',
      'item_24.png',
      'item_25.png',
      'item_26.png',
      'item_27.png',
      'item_28.png',
      'item_29.png',
      'item_30.png',
      'item_31.png',
      'item_32.png',
      'item_33.png',
      'item_34.png',
      'item_35.png',
      'item_36.png',
      'item_37.png',
      'item_38.png',
      'item_39.png',
      'item_40.png'
    ],
    levels:[
      {pairs: 5},
      {pairs: 10},
      {pairs: 15},
      {pairs: 20},
      {pairs: 25},
      {pairs: 30},
      {pairs: 35},
      {pairs: 40}
    ]

};

