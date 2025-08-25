var GAME_NAME = "gummy_block";

var CANVAS_WIDTH = 1920;
var CANVAS_HEIGHT = 1920;

var EDGEBOARD_X = 0;
var EDGEBOARD_Y = 0;

var FONT = "bubblegumregular";
var ENABLE_FULLSCREEN;

var FPS      = 30;
var DISABLE_SOUND_MOBILE = false;

var STATE_LOADING = 0;
var STATE_MENU    = 1;
var STATE_MODE    = 2;
var STATE_GAME    = 3;

var ON_MOUSE_DOWN  = 0;
var ON_MOUSE_UP    = 1;
var ON_MOUSE_OVER  = 2;
var ON_MOUSE_OUT   = 3;
var ON_BUT_YES_DOWN  = 4;
var ON_BUT_NO_DOWN  = 5;
var ON_SELECT_PIECE = 6;
var ON_END_CELL_MOVE = 7;

var DIR_LEFT = 0;
var DIR_TOP = 1;
var DIR_RIGHT = 2;
var DIR_BOTTOM = 3;
var LABEL_EMPTY = -1;

var CUR_GRID_SCALE = 1;
var MAX_TABLE_HEIGHT = 1802;
var NUM_ROWS = 10;
var NUM_COLS = 10;
var CELL_WIDTH = 96;
var CELL_HEIGHT = 106;
var CELL_HEIGHT_FAKE = 98;
var CELL_X = 526;
var CELL_Y = 476;
var NUM_PIECES;
var PIECE_TO_PLACE = 3;
var NUM_TYPES = 9;
var Y_PIECE_ATTACH = CANVAS_HEIGHT - 300 ;
var SCALE_STARTING_PIECE = 0.7;
var NUM_HIT_AIR_STRIKE = 5;
var TIME_CHANGE_COLOR = 2000;
var OFFSET_PIECE_Y = 300;
var TIME_ALERT_ANIM = 5000;
var SOUNDTRACK_VOLUME_IN_GAME = 0.5;