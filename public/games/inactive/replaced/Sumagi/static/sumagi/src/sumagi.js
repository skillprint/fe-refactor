///////////////////////////////////////////////////////////
//
//  Sumagi
//  HTML5 puzzle/educational game.
//
//  (c) 2014 Danijel Durakovic
//
///////////////////////////////////////////////////////////

var sumagi = (function (self) {

	///////////////////////////////////////////////////////////
	//
	//  Common functions and routines.
	//
	///////////////////////////////////////////////////////////

	self.common = {
		getExtension: function (filename) {
			return filename.split('.').pop().toLowerCase();
		},
		iterate: function (collection, callback) {
			for (var key in collection) {
				var item = collection[key];
				if (collection.hasOwnProperty(key) && !(item instanceof Function))
					callback(key, item);
			}
		},
		pointInRect: function (x, y, rx, ry, rw, rh) {
			return (x >= rx && x < rx + rw && y >= ry && y < ry + rh);
		},
		getRandomInt: function (a, b) {
			return Math.floor(Math.random() * (b - a + 1)) + a;
		},
		shuffle: function (list) {
			if (!(list instanceof Array))
				return;
			var i = list.length;
			while (i--) {
				var r = Math.floor(Math.random() * (i + 1));
				var tmp = list[r];
				list[r] = list[i];
				list[i] = tmp;
			}
		},
		createTransition: function (start, end, duration, update, finished, easing) {
			if (duration <= 0 || end <= start) return;
			if (easing === undefined) easing = 'linear';
			var delay = 5;
			var EasingFunc = function () {
				switch (easing) {
					case 'linear':
						return function (elapsed) {
							return start + (end - start) * (elapsed / duration);
						};
					case 'quadin':
						return function (elapsed) {
							return end * (elapsed /= duration) * elapsed + start;
						};
					case 'quadout':
						return function (elapsed) {
							return -end * (elapsed /= duration) * (elapsed - 2) + start;
						};
					case 'quadinout':
						return function (elapsed) {
							if (1 > (elapsed /= duration / 2))
								return end / 2 * Math.pow(elapsed, 2) + start;
							return -end / 2 * ((--elapsed) * (elapsed - 2) - 1) + start;
						};
				}
			}();
			(function DoTransition(elapsed) {
				var progress = elapsed / duration;
				var value = Math.floor(EasingFunc(elapsed));
				if (update instanceof Function)
					update(value);
				if (progress < 1) {
					setTimeout(function () {
						DoTransition(elapsed + delay);
					}, delay);
				} else if (finished instanceof Function)
					finished();
			}(0));
		}
	};

	return self;
}(sumagi || {}));

var sumagi = (function (self) {

	///////////////////////////////////////////////////////////
	//
	//  Definitions.
	//
	///////////////////////////////////////////////////////////

	self.meta = {
		// game assets
		assets: {
			// configuration
			config: {
				cfg_user: 'conf/user.json',
				cfg_colors: 'conf/colors.json'
			},
			// loadscreen graphics
			primary: {
				gfx_title: 'gfx/title.png',
				gfx_progress: 'gfx/progress.png'
			},
			// game graphics
			graphics: {
				gfx_menubg: 'gfx/menubg.png',
				gfx_menulabels: 'gfx/menulabels.png',
				gfx_sliderbg: 'gfx/sliderbg.png',
				gfx_sliderthumb: 'gfx/sliderthumb.png',
				gfx_playbutton: 'gfx/playbutton.png',
				gfx_goalbar: 'gfx/goalbar.png',
				gfx_statusbar: 'gfx/statusbar.png',
				gfx_xbutton: 'gfx/xbutton.png',
				gfx_victorylabel: 'gfx/victorylabel.png'
			}
		},
		// game options
		options: {
			difficulties: [
				['baby', 10, 20], // name, min, max
				['easy', 20, 40],
				['medium', 40, 80],
				['difficult', 80, 160],
				['hard', 160, 320],
				['professor', 320, 640],
				['master', 640, 1280]
			],
			boards: [
				['3 x 3', 3] // name, dimension
			]
			/*boards: [
				['3 x 3', 3], // name, dimension
				['4 x 4', 4],
				['5 x 5', 5],
				['6 x 6', 6],
				['7 x 7', 7],
				['8 x 8', 8],
				['9 x 9', 9],
				['10 x 10', 10],
			]*/
		},
		// default color config
		// used in case of missing config file
		defaultColors: {
			background: "#676d6a",
			menu_text: "#bbb",
			menu_text2: "#eee",
			piece_solved: "#4c4",
			piece_tagged: "#ecefbf",
			piece_normal: "#888c8a",
			piece_text_solved: "#feffea",
			piece_text_tagged: "#000",
			piece_text_normal: "#fff",
			piece_shadow: "#555",
			gridlines: "#666a68",
			goal_text_sigma: "#999",
			goal_text_sum: "#fff",
			status_text: "#ccc"
		}
	};

	return self;
}(sumagi || {}));

var sumagi = (function (self) {

	///////////////////////////////////////////////////////////
	//
	//  Asset loader.
	//
	///////////////////////////////////////////////////////////

	self.assets = (function () {
		// compiled (post-load) list of assets
		var loadedAssets = {};
		var path = '';
		// supported formats
		var formats = {
			image: ['png', 'jpg', 'jpeg'],
			data: ['json', 'conf']
		};

		return {
			setPath: function (p) {
				path = p;
			},
			load: function (assetLists, finished, progress) {
				// load the asset lists and store them for later use
				assetLists = (assetLists instanceof Array) ?
					assetLists : [assetLists];
				var nAssetLists = assetLists.length;
				var itemsLoaded = 0;
				var itemsToLoad = 0;
				for (var i = 0; i < nAssetLists; i++) {
					self.common.iterate(assetLists[i], function (key, asset) {
						itemsToLoad++;
					});
				}
				for (var i = 0; i < nAssetLists; i++) {
					self.common.iterate(assetLists[i], function (key, asset) {
						var ext = self.common.getExtension(asset);
						var filename = path + asset;
						if (formats.image.indexOf(ext) > -1) {
							var loadImage = loadedAssets[key] = new Image();
							loadImage.src = filename;
							loadImage.addEventListener('load', advance, false);
						} else if (formats.data.indexOf(ext) > -1) {
							var xhr = new XMLHttpRequest();
							xhr.open('get', filename, true);
							xhr.send(null);
							xhr.onreadystatechange = function () {
								if (xhr.readyState === 4 && xhr.status === 200) {
									var data;
									var response = xhr.responseText;
									try { // try to parse json
										data = JSON.parse(response);
									} catch (e) {
										// if unsuccessful, treat it as plain data
										data = response;
									} finally {
										loadedAssets[key] = data;
										advance();
									}
								}
							};
						}
					});
				}
				// advance load progress
				function advance() {
					itemsLoaded++;
					if (progress instanceof Function)
						progress(itemsLoaded, itemsToLoad);
					if (itemsLoaded === itemsToLoad && finished instanceof Function)
						finished();
				}
			},
			get: function (key) {
				// retreive specific asset
				return loadedAssets[key];
			},
			inflate: function (object, assetList) {
				// inflate object with assets
				var nassets = assetList.length;
				for (var i = 0; i < nassets; i++) {
					var assetKey = assetList[i];
					var item = assetKey.split('_')[1];
					object[item] = loadedAssets[assetKey];
				}
			}
		};
	}());

	return self;
}(sumagi || {}));

var sumagi = (function (self) {

	///////////////////////////////////////////////////////////
	//
	//  HTML5 drawing routines wrapper module.
	//
	///////////////////////////////////////////////////////////

	self.draw = (function () {
		// render context
		var ctx;

		return {
			setContext: function (c) {
				ctx = c;
			},
			// alpha handling
			setAlpha: function (alpha) {
				if (alpha === undefined)
					alpha = 1.0;
				else
					alpha = Math.min(1, Math.max(0, alpha));
				ctx.globalAlpha = alpha;
			},
			useAlpha: function (alpha, drawcalls) {
				this.setAlpha(alpha);
				drawcalls();
				this.setAlpha();
			},
			// primitives
			rect: function (x, y, w, h, strokeStyle, lineWidth) {
				if (strokeStyle === undefined)
					strokeStyle = '#fff';
				if (lineWidth === undefined)
					lineWidth = 1;
				ctx.strokeStyle = strokeStyle;
				ctx.lineWidth = lineWidth;
				ctx.strokeRect(x, y, w, h);
			},
			rectFill: function (x, y, w, h, fillStyle) {
				if (fillStyle === undefined)
					fillStyle = '#fff';
				ctx.fillStyle = fillStyle;
				ctx.fillRect(x, y, w, h);
			},
			circle: function (x, y, r, strokeStyle, lineWidth) {
				if (strokeStyle === undefined)
					strokeStyle = '#fff';
				if (lineWidth === undefined)
					lineWidth = 1;
				ctx.strokeStyle = strokeStyle;
				ctx.lineWidth = lineWidth;
				ctx.arc(x, y, r, 0, Math.PI * 2);
				ctx.stroke();
			},
			circleFill: function (x, y, r, fillStyle) {
				if (fillStyle === undefined)
					fillStyle = '#fff';
				ctx.fillStyle = fillStyle;
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2);
				ctx.fill();
				ctx.closePath();
			},
			// graphics
			image: function (gfx, x, y, w, h) {
				if (w !== undefined && h !== undefined)
					ctx.drawImage(gfx, x, y, w, h);
				else
					ctx.drawImage(gfx, x, y);
			},
			tile: function (gfx, x, y, w, h, sx, sy) {
				ctx.drawImage(gfx, sx, sy, w, h, x, y, w, h);
			},
			// textual output
			text: function (text, x, y, fillStyle, textAlign, font) {
				if (fillStyle === undefined)
					fillStyle = '#fff';
				if (textAlign === undefined)
					textAlign = 'left';
				if (font === undefined)
					font = '12px sans-serif';
				ctx.textBaseline = 'top';
				ctx.fillStyle = fillStyle;
				ctx.textAlign = textAlign;
				ctx.font = font;
				ctx.fillText(text, x, y);
			},
			// game text
			gameText: function () {}
		};
	}());

	return self;
}(sumagi || {}));

var sumagi = (function (self) {

	///////////////////////////////////////////////////////////
	//
	//  User input handling.
	//
	///////////////////////////////////////////////////////////

	self.input = (function () {
		// reference to element capturing the input
		var element;

		// input agent constants
		var MOUSE = 0;
		var TOUCH = 1;

		// fixed ratio flag
		var fixedRatio = true;

		function translateCoords(e, agent) {
			// translate event coordinates to local coordinates
			var ratio = (fixedRatio) ? 1 : Math.max(
				element.width / window.innerWidth,
				element.height / window.innerHeight
			);
			var bounds = element.getBoundingClientRect();
			var px = (agent === TOUCH) ?
				e.changedTouches[0].clientX :
				e.clientX;
			var py = (agent === TOUCH) ?
				e.changedTouches[0].clientY :
				e.clientY;
			return {
				x: ratio * (px - bounds.left),
				y: ratio * (py - bounds.top)
			};
		}

		// event dispatch lists
		var _cbpress = [],
			_cbmove = [],
			_cbrelease = [];

		// event triggers
		function pressEvent(e, agent) {
			if (e.preventDefault) e.preventDefault();
			if (agent === MOUSE) {
				var button = e.which || e.button;
				if (button !== 1)
					return;
			}
			var coords = translateCoords(e, agent);
			for (var i = 0; i < _cbpress.length; i++)
				_cbpress[i][0](coords);
		}

		function moveEvent(e, agent) {
			if (e.preventDefault) e.preventDefault();
			var coords = translateCoords(e, agent);
			for (var i = 0; i < _cbmove.length; i++)
				_cbmove[i][0](coords);
		}

		function releaseEvent(e, agent) {
			if (e.preventDefault) e.preventDefault();
			if (agent === MOUSE) {
				var button = e.which || e.button;
				if (button !== 1)
					return;
			}
			var coords = translateCoords(e, agent);
			for (var i = 0; i < _cbrelease.length; i++)
				_cbrelease[i][0](coords);
		}

		return {
			init: function (e) {
				element = e;
				// attach event listeners
				window.addEventListener('mousedown', function (e) {
					pressEvent(e, MOUSE);
				}, false);
				window.addEventListener('touchstart', function (e) {
					pressEvent(e, TOUCH);
				}, false);
				window.addEventListener('mousemove', function (e) {
					moveEvent(e, MOUSE);
				}, false);
				window.addEventListener('touchmove', function (e) {
					moveEvent(e, TOUCH);
				}, false);
				window.addEventListener('mouseup', function (e) {
					releaseEvent(e, MOUSE);
				}, false);
				window.addEventListener('touchend', function (e) {
					releaseEvent(e, TOUCH);
				}, false);
				var user = self.assets.get('cfg_user');
				if (user.fitscreen !== false)
					fixedRatio = false;
			},
			register: function (eventType, callback, id) {
				// register callback function
				// id is optional
				var cbdata = [callback, id];
				if (eventType === 'press')
					_cbpress.push(cbdata);
				else if (eventType === 'move')
					_cbmove.push(cbdata);
				else if (eventType === 'release')
					_cbrelease.push(cbdata);
			},
			unregister: function (id) {
				// unregister callback function
				var cbLists = [_cbpress, _cbmove, _cbrelease];
				for (var i = 0; i < 3; i++) {
					var list = cbLists[i];
					var j = list.length;
					while (j--)
						if (list[j][1] === id)
							list.splice(j, 1);
				}
			}
		};
	}());

	return self;
}(sumagi || {}));

var sumagi = (function (self) {

	///////////////////////////////////////////////////////////
	//
	//  Loadscreen module.
	//
	///////////////////////////////////////////////////////////

	self.loadscreen = (function () {
		var gfx = {};

		var progresspath = [
			[95, 187],
			[123, 187],
			[123, 215],
			[124, 243],
			[151, 243],
			[179, 243],
			[179, 271],
			[207, 271],
			[235, 271],
			[235, 299],
			[235, 327],
			[207, 327],
			[207, 355],
			[179, 355],
			[151, 355],
			[151, 383]
		];

		var progress = 0;
		var nblocks;

		var blocks_alpha = 1;

		return {
			init: function () {
				self.assets.inflate(gfx, [
					'gfx_title', 'gfx_progress'
				]);
				nblocks = progresspath.length;
				self.common.shuffle(progresspath);
			},
			draw: function () {
				self.draw.image(gfx.title, 27, 38);
				self.draw.useAlpha(blocks_alpha, function () {
					for (var i = 0; i < nblocks; i++) {
						var block = progresspath[i];
						var blockgfx = (i < progress) ? 18 : 0;
						self.draw.tile(gfx.progress, block[0], block[1], 18, 18, blockgfx, 0);
					}
				});
			},
			update: function (items, nitems) {
				progress = Math.floor(items * nblocks / nitems);
			},
			finish: function (callback) {
				self.common.createTransition(0, 100, 300, function (value) {
					blocks_alpha = 1 - value / 100;
				}, callback, 'quadin');
				//console.log("Loading Finish");
			}
		};
	}());

	return self;
}(sumagi || {}));

var sumagi = (function (self) {

	///////////////////////////////////////////////////////////
	//
	//  Menu module.
	//
	///////////////////////////////////////////////////////////

	self.menu = (function () {
		// state active flag
		var active = false;
		// graphics
		var gfx = {};
		// colors
		var colors = {
			get: function () {
				var cfg_colors = self.assets.get('cfg_colors');
				this.menu_text = cfg_colors.menu_text || self.meta.defaultColors.menu_text;
				this.menu_text2 = cfg_colors.menu_text2 || self.meta.defaultColors.menu_text2;
			}
		};
		//console.log("Game Difficulty : " + gamedifficulty);
		// local config
		var localConfig = {
			difficulty: gamedifficulty,
			board: 0
		};

		/*function saveConfig() {
			localStorage.setItem('sumagidata', JSON.stringify(localConfig));
		}*/

		/*function loadConfig() {
			var cfg = localStorage.getItem('sumagidata');
			if (cfg) localConfig = JSON.parse(cfg);
		}*/

		function loadConfig() {
			localConfig = {
				difficulty: gamedifficulty,
				board: 0
			}
		};

		// vertical offset
		var title_y = 0;
		var menu_y = 0;
		// game options
		var m_difficulties = self.meta.options.difficulties;
		var m_boards = self.meta.options.boards;
		// selection data
		//var selDifficulty = 0;
		//console.log("selfdifficulty0 : " + selDifficulty);
		var selDifficulty = gamedifficulty;
		//console.log("selfdifficulty1 : " + selDifficulty);
		var selBoard = 0;
		// ui classes
		function slider(props, events) {
			var value = 0;
			var hold = false;

			function mouseIn(coords) {
				return self.common.pointInRect(coords.x, coords.y, props.x, props.y, 274, 24);
			}

			function refreshValue(coords) {
				var val = Math.floor((coords.x - props.x) / (232) * props.max);
				if (val >= 0 && val <= props.max) {
					value = val;
					if (events.valueChange instanceof Function)
						events.valueChange(value);
				}
				//console.log("refresh value");
			}
			/*self.input.register('press', function (coords) {
				if (!active) return;
				if (mouseIn(coords)) {
					hold = true;
					refreshValue(coords);
				}
			});
			self.input.register('move', function (coords) {
				if (!active) return;
				if (hold)
					refreshValue(coords);
			});
			self.input.register('release', function (coords) {
				if (!active) return;
				hold = false;
			});*/
			this.draw = function () {
				self.draw.image(gfx.sliderbg, props.x, props.y + menu_y);
				var sliderx = value / props.max * 232;
				self.draw.image(gfx.sliderthumb, props.x + sliderx - 16, props.y + menu_y - 22);
			};
			this.setValue = function (v) {
				value = v;
			};
		}

		function button(props, events) {
			function mouseIn(coords) {
				//return self.common.pointInRect(coords.x, coords.y, props.x, props.y, props.w, props.h);
				return self.common.pointInRect(coords.x, coords.y,
					props.x + props.bounds[0], props.y + props.bounds[1],
					props.bounds[2], props.bounds[3]);
			}
			self.input.register('press', function (coords) {
				if (!active) return;
				if (mouseIn(coords) && events.press instanceof Function)
					events.press();
			});
			this.draw = function () {
				self.draw.image(props.gfx, props.x, props.y + menu_y);
			};
		}
		// ui elements
		var sliderDifficulty, sliderBoard;
		var buttonHelp, buttonPlay;

		function manageUI() {
			sliderDifficulty = new slider({
				x: 28,
				y: 245,
				max: m_difficulties.length - 1
			}, {
				valueChange: function (value) {
					selDifficulty = value;
					//console.log("seldifficulty : " + selDifficulty);
					gamedifficulty = selDifficulty;
				}
			});
			sliderBoard = new slider({
				x: 28,
				y: 345,
				max: m_boards.length - 1
			}, {
				valueChange: function (value) {
					selBoard = value;
					//console.log(selBoard);
					gameboard = selBoard;
				}
			});
			buttonPlay = new button({
				gfx: gfx.playbutton,
				x: 80,
				y: 300,
				bounds: [15, 15, 128, 64]
			}, {
				press: function () {
					hide(startGame);
				}
			});
		}

		function hide(callback) {
			active = false;
			self.common.createTransition(0, 330, 300, function (value) {
				menu_y = 10 + value;
			}, function () {}, 'quadin');
			setTimeout(function () {
				self.common.createTransition(0, 120, 200, function (value) {
					title_y = -value;
				}, function () {
					if (callback instanceof Function)
						callback();
				}, 'quadin');
			}, 140);
		}

		function startGame() {
			gameround = 1;
			selDifficulty = gamedifficulty;
			localConfig.difficulty = selDifficulty;
			//console.log("selfdifficulty2 : " + selDifficulty);
			localConfig.board = selBoard;
			//saveConfig();
			self.core.setState(self.game);
			self.game.create(selDifficulty, selBoard);
			self.game.show();
			//console.log("start game");
		}


		return {
			init: function () {
				self.assets.inflate(gfx, [
					'gfx_title', 'gfx_menubg', 'gfx_menulabels', 'gfx_sliderbg',
					'gfx_sliderthumb', 'gfx_playbutton'
				]);
				colors.get();
				manageUI();
				loadConfig();
				//console.log("selfdifficulty3 : " + selDifficulty);
				sliderDifficulty.setValue(selDifficulty = localConfig.difficulty);
				sliderBoard.setValue(selBoard = localConfig.board);
			},
			draw: function () {
				var difficulty = m_difficulties[selDifficulty];
				var board = m_boards[selBoard];
				var sumLabel = '∑ = [ ' + difficulty[1] + ', ' + difficulty[2] + ' ]';
				self.draw.image(gfx.title, 27, 38 + title_y);
				self.draw.image(gfx.menubg, 0, 140 + menu_y);
				self.draw.tile(gfx.menulabels, 128, 175 + menu_y, 70, 16, 0, 0);
				//self.draw.tile(gfx.menulabels, 122, 275 + menu_y, 85, 16, 0, 16);
				self.draw.text(difficulty[0], 40, 210 + menu_y, colors.menu_text, 'left', '14px sans-serif');
				self.draw.text(sumLabel, 280, 210 + menu_y, colors.menu_text2, 'right', '14px sans-serif');
				//self.draw.text(board[0], 40, 310 + menu_y, colors.menu_text, 'left', '14px sans-serif');
				//sliderDifficulty.draw();
				//sliderBoard.draw();
				buttonPlay.draw();
			},
			show: function (titledrop) {
				if (titledrop === undefined)
					titledrop = false;
				menu_y = 330;
				title_y = (titledrop) ? -120 : 0;
				if (titledrop) {
					self.common.createTransition(0, 120, 300, function (value) {
						title_y = value - 120;
					}, null, 'quadout');
				}
				self.common.createTransition(0, 320, 300, function (value) {
					menu_y = 330 - value;
				}, function () {
					active = true;
				}, 'quadout');
			}
		};
	}());

	return self;
}(sumagi || {}));

var sumagi = (function (self) {

	///////////////////////////////////////////////////////////
	//
	//  Game module.
	//
	///////////////////////////////////////////////////////////

	self.game = (function () {
		// state active flag
		var active = false;
		// graphics
		var gfx = {};
		// colors
		var colors = {
			get: function () {
				var cfg_colors = self.assets.get('cfg_colors');
				this.piece_solved = cfg_colors.piece_solved || self.meta.defaultColors.piece_solved;
				this.piece_tagged = cfg_colors.piece_tagged || self.meta.defaultColors.piece_tagged;
				this.piece_normal = cfg_colors.piece_normal || self.meta.defaultColors.piece_normal;
				this.piece_text_solved = cfg_colors.piece_text_solved || self.meta.defaultColors.piece_text_solved;
				this.piece_text_tagged = cfg_colors.piece_text_tagged || self.meta.defaultColors.piece_text_tagged;
				this.piece_text_normal = cfg_colors.piece_text_normal || self.meta.defaultColors.piece_text_normal;
				this.piece_shadow = cfg_colors.piece_shadow || self.meta.defaultColors.piece_shadow;
				this.gridlines = cfg_colors.gridlines || self.meta.defaultColors.gridlines;
				this.goal_text_sigma = cfg_colors.goal_text_sigma || self.meta.defaultColors.goal_text_sigma;
				this.goal_text_sum = cfg_colors.goal_text_sum || self.meta.defaultColors.goal_text_sum;
				this.status_text = cfg_colors.status_text || self.meta.defaultColors.status_text;
			}
		};
		// game options
		var m_difficulties = self.meta.options.difficulties;
		//console.log("Game Difficulty : " + gamedifficulty);
		//console.log("m_difficulties : " + m_difficulties);
		var m_boards = self.meta.options.boards;
		// game variables
		var sum; // current sum
		var sumGoal; // goal sum
		// solved flag
		var solved;
		// number of tries
		var tries
		// transition values
		var tr_x;
		var victoryalpha;
		// game board data
		var boardN;
		// game grid
		var grid;
		// game timing
		var secondsPassed;
		var gameTimer = null;
		var timeReadable;
		// neighbourhood matrix
		var neighbours = [
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1]
		];
		// tagging variables
		var tagging = false;
		var tagNeighbours = [];
		// get tag neighbours
		function getTagNeighbours(x, y) {
			tagNeighbours = [];
			for (var i = 0; i < 4; i++) {
				var neighbour = neighbours[i];
				var nx = x + neighbour[0];
				var ny = y + neighbour[1];
				if (nx >= 0 && ny >= 0 && nx < boardN && ny < boardN &&
					!(getPiece(nx, ny).isTagged()))
					tagNeighbours.push([nx, ny]);
			}
		}

		function isTagCandidate(x, y) {
			var neighboursn = tagNeighbours.length;
			for (var i = 0; i < neighboursn; i++) {
				var neighbour = tagNeighbours[i];
				if (neighbour[0] === x && neighbour[1] === y)
					return true;
			}
			return false;
		}
		// input register id iterator
		var rid;
		// game piece
		function gamepiece(props) {
			var center = Math.floor(props.size / 2);
			var value = -1;
			var tagged = false;
			this.draw = function () {
				var bgcolor = (solved && tagged) ?
					colors.piece_solved :
					(tagged) ? colors.piece_tagged : colors.piece_normal;
				var textcolor = (solved && tagged) ?
					colors.piece_text_solved :
					(tagged) ? colors.piece_text_tagged : colors.piece_text_normal;
				var half = props.size / 2;
				self.draw.rectFill(props.x + tr_x, props.y, props.size, props.size, bgcolor);
				self.draw.useAlpha(0.1, function () {
					self.draw.rectFill(props.x + tr_x, props.y + half, props.size, props.size - half, colors.piece_shadow);
				});
				self.draw.rect(props.x + tr_x, props.y, props.size, props.size, colors.gridlines);
				self.draw.text(value.toString(), props.x + center + tr_x, props.y + center - 8, textcolor, 'center', 'bold 16px sans-serif');

			};
			this.getValue = function () {
				return value;
			};
			this.setValue = function (v) {
				value = v;
			};
			this.isTagged = function () {
				return tagged;
			};

			function mouseIn(coords) {
				return self.common.pointInRect(coords.x, coords.y, props.x, props.y, props.size, props.size);
			}
			var rid_start = rid;

			self.input.register('press', function (coords) {
				if (!active || solved) return;
				if (!tagging && mouseIn(coords)) {
					tagging = true;
					tagged = true;
					getTagNeighbours(props.index[0], props.index[1]);
					sum += value;
					tries++;
				}
			}, rid++);
			self.input.register('move', function (coords) {
				if (!active || solved) return;
				if (tagging && mouseIn(coords) && isTagCandidate(props.index[0], props.index[1])) {
					tagged = true;
					TotalTiles++;
					//console.log(TotalTag);
					getTagNeighbours(props.index[0], props.index[1]);
					sum += value;
					if (sum === sumGoal) {
						//active = false;
						tagging = false;
						solved = true;
						stopTimer();
						Skillprint.sendTap({
							tries: tries,
							sumtotal: sum,
							answer: sumGoal
						});
						showVictory();
					}
				}
			}, rid++);
			self.input.register('release', function (coords) {
				if (!active || solved) return;
				tagged = false;
				if (tagging) {
					Skillprint.sendTap({
						tries: tries,
						sumtotal: sum,
						answer: sumGoal
					});
					tagging = false;
					tagNeighbours = [];
					sum = 0;
					TotalTiles = 1;
				}
			}, rid++);
			this.discard = function () {
				for (var i = 0; i < 3; i++)
					self.input.unregister(rid_start + i);
			}
		}

		function getPiece(x, y) {
			return grid[x + y * boardN];
		}

		function createGrid() {
			grid = [];
			rid = 0;
			var size = 320 / boardN;
			for (var y = 0; y < boardN; y++) {
				for (var x = 0; x < boardN; x++) {
					grid.push(new gamepiece({
						x: x * size,
						y: y * size + 46,
						size: size,
						index: [x, y]
					}));
				}
			}
		}

		function createValues() {
			var walk = [];
			var pathmax = 2 * boardN;
			var pathmin = 4;

			function notInWalk(x, y) {
				var walkn = walk.length;
				for (var i = 0; i < walkn; i++) {
					var piece = walk[i];
					if (piece[0] === x && piece[1] === y)
						return false;
				}
				return true;
			}

			function getNeighbours(x, y) {
				// get the 4 neighbours surrounding a given piece,
				// excluding tagged pieces
				var neighbourList = [];
				for (var i = 0; i < 4; i++) {
					var neighbour = neighbours[i];
					var nx = x + neighbour[0];
					var ny = y + neighbour[1];
					if (nx >= 0 && ny >= 0 && nx < boardN && ny < boardN &&
						notInWalk(nx, ny))
						neighbourList.push([nx, ny]);
				}
				return neighbourList;
			}
			// perform a random walk
			var optimal = self.common.getRandomInt(pathmin, pathmax);
			var wx = self.common.getRandomInt(0, boardN - 1);
			var wy = self.common.getRandomInt(0, boardN - 1);
			for (var i = 0; i < optimal; i++) {
				// add current position to walk
				walk.push([wx, wy]);
				// find a new candidate
				var neighbourList = getNeighbours(wx, wy);
				var neighboursn = neighbourList.length;
				if (neighboursn > 0) {
					// choose a random neighbour
					var neighbour = neighbourList[self.common.getRandomInt(0, neighboursn - 1)];
					// continue walk
					wx = neighbour[0];
					wy = neighbour[1];
				} else break; // stop the walk if no neighbours remain
			}
			// walk length
			var walkn = walk.length;
			// generate solution values
			var solution = [];
			for (var i = 0; i < walkn; i++)
				solution.push(1);
			var ssum = walkn;
			while (ssum < sumGoal) {
				var r = self.common.getRandomInt(0, walkn - 1);
				solution[r]++;
				ssum++;
			}
			// fill solution values
			for (var i = 0; i < walkn; i++) {
				var step = walk[i];
				getPiece(step[0], step[1]).setValue(solution[i]);
			}
			// fill remaining values
			var randmin = 1;
			var randmax = Math.max.apply(null, solution);
			for (var y = 0; y < boardN; y++) {
				for (var x = 0; x < boardN; x++) {
					var piece = getPiece(x, y);
					if (piece.getValue() === -1)
						piece.setValue(self.common.getRandomInt(randmin, randmax));
				}
			}
		}

		function discardPieces() {
			var gridn = grid.length;
			for (var i = 0; i < gridn; i++) {
				grid[i].discard();
			}
		}

		function quitGame() {
			if (gameround != 5) {
				Skillprint.LevelQuit();
			};

			discardPieces();
			active = false;
			stopTimer();
			self.common.createTransition(0, 320, 160, function (value) {
				tr_x = value;
			}, function () {
				// go back to menu
				self.core.setState(self.menu);
				self.menu.init();
				self.menu.show(true);
			}, 'quadin');
		}
		var xbutton = function () {
			var x = 26;
			var y = 396;

			function mouseIn(coords) {
				return self.common.pointInRect(coords.x, coords.y, x, y, 57, 57);
			}

			function userinput() {
				self.input.register('press', function (coords) {
					if (!active) return;
					if (mouseIn(coords))
						quitGame();
				});
			}
			return {
				init: userinput,
				draw: function () {
					self.draw.image(gfx.xbutton, x - tr_x, y);
				}
			};
		}();

		function secondsToTime() {
			var minutes = parseInt(secondsPassed / 60);
			var seconds = secondsPassed % 60;
			var readable = '';
			if (minutes > 0)
				readable = minutes + 'm ';
			readable += seconds + 's';
			return readable;
		}

		function runTimer() {
			secondsPassed = 0;
			gameTimer = setInterval(function () {
				secondsPassed++;
				gametime = secondsPassed;
				timeReadable = secondsToTime();
			}, 1000);
		}

		function stopTimer() {
			if (gameTimer !== null) {
				clearInterval(gameTimer);
				gameTimer = null;
			}
		}

		function showVictory() {
			self.common.createTransition(0, 100, 340, function (value) {
				victoryalpha = value / 100;
			}, null, 'quadin');
			//console.log("Victory");
			//console.log("Total Game Time : " + TotalGameTime);
			TotalGameTime = TotalGameTime + gametime;
			//console.log("Total Game Time : " + TotalGameTime);

			Skillprint.levelComplete({
				tries: tries,
				answer: sumGoal
			});
			checkRounds();
		}

		function checkRounds() {
			if (gameround < 5) {
				gameround++;
				setTimeout(function () {
					discardPieces();
					active = false;
					stopTimer();
					self.core.setState(self.game);
					self.game.create(gamedifficulty, gameboard);
					self.game.show();
				}, 1000);
			} else {
				//each round max 30sec | there are 5 rounds, so 30sec*5 = 150secs
				//each round get over than 1mins (60secs) | so 60*5 = 300secs
				if (TotalGameTime <= 150) {
					gamedifficulty++;
					//console.log("Game Difficulty : " + gamedifficulty);
				};
				if (TotalGameTime >= 300) {
					if (gamedifficulty == 0) {
						gamedifficulty = 0;
						//console.log("Game Difficulty : " + gamedifficulty);
					} else {
						gamedifficulty--;
						//console.log("Game Difficulty : " + gamedifficulty);
					}
				};
				setTimeout(function () {
					quitGame();
				}, 1000);

			}
		}

		return {
			init: function () {
				self.assets.inflate(gfx, [
					'gfx_goalbar', 'gfx_statusbar', 'gfx_xbutton', 'gfx_victorylabel'
				]);
				colors.get();
				xbutton.init();
			},
			draw: function () {
				// draw goalbar
				self.draw.image(gfx.goalbar, -tr_x, 0);
				self.draw.text('∑', 20 - tr_x, 12, colors.goal_text_sigma, 'left', '18px sans-serif');
				if (solved) {
					self.draw.useAlpha(victoryalpha, function () {
						self.draw.image(gfx.victorylabel, 101 - tr_x, 6);
					});
				}
				self.draw.text(sumGoal.toString(), 300 - tr_x, 12, colors.goal_text_sum, 'right', '20px sans-serif');
				// draw grid
				var gridn = grid.length;
				for (var i = 0; i < gridn; i++) {
					var piece = grid[i];
					piece.draw();
				}
				// draw statusbar
				self.draw.image(gfx.statusbar, -tr_x, 368);
				// n tries
				self.draw.text('Tries: ' + tries.toString(), 120 - tr_x, 410, colors.status_text, 'left', '18px sans-serif');
				// display time
				self.draw.text(timeReadable, 280 - tr_x, 410, colors.status_text, 'right', '18px sans-serif');
				// x button
				xbutton.draw();
			},
			create: function (difficulty, board) {
				// extrapolate values
				var sumMin = m_difficulties[difficulty][1];
				var sumMax = m_difficulties[difficulty][2];
				//console.log("sumMin : " + sumMin + "| sumMax :" + sumMax);
				boardN = m_boards[board][1];
				// create game environment
				createGrid(boardN);
				// generate random sum
				sumGoal = self.common.getRandomInt(sumMin, sumMax);
				// create values and map to pieces
				createValues();
				// reset game variables
				solved = false;
				sum = 0;
				timeReadable = '0s';
				tries = 0;
				victoryalpha = 0;
				TotalTiles = 1;
				//console.log("Total Game Time : " + TotalGameTime);
				Skillprint.levelStart({
					difficulty: gamedifficulty == 0 ? "BABY" : gamedifficulty == 1 ? "EASY" : gamedifficulty == 2 ? "MEDIUM" : gamedifficulty == 3 ? "DIFFICULT" : gamedifficulty == 4 ? "HARD" : gamedifficulty == 5 ? "PROFESSOR" : "MASTER",
					board: gameboard == 0 ? "3x3" : gameboard == 1 ? "4x4" : gameboard == 2 ? "5x5" : gameboard == 3 ? "6x6" : gameboard == 4 ? "7x7" : gameboard == 5 ? "8x8" : gameboard == 6 ? "9x9" : "10x10",
					level: gameround,
					answer: sumGoal
				});
			},
			show: function () {
				tr_x = -320;
				goalbar_x = 320;
				self.common.createTransition(0, 320, 160, function (value) {
					tr_x = value - 320;
				}, function () {
					active = true;
					// start game timer
					runTimer();
				}, 'quadin');
			}
		};
	}());

	return self;
}(sumagi || {}));

var sumagi = (function (self) {

	///////////////////////////////////////////////////////////
	//
	//  Core module. Handles startup and states.
	//
	///////////////////////////////////////////////////////////

	self.core = (function () {
		// reference to canvas
		var canvas;
		// reference to active state
		var statehandle;
		// repaint fill color
		var bgcolor;
		// window height
		var wheight;
		// fallbacks for requestAnimationFrame
		var requestAnimFrame = (
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			}
		);
		// fit canvas to fit screen
		function activelyResize() {
			var dh = window.innerHeight;
			if (dh !== wheight) {
				wheight = dh;
				var ratio = canvas.width / canvas.height;
				var width = dh * ratio;
				canvas.style.width = width + 'px';
				canvas.style.height = dh + 'px';
			}
			setTimeout(activelyResize, 10);
		}
		// render loop
		function render() {
			// clear canvas
			self.draw.rectFill(0, 0, canvas.width, canvas.height, bgcolor);
			// render to canvas
			statehandle.draw();
			// loopback
			requestAnimFrame(render);
		}

		return {
			run: function () {
				// retreive canvas
				canvas = document.getElementById('sumagi');
				// initialize drawing module
				self.draw.setContext(canvas.getContext('2d'));
				// load configuration and loadscreen assets
				self.assets.load([
					self.meta.assets.config,
					self.meta.assets.primary
				], function () { // done loading
					// initialize input module
					self.input.init(canvas);
					// retreive and apply user config
					var user = self.assets.get('cfg_user');
					var colors = self.assets.get('cfg_colors');
					bgcolor = colors.background || self.meta.defaultColors.background;
					if (user.fitscreen !== false)
						activelyResize();
					// init loadscreen and set initial state
					(statehandle = self.loadscreen).init();
					// run render loop
					render();
					// load game assets
					self.assets.load([
						self.meta.assets.graphics
					], function () { // done loading
						self.loadscreen.finish(function () {
							// init states
							self.menu.init();
							self.game.init();
							// set initial state
							statehandle = self.menu;
							self.menu.show();
						});
					}, self.loadscreen.update); // update progress
				});
			},
			setState: function (next) {
				statehandle = next;
			}
		};
	}());

	return self;
}(sumagi || {}));

///////////////////////////////////////////////////////////
//
//  Entry point. Imports scripts and runs the game.
//
///////////////////////////////////////////////////////////

(function () {
	window.addEventListener('load', function () {
		// set assets path
		sumagi.assets.setPath('sumagi/');
		// start game
		sumagi.core.run();
	}, false);
}());