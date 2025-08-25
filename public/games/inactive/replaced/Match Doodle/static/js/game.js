////////////////////////////////////////////////////////////
// GAME
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//item array list
var item_arr = [
	'assets/item_01.png',
	'assets/item_02.png',
	'assets/item_03.png',
	'assets/item_04.png',
	'assets/item_05.png',
	'assets/item_06.png',
	'assets/item_07.png',
	'assets/item_08.png',
	'assets/item_09.png',
	'assets/item_10.png',
	'assets/item_11.png',
	'assets/item_12.png',
	'assets/item_13.png',
	'assets/item_14.png',
	'assets/item_15.png',
	'assets/item_16.png',
	'assets/item_17.png',
	'assets/item_18.png',
	'assets/item_19.png',
	'assets/item_20.png',
	'assets/item_21.png',
	'assets/item_22.png',
	'assets/item_23.png',
	'assets/item_24.png',
	'assets/item_25.png',
	'assets/item_26.png',
	'assets/item_27.png',
	'assets/item_28.png',
	'assets/item_29.png',
	'assets/item_30.png',
	'assets/item_31.png',
	'assets/item_32.png',
	'assets/item_33.png',
	'assets/item_34.png',
	'assets/item_35.png',
	'assets/item_36.png',
	'assets/item_37.png',
	'assets/item_38.png',
	'assets/item_39.png',
	'assets/item_40.png',
];

var levelSettings = {
	totalStart: 5, //total match item
	totalIncrease: 5, //total match increase for next stage
	timer: 31000, //game timer
	timerIncrease: 10000 //game timer increase for next stage
};

//item gravity settings
var gravitySettings = {
	gravity: 0,
	drag: .88,
	bounce: .3
};

//item position settings
var positionSettings = {
	x: 384,
	y: 480,
	area: [{
			total: 5,
			disX: 150,
			disY: 150
		},
		{
			total: 10,
			disX: 200,
			disY: 200
		},
		{
			total: 15,
			disX: 250,
			disY: 250
		},
		{
			total: 20,
			disX: 300,
			disY: 300
		},
	]
};

//item drop area settings
var dropAreaSettings = {
	radius: 120,
	x: 384,
	y: 840
};

//text settings
var stageCompleteText = 'level [NUMBER] complete';
var timersupText = 'time\'s up';
var exitMessageText = 'are you sure you\nwant to quit the game?';
var scoreDescText = 'top level:';


//Social share, [SCORE] will replace with game score
var shareText = 'share your score:'
var shareEnable = true; //toggle share
var shareTitle = 'Highscore on Match Doodle Game is Level [NUMBER].'; //social share score title
var shareMessage = 'Level [NUMBER] is mine new highscore on Match Doodle Game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */

var playerData = {
	score: 0,
	timer: 0
};
var gameData = {
	levelNum: 0,
	total: 0,
	items: [],
	matchItems: [],
	completeItems: [],
	complete: 0,
	dropMatch: null,
	paused: true,
	timer: false,
	startDate: '',
	nowDate: '',
	timerCount: 0,
	timerStart: 0,
	timerAlert: false
};

// Increment timer
var secondsPassed;
var gameTimer = null;
var timeReadable;

/*!
 * 
 * GAME BUTTONS - This is the function that runs to setup button event
 * 
 */
function buildGameButton() {
	buttonStart.cursor = "pointer";
	buttonStart.addEventListener("click", function (evt) {
		playSound('soundClick');
		goPage('game');
	});

	//game
	buttonConfirm.cursor = "pointer";
	buttonConfirm.addEventListener("click", function (evt) {
		playSound('soundClick');
		toggleConfirm(false);
		stopGame(true);
		stopTimer();
		goPage('main');
		Skillprint.LevelQuit({
			level: playerData.score
		});
	});

	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function (evt) {
		playSound('soundClick');
		toggleConfirm(false);
	});

	buttonContinue.cursor = "pointer";
	buttonContinue.addEventListener("click", function (evt) {
		playSound('soundClick');
		goPage('main');
	});

	//result
	buttonFacebook.cursor = "pointer";
	buttonFacebook.addEventListener("click", function (evt) {
		share('facebook');
	});

	buttonTwitter.cursor = "pointer";
	buttonTwitter.addEventListener("click", function (evt) {
		share('twitter');
	});

	buttonWhatsapp.cursor = "pointer";
	buttonWhatsapp.addEventListener("click", function (evt) {
		share('whatsapp');
	});

	//options
	buttonSoundOff.cursor = "pointer";
	buttonSoundOff.addEventListener("click", function (evt) {
		toggleGameMute(true);
	});

	buttonSoundOn.cursor = "pointer";
	buttonSoundOn.addEventListener("click", function (evt) {
		toggleGameMute(false);
	});

	buttonFullscreen.cursor = "pointer";
	buttonFullscreen.addEventListener("click", function (evt) {
		toggleFullScreen();
	});

	buttonSettings.cursor = "pointer";
	buttonSettings.addEventListener("click", function (evt) {
		playSound('soundClick');
		toggleOption();
	});

	buttonExit.cursor = "pointer";
	buttonExit.addEventListener("click", function (evt) {
		playSound('soundClick');
		toggleConfirm(true);
		toggleOption();
	});
}

/*!
 * 
 * DISPLAY PAGES - This is the function that runs to display pages
 * 
 */
var curPage = ''

function goPage(page) {
	curPage = page;

	mainContainer.visible = false;
	gameContainer.visible = false;
	resultContainer.visible = false;

	var targetContainer = null;
	switch (page) {
		case 'main':
			targetContainer = mainContainer;
			break;

		case 'select':
			targetContainer = selectContainer;
			break;

		case 'game':
			targetContainer = gameContainer;
			prepareGame();
			break;

		case 'result':
			targetContainer = resultContainer;
			stopGame();

			if (playerData.score > 1) {
				playerData.score--;
			}

			playSound('soundResult');
			scoreTxt.text = playerData.score;
			saveGame(playerData.score);
			stopTimer();
			// Skillprint.LevelFailed({
			// 	level: playerData.score,
			// 	object_done: gameData.complete
			// });
			break;
	}

	if (targetContainer != null) {
		targetContainer.visible = true;
		targetContainer.alpha = 0;
		TweenMax.to(targetContainer, .5, {
			alpha: 1,
			overwrite: true
		});
	}

	resizeCanvas();
}

function toggleConfirm(con) {
	confirmContainer.visible = con;
	if (con) {
		TweenMax.pauseAll(true, true);
		gameData.paused = true;
	} else {
		TweenMax.resumeAll(true, true);
		if (curPage == 'game') {
			gameData.paused = false;
		}
	}
}

/*!
 * 
 * TOGGLE BLINK ANIMATION - This is the function that runs to toggle blink animation
 * 
 */
function toggleAnimateBlink(obj, con, speed, alpha) {
	if (con) {
		obj.tweenSpeed = speed;
		obj.tweenAlpha = alpha;
		animateBlink(obj);
	} else {
		TweenMax.killTweensOf(obj);
	}
}

function animateBlink(obj) {
	obj.alpha = obj.tweenAlpha[0];
	TweenMax.to(obj, obj.tweenSpeed, {
		alpha: obj.tweenAlpha[1],
		overwrite: true,
		onComplete: function () {
			TweenMax.to(obj, obj.tweenSpeed, {
				alpha: obj.tweenAlpha[0],
				overwrite: true,
				onComplete: function () {
					animateBlink(obj);
				}
			});
		}
	});
}

/*!
 * 
 * START GAME - This is the function that runs to start play game
 * 
 */

function prepareGame() {
	gameData.total = levelSettings.totalStart;
	gameData.total = gameData.total > item_arr.length - 1 ? item_arr.length - 1 : gameData.total;
	gameData.timerStart = levelSettings.timer;
	playerData.score = 1;
	startGame();
}

function startGame() {
	gameData.paused = false;
	gameData.dropMatch = null;
	gameData.matchItems = [];
	gameData.completeItems = [];
	gameData.complete = 0;
	playerData.timer = 0;

	gameData.timer = true;
	gameData.startDate = new Date();
	gameData.timerCount = 0;
	gameData.timerAlert = false;
	timeReadable = "0s";
	runTimer();
	updateStats();
	displayGameText();

	buildMatchItems();

	timerTxt.visible = true;
	timerAlertTxt.visible = false;

	itemContainer.alpha = 0;
	TweenMax.to(itemContainer, 1, {
		alpha: 1,
		overwrite: true
	});
	Skillprint.LevelStart({
		level: playerData.score,
		objectives: gameData.matchItems.length,
		//time: (gameData.timerStart / 1000) - 1
	});
	/*console.log("Game Start");
	console.log("Level: " + playerData.score);
	console.log("Total Objects: " + gameData.matchItems.length);
	console.log((gameData.timerStart / 1000) - 1 + " seconds");*/

	playSound('soundStart');
}

/*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame() {
	gameData.paused = true;
	TweenMax.killAll();
}

/*!
 * 
 * SAVE GAME - This is the function that runs to save game
 * 
 */
function saveGame(score) {
	/*$.ajax({
      type: "POST",
      url: 'saveResults.php',
      data: {score:score},
      success: function (result) {
          console.log(result);
      }
    });*/
}

/*!
 * 
 * MATH ITEMS - This is the function that runs to build match items
 * 
 */
function buildMatchItems() {
	gameData.items.length = 0;
	for (var n = 0; n < item_arr.length; n++) {
		gameData.items.push(n);
	}
	shuffle(gameData.items);

	itemContainer.removeAllChildren();

	var centerX = positionSettings.x;
	var centerY = positionSettings.y;
	var randomDisX = 0;
	var randomDisY = 0;

	sortOnObject(positionSettings.area, 'total', false);
	for (var n = 0; n < positionSettings.area.length; n++) {
		if (positionSettings.area[n].total <= gameData.total) {
			randomDisX = positionSettings.area[n].disX;
			randomDisY = positionSettings.area[n].disY;
		}
	}

	for (var n = 0; n < gameData.items.length; n++) {
		if (n < gameData.total) {
			var itemIndex = gameData.items[n];
			var newItemA = $.items[itemIndex].clone();
			var newItemB = $.items[itemIndex].clone();

			newItemA.itemType = newItemB.itemType = n;

			newItemA.x = randomIntFromInterval(centerX - randomDisX, centerX + randomDisX);
			newItemA.y = randomIntFromInterval(centerY - randomDisY, centerY + randomDisY);
			newItemB.x = randomIntFromInterval(centerX - randomDisX, centerX + randomDisX);
			newItemB.y = randomIntFromInterval(centerY - randomDisY, centerY + randomDisY);
			newItemA.rotation = randomIntFromInterval(0, 360);
			newItemB.rotation = randomIntFromInterval(0, 360);
			newItemA.visible = newItemB.visible = true;
			newItemA.radius = newItemB.radius = 100;
			newItemA.complete = newItemB.complete = false;
			newItemA.focus = newItemB.focus = false;
			buildItemEvents(newItemA);
			buildItemEvents(newItemB);

			gameData.matchItems.push(newItemA);
			gameData.matchItems.push(newItemB);
			itemContainer.addChild(newItemA);
			itemContainer.addChild(newItemB);
		}
	}

	//z-index
	shuffle(gameData.matchItems);
	for (var n = 0; n < gameData.matchItems.length; n++) {
		itemContainer.setChildIndex(gameData.matchItems[n], n);
	}
}

/*!
 * 
 * MATH ITEMS EVENTS - This is the function that runs to build match items events
 * 
 */
function buildItemEvents(obj) {
	var easeSpeed = 10;

	obj.dragging = false;
	obj.oldX = obj.x;
	obj.oldY = obj.y;
	obj.speedX = randomIntFromInterval(-easeSpeed, easeSpeed);
	obj.speedY = randomIntFromInterval(-easeSpeed, easeSpeed);

	obj.cursor = "pointer";
	obj.addEventListener("mousedown", function (evt) {
		Skillprint.sendDragDrop({
			event: "DRAG",
			object_id: (obj.image.attributes.src.value).substring(12, 14),
			//time: Math.floor(playerData.timer / 1000)
		});
		//console.log("Drag object_id: " + (obj.image.attributes.src.value).substring(12, 14));
		//console.log(Math.floor(playerData.timer / 1000) + " seconds");
		toggleItemDragEvent(evt, 'drag')
	});
	obj.addEventListener("pressmove", function (evt) {
		toggleItemDragEvent(evt, 'move')
	});
	obj.addEventListener("pressup", function (evt) {
		Skillprint.sendDragDrop({
			event: "DROP",
			object_id: (obj.image.attributes.src.value).substring(12, 14),
			//time: Math.floor(playerData.timer / 1000)
		});
		//console.log("Drop object_id: " + (obj.image.attributes.src.value).substring(12, 14));
		//console.log(Math.floor(playerData.timer / 1000) + " seconds");
		toggleItemDragEvent(evt, 'drop')
	});
}

function toggleItemDragEvent(obj, con) {
	if (gameData.paused) {
		return;
	}

	if (obj.target.complete) {
		return;
	}

	switch (con) {
		case 'drag':
			playSound('soundSelect');
			obj.target.dragging = true;
			obj.target.offset = {
				x: obj.target.x - (obj.stageX),
				y: obj.target.y - (obj.stageY)
			};
			focusItemEasing(obj.target);
			backgroundItemEasing(obj.target);
			break;

		case 'move':
			obj.target.x = (obj.stageX) + obj.target.offset.x;
			obj.target.y = (obj.stageY) + obj.target.offset.y;
			break;

		case 'drop':
			obj.target.dragging = false;
			focusItemEasing(obj.target);
			checkDropArea(obj.target);
			break;
	}
}

/*!
 * 
 * FOCUS ITEM EASING - This is the function that runs to animate focus item
 * 
 */
function focusItemEasing(obj) {
	if (gameData.dropMatch == obj) {
		obj.focus = false;
		gameData.dropMatch = null;
	}

	var rotateNum = randomIntFromInterval(10, 50);
	if (randomBoolean()) {
		rotateNum = obj.rotation + rotateNum;
	} else {
		rotateNum = obj.rotation - rotateNum;
	}
	TweenMax.to(obj, .5, {
		rotation: rotateNum,
		overwrite: true
	});
}

/*!
 * 
 * BACKGROUND ITEM EASING - This is the function that runs to animate background item
 * 
 */
function backgroundItemEasing(obj) {
	for (var n = 0; n < gameData.matchItems.length; n++) {
		var itemObj = gameData.matchItems[n];
		if (obj != itemObj && !itemObj.complete && !itemObj.focus) {
			var distanceNum = getDistance(itemObj, obj);
			if (distanceNum < 100) {
				itemObj.speedX = (itemObj.x - obj.x) * .06;
				itemObj.speedY = (itemObj.y - obj.y) * .06;
			}
		}
	}
}

function backgroundItemEasingLarge(obj) {
	for (var n = 0; n < gameData.matchItems.length; n++) {
		var itemObj = gameData.matchItems[n];
		if (!itemObj.complete && !itemObj.focus) {
			var distanceNum = getDistance(itemObj, obj);
			if (distanceNum < 120) {
				itemObj.speedX = (itemObj.x - obj.x) * .15;
				itemObj.speedY = (itemObj.y - obj.y) * .15;

				if (Math.abs(itemObj.speedX) < 5) {
					itemObj.speedX = itemObj.speedX * 1.5;
				}

				if (Math.abs(itemObj.speedY) < 5) {
					itemObj.speedY = itemObj.speedY * 1.5;
				}
			}
		}
	}
}

/*!
 * 
 * CHECK DROP AREA - This is the function that runs to check drop area and match items
 * 
 */
function checkDropArea(item) {
	var itemDistance = getDistanceByValue(item.x, item.y, dropAreaSettings.x, dropAreaSettings.y);
	var targetItem = null;
	var dropPos = {
		x: 0,
		y: 0
	};

	if (itemDistance <= dropAreaSettings.radius) {
		if (gameData.dropMatch == null) {
			targetItem = gameData.dropMatch = item;
			targetItem.focus = true;
			dropPos.x = dropAreaSettings.x - (dropAreaSettings.radius / 2);
			dropPos.y = dropAreaSettings.y;
		} else {
			if (gameData.dropMatch.itemType == item.itemType) {
				gameData.completeItems.push(gameData.dropMatch);
				gameData.completeItems.push(item);
				gameData.dropMatch.complete = item.complete = true;
				gameData.dropMatch = null;
				targetItem = item;

				dropPos.x = dropAreaSettings.x + (dropAreaSettings.radius / 2);
				dropPos.y = dropAreaSettings.y;

				//console.log("MATCH");
				//console.log(Math.floor(playerData.timer / 1000) + " seconds");
				//console.log("Objects Done: " + gameData.completeItems.length);
				playSound('soundRight');
			} else {
				item.speedX = randomIntFromInterval(-40, 40);
				item.speedY = randomIntFromInterval(-80, 0);
				Skillprint.sendMatch({
					event: "UNMATCH",
					object_done: gameData.complete,
					//time: Math.floor(playerData.timer / 1000)
				});
				//console.log("UNMATCH");
				//console.log(Math.floor(playerData.timer / 1000) + " seconds");
				//console.log("Objects Done: " + gameData.completeItems.length);
				playSound('soundWrong');
			}
		}
	}

	if (targetItem != null) {
		var rotateNum = randomIntFromInterval(10, 50);
		if (randomBoolean()) {
			rotateNum = item.rotation + rotateNum;
		} else {
			rotateNum = item.rotation - rotateNum;
		}

		TweenMax.to(targetItem, .5, {
			x: dropPos.x,
			y: dropPos.y,
			rotation: rotateNum,
			overwrite: true,
			onComplete: function () {
				if (gameData.completeItems.length > 0) {
					var scaleNum = .5;
					TweenMax.to(gameData.completeItems[0], .5, {
						scaleX: scaleNum,
						scaleY: scaleNum,
						alpha: 0,
						overwrite: true
					});
					TweenMax.to(gameData.completeItems[1], .5, {
						scaleX: scaleNum,
						scaleY: scaleNum,
						alpha: 0,
						overwrite: true
					});
					gameData.completeItems.length = 0;
					gameData.complete++;
					Skillprint.sendMatch({
						event: "MATCH",
						object_done: gameData.complete,
						//time: Math.floor(playerData.timer / 1000)
					});
					if (gameData.complete == gameData.total) {
						stopTimer();
						Skillprint.levelComplete({
							level: playerData.score
						});
						//console.log("Level Complete");
						//console.log("Level: " + playerData.score);
						playSound('soundComplete');
						gameData.timer = false;
						displayGameText('complete');
						gameData.timerAlert = false;
						timerTxt.visible = false;
						timerAlertTxt.visible = false;
						toggleAnimateBlink(timerAlertTxt, false);

						TweenMax.to(gameContainer, 3, {
							overwrite: true,
							onComplete: function () {
								prepareNextLevel();
							}
						});
					}
				}
			}
		});
	}
}

/*!
 * 
 * PREPARE NEXT LEVEL - This is the function that runs to prepare next level
 * 
 */
function prepareNextLevel() {
	playerData.score++;
	gameData.timerStart += levelSettings.timerIncrease;
	gameData.total += levelSettings.totalIncrease;
	gameData.total = gameData.total > gameData.items.length - 1 ? gameData.items.length - 1 : gameData.total;
	startGame();
}

/*!
 * 
 * LOOP UPDATE GAME - This is the function that runs to update game loop
 * 
 */
function updateGame() {
	if (!gameData.paused) {
		if (gameData.timer) {
			gameData.nowDate = new Date();
			//gameData.timerCount = (gameData.nowDate.getTime() - gameData.startDate.getTime());
			//playerData.timer = gameData.timerStart - gameData.timerCount;

			/*if (playerData.timer <= 10000) {
				if (!gameData.timerAlert) {
					gameData.timerAlert = true;
					timerAlertTxt.visible = true;
					toggleAnimateBlink(timerAlertTxt, true, .3, [.2, .8]);
				}
			} else {
				gameData.timerAlert = false;
				timerAlertTxt.visible = false;
				toggleAnimateBlink(timerAlertTxt, false);
			}*/

			/*if (gameData.timerCount > gameData.timerStart) {

				//console.log("Game End");
				//console.log("Level: " + playerData.score);
				playSound('soundTimesup');
				gameData.paused = true;
				gameData.timer = false;
				displayGameText('timesup');
				backgroundItemEasingLarge(gameStatusTxt);

				TweenMax.to(gameContainer, 2.5, {
					overwrite: true,
					onComplete: function () {
						goPage('result');
					}
				});
			}*/
			updateStats();
		}
	}

	var wallBounce = {
		startX: offset.x,
		endX: canvasW - offset.x,
		startY: offset.y,
		endY: canvasH - offset.y
	};
	for (var n = 0; n < gameData.matchItems.length; n++) {
		var itemObj = gameData.matchItems[n];

		//if not dragging
		if (!itemObj.dragging) {
			//calculate new x and y position
			itemObj.y = itemObj.y + itemObj.speedY;
			itemObj.x = itemObj.x + itemObj.speedX;

			//bounce off the bottom of stage and reverse speedY
			if (itemObj.y + itemObj.radius / 2 > wallBounce.endY) {
				itemObj.y = wallBounce.endY - itemObj.radius / 2;
				itemObj.speedY = -itemObj.speedY * gravitySettings.bounce;
			}

			//bounce off the top of stage and reverse speedY
			if (itemObj.y - itemObj.radius / 2 < wallBounce.startY) {
				itemObj.y = wallBounce.startY + (itemObj.radius / 2);
				itemObj.speedY = -itemObj.speedY * gravitySettings.bounce;
			}

			//bounce off right of stage
			if (itemObj.x + itemObj.radius / 2 > wallBounce.endX) {
				itemObj.x = wallBounce.endX - itemObj.radius / 2;
				itemObj.speedX = -itemObj.speedX * gravitySettings.bounce;
			}
			//bounce off left of stage  
			if (itemObj.x - itemObj.radius / 2 < wallBounce.startX) {
				itemObj.x = wallBounce.startX + (itemObj.radius / 2);
				itemObj.speedX = -itemObj.speedX * gravitySettings.bounce;
			}
			//recalculate x and y speeds figuring in drag (friction) and gravity for y  
			itemObj.speedY = itemObj.speedY * gravitySettings.drag + gravitySettings.gravity;
			itemObj.speedX = itemObj.speedX * gravitySettings.drag;
		} else {
			//if dragging then calculate new speeds according to dragging movement and speed
			itemObj.speedX = itemObj.x - itemObj.oldX;
			itemObj.speedY = itemObj.y - itemObj.oldY;
			itemObj.oldX = itemObj.x;
			itemObj.oldY = itemObj.y;

			var moveSpeed = 20;
			if (Math.abs(itemObj.speedX) >= moveSpeed || Math.abs(itemObj.speedY) >= moveSpeed) {
				for (var p = 0; p < gameData.matchItems.length; p++) {
					var areaObj = gameData.matchItems[p];
					if (areaObj != itemObj && !areaObj.complete && !areaObj.focus) {
						var distanceNum = getDistance(itemObj, areaObj);
						if (distanceNum < 100) {
							areaObj.speedX = (areaObj.x - itemObj.x) * .05;
							areaObj.speedY = (areaObj.y - itemObj.y) * .05;
						}
					}
				}
			}
		}
	}
}

/*!
 * 
 * UPDATE GAME STATUS - This is the function that runs to update game status
 * 
 */

function displayGameText(con) {
	if (con == 'complete') {
		gameStatusTxt.text = stageCompleteText.replace('[NUMBER]', playerData.score);
	}
	/*else if (con == 'timesup') {
		gameStatusTxt.text = timersupText;
	} */
	else {
		gameStatusTxt.text = '';
	}

	if (con != '') {
		gameStatusTxt.alpha = 0;
		TweenMax.to(gameStatusTxt, .5, {
			alpha: 1,
			overwrite: true
		});
	}
}

function updateStats() {
	/*if (!gameData.timer) {
		timerTxt.text = timerAlertTxt.text = millisecondsToTime(0);
	} else {
		timerTxt.text = timerAlertTxt.text = millisecondsToTime(playerData.timer);
	}*/
	timerTxt.text = timeReadable;
}

/*!
 * 
 * MILLISECONDS CONVERT - This is the function that runs to convert milliseconds to time
 * 
 */
function millisecondsToTime(milli) {
	var milliseconds = milli % 1000;
	var seconds = Math.floor((milli / 1000) % 60);
	var minutes = Math.floor((milli / (60 * 1000)) % 60);

	if (seconds < 10) {
		seconds = '0' + seconds;
	}

	if (minutes < 10) {
		minutes = '0' + minutes;
	}

	return minutes + ':' + seconds;
}

/*!
 * 
 * OPTIONS - This is the function that runs to toggle options
 * 
 */

function toggleOption() {
	if (optionsContainer.visible) {
		optionsContainer.visible = false;
	} else {
		optionsContainer.visible = true;
	}
}

/*!
 * 
 * OPTIONS - This is the function that runs to mute and fullscreen
 * 
 */
function toggleGameMute(con) {
	buttonSoundOff.visible = false;
	buttonSoundOn.visible = false;
	toggleMute(con);
	if (con) {
		buttonSoundOn.visible = true;
	} else {
		buttonSoundOff.visible = true;
	}
}

function toggleFullScreen() {
	if (!document.fullscreenElement && // alternative standard method
		!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
		if (document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen();
		} else if (document.documentElement.msRequestFullscreen) {
			document.documentElement.msRequestFullscreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullscreen) {
			document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}


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
		GameTime = secondsPassed;
		timeReadable = secondsToTime();
	}, 1000);
}

function stopTimer() {
	if (gameTimer !== null) {
		clearInterval(gameTimer);
		gameTimer = null;
	}
}
/*!
 * 
 * SHARE - This is the function that runs to open share url
 * 
 */
/*function share(action) {
	gtag('event', 'click', {
		'event_category': 'share',
		'event_label': action
	});

	var loc = location.href
	loc = loc.substring(0, loc.lastIndexOf("/") + 1);

	var title = '';
	var text = '';

	title = title.replace("[NUMBER]", playerData.score);
	text = text.replace("[NUMBER]", playerData.score);
	var shareurl = '';

	if (action == 'twitter') {
		shareurl = 'https://twitter.com/intent/tweet?url=' + loc + '&text=' + text;
	} else if (action == 'facebook') {
		shareurl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(loc + 'share.php?desc=' + text + '&title=' + title + '&url=' + loc + '&thumb=' + loc + 'share.jpg&width=590&height=300');
	} else if (action == 'whatsapp') {
		shareurl = "whatsapp://send?text=" + encodeURIComponent(text) + " - " + encodeURIComponent(loc);
	}

	window.open(shareurl);
}*/