var Utils;
(function (Utils) {
    var AssetLoader = (function () {
        function AssetLoader(_lang, _aFileData, _ctx, _canvasWidth, _canvasHeight, _showBar) {
            if (typeof _showBar === "undefined") { _showBar = true; }
            this.oAssetData = {
            };
            this.assetsLoaded = 0;
            this.textData = {
            };
            this.totalAssets = _aFileData.length;
            this.ctx = _ctx;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.showBar = _showBar;
            this.topLeftX = this.canvasWidth / 2 - _canvasWidth / 4;
            this.topLeftY = 440;
            if(this.showBar) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.fillStyle = "#1E95EF";
                ctx.moveTo(this.topLeftX, this.topLeftY);
                ctx.lineTo(this.topLeftX + _canvasWidth / 2, this.topLeftY + 0);
                ctx.lineTo(this.topLeftX + _canvasWidth / 2, this.topLeftY + 20);
                ctx.lineTo(this.topLeftX + 0, this.topLeftY + 20);
                ctx.lineTo(this.topLeftX + 0, this.topLeftY + 0);
                ctx.stroke();
            }
            for(var i = 0; i < _aFileData.length; i++) {
                if(_aFileData[i].file.indexOf(".json") != -1) {
                    this.loadJSON(_aFileData[i]);
                } else {
                    this.loadImage(_aFileData[i]);
                }
            }
        }
        AssetLoader.prototype.loadExtraAssets = function (_callback, _aFileData) {
            this.showBar = false;
            this.totalAssets = _aFileData.length;
            this.assetsLoaded = 0;
            this.loadedCallback = _callback;
            for(var i = 0; i < _aFileData.length; i++) {
                if(_aFileData[i].file.indexOf(".json") != -1) {
                    this.loadJSON(_aFileData[i]);
                } else {
                    this.loadImage(_aFileData[i]);
                }
            }
        };
        AssetLoader.prototype.loadJSON = function (_oData) {
            var _this = this;
            var xobj = new XMLHttpRequest();
            xobj.open('GET', _oData.file, true);
            xobj.onreadystatechange = function () {

                var protocolRegex = new RegExp('^file:', 'i');
                var isFileProtocol = protocolRegex.test(xobj.responseURL);

                if (xobj.readyState == 4
                && (xobj.status == 200 || isFileProtocol && xobj.status === 0)) {
                    _this.textData[_oData.id] = JSON.parse(xobj.responseText);
                    ++_this.assetsLoaded;
                    _this.updatePreloadScreen();
                    _this.checkLoadComplete();
                }
            };
            xobj.send(null);
        };
        AssetLoader.prototype.loadImage = function (_oData) {
            var _this = this;
            var img = new Image();
            img.onload = function () {
                _this.oAssetData[_oData.id] = {
                };
                _this.oAssetData[_oData.id].img = img;
                _this.oAssetData[_oData.id].oData = {
                };
                var aSpriteSize = _this.getSpriteSize(_oData.file);
                if(aSpriteSize[0] != 0) {
                    _this.oAssetData[_oData.id].oData.spriteWidth = aSpriteSize[0];
                    _this.oAssetData[_oData.id].oData.spriteHeight = aSpriteSize[1];
                } else {
                    _this.oAssetData[_oData.id].oData.spriteWidth = _this.oAssetData[_oData.id].img.width;
                    _this.oAssetData[_oData.id].oData.spriteHeight = _this.oAssetData[_oData.id].img.height;
                }
                if(_oData.oAnims) {
                    _this.oAssetData[_oData.id].oData.oAnims = _oData.oAnims;
                }
                if(_oData.oAtlasData) {
                    _this.oAssetData[_oData.id].oData.oAtlasData = _oData.oAtlasData;
                } else {
                    _this.oAssetData[_oData.id].oData.oAtlasData = {
                        none: {
                            x: 0,
                            y: 0,
                            width: _this.oAssetData[_oData.id].oData.spriteWidth,
                            height: _this.oAssetData[_oData.id].oData.spriteHeight
                        }
                    };
                }
                ++_this.assetsLoaded;
                _this.updatePreloadScreen();
                _this.checkLoadComplete();
            };
            img.src = _oData.file;
        };
        AssetLoader.prototype.updatePreloadScreen = function () {
            ctx.fillStyle = "#C094E7";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "#8548B8";
            ctx.lineWidth = 2;
            ctx.fillStyle = "#E9DFF3";
            ctx.moveTo(this.topLeftX, this.topLeftY);
            ctx.lineTo(this.topLeftX + canvas.width / 2, this.topLeftY + 0);
            ctx.lineTo(this.topLeftX + canvas.width / 2, this.topLeftY + 20);
            ctx.lineTo(this.topLeftX + 0, this.topLeftY + 20);
            ctx.lineTo(this.topLeftX + 0, this.topLeftY + 0);
            ctx.stroke();
            if(this.showBar) {
                ctx.fillRect(this.topLeftX + 2, this.topLeftY + 2, ((this.canvasWidth / 2 - 4) / this.totalAssets) * this.assetsLoaded, 16);
            }
            var oImgData = preAssetLib.getData("preloadImage");
            ctx.drawImage(oImgData.img, 0, 0);
        };
        AssetLoader.prototype.getSpriteSize = function (_file) {
            var aNew = new Array();
            var sizeY = "";
            var sizeX = "";
            var stage = 0;
            var inc = _file.lastIndexOf(".");
            var canCont = true;
            while(canCont) {
                inc--;
                if(stage == 0 && this.isNumber(_file.charAt(inc))) {
                    sizeY = _file.charAt(inc) + sizeY;
                } else if(stage == 0 && sizeY.length > 0 && _file.charAt(inc) == "x") {
                    inc--;
                    stage = 1;
                    sizeX = _file.charAt(inc) + sizeX;
                } else if(stage == 1 && this.isNumber(_file.charAt(inc))) {
                    sizeX = _file.charAt(inc) + sizeX;
                } else if(stage == 1 && sizeX.length > 0 && _file.charAt(inc) == "_") {
                    canCont = false;
                    aNew = [
                        parseInt(sizeX),
                        parseInt(sizeY)
                    ];
                } else {
                    canCont = false;
                    aNew = [
                        0,
                        0
                    ];
                }
            }
            return aNew;
        };
        AssetLoader.prototype.isNumber = function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        AssetLoader.prototype.checkLoadComplete = function () {
            if(this.assetsLoaded == this.totalAssets) {
                this.loadedCallback();
            }
        };
        AssetLoader.prototype.onReady = function (_func) {
            this.loadedCallback = _func;
        };
        AssetLoader.prototype.getImg = function (_id) {
            return this.oAssetData[_id].img;
        };
        AssetLoader.prototype.getData = function (_id) {
            return this.oAssetData[_id];
        };
        return AssetLoader;
    })();
    Utils.AssetLoader = AssetLoader;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var AnimSprite = (function () {
        function AnimSprite(_oImgData, _fps, _radius, _animId) {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.radius = 10;
            this.removeMe = false;
            this.frameInc = 0;
            this.animType = "loop";
            this.offsetX = 0;
            this.offsetY = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.alpha = 1;
            this.oImgData = _oImgData;
            this.oAnims = this.oImgData.oData.oAnims;
            this.fps = _fps;
            this.radius = _radius;
            this.animId = _animId;
            this.centreX = Math.round(this.oImgData.oData.spriteWidth / 2);
            this.centreY = Math.round(this.oImgData.oData.spriteHeight / 2);
        }
        AnimSprite.prototype.updateAnimation = function (_delta) {
            this.frameInc += this.fps * _delta;
        };
        AnimSprite.prototype.changeImgData = function (_newImgData, _animId) {
            this.oImgData = _newImgData;
            this.oAnims = this.oImgData.oData.oAnims;
            this.animId = _animId;
            this.centreX = Math.round(this.oImgData.oData.spriteWidth / 2);
            this.centreY = Math.round(this.oImgData.oData.spriteHeight / 2);
            this.resetAnim();
        };
        AnimSprite.prototype.resetAnim = function () {
            this.frameInc = 0;
        };
        AnimSprite.prototype.setFrame = function (_frameNum) {
            this.fixedFrame = _frameNum;
        };
        AnimSprite.prototype.setAnimType = function (_type, _animId, _reset) {
            if (typeof _reset === "undefined") { _reset = true; }
            this.animId = _animId;
            this.animType = _type;
            if(_reset) {
                this.resetAnim();
            }
            switch(_type) {
                case "loop":
                    break;
                case "once":
                    this.maxIdx = this.oAnims[this.animId].length - 1;
                    break;
            }
        };
        AnimSprite.prototype.render = function (_ctx) {
            _ctx.save();
            _ctx.translate(this.x, this.y);
            _ctx.rotate(this.rotation);
            _ctx.scale(this.scaleX, this.scaleY);
            _ctx.globalAlpha = this.alpha;
            if(this.animId != null) {
                var max = this.oAnims[this.animId].length;
                var idx = Math.floor(this.frameInc);
                this.curFrame = this.oAnims[this.animId][idx % max];
                var imgX = (this.curFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.curFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                if(this.animType == "once") {
                    if(idx > this.maxIdx) {
                        this.fixedFrame = this.oAnims[this.animId][max - 1];
                        this.animId = null;
                        if(this.animEndedFunc != null) {
                            this.animEndedFunc();
                        }
                        var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                        var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                    }
                }
            } else {
                var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            }
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, -this.centreX + this.offsetX, -this.centreY + this.offsetY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight);
            _ctx.restore();
        };
        AnimSprite.prototype.renderSimple = function (_ctx) {
            if(this.animId != null) {
                var max = this.oAnims[this.animId].length;
                var idx = Math.floor(this.frameInc);
                this.curFrame = this.oAnims[this.animId][idx % max];
                var imgX = (this.curFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.curFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                if(this.animType == "once") {
                    if(idx > this.maxIdx) {
                        this.fixedFrame = this.oAnims[this.animId][max - 1];
                        this.animId = null;
                        if(this.animEndedFunc != null) {
                            this.animEndedFunc();
                        }
                        var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                        var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                    }
                }
            } else {
                var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            }
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, this.x - (this.centreX - this.offsetX) * this.scaleX, this.y - (this.centreY - this.offsetY) * this.scaleY, this.oImgData.oData.spriteWidth * this.scaleX, this.oImgData.oData.spriteHeight * this.scaleY);
        };
        return AnimSprite;
    })();
    Utils.AnimSprite = AnimSprite;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var BasicSprite = (function () {
        function BasicSprite(_oImgData, _radius, _frame) {
            if (typeof _frame === "undefined") { _frame = 0; }
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.radius = 10;
            this.removeMe = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.oImgData = _oImgData;
            this.radius = _radius;
            this.setFrame(_frame);
        }
        BasicSprite.prototype.setFrame = function (_frameNum) {
            this.frameNum = _frameNum;
        };
        BasicSprite.prototype.render = function (_ctx) {
            _ctx.save();
            _ctx.translate(this.x, this.y);
            _ctx.rotate(this.rotation);
            _ctx.scale(this.scaleX, this.scaleY);
            var imgX = (this.frameNum * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
            var imgY = Math.floor(this.frameNum / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, -this.oImgData.oData.spriteWidth / 2 + this.offsetX, -this.oImgData.oData.spriteHeight / 2 + this.offsetY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight);
            _ctx.restore();
        };
        return BasicSprite;
    })();
    Utils.BasicSprite = BasicSprite;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var UserInput = (function () {
        function UserInput(_canvas, _isBugBrowser) {
            var _this = this;
            this.canvasX = 0;
            this.canvasY = 0;
            this.canvasScaleX = 1;
            this.canvasScaleY = 1;
            this.prevHitTime = 0;
            this.pauseIsOn = false;
            this.isDown = false;
            this.isBugBrowser = _isBugBrowser;
            this.keyDownEvtFunc = function (e) {
                _this.keyDown(e);
            };
            this.keyUpEvtFunc = function (e) {
                _this.keyUp(e);
            };
            _canvas.addEventListener("touchstart", function (e) {
                for(var i = 0; i < e.changedTouches.length; i++) {
                    _this.hitDown(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier);
                }
            }, false);
            _canvas.addEventListener("touchend", function (e) {
                for(var i = 0; i < e.changedTouches.length; i++) {
                    _this.hitUp(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier);
                }
            }, false);
            _canvas.addEventListener("touchmove", function (e) {
                for(var i = 0; i < e.changedTouches.length; i++) {
                    _this.move(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier, true);
                }
            }, false);
            _canvas.addEventListener("mousedown", function (e) {
                _this.isDown = true;
                _this.hitDown(e, e.pageX, e.pageY, 1);
            }, false);
            _canvas.addEventListener("mouseup", function (e) {
                _this.isDown = false;
                _this.hitUp(e, e.pageX, e.pageY, 1);
            }, false);
            _canvas.addEventListener("mousemove", function (e) {
                _this.move(e, e.pageX, e.pageY, 1, _this.isDown);
            }, false);
            this.aHitAreas = new Array();
            this.aKeys = new Array();
        }
        UserInput.prototype.setCanvas = function (_canvasX, _canvasY, _canvasScaleX, _canvasScaleY) {
            this.canvasX = _canvasX;
            this.canvasY = _canvasY;
            this.canvasScaleX = _canvasScaleX;
            this.canvasScaleY = _canvasScaleY;
        };
        UserInput.prototype.hitDown = function (e, _posX, _posY, _identifer) {
            e.preventDefault();
            e.stopPropagation();
            if(this.pauseIsOn) {
                return;
            }
            var curHitTime = new Date().getTime();
            _posX = (_posX - this.canvasX) * this.canvasScaleX;
            _posY = (_posY - this.canvasY) * this.canvasScaleY;
            for(var i = 0; i < this.aHitAreas.length; i++) {
                if(this.aHitAreas[i].rect) {
                    if(_posX > this.aHitAreas[i].area[0] && _posY > this.aHitAreas[i].area[1] && _posX < this.aHitAreas[i].area[2] && _posY < this.aHitAreas[i].area[3]) {
                        this.aHitAreas[i].aTouchIdentifiers.push(_identifer);
                        this.aHitAreas[i].oData.hasLeft = false;
                        if(!this.aHitAreas[i].oData.isDown) {
                            this.aHitAreas[i].oData.isDown = true;
                            this.aHitAreas[i].oData.x = _posX;
                            this.aHitAreas[i].oData.y = _posY;
                            if((curHitTime - this.prevHitTime < 500 && (gameState != "game" || this.aHitAreas[i].id == "pause")) && isBugBrowser) {
                                return;
                            }
                            this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                        }
                        break;
                    }
                } else {
                }
            }
            this.prevHitTime = curHitTime;
        };
        UserInput.prototype.hitUp = function (e, _posX, _posY, _identifer) {
            if(!ios9FirstTouch) {
                playSound("silence");
                ios9FirstTouch = true;
            }
            if(this.pauseIsOn) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            _posX = (_posX - this.canvasX) * this.canvasScaleX;
            _posY = (_posY - this.canvasY) * this.canvasScaleY;
            for(var i = 0; i < this.aHitAreas.length; i++) {
                if(this.aHitAreas[i].rect) {
                    if(_posX > this.aHitAreas[i].area[0] && _posY > this.aHitAreas[i].area[1] && _posX < this.aHitAreas[i].area[2] && _posY < this.aHitAreas[i].area[3]) {
                        for(var j = 0; j < this.aHitAreas[i].aTouchIdentifiers.length; j++) {
                            if(this.aHitAreas[i].aTouchIdentifiers[j] == _identifer) {
                                this.aHitAreas[i].aTouchIdentifiers.splice(j, 1);
                                j -= 1;
                            }
                        }
                        if(this.aHitAreas[i].aTouchIdentifiers.length == 0) {
                            this.aHitAreas[i].oData.isDown = false;
                            if(this.aHitAreas[i].oData.multiTouch) {
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                            }
                        }
                        break;
                    }
                } else {
                }
            }
        };
        UserInput.prototype.move = function (e, _posX, _posY, _identifer, _isDown) {
            if(this.pauseIsOn) {
                return;
            }
            if(_isDown) {
                _posX = (_posX - this.canvasX) * this.canvasScaleX;
                _posY = (_posY - this.canvasY) * this.canvasScaleY;
                for(var i = 0; i < this.aHitAreas.length; i++) {
                    if(this.aHitAreas[i].rect) {
                        if(_posX > this.aHitAreas[i].area[0] && _posY > this.aHitAreas[i].area[1] && _posX < this.aHitAreas[i].area[2] && _posY < this.aHitAreas[i].area[3]) {
                            this.aHitAreas[i].oData.hasLeft = false;
                            if(!this.aHitAreas[i].oData.isDown) {
                                this.aHitAreas[i].oData.isDown = true;
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].aTouchIdentifiers.push(_identifer);
                                if(this.aHitAreas[i].oData.multiTouch) {
                                    this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                }
                            }
                            if(this.aHitAreas[i] && this.aHitAreas[i].oData.isDraggable) {
                                this.aHitAreas[i].oData.isBeingDragged = true;
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                this.aHitAreas[i].oData.isBeingDragged = false;
                            }
                        } else if(this.aHitAreas[i].oData.isDown && !this.aHitAreas[i].oData.hasLeft) {
                            for(var j = 0; j < this.aHitAreas[i].aTouchIdentifiers.length; j++) {
                                if(this.aHitAreas[i].aTouchIdentifiers[j] == _identifer) {
                                    this.aHitAreas[i].aTouchIdentifiers.splice(j, 1);
                                    j -= 1;
                                }
                            }
                            if(this.aHitAreas[i].aTouchIdentifiers.length == 0) {
                                this.aHitAreas[i].oData.hasLeft = true;
                                if(!this.aHitAreas[i].oData.isBeingDragged) {
                                    this.aHitAreas[i].oData.isDown = false;
                                }
                                if(this.aHitAreas[i].oData.multiTouch) {
                                    this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                }
                            }
                        }
                    }
                }
            }
        };
        UserInput.prototype.keyDown = function (e) {
            for(var i = 0; i < this.aKeys.length; i++) {
                if(e.keyCode == this.aKeys[i].keyCode) {
                    this.aKeys[i].oData.isDown = true;
                    this.aKeys[i].callback(this.aKeys[i].id, this.aKeys[i].oData);
                }
            }
        };
        UserInput.prototype.keyUp = function (e) {
            for(var i = 0; i < this.aKeys.length; i++) {
                if(e.keyCode == this.aKeys[i].keyCode) {
                    this.aKeys[i].oData.isDown = false;
                    this.aKeys[i].callback(this.aKeys[i].id, this.aKeys[i].oData);
                }
            }
        };
        UserInput.prototype.checkKeyFocus = function () {
            window.focus();
            if(this.aKeys.length > 0) {
                window.removeEventListener('keydown', this.keyDownEvtFunc, false);
                window.removeEventListener('keyup', this.keyUpEvtFunc, false);
                window.addEventListener('keydown', this.keyDownEvtFunc, false);
                window.addEventListener('keyup', this.keyUpEvtFunc, false);
            }
        };
        UserInput.prototype.addKey = function (_id, _callback, _oCallbackData, _keyCode) {
            if(_oCallbackData == null) {
                _oCallbackData = new Object();
            }
            this.aKeys.push({
                id: _id,
                callback: _callback,
                oData: _oCallbackData,
                keyCode: _keyCode
            });
            this.checkKeyFocus();
        };
        UserInput.prototype.removeKey = function (_id) {
            for(var i = 0; i < this.aKeys.length; i++) {
                if(this.aKeys[i].id == _id) {
                    this.aKeys.splice(i, 1);
                    i -= 1;
                }
            }
        };
        UserInput.prototype.addHitArea = function (_id, _callback, _oCallbackData, _type, _oAreaData, _isUnique) {
            if (typeof _isUnique === "undefined") { _isUnique = false; }
            if(_oCallbackData == null) {
                _oCallbackData = new Object();
            }
            if(_isUnique) {
                this.removeHitArea(_id);
            }
            if(!_oAreaData.scale) {
                _oAreaData.scale = 1;
            }
            var aTouchIdentifiers = new Array();
            switch(_type) {
                case "image":
                    var aRect;
                    aRect = new Array(_oAreaData.aPos[0] - (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].width / 2) * _oAreaData.scale, _oAreaData.aPos[1] - (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].height / 2) * _oAreaData.scale, _oAreaData.aPos[0] + (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].width / 2) * _oAreaData.scale, _oAreaData.aPos[1] + (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].height / 2) * _oAreaData.scale);
                    this.aHitAreas.push({
                        id: _id,
                        aTouchIdentifiers: aTouchIdentifiers,
                        callback: _callback,
                        oData: _oCallbackData,
                        rect: true,
                        area: aRect
                    });
                    break;
                case "rect":
                    this.aHitAreas.push({
                        id: _id,
                        aTouchIdentifiers: aTouchIdentifiers,
                        callback: _callback,
                        oData: _oCallbackData,
                        rect: true,
                        area: _oAreaData.aRect
                    });
                    break;
            }
        };
        UserInput.prototype.removeHitArea = function (_id) {
            for(var i = 0; i < this.aHitAreas.length; i++) {
                if(this.aHitAreas[i].id == _id) {
                    this.aHitAreas.splice(i, 1);
                    i -= 1;
                }
            }
        };
        UserInput.prototype.resetAll = function () {
            for(var i = 0; i < this.aHitAreas.length; i++) {
                this.aHitAreas[i].oData.isDown = false;
                this.aHitAreas[i].oData.isBeingDragged = false;
                this.aHitAreas[i].aTouchIdentifiers = new Array();
            }
            this.isDown = false;
        };
        return UserInput;
    })();
    Utils.UserInput = UserInput;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var FpsMeter = (function () {
        function FpsMeter(_canvasHeight) {
            this.updateFreq = 10;
            this.updateInc = 0;
            this.frameAverage = 0;
            this.display = 1;
            this.log = "";
            this.render = function (_ctx) {
                this.frameAverage += this.delta / this.updateFreq;
                if(++this.updateInc >= this.updateFreq) {
                    this.updateInc = 0;
                    this.display = this.frameAverage;
                    this.frameAverage = 0;
                }
                _ctx.textAlign = "left";
                ctx.font = "10px Helvetica";
                _ctx.fillStyle = "#333333";
                _ctx.beginPath();
                _ctx.rect(0, this.canvasHeight - 15, 40, 15);
                _ctx.closePath();
                _ctx.fill();
                _ctx.fillStyle = "#ffffff";
                _ctx.fillText(Math.round(1000 / (this.display * 1000)) + " fps " + this.log, 5, this.canvasHeight - 5);
            };
            this.canvasHeight = _canvasHeight;
        }
        FpsMeter.prototype.update = function (_delta) {
            this.delta = _delta;
        };
        return FpsMeter;
    })();
    Utils.FpsMeter = FpsMeter;
})(Utils || (Utils = {}));
var Elements;
(function (Elements) {
    var Background = (function () {
        function Background() {
            this.x = 0;
            this.y = 0;
            this.targY = 0;
            this.incY = 0;
            this.renderState = "none";
            this.bgId = 0;
            this.setBackground();
        }
        Background.prototype.setBackground = function (_id) {
            if (typeof _id === "undefined") { _id = -1; }
            if(_id == -1) {
                _id = Math.floor(Math.random() * 5);
            }
            this.oImgData = assetLib.getData("background" + _id);
        };
        Background.prototype.update = function () {
            switch(this.renderState) {
                case "menuScroll":
                    this.incY += 5 * delta;
                    this.x = (this.x - (Math.sin(this.incY / 10) * 50) * delta);
                    this.y = (this.y - 50 * delta);
                    break;
                case "ripple":
                    this.incY += 2 * delta;
                    break;
            }
        };
        Background.prototype.render = function () {
            switch(this.renderState) {
                case "menuScroll":
                    this.x = this.x % canvas.width;
                    this.y = this.y % canvas.height;
                    if(this.x < 0) {
                        this.x += canvas.width;
                    }
                    if(this.y < 0) {
                        this.y += canvas.height;
                    }
                    ctx.drawImage(this.oImgData.img, this.x, this.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                    break;
                case "ripple":
                    var segs = 25;
                    ctx.drawImage(this.oImgData.img, 0, 0);
                    for(var i = 0; i < segs; i++) {
                        ctx.drawImage(this.oImgData.img, 0, i * (canvas.height / segs), canvas.width, canvas.height / segs, Math.sin(this.incY + i / 2) * 5, i * (canvas.height / segs), canvas.width, canvas.height / segs);
                    }
                    break;
                case "none":
                    ctx.drawImage(this.oImgData.img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                    break;
            }
        };
        return Background;
    })();
    Elements.Background = Background;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Splash = (function () {
        function Splash(_oSplashScreenImgData, _canvasWidth, _canvasHeight) {
            this.inc = 0;
            this.oSplashScreenImgData = _oSplashScreenImgData;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.posY = -this.canvasHeight;
            TweenLite.to(this, .5, {
                posY: 0
            });
        }
        Splash.prototype.render = function (_ctx, _delta) {
            this.inc += 5 * _delta;
            _ctx.drawImage(this.oSplashScreenImgData.img, 0, 0 - this.posY);
        };
        return Splash;
    })();
    Elements.Splash = Splash;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Panel = (function () {
        function Panel(_panelType, _aButs) {
            this.timer = .3;
            this.endTime = 0;
            this.posY = 0;
            this.numberSpace = 17;
            this.incY = 0;
            this.flareRot = 0;
            this.letterSpace = 24;
            this.numberScale = .75;
            this.oTitleImgData = assetLib.getData("title");
            this.oSplashImgData = assetLib.getData("splash");
            this.oNumbers0ImgData = assetLib.getData("numbers0");
            this.oNumbers1ImgData = assetLib.getData("numbers1");
            this.oTopFlareImgData = assetLib.getData("flare");
            this.oGameElementsImgData = assetLib.getData("gameElements");
            this.oBubblesImgData = assetLib.getData("bubbles");
            this.oMapImgData = assetLib.getData("map");
            this.oUiButsImgData = assetLib.getData("uiButs");
            this.panelType = _panelType;
            this.aButs = _aButs;
        }
        Panel.prototype.update = function (_delta) {
            this.incY += 10 * _delta;
        };
        Panel.prototype.startTween1 = function () {
            this.posY = 550;
            TweenLite.to(this, .4, {
                posY: 0,
                ease: "Back.easeOut"
            });
        };
        Panel.prototype.startMapTween = function (_targY) {
            this.mapPosY = Math.max(_targY - 100, 0);
            this.mapTween = TweenLite.to(this, 1, {
                mapPosY: _targY,
                ease: "Cubic.easeOut"
            });
        };
        Panel.prototype.startTween2 = function () {
            this.posY = 550;
            TweenLite.to(this, .5, {
                posY: 0,
                ease: "Quad.easeOut"
            });
        };
        Panel.prototype.tweenOffScreen = function (_onCompleteFunction) {
            if (typeof _onCompleteFunction === "undefined") { _onCompleteFunction = null; }
            TweenLite.to(this, .5, {
                posY: 550,
                ease: "Quad.easeIn",
                onComplete: _onCompleteFunction
            });
        };
        Panel.prototype.render = function (_ctx, _butsOnTop) {
            if (typeof _butsOnTop === "undefined") { _butsOnTop = true; }
            if(!_butsOnTop) {
                this.addButs(_ctx);
            }
            switch(this.panelType) {
                case "start":
                    this.flareRot += delta / 3;
                    _ctx.save();
                    _ctx.translate(canvas.width / 2, 292 + this.posY);
                    _ctx.rotate(this.flareRot);
                    _ctx.scale(1.3, 1.3);
                    _ctx.drawImage(this.oTopFlareImgData.img, -this.oTopFlareImgData.img.width / 2, -this.oTopFlareImgData.img.height / 2);
                    _ctx.restore();
                    _ctx.save();
                    _ctx.translate(canvas.width / 2, 292 + this.posY);
                    _ctx.rotate(-this.flareRot);
                    _ctx.scale(1.3, 1.3);
                    _ctx.drawImage(this.oTopFlareImgData.img, -this.oTopFlareImgData.img.width / 2, -this.oTopFlareImgData.img.height / 2);
                    _ctx.restore();
                    _ctx.drawImage(this.oTitleImgData.img, 0, 0, canvas.width, canvas.height, 0, 0 + this.posY, canvas.width, canvas.height);
                    for(var i = 0; i < totalScore.toString().length; i++) {
                        var id = parseFloat(totalScore.toString().charAt(i));
                        var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                        ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, 10 + i * (this.letterSpace * this.numberScale), 4, this.oNumbers0ImgData.oData.spriteWidth * this.numberScale, this.oNumbers0ImgData.oData.spriteHeight * this.numberScale);
                    }
                    break;
                case "map":
                    this.mapPosRealY -= ((this.mapPosRealY - this.mapPosY) * 8) * delta;
                    ctx.drawImage(this.oMapImgData.img, 0, this.mapPosRealY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                    var butId;
                    if(this.mapButIdToHighlight != -1) {
                        this.flareRot += delta / 3;
                        ctx.save();
                        ctx.translate(aMapButs[this.mapButIdToHighlight][0], aMapButs[this.mapButIdToHighlight][1] - this.mapPosRealY);
                        ctx.rotate(this.flareRot);
                        ctx.scale(.5, .5);
                        ctx.drawImage(this.oTopFlareImgData.img, -this.oTopFlareImgData.img.width / 2, -this.oTopFlareImgData.img.height / 2);
                        ctx.restore();
                        ctx.save();
                        ctx.translate(aMapButs[this.mapButIdToHighlight][0], aMapButs[this.mapButIdToHighlight][1] - this.mapPosRealY);
                        ctx.rotate(-this.flareRot);
                        ctx.scale(.5, .5);
                        ctx.drawImage(this.oTopFlareImgData.img, -this.oTopFlareImgData.img.width / 2, -this.oTopFlareImgData.img.height / 2);
                        ctx.restore();
                    }
                    for(var i = 0; i < aMapButs.length; i++) {
                        if(saveDataHandler.getStars(i) == 0) {
                            butId = 0;
                        } else {
                            butId = 1;
                        }
                        var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["mapBut" + butId]].x;
                        var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["mapBut" + butId]].y;
                        var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["mapBut" + butId]].width;
                        var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["mapBut" + butId]].height;
                        _ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, aMapButs[i][0] - bWidth / 2, aMapButs[i][1] - bHeight / 2 - this.mapPosRealY, bWidth, bHeight);
                        if(butId == 1 && aLevelData.length > i) {
                            var starID = saveDataHandler.getStars(i);
                            if(starID > 1) {
                                var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["mapStars" + (starID - 2)]].x;
                                var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["mapStars" + (starID - 2)]].y;
                                var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["mapStars" + (starID - 2)]].width;
                                var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["mapStars" + (starID - 2)]].height;
                                _ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, aMapButs[i][0] - bWidth / 2, aMapButs[i][1] - bHeight / 2 - this.mapPosRealY - 20, bWidth, bHeight);
                            }
                        }
                    }
                    if(this.mapButIdToHighlight != -1) {
                        var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.hintFinger].x;
                        var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.hintFinger].y;
                        var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.hintFinger].width;
                        var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.hintFinger].height;
                        _ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, aMapButs[this.mapButIdToHighlight][0] - bWidth / 2, aMapButs[this.mapButIdToHighlight][1] - bHeight - this.mapPosRealY + Math.sin(this.incY + this.mapButIdToHighlight * 45) * 5 - 20, bWidth, bHeight);
                    }
                    for(var i = 0; i < totalScore.toString().length; i++) {
                        var id = parseFloat(totalScore.toString().charAt(i));
                        var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                        ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, 10 + i * (this.letterSpace * this.numberScale), 4, this.oNumbers0ImgData.oData.spriteWidth * this.numberScale, this.oNumbers0ImgData.oData.spriteHeight * this.numberScale);
                    }
                    break;
                case "credits":
                    _ctx.drawImage(this.oSplashImgData.img, 0, 0, canvas.width, canvas.height, 0, 0 + this.posY, canvas.width, canvas.height);
                    break;
                case "startPanel":
                    var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.introPanel].x;
                    var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.introPanel].y;
                    var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.introPanel].width;
                    var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.introPanel].height;
                    _ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 300 - bHeight / 2 + this.posY, bWidth, bHeight);
                    if(aLevelData[levelNum]["@levelType"] == 0) {
                        if(bubbleTargId == 0) {
                            var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.allColourBubble].x;
                            var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.allColourBubble].y;
                            var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.allColourBubble].width;
                            var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.allColourBubble].height;
                            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + 10 - bWidth / 2, 317 - bHeight / 2 + this.posY, bWidth, bHeight);
                        } else {
                            var imgX = ((bubbleTargId - 1) * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                            var imgY = Math.floor((bubbleTargId - 1) / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                            ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, canvas.width / 2 + 10 - this.oBubblesImgData.oData.spriteWidth / 2, 317 - this.oBubblesImgData.oData.spriteHeight / 2 + this.posY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
                        }
                        for(var i = 0; i < bubbleTargNum.toString().length; i++) {
                            var id = parseFloat(bubbleTargNum.toString().charAt(i));
                            var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                            var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                            ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, canvas.width / 2 - 16 + i * (this.letterSpace * this.numberScale) - (this.letterSpace * bubbleTargNum.toString().length) * this.numberScale, 300 + this.posY, this.oNumbers0ImgData.oData.spriteWidth * this.numberScale, this.oNumbers0ImgData.oData.spriteHeight * this.numberScale);
                        }
                    } else if(aLevelData[levelNum]["@levelType"] == 1) {
                        var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ceiling].x;
                        var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ceiling].y;
                        var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ceiling].width;
                        var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ceiling].height;
                        _ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * .55, 290 + this.posY, bWidth * .55, bHeight * .55);
                        for(var i = 0; i < 6; i++) {
                            var imgX = (16 * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                            var imgY = Math.floor(16 / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                            ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, canvas.width / 2 - 110 + i * 36, 320 + this.posY, this.oBubblesImgData.oData.spriteWidth * .90, this.oBubblesImgData.oData.spriteHeight * .90);
                        }
                    } else {
                        for(var i = 0; i < 5; i++) {
                            var imgX = ((i + 10) * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                            var imgY = Math.floor((i + 10) / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                            ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, canvas.width / 2 - 93 - this.oBubblesImgData.oData.spriteWidth / 2 + i * 45, 335 - this.oBubblesImgData.oData.spriteHeight / 2 + this.posY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
                        }
                    }
                    var oTextDisplayData = {
                        text: "startLevel" + aLevelData[levelNum]["@levelType"],
                        x: canvas.width / 2,
                        y: 260 + this.posY,
                        alignX: "centre",
                        alignY: "centre",
                        lineOffsetY: -6,
                        maxWidth: 270
                    };
                    textDisplay.renderText(oTextDisplayData);
                    break;
                case "endPanel":
                    _ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                    _ctx.fillRect(0, 0, canvas.width, canvas.height);
                    var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.infoPanel].x;
                    var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.infoPanel].y;
                    var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.infoPanel].width;
                    var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.infoPanel].height;
                    _ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 310 - bHeight / 2 + this.posY, bWidth, bHeight);
                    var tempId;
                    if(starBarLength >= aStarMarkers[0] / aStarMarkers[2]) {
                        tempId = "star";
                    } else {
                        tempId = "starFade";
                    }
                    var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].x;
                    var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].y;
                    var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].width;
                    var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].height;
                    _ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - 95 - bWidth / 2, 190 - bHeight / 2 + this.posY, bWidth, bHeight);
                    if(starBarLength >= aStarMarkers[1] / aStarMarkers[2]) {
                        tempId = "star";
                    } else {
                        tempId = "starFade";
                    }
                    var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].x;
                    var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].y;
                    var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].width;
                    var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].height;
                    _ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 175 - bHeight / 2 + this.posY, bWidth, bHeight);
                    if(starBarLength >= aStarMarkers[2] / aStarMarkers[2]) {
                        tempId = "star";
                    } else {
                        tempId = "starFade";
                    }
                    var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].x;
                    var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].y;
                    var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].width;
                    var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds[tempId]].height;
                    _ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + 95 - bWidth / 2, 190 - bHeight / 2 + this.posY, bWidth, bHeight);
                    var oTextDisplayData = {
                        text: "endLevel" + aLevelData[levelNum]["@levelType"],
                        x: canvas.width / 2,
                        y: 260 + this.posY,
                        alignX: "centre",
                        alignY: "top",
                        lineOffsetY: -6,
                        scale: .9,
                        maxWidth: 270
                    };
                    textDisplay.renderText(oTextDisplayData);
                    var oTextDisplayData = {
                        text: "levelScore",
                        x: canvas.width / 2,
                        y: 305 + this.posY,
                        alignX: "centre",
                        alignY: "top",
                        lineOffsetY: -6,
                        scale: .9,
                        maxWidth: 270
                    };
                    textDisplay.renderText(oTextDisplayData);
                    var tempScale = 1;
                    for(var i = 0; i < levelScore.toString().length; i++) {
                        var id = parseFloat(levelScore.toString().charAt(i));
                        var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                        ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, canvas.width / 2 + i * (this.letterSpace * tempScale) - (this.letterSpace * levelScore.toString().length / 2) * tempScale, 345 + this.posY, this.oNumbers0ImgData.oData.spriteWidth * tempScale, this.oNumbers0ImgData.oData.spriteHeight * tempScale);
                    }
                    break;
                case "endFailPanel":
                    _ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                    _ctx.fillRect(0, 0, canvas.width, canvas.height);
                    var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.infoPanel].x;
                    var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.infoPanel].y;
                    var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.infoPanel].width;
                    var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.infoPanel].height;
                    _ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 310 - bHeight / 2 + this.posY, bWidth, bHeight);
                    var oTextDisplayData = {
                        text: "gameOver",
                        x: canvas.width / 2,
                        y: 158 + this.posY,
                        alignX: "centre",
                        alignY: "top",
                        lineOffsetY: -6,
                        scale: .9,
                        maxWidth: 270
                    };
                    textDisplay.renderText(oTextDisplayData);
                    var oTextDisplayData = {
                        text: "tryAgain",
                        x: canvas.width / 2,
                        y: 350 + this.posY,
                        alignX: "centre",
                        alignY: "top",
                        lineOffsetY: -6,
                        scale: .9,
                        maxWidth: 270
                    };
                    textDisplay.renderText(oTextDisplayData);
                    var oTextDisplayData = {
                        text: "totalScore",
                        x: canvas.width / 2,
                        y: 260 + this.posY,
                        alignX: "centre",
                        alignY: "top",
                        lineOffsetY: -6,
                        scale: .9,
                        maxWidth: 270
                    };
                    textDisplay.renderText(oTextDisplayData);
                    var tempScale = 1;
                    for(var i = 0; i < totalScore.toString().length; i++) {
                        var id = parseFloat(totalScore.toString().charAt(i));
                        var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                        ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, canvas.width / 2 + i * (this.letterSpace * tempScale) - (this.letterSpace * totalScore.toString().length / 2) * tempScale, 300 + this.posY, this.oNumbers0ImgData.oData.spriteWidth * tempScale, this.oNumbers0ImgData.oData.spriteHeight * tempScale);
                    }
                    break;
                case "pause":
                    _ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                    _ctx.fillRect(0, 0, canvas.width, canvas.height);
                    var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.introPanel].x;
                    var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.introPanel].y;
                    var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.introPanel].width;
                    var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.introPanel].height;
                    _ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 310 - bHeight / 2 + this.posY, bWidth, bHeight);
                    break;
            }
            if(_butsOnTop) {
                this.addButs(_ctx);
            }
        };
        Panel.prototype.addButs = function (_ctx) {
            for(var i = 0; i < this.aButs.length; i++) {
                var offsetPosY = this.posY;
                var floatY = 0;
                if(this.incY != 0 && !this.aButs[i].noMove) {
                    floatY = Math.sin(this.incY + i * 45) * 3;
                }
                if(i % 2 == 0) {
                }
                if(!this.aButs[i].scale) {
                    this.aButs[i].scale = 1;
                }
                var bX = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].x;
                var bY = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].y;
                var bWidth = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].width;
                var bHeight = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].height;
                _ctx.drawImage(this.aButs[i].oImgData.img, bX, bY, bWidth, bHeight, this.aButs[i].aPos[0] - (bWidth / 2) * (this.aButs[i].scale) - floatY / 2, this.aButs[i].aPos[1] - (bHeight / 2) * (this.aButs[i].scale) + floatY / 2 + this.posY, bWidth * (this.aButs[i].scale) + floatY, bHeight * (this.aButs[i].scale) - floatY);
                if(this.aButs[i].text) {
                    var oTextDisplayData = {
                        text: this.aButs[i].text,
                        x: this.aButs[i].aPos[0] + offsetPosY,
                        y: this.aButs[i].aPos[1],
                        alignX: "centre",
                        alignY: "centre",
                        maxWidth: bWidth - 8
                    };
                    textDisplay.renderText(oTextDisplayData);
                }
            }
        };
        return Panel;
    })();
    Elements.Panel = Panel;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Hud = (function () {
        function Hud() {
            this.bonusScore = 0;
            this.letterSpace = 24;
            this.aSpecialBubbleIds = new Array();
            this.numberScale = .75;
            this.starBarLength = 179;
            this.oHudImgData = assetLib.getData("hud");
            this.oNumbers0ImgData = assetLib.getData("numbers0");
            this.oGameElementsImgData = assetLib.getData("gameElements");
            this.oUiButsImgData = assetLib.getData("uiButs");
            this.oBubblesImgData = assetLib.getData("bubbles");
            if(aLevelData[levelNum]["@vBombs"] == 1) {
                this.aSpecialBubbleIds.push(5);
            }
            if(aLevelData[levelNum]["@hBombs"] == 1) {
                this.aSpecialBubbleIds.push(6);
            }
            if(aLevelData[levelNum]["@lBombs"] == 1) {
                this.aSpecialBubbleIds.push(7);
            }
            if(aLevelData[levelNum]["@rBubbles"] == 1) {
                this.aSpecialBubbleIds.push(15);
            }
            this.addNextBubble();
        }
        Hud.prototype.setLevelSpecificTargets = function (_topRowFree, _gemNum) {
            if(aLevelData[levelNum]["@levelType"] == 1) {
                aLevelSpecificTarget = new Array(_topRowFree, 6);
            } else if(aLevelData[levelNum]["@levelType"] == 2) {
                aLevelSpecificTarget = new Array(0, _gemNum);
            }
        };
        Hud.prototype.getRandomBubble = function () {
            var aTempBubbles = new Array();
            for(var i = 0; i < aAllowedBubbleStates.length; i++) {
                if(aAllowedBubbleStates[i]) {
                    aTempBubbles.push(i);
                }
            }
            if(this.aSpecialBubbleIds.length > 0) {
                var ran = Math.random() * 1;
                if(ran < aLevelData[levelNum]["@specialChance"] / 100) {
                    return this.aSpecialBubbleIds[Math.floor(Math.random() * this.aSpecialBubbleIds.length)];
                } else {
                    return aTempBubbles[Math.floor(Math.random() * aTempBubbles.length)];
                }
            } else {
                return aTempBubbles[Math.floor(Math.random() * aTempBubbles.length)];
            }
        };
        Hud.prototype.addNextBubble = function () {
            this.nextBubbleId = this.getRandomBubble();
        };
        Hud.prototype.renderOver = function () {
            var id = 1;
            var imgX = (id * this.oHudImgData.oData.spriteWidth) % this.oHudImgData.img.width;
            var imgY = Math.floor(id / (this.oHudImgData.img.width / this.oHudImgData.oData.spriteWidth)) * this.oHudImgData.oData.spriteHeight;
            ctx.drawImage(this.oHudImgData.img, imgX, imgY, this.oHudImgData.oData.spriteWidth, this.oHudImgData.oData.spriteHeight, 0, 0, this.oHudImgData.oData.spriteWidth, this.oHudImgData.oData.spriteHeight);
            var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds.pauseBut].x;
            var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds.pauseBut].y;
            var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds.pauseBut].width;
            var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds.pauseBut].height;
            ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, 385, 0, bWidth, bHeight);
            if(starBarLength > 0) {
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.starBar].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.starBar].y;
                var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.starBar].width;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.starBar].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth * starBarLength, bHeight, 185, 20 - bHeight / 2, bWidth * starBarLength, bHeight);
            }
            for(var i = 0; i < aStarMarkers.length; i++) {
                var tempScale = .3;
                if(starBarLength >= aStarMarkers[i] / aStarMarkers[2]) {
                    tempScale = .45;
                }
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.star].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.star].y;
                var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.star].width;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.star].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, 185 + ((aStarMarkers[i] / aStarMarkers[2]) * this.starBarLength) - (bWidth / 2) * tempScale, 20 - (bHeight / 2) * tempScale, bWidth * tempScale, bHeight * tempScale);
            }
            if(aLevelData[levelNum]["@bLimit"] == 0 || (aLevelData[levelNum]["@bLimit"] != 0 && bubblesToFire > 0)) {
                var imgX = (this.nextBubbleId * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                var imgY = Math.floor(this.nextBubbleId / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, 88 - this.oBubblesImgData.oData.spriteWidth / 2, 572 - this.oBubblesImgData.oData.spriteHeight / 2, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
            }
            for(var i = 0; i < totalScore.toString().length; i++) {
                var id = parseFloat(totalScore.toString().charAt(i));
                var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, 165 + i * (this.letterSpace * this.numberScale) - (this.letterSpace * totalScore.toString().length) * this.numberScale, 4, this.oNumbers0ImgData.oData.spriteWidth * this.numberScale, this.oNumbers0ImgData.oData.spriteHeight * this.numberScale);
            }
            if(aLevelData[levelNum]["@bLimit"] != 0) {
                var tempScale = .5;
                for(var i = 0; i < bubblesToFire.toString().length; i++) {
                    var id = parseFloat(bubblesToFire.toString().charAt(i));
                    var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                    var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                    ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, 86 + i * (this.letterSpace * tempScale) - ((this.letterSpace * bubblesToFire.toString().length) / 2) * tempScale, 530, this.oNumbers0ImgData.oData.spriteWidth * tempScale, this.oNumbers0ImgData.oData.spriteHeight * tempScale);
                }
            }
            if(aLevelData[levelNum]["@levelType"] == 0) {
                if(bubbleTargId > 0) {
                    var id = bubbleTargId - 1;
                    var imgX = (id * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                    var imgY = Math.floor(id / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                    ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, 425 - this.oBubblesImgData.oData.spriteWidth / 2, 675 - this.oBubblesImgData.oData.spriteHeight / 2, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
                } else {
                    var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.allColourBubble].x;
                    var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.allColourBubble].y;
                    var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.allColourBubble].width;
                    var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.allColourBubble].height;
                    ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, 425 - bWidth / 2, 675 - bHeight / 2, bWidth, bHeight);
                }
                for(var i = 0; i < bubbleTargNum.toString().length; i++) {
                    var id = parseFloat(bubbleTargNum.toString().charAt(i));
                    var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                    var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                    ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, 400 + i * (this.letterSpace * this.numberScale) - (this.letterSpace * bubbleTargNum.toString().length) * this.numberScale, 662, this.oNumbers0ImgData.oData.spriteWidth * this.numberScale, this.oNumbers0ImgData.oData.spriteHeight * this.numberScale);
                }
            } else {
                if(aLevelData[levelNum]["@levelType"] == 1) {
                    var imgX = (16 * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                    var imgY = Math.floor(16 / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                    ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, 425 - this.oBubblesImgData.oData.spriteWidth / 2, 675 - this.oBubblesImgData.oData.spriteHeight / 2, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
                } else {
                    var imgX = (10 * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                    var imgY = Math.floor(10 / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                    ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, 425 - this.oBubblesImgData.oData.spriteWidth / 2, 675 - this.oBubblesImgData.oData.spriteHeight / 2, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
                }
                for(var i = 0; i < aLevelSpecificTarget[0].toString().length; i++) {
                    var id = parseFloat(aLevelSpecificTarget[0].toString().charAt(i));
                    var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                    var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                    ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, 400 + i * (this.letterSpace * this.numberScale) - (this.letterSpace * (1 + aLevelSpecificTarget[0].toString().length + aLevelSpecificTarget[1].toString().length)) * this.numberScale, 662, this.oNumbers0ImgData.oData.spriteWidth * this.numberScale, this.oNumbers0ImgData.oData.spriteHeight * this.numberScale);
                }
                var id = 10;
                var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, 400 - (this.letterSpace * (1 + aLevelSpecificTarget[1].toString().length)) * this.numberScale, 662, this.oNumbers0ImgData.oData.spriteWidth * this.numberScale, this.oNumbers0ImgData.oData.spriteHeight * this.numberScale);
                for(var i = 0; i < aLevelSpecificTarget[1].toString().length; i++) {
                    var id = parseFloat(aLevelSpecificTarget[1].toString().charAt(i));
                    var imgX = (id * this.oNumbers0ImgData.oData.spriteWidth) % this.oNumbers0ImgData.img.width;
                    var imgY = Math.floor(id / (this.oNumbers0ImgData.img.width / this.oNumbers0ImgData.oData.spriteWidth)) * this.oNumbers0ImgData.oData.spriteHeight;
                    ctx.drawImage(this.oNumbers0ImgData.img, imgX, imgY, this.oNumbers0ImgData.oData.spriteWidth, this.oNumbers0ImgData.oData.spriteHeight, 400 + i * (this.letterSpace * this.numberScale) - (this.letterSpace * (aLevelSpecificTarget[1].toString().length)) * this.numberScale, 662, this.oNumbers0ImgData.oData.spriteWidth * this.numberScale, this.oNumbers0ImgData.oData.spriteHeight * this.numberScale);
                }
            }
        };
        Hud.prototype.renderUnder = function () {
            var id = 0;
            var imgX = (id * this.oHudImgData.oData.spriteWidth) % this.oHudImgData.img.width;
            var imgY = Math.floor(id / (this.oHudImgData.img.width / this.oHudImgData.oData.spriteWidth)) * this.oHudImgData.oData.spriteHeight;
            ctx.drawImage(this.oHudImgData.img, imgX, imgY, this.oHudImgData.oData.spriteWidth, this.oHudImgData.oData.spriteHeight, 0, 0, this.oHudImgData.oData.spriteWidth, this.oHudImgData.oData.spriteHeight);
        };
        return Hud;
    })();
    Elements.Hud = Hud;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var UserBubble = (function () {
        function UserBubble() {
            this.x = 0;
            this.y = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.vx = 0;
            this.vy = 0;
            this.isFlying = false;
            this.oBubblesImgData = assetLib.getData("bubbles");
            this.reset(true);
        }
        UserBubble.prototype.reset = function (_addNew) {
            if (typeof _addNew === "undefined") { _addNew = false; }
            this.wasClose = false;
            if(_addNew) {
                this.id = hud.getRandomBubble();
            } else {
                if(aLevelData[levelNum]["@bLimit"] == 0 || (aLevelData[levelNum]["@bLimit"] != 0 && --bubblesToFire >= 0)) {
                    this.id = hud.nextBubbleId;
                    hud.addNextBubble();
                } else {
                    bubblesToFire = 0;
                    return;
                }
            }
            this.x = bubbleStartX;
            this.y = bubbleStartY;
        };
        UserBubble.prototype.shoot = function () {
            this.isFlying = true;
            this.vx = 900 * Math.cos(aimRot);
            this.vy = 900 * Math.sin(aimRot);
        };
        UserBubble.prototype.tweenBubbleToPark = function () {
            this.isFlying = false;
            this.hitAngle = Math.atan2(this.vy, this.vx);
            this.vx = 0;
            this.vy = 0;
            gameTouchState = 3;
            bubbleStack.addBubble(this.id, bubbleTarget.x, bubbleTarget.y);
        };
        UserBubble.prototype.update = function () {
            if(gameTouchState == 2 && this.isFlying) {
                this.x -= this.vx * delta;
                this.y -= this.vy * delta;
                if(this.x < (wallDepth + ballRadius)) {
                    this.x = (wallDepth + ballRadius);
                    this.vx *= -1;
                    playSound("bounce");
                } else if(this.x > canvas.width - (wallDepth + ballRadius)) {
                    this.x = canvas.width - (wallDepth + ballRadius);
                    this.vx *= -1;
                    playSound("bounce");
                }
                var distance_squared = (((this.x - bubbleTarget.x) * (this.x - bubbleTarget.x)) + ((this.y - bubbleTarget.y) * (this.y - bubbleTarget.y)));
                if(this.y < bubbleTarget.y) {
                    this.tweenBubbleToPark();
                }
            }
        };
        UserBubble.prototype.render = function () {
            if(gameControlState && gameTouchState <= 2) {
                var imgX = (this.id * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                var imgY = Math.floor(this.id / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, this.x - this.oBubblesImgData.oData.spriteWidth / 2, this.y - this.oBubblesImgData.oData.spriteHeight / 2, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
            }
        };
        return UserBubble;
    })();
    Elements.UserBubble = UserBubble;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Launcher = (function () {
        function Launcher() {
            this.x = 0;
            this.y = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.colourId = 0;
            this.aimLineAlpha = 0;
            this.aimLineLength = 0;
            this.hitSomething = false;
            this.lineScroll = 0;
            this.oGameElementsImgData = assetLib.getData("gameElements");
        }
        Launcher.prototype.findNearestFreePos = function (_startX, _startY, _angle) {
            var temp = 0;
            this.hitSomething = false;
            while(temp < this.aimLineLength) {
                var posX = _startX - temp * Math.cos(_angle);
                var posY = _startY - temp * Math.sin(_angle) - bubbleStack.ceiling;
                for(var i = 0; i < bubbleStack.aFreePos.length; i++) {
                    var distance_squared = (((posX - bubbleStack.aFreePos[i].targX) * (posX - bubbleStack.aFreePos[i].targX)) + ((posY - bubbleStack.aFreePos[i].targY) * (posY - bubbleStack.aFreePos[i].targY)));
                    if(distance_squared < ballRadius * ballRadius) {
                        bubbleTarget = {
                            x: bubbleStack.aFreePos[i].posX,
                            y: bubbleStack.ceiling + bubbleStack.aFreePos[i].posY
                        };
                        this.aimLineLength = temp;
                        this.hitSomething = true;
                        break;
                    }
                }
                temp++;
            }
        };
        Launcher.prototype.update = function () {
            this.lineScroll += 50 * delta;
            if(this.lineScroll > 500) {
                this.lineScroll = 0;
            }
        };
        Launcher.prototype.render = function () {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(aimRot);
            var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds["launcher" + userBubble.id]].x;
            var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds["launcher" + userBubble.id]].y;
            var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds["launcher" + userBubble.id]].width;
            var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds["launcher" + userBubble.id]].height;
            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, -20, -bHeight / 2, bWidth, bHeight);
            ctx.restore();
            if(gameTouchState == 0) {
                var aimId = oImageIds["aimLine" + Math.min(userBubble.id, 5)];
                var bX = this.oGameElementsImgData.oData.oAtlasData[aimId].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[aimId].y;
                var bWidth = this.oGameElementsImgData.oData.oAtlasData[aimId].width;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[aimId].height;
                var opposite = Math.abs((Math.tan(aimRot) * (canvas.width / 2 - (wallDepth + ballRadius))));
                this.aimLineLength = Math.min(Math.sqrt(opposite * opposite + (canvas.width / 2 - (wallDepth + ballRadius)) * (canvas.width / 2 - (wallDepth + ballRadius))), (bubbleStartY - bubbleStack.ceiling) + 100);
                this.findNearestFreePos(bubbleStartX, bubbleStartY, aimRot);
                this.aimLineLength = Math.min(this.aimLineLength, bWidth);
                ctx.save();
                ctx.globalAlpha = this.aimLineAlpha;
                ctx.translate(this.x, this.y);
                ctx.rotate(aimRot);
                ctx.drawImage(this.oGameElementsImgData.img, bX + ((bWidth / 2) - this.aimLineLength) + this.lineScroll, bY, (bWidth / 2) - ((bWidth / 2) - this.aimLineLength), bHeight, -this.aimLineLength, -bHeight / 2, (bWidth / 2) - ((bWidth / 2) - this.aimLineLength), bHeight);
                ctx.restore();
                var bounceSide;
                if(!aimingFlipped) {
                    if(aimX < canvas.width / 2) {
                        bounceSide = "left";
                    } else {
                        bounceSide = "right";
                    }
                } else {
                    if(aimX < canvas.width / 2) {
                        bounceSide = "right";
                    } else {
                        bounceSide = "left";
                    }
                }
                var startY = bubbleStartY;
                var wallBounces = 0;
                while(!this.hitSomething && opposite < startY - bubbleStack.ceiling) {
                    if(bounceSide == "left") {
                        var bX = this.oGameElementsImgData.oData.oAtlasData[aimId].x;
                        var bY = this.oGameElementsImgData.oData.oAtlasData[aimId].y;
                        var bWidth = this.oGameElementsImgData.oData.oAtlasData[aimId].width;
                        var bHeight = this.oGameElementsImgData.oData.oAtlasData[aimId].height;
                        var aimRotBounce;
                        if(wallBounces % 2 == 0) {
                            aimRotBounce = -aimRot + 180 * radian;
                        } else {
                            aimRotBounce = aimRot;
                        }
                        var oppositeBounce = Math.abs((Math.tan(aimRotBounce) * (canvas.width - (wallDepth + ballRadius) * 2)));
                        this.aimLineLength = Math.min(Math.sqrt(oppositeBounce * oppositeBounce + (canvas.width - (wallDepth + ballRadius) * 2) * (canvas.width - (wallDepth + ballRadius) * 2)), (bubbleStartY - bubbleStack.ceiling) + 100);
                        this.findNearestFreePos((wallDepth + ballRadius), startY - opposite, aimRotBounce);
                        this.aimLineLength = Math.min(this.aimLineLength, bWidth);
                        if(wallBounces == 0) {
                            ctx.save();
                            ctx.globalAlpha = this.aimLineAlpha;
                            ctx.translate((wallDepth + ballRadius), startY - opposite);
                            ctx.rotate(aimRotBounce);
                            var tempAimLineLength = Math.max(Math.min(this.aimLineLength, 70), 1);
                            ctx.drawImage(this.oGameElementsImgData.img, bX + this.lineScroll, bY, tempAimLineLength, bHeight, -tempAimLineLength, -bHeight / 2, tempAimLineLength, bHeight);
                            ctx.restore();
                        }
                        startY = startY - opposite;
                        opposite = oppositeBounce;
                        bounceSide = "right";
                    } else if(bounceSide == "right") {
                        var bX = this.oGameElementsImgData.oData.oAtlasData[aimId].x;
                        var bY = this.oGameElementsImgData.oData.oAtlasData[aimId].y;
                        var bWidth = this.oGameElementsImgData.oData.oAtlasData[aimId].width;
                        var bHeight = this.oGameElementsImgData.oData.oAtlasData[aimId].height;
                        var aimRotBounce;
                        if(wallBounces % 2 == 0) {
                            aimRotBounce = -aimRot + 180 * radian;
                        } else {
                            aimRotBounce = aimRot;
                        }
                        var oppositeBounce = Math.abs((Math.tan(aimRotBounce) * (canvas.width - (wallDepth + ballRadius) * 2)));
                        this.aimLineLength = Math.min(Math.sqrt(oppositeBounce * oppositeBounce + (canvas.width - (wallDepth + ballRadius) * 2) * (canvas.width - (wallDepth + ballRadius) * 2)), (bubbleStartY - bubbleStack.ceiling) + 100);
                        this.findNearestFreePos(canvas.width - (wallDepth + ballRadius), startY - opposite, aimRotBounce);
                        this.aimLineLength = Math.min(this.aimLineLength, bWidth);
                        if(wallBounces == 0) {
                            ctx.save();
                            ctx.globalAlpha = this.aimLineAlpha;
                            ctx.translate(canvas.width - (wallDepth + ballRadius), startY - opposite);
                            ctx.rotate(aimRotBounce);
                            var tempAimLineLength = Math.max(Math.min(this.aimLineLength, 70), 1);
                            ctx.drawImage(this.oGameElementsImgData.img, bX + this.lineScroll, bY, tempAimLineLength, bHeight, -tempAimLineLength, -bHeight / 2, tempAimLineLength, bHeight);
                            ctx.restore();
                        }
                        startY = startY - opposite;
                        opposite = oppositeBounce;
                        bounceSide = "left";
                    }
                    if(++wallBounces > 50) {
                        break;
                    }
                }
            }
        };
        return Launcher;
    })();
    Elements.Launcher = Launcher;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var BubbleStack = (function () {
        function BubbleStack(_aLevelData) {
            this.ceilingLimit = 55;
            this.moveCeilingUpAt = 385;
            this.moveCeilingDownAt = 360;
            this.freePosAdjust = .8;
            this.hasRemoved = false;
            this.praiseTarg = 10;
            this.oBubblesImgData = assetLib.getData("bubbles");
            this.ceiling = this.ceilingLimit;
            this.aBubblePos = new Array();
            var bx = wallDepth + ballRadius;
            var by = ballRadius;
            var row = 0;
            var column = 0;
            var topRowFree = 10;
            var gemNum = 0;
            for(var i = 0; i < _aLevelData.length; i++) {
                if(_aLevelData[i] != -1) {
                    var tempId = _aLevelData[i];
                    if(tempId == 10) {
                        tempId += Math.floor(Math.random() * 5);
                    }
                    if(row == 0) {
                        topRowFree--;
                    }
                    if(_aLevelData[i] == 10) {
                        gemNum++;
                    }
                    this.aBubblePos.push({
                        id: tempId,
                        x: bx,
                        y: by,
                        state: 0,
                        float: 0,
                        vx: 0,
                        vy: 0,
                        inc: 0,
                        dist: 0
                    });
                }
                bx += ballRadius * 2;
                column++;
                if(row % 2 == 0) {
                    if(column == 10) {
                        column = 0;
                        bx = wallDepth + ballRadius + ballRadius;
                        by += ballRadius * 1.75;
                        row++;
                    }
                } else {
                    if(column == 9) {
                        column = 0;
                        bx = wallDepth + ballRadius;
                        by += ballRadius * 1.75;
                        row++;
                    }
                }
            }
            this.animateInitialCeiling();
            hud.setLevelSpecificTargets(topRowFree, gemNum);
            this.getAllFreePos();
        }
        BubbleStack.prototype.animateInitialCeiling = function () {
            var _this = this;
            var lowestBubbleY = this.getLowestBubbleY() + this.ceiling;
            var tempCeiling = this.ceiling;
            if(lowestBubbleY > this.moveCeilingUpAt) {
                tempCeiling = this.ceiling - (lowestBubbleY - this.moveCeilingUpAt);
            }
            TweenLite.to(this, 1, {
                ceiling: tempCeiling,
                ease: "Quad.easeInOut",
                onComplete: function () {
                    _this.animateInitialComplete();
                }
            });
        };
        BubbleStack.prototype.animateInitialComplete = function () {
            gameTouchState = 0;
        };
        BubbleStack.prototype.setCeiling = function () {
            var lowestBubbleY = this.getLowestBubbleY() + this.ceiling;
            if(lowestBubbleY > this.moveCeilingUpAt) {
                this.ceiling = this.ceiling - (lowestBubbleY - this.moveCeilingUpAt);
            }
        };
        BubbleStack.prototype.addBubble = function (_id, _x, _y) {
            var _this = this;
            this.aBubblePos.push({
                id: _id,
                x: _x,
                y: _y - this.ceiling,
                state: 1,
                float: 0,
                vx: 0,
                vy: 0,
                inc: 0,
                dist: 0
            });
            this.aToRemove = new Array();
            this.aSpecials = new Array();
            var isSpecial = true;
            var anyBomb = false;
            switch(_id) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    this.findMatchingConnectingBubbles(_id, _x, _y - this.ceiling);
                    isSpecial = false;
                    break;
                case 15:
                    this.findRainbowConnectingBubbles(_id, _x, _y - this.ceiling, true);
                    break;
                case 5:
                    this.findVerticleBubbles(_id, _x, _y - this.ceiling, true);
                    anyBomb = true;
                    break;
                case 6:
                    this.findHorizontalBubbles(_id, _x, _y - this.ceiling, true);
                    anyBomb = true;
                    break;
                case 7:
                    this.findNuclearBubbles(_id, _x, _y - this.ceiling, true);
                    anyBomb = true;
                    break;
            }
            for(var i = 0; i < this.aSpecials.length; i++) {
                switch(this.aSpecials[i].id) {
                    case 5:
                        this.findVerticleBubbles(this.aSpecials[i].id, this.aSpecials[i].x, this.aSpecials[i].y);
                        anyBomb = true;
                        break;
                    case 6:
                        this.findHorizontalBubbles(this.aSpecials[i].id, this.aSpecials[i].x, this.aSpecials[i].y);
                        anyBomb = true;
                        break;
                    case 7:
                        this.findNuclearBubbles(this.aSpecials[i].id, this.aSpecials[i].x, this.aSpecials[i].y);
                        anyBomb = true;
                        break;
                    case 9:
                        playSound("bonusBubble");
                        break;
                }
            }
            if(anyBomb) {
                playSound("explode" + Math.floor(Math.random() * 4));
            }
            if(this.aToRemove.length >= 3 || _id > 4 || this.aSpecials.length > 0) {
                curPopChain++;
                this.hasRemoved = true;
                if(this.aSpecials.length > 0 || isSpecial) {
                    addFirework(1, _x, _y);
                } else {
                    addFirework(0, _x, _y);
                }
                this.findFloatingBubbles();
                this.removeBubbles(_x, _y - this.ceiling);
            } else {
                curPopChain = -1;
                this.hasRemoved = false;
                playSound("bounce");
                for(var i = 0; i < this.aBubblePos.length; i++) {
                    this.aBubblePos[i].state = 0;
                }
            }
            this.getAllFreePos();
            var lowestBubbleY = this.getLowestBubbleY() + this.ceiling;
            if(lowestBubbleY > this.moveCeilingUpAt) {
                TweenLite.to(this, .75, {
                    ceiling: this.ceiling - (lowestBubbleY - this.moveCeilingUpAt),
                    ease: "Quad.easeInOut",
                    onComplete: function () {
                        _this.ceilingMoved();
                    }
                });
            } else if(lowestBubbleY < this.moveCeilingDownAt && this.ceiling < this.ceilingLimit) {
                TweenLite.to(this, .75, {
                    ceiling: Math.min(this.ceiling + (this.moveCeilingDownAt - lowestBubbleY), this.ceilingLimit),
                    ease: "Quad.easeInOut",
                    onComplete: function () {
                        _this.ceilingMoved();
                    }
                });
            } else {
                this.ceilingMoved();
            }
        };
        BubbleStack.prototype.findNuclearBubbles = function (_id, _x, _y, _first) {
            if (typeof _first === "undefined") { _first = false; }
            var maxDist = (ballRadius * 4) * (ballRadius * 4) + 50;
            for(var i = 0; i < this.aBubblePos.length; i++) {
                this.aBubblePos[i].float = 1;
                var distance_squared = (((_x - this.aBubblePos[i].x) * (_x - this.aBubblePos[i].x)) + ((_y - this.aBubblePos[i].y) * (_y - this.aBubblePos[i].y)));
                var hitAngle = Math.atan2(_y - this.aBubblePos[i].y, _x - this.aBubblePos[i].x);
                var hitDist = (Math.max(20000 - distance_squared, 0)) / 500;
                this.aBubblePos[i].vx = hitDist * Math.cos(hitAngle);
                this.aBubblePos[i].vy = hitDist * Math.sin(hitAngle);
                this.aBubblePos[i].inc = 0;
                this.aBubblePos[i].dist = hitDist / 2.5;
                this.aBubblePos[i].range = Math.sqrt(distance_squared) / 25;
                if(!(_x == this.aBubblePos[i].x && _y == this.aBubblePos[i].y)) {
                    if(distance_squared < maxDist) {
                        this.aToRemove.push(this.aBubblePos[i]);
                        this.aBubblePos[i].state = 1;
                        if(_first && this.aBubblePos[i].id > 4 && (this.aBubblePos[i].id != 8 && !(this.aBubblePos[i].id > 9 && this.aBubblePos[i].id < 15))) {
                            this.aSpecials.push(this.aBubblePos[i]);
                            this.aBubblePos[i].state = 1;
                        }
                    }
                } else {
                    this.aBubblePos[i].vx = hitDist * Math.cos(userBubble.hitAngle);
                    this.aBubblePos[i].vy = hitDist * Math.sin(userBubble.hitAngle);
                    this.aBubblePos[i].inc = 0;
                    this.aBubblePos[i].dist = hitDist / 2.5;
                }
            }
            this.aToRemove.push({
                id: _id,
                x: _x,
                y: _y
            });
        };
        BubbleStack.prototype.findHorizontalBubbles = function (_id, _x, _y, _first) {
            if (typeof _first === "undefined") { _first = false; }
            var maxDist = (ballRadius * 2) * (ballRadius * 2) + 50;
            for(var i = 0; i < this.aBubblePos.length; i++) {
                this.aBubblePos[i].float = 1;
                var distance_squared = (((_x - this.aBubblePos[i].x) * (_x - this.aBubblePos[i].x)) + ((_y - this.aBubblePos[i].y) * (_y - this.aBubblePos[i].y)));
                var hitAngle = Math.atan2(_y - this.aBubblePos[i].y, _x - this.aBubblePos[i].x);
                var hitDist = (Math.max(20000 - distance_squared, 0)) / 500;
                this.aBubblePos[i].vx = hitDist * Math.cos(hitAngle);
                this.aBubblePos[i].vy = hitDist * Math.sin(hitAngle);
                this.aBubblePos[i].inc = 0;
                this.aBubblePos[i].dist = hitDist / 2.5;
                if(!(_x == this.aBubblePos[i].x && _y == this.aBubblePos[i].y)) {
                    if(_y == this.aBubblePos[i].y) {
                        this.aToRemove.push(this.aBubblePos[i]);
                        this.aBubblePos[i].range = Math.abs(Math.round((this.aBubblePos[i].x - _x) / (ballRadius * 2)));
                        this.aBubblePos[i].state = 1;
                    }
                    if(_first && distance_squared < maxDist) {
                        if(this.aBubblePos[i].id > 4 && (this.aBubblePos[i].id != 8 && !(this.aBubblePos[i].id > 9 && this.aBubblePos[i].id < 15))) {
                            this.aSpecials.push(this.aBubblePos[i]);
                            this.aBubblePos[i].state = 1;
                        }
                    }
                } else {
                    this.aBubblePos[i].vx = hitDist * Math.cos(userBubble.hitAngle);
                    this.aBubblePos[i].vy = hitDist * Math.sin(userBubble.hitAngle);
                    this.aBubblePos[i].inc = 0;
                    this.aBubblePos[i].dist = hitDist / 2.5;
                }
            }
            this.aToRemove.push({
                id: _id,
                x: _x,
                y: _y
            });
        };
        BubbleStack.prototype.findVerticleBubbles = function (_id, _x, _y, _first) {
            if (typeof _first === "undefined") { _first = false; }
            var maxDist = (ballRadius * 2) * (ballRadius * 2) + 50;
            for(var i = 0; i < this.aBubblePos.length; i++) {
                this.aBubblePos[i].float = 1;
                var distance_squared = (((_x - this.aBubblePos[i].x) * (_x - this.aBubblePos[i].x)) + ((_y - this.aBubblePos[i].y) * (_y - this.aBubblePos[i].y)));
                var hitAngle = Math.atan2(_y - this.aBubblePos[i].y, _x - this.aBubblePos[i].x);
                var hitDist = (Math.max(20000 - distance_squared, 0)) / 500;
                this.aBubblePos[i].vx = hitDist * Math.cos(hitAngle);
                this.aBubblePos[i].vy = hitDist * Math.sin(hitAngle);
                this.aBubblePos[i].inc = 0;
                this.aBubblePos[i].dist = hitDist / 2.5;
                if(!(_x == this.aBubblePos[i].x && _y == this.aBubblePos[i].y)) {
                    if(_x > this.aBubblePos[i].x - ballRadius - 5 && _x < this.aBubblePos[i].x + ballRadius + 5 && _y > this.aBubblePos[i].y - 300 && _y < this.aBubblePos[i].y + 300) {
                        this.aToRemove.push(this.aBubblePos[i]);
                        this.aBubblePos[i].range = Math.abs(Math.round((this.aBubblePos[i].y - _y) / (ballRadius * 2)));
                        this.aBubblePos[i].state = 1;
                    }
                    if(_first && distance_squared < maxDist) {
                        if(this.aBubblePos[i].id > 4 && (this.aBubblePos[i].id != 8 && !(this.aBubblePos[i].id > 9 && this.aBubblePos[i].id < 15))) {
                            this.aSpecials.push(this.aBubblePos[i]);
                            this.aBubblePos[i].state = 1;
                        }
                    }
                } else {
                    this.aBubblePos[i].vx = hitDist * Math.cos(userBubble.hitAngle);
                    this.aBubblePos[i].vy = hitDist * Math.sin(userBubble.hitAngle);
                    this.aBubblePos[i].inc = 0;
                    this.aBubblePos[i].dist = hitDist / 2.5;
                }
            }
            this.aToRemove.push({
                id: _id,
                x: _x,
                y: _y
            });
        };
        BubbleStack.prototype.findRainbowConnectingBubbles = function (_id, _x, _y, _first) {
            if (typeof _first === "undefined") { _first = false; }
            var maxDist = (ballRadius * 2) * (ballRadius * 2) + 50;
            for(var i = 0; i < this.aBubblePos.length; i++) {
                this.aBubblePos[i].float = 1;
                var distance_squared = (((_x - this.aBubblePos[i].x) * (_x - this.aBubblePos[i].x)) + ((_y - this.aBubblePos[i].y) * (_y - this.aBubblePos[i].y)));
                var hitAngle = Math.atan2(_y - this.aBubblePos[i].y, _x - this.aBubblePos[i].x);
                var hitDist = (Math.max(20000 - distance_squared, 0)) / 500;
                this.aBubblePos[i].vx = hitDist * Math.cos(hitAngle);
                this.aBubblePos[i].vy = hitDist * Math.sin(hitAngle);
                this.aBubblePos[i].inc = 0;
                this.aBubblePos[i].dist = hitDist / 2.5;
                this.aBubblePos[i].range = Math.sqrt(distance_squared) / 25;
                if(!(_x == this.aBubblePos[i].x && _y == this.aBubblePos[i].y)) {
                    if(distance_squared < maxDist) {
                        if(this.aBubblePos[i].id > 4 && (this.aBubblePos[i].id != 8 && !(this.aBubblePos[i].id > 9 && this.aBubblePos[i].id < 15))) {
                            this.aSpecials.push(this.aBubblePos[i]);
                            this.aBubblePos[i].state = 1;
                        } else if(this.aBubblePos[i].id < 5) {
                            this.aBubblePos[i].state = 1;
                            this.aToRemove.push(this.aBubblePos[i]);
                        } else if(_first && this.aBubblePos[i].id > 4 && (this.aBubblePos[i].id != 8 && !(this.aBubblePos[i].id > 9 && this.aBubblePos[i].id < 15))) {
                            this.aSpecials.push(this.aBubblePos[i]);
                            this.aBubblePos[i].state = 1;
                        }
                    }
                } else {
                    this.aBubblePos[i].vx = hitDist * Math.cos(userBubble.hitAngle);
                    this.aBubblePos[i].vy = hitDist * Math.sin(userBubble.hitAngle);
                    this.aBubblePos[i].inc = 0;
                    this.aBubblePos[i].dist = hitDist / 2.5;
                }
            }
            if(this.aToRemove.length > 0) {
                for(var i = 0; i < this.aToRemove.length; i++) {
                    for(var j = 0; j < this.aBubblePos.length; j++) {
                        if(this.aToRemove[i].id == this.aBubblePos[j].id && this.aBubblePos[j].state == 0) {
                            var distance_squared = (((this.aToRemove[i].x - this.aBubblePos[j].x) * (this.aToRemove[i].x - this.aBubblePos[j].x)) + ((this.aToRemove[i].y - this.aBubblePos[j].y) * (this.aToRemove[i].y - this.aBubblePos[j].y)));
                            if(distance_squared < maxDist) {
                                this.aBubblePos[j].state = this.aToRemove.length + 1;
                                this.aToRemove.push(this.aBubblePos[j]);
                            }
                        }
                    }
                }
            }
            this.aToRemove.push({
                id: _id,
                x: _x,
                y: _y
            });
        };
        BubbleStack.prototype.findMatchingConnectingBubbles = function (_id, _x, _y) {
            var maxDist = (ballRadius * 2) * (ballRadius * 2) + 50;
            for(var i = 0; i < this.aBubblePos.length; i++) {
                this.aBubblePos[i].float = 1;
                var distance_squared = (((_x - this.aBubblePos[i].x) * (_x - this.aBubblePos[i].x)) + ((_y - this.aBubblePos[i].y) * (_y - this.aBubblePos[i].y)));
                var hitAngle = Math.atan2(_y - this.aBubblePos[i].y, _x - this.aBubblePos[i].x);
                var hitDist = (Math.max(20000 - distance_squared, 0)) / 500;
                this.aBubblePos[i].vx = hitDist * Math.cos(hitAngle);
                this.aBubblePos[i].vy = hitDist * Math.sin(hitAngle);
                this.aBubblePos[i].inc = 0;
                this.aBubblePos[i].dist = hitDist / 2.5;
                this.aBubblePos[i].range = Math.sqrt(distance_squared) / 25;
                if(!(_x == this.aBubblePos[i].x && _y == this.aBubblePos[i].y)) {
                    if(distance_squared < maxDist) {
                        if(this.aBubblePos[i].id == _id) {
                            this.aToRemove.push(this.aBubblePos[i]);
                            this.aBubblePos[i].state = 1;
                        } else if(this.aBubblePos[i].id > 4 && (this.aBubblePos[i].id != 8 && !(this.aBubblePos[i].id > 9 && this.aBubblePos[i].id < 15))) {
                            this.aSpecials.push(this.aBubblePos[i]);
                            this.aBubblePos[i].state = 1;
                        }
                    }
                } else {
                    this.aBubblePos[i].vx = hitDist * Math.cos(userBubble.hitAngle);
                    this.aBubblePos[i].vy = hitDist * Math.sin(userBubble.hitAngle);
                    this.aBubblePos[i].inc = 0;
                    this.aBubblePos[i].dist = hitDist / 2.5;
                }
            }
            if(this.aToRemove.length > 0) {
                for(var i = 0; i < this.aToRemove.length; i++) {
                    for(var j = 0; j < this.aBubblePos.length; j++) {
                        if(this.aToRemove[i].id == this.aBubblePos[j].id && this.aBubblePos[j].state == 0) {
                            var distance_squared = (((this.aToRemove[i].x - this.aBubblePos[j].x) * (this.aToRemove[i].x - this.aBubblePos[j].x)) + ((this.aToRemove[i].y - this.aBubblePos[j].y) * (this.aToRemove[i].y - this.aBubblePos[j].y)));
                            var initial_distance_squared = (((_x - this.aToRemove[i].x) * (_x - this.aToRemove[i].x)) + ((_y - this.aToRemove[i].y) * (_y - this.aToRemove[i].y)));
                            if(distance_squared < maxDist) {
                                this.aBubblePos[j].state = 1;
                                this.aToRemove.push(this.aBubblePos[j]);
                            }
                        }
                    }
                }
            }
            this.aToRemove.push({
                id: _id,
                x: _x,
                y: _y
            });
        };
        BubbleStack.prototype.findFloatingBubbles = function () {
            var aCeilingBubbles = new Array();
            for(var i = 0; i < this.aBubblePos.length; i++) {
                if(this.aBubblePos[i].y == ballRadius && this.aBubblePos[i].state == 0) {
                    this.aBubblePos[i].float = 0;
                    this.findAnyConnectingBubbles(this.aBubblePos[i].x, this.aBubblePos[i].y);
                }
            }
        };
        BubbleStack.prototype.findAnyConnectingBubbles = function (_x, _y) {
            var maxDist = (ballRadius * 2) * (ballRadius * 2) + 50;
            var aNotFloating = new Array();
            for(var i = 0; i < this.aBubblePos.length; i++) {
                if(!(_x == this.aBubblePos[i].x && _y == this.aBubblePos[i].y) && this.aBubblePos[i].state == 0) {
                    var distance_squared = (((_x - this.aBubblePos[i].x) * (_x - this.aBubblePos[i].x)) + ((_y - this.aBubblePos[i].y) * (_y - this.aBubblePos[i].y)));
                    if(distance_squared < maxDist) {
                        this.aBubblePos[i].float = 0;
                        aNotFloating.push(this.aBubblePos[i]);
                    }
                }
            }
            if(aNotFloating.length > 0) {
                for(var i = 0; i < aNotFloating.length; i++) {
                    for(var j = 0; j < this.aBubblePos.length; j++) {
                        if(this.aBubblePos[j].float == 1 && this.aBubblePos[j].state == 0) {
                            var distance_squared = (((aNotFloating[i].x - this.aBubblePos[j].x) * (aNotFloating[i].x - this.aBubblePos[j].x)) + ((aNotFloating[i].y - this.aBubblePos[j].y) * (aNotFloating[i].y - this.aBubblePos[j].y)));
                            if(distance_squared < maxDist) {
                                this.aBubblePos[j].float = 0;
                                aNotFloating.push(this.aBubblePos[j]);
                            }
                        }
                    }
                }
            }
        };
        BubbleStack.prototype.removeBubbles = function (_x, _y) {
            if(this.aToRemove.length > this.praiseTarg) {
                displayInGameText("praise" + Math.floor(Math.random() * 3), .5);
                playSound("praise");
                this.praiseTarg += 5;
            }
            for(var i = 0; i < this.aBubblePos.length; i++) {
                if(this.aBubblePos[i].state != 0 || this.aBubblePos[i].float == 1) {
                    if(this.aBubblePos[i].state != 0) {
                        addPop(this.aBubblePos[i].x, this.aBubblePos[i].y, this.aBubblePos[i].range, this.aBubblePos[i].id);
                    } else {
                        addFallingBubble(this.aBubblePos[i].id, this.aBubblePos[i].x, this.aBubblePos[i].y + this.ceiling);
                    }
                    for(var j = 0; j < aGlints.length; j++) {
                        if(aGlints[j].bubbleTargId == i) {
                            aGlints[j].resetInGame();
                        }
                    }
                    this.aBubblePos.splice(i, 1);
                    i -= 1;
                }
            }
        };
        BubbleStack.prototype.ceilingMoved = function () {
            if(aLevelData[levelNum]["@levelType"] == 1) {
                var tempN = 10;
                for(var i = 0; i < this.aBubblePos.length; i++) {
                    if(this.aBubblePos[i].y == ballRadius) {
                        tempN--;
                    }
                }
                aLevelSpecificTarget[0] = tempN;
                if(aLevelSpecificTarget[0] >= aLevelSpecificTarget[1]) {
                    initLevelCompleteSequence();
                    return;
                }
            } else if(aLevelData[levelNum]["@levelType"] == 2) {
                var tempN = aLevelSpecificTarget[1];
                var canShowMesage = false;
                if(aLevelSpecificTarget[0] != aLevelSpecificTarget[1] - 1) {
                    canShowMesage = true;
                }
                for(var i = 0; i < this.aBubblePos.length; i++) {
                    if(this.aBubblePos[i].id > 9 && this.aBubblePos[i].id < 15) {
                        tempN--;
                    }
                }
                aLevelSpecificTarget[0] = tempN;
                if(aLevelSpecificTarget[0] >= aLevelSpecificTarget[1]) {
                    initLevelCompleteSequence();
                    return;
                }
                if(canShowMesage && aLevelSpecificTarget[0] == aLevelSpecificTarget[1] - 1) {
                    displayInGameText("oneLeft", .5);
                }
            }
            firstPop = true;
            gameTouchState = 0;
            launcher.render();
            if(aLevelData[levelNum]["@bLimit"] != 0 && gameIsInPlay && bubblesToFire == 0) {
                initLevelFailSequence();
            }
            userBubble.reset();
        };
        BubbleStack.prototype.getLowestBubbleY = function () {
            var lowestY = 0;
            for(var i = 0; i < this.aBubblePos.length; i++) {
                if(this.aBubblePos[i].y > lowestY) {
                    lowestY = this.aBubblePos[i].y;
                }
            }
            return lowestY;
        };
        BubbleStack.prototype.getAllFreePos = function () {
            this.aFreePos = new Array();
            var tempX = wallDepth + ballRadius + ballRadius;
            for(var i = 0; i < 9; i++) {
                var aCanAdd = new Array(1, 1);
                for(var j = 0; j < this.aBubblePos.length; j++) {
                    if(tempX > wallDepth + ballRadius) {
                        if(tempX - ballRadius == this.aBubblePos[j].x && 0 == this.aBubblePos[j].y) {
                            aCanAdd[0] = 0;
                        }
                    } else {
                        aCanAdd[0] = 0;
                    }
                    if(tempX < canvas.width - (wallDepth + ballRadius)) {
                        if(tempX + ballRadius == this.aBubblePos[j].x && 0 == this.aBubblePos[j].y) {
                            aCanAdd[1] = 0;
                        }
                    } else {
                        aCanAdd[1] = 0;
                    }
                }
                if(aCanAdd[0] == 1) {
                    this.aFreePos.push({
                        posX: tempX - ballRadius,
                        posY: ballRadius,
                        targX: tempX - ballRadius / 2,
                        targY: ballRadius
                    });
                }
                if(aCanAdd[0] == 1) {
                    this.aFreePos.push({
                        posX: tempX + ballRadius,
                        posY: ballRadius,
                        targX: tempX + ballRadius / 2,
                        targY: ballRadius
                    });
                }
                tempX += ballRadius * 2;
            }
            aAllowedBubbleStates = new Array(0, 0, 0, 0, 0);
            for(var i = 0; i < this.aBubblePos.length; i++) {
                var aCanAdd = new Array(1, 1, 1, 1);
                for(var j = 0; j < this.aBubblePos.length; j++) {
                    if(this.aBubblePos[i].y != ballRadius && this.aBubblePos[i].x > wallDepth + ballRadius * 2) {
                        if(this.aBubblePos[i].x - ballRadius * 2 == this.aBubblePos[j].x && this.aBubblePos[i].y == this.aBubblePos[j].y) {
                            aCanAdd[0] = 0;
                        }
                    } else {
                        aCanAdd[0] = 0;
                    }
                    if(this.aBubblePos[i].x > wallDepth + ballRadius) {
                        if(this.aBubblePos[i].x - ballRadius == this.aBubblePos[j].x && this.aBubblePos[i].y + ballRadius * 1.75 == this.aBubblePos[j].y) {
                            aCanAdd[1] = 0;
                        }
                    } else {
                        aCanAdd[1] = 0;
                    }
                    if(this.aBubblePos[i].x < canvas.width - (wallDepth + ballRadius)) {
                        if(this.aBubblePos[i].x + ballRadius == this.aBubblePos[j].x && this.aBubblePos[i].y + ballRadius * 1.75 == this.aBubblePos[j].y) {
                            aCanAdd[2] = 0;
                        }
                    } else {
                        aCanAdd[2] = 0;
                    }
                    if(this.aBubblePos[i].y != ballRadius && this.aBubblePos[i].x < canvas.width - (wallDepth + ballRadius * 2)) {
                        if(this.aBubblePos[i].x + ballRadius * 2 == this.aBubblePos[j].x && this.aBubblePos[i].y == this.aBubblePos[j].y) {
                            aCanAdd[3] = 0;
                        }
                    } else {
                        aCanAdd[3] = 0;
                    }
                }
                if(aCanAdd[0] == 1) {
                    this.aFreePos.push({
                        posX: this.aBubblePos[i].x - (ballRadius * 2),
                        posY: this.aBubblePos[i].y,
                        targX: this.aBubblePos[i].x - ((ballRadius * 2) / 2) * this.freePosAdjust,
                        targY: this.aBubblePos[i].y
                    });
                }
                if(aCanAdd[1] == 1) {
                    this.aFreePos.push({
                        posX: this.aBubblePos[i].x - ballRadius,
                        posY: this.aBubblePos[i].y + (ballRadius * 1.75),
                        targX: this.aBubblePos[i].x - (ballRadius / 2) * this.freePosAdjust,
                        targY: this.aBubblePos[i].y + ((ballRadius * 1.75) / 2) * this.freePosAdjust
                    });
                }
                if(aCanAdd[2] == 1) {
                    this.aFreePos.push({
                        posX: this.aBubblePos[i].x + ballRadius,
                        posY: this.aBubblePos[i].y + (ballRadius * 1.75),
                        targX: this.aBubblePos[i].x + (ballRadius / 2) * this.freePosAdjust,
                        targY: this.aBubblePos[i].y + ((ballRadius * 1.75) / 2) * this.freePosAdjust
                    });
                }
                if(aCanAdd[3] == 1) {
                    this.aFreePos.push({
                        posX: this.aBubblePos[i].x + (ballRadius * 2),
                        posY: this.aBubblePos[i].y,
                        targX: this.aBubblePos[i].x + ((ballRadius * 2) / 2) * this.freePosAdjust,
                        targY: this.aBubblePos[i].y
                    });
                }
                if(this.aBubblePos[i].id < 5) {
                    aAllowedBubbleStates[this.aBubblePos[i].id] = true;
                }
            }
            var allFalse = true;
            for(var i = 0; i < aAllowedBubbleStates.length; i++) {
                if(aAllowedBubbleStates[i]) {
                    allFalse = false;
                }
            }
            if(allFalse) {
                aAllowedBubbleStates = new Array(1, 1, 1, 1, 1);
            }
        };
        BubbleStack.prototype.update = function () {
        };
        BubbleStack.prototype.render = function () {
            var vx;
            var vy;
            var jiggleTime;
            var jiggleMultipier;
            if(this.hasRemoved) {
                jiggleTime = 10;
                jiggleMultipier = 1.5;
            } else {
                jiggleTime = 5;
                jiggleMultipier = .75;
            }
            if(aLevelData[levelNum]["@levelType"] == 1) {
                for(var i = 0; i < 10; i++) {
                    var imgX = (16 * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                    var imgY = Math.floor(16 / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                    ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, wallDepth + ballRadius - this.oBubblesImgData.oData.spriteWidth / 2 + (ballRadius * 2) * i, this.ceiling + ballRadius - this.oBubblesImgData.oData.spriteHeight / 2, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
                }
            }
            for(var i = 0; i < this.aBubblePos.length; i++) {
                if(this.aBubblePos[i].inc < jiggleTime) {
                    this.aBubblePos[i].inc += (this.aBubblePos[i].dist * delta);
                    vx = this.aBubblePos[i].vx * (this.aBubblePos[i].inc / jiggleTime) * (this.aBubblePos[i].inc / jiggleTime - 2) + this.aBubblePos[i].vx;
                    vy = this.aBubblePos[i].vy * (this.aBubblePos[i].inc / jiggleTime) * (this.aBubblePos[i].inc / jiggleTime - 2) + this.aBubblePos[i].vy;
                } else {
                    vx = 0;
                    vy = 0;
                    this.aBubblePos[i].inc = jiggleTime;
                }
                var imgX = (this.aBubblePos[i].id * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                var imgY = Math.floor(this.aBubblePos[i].id / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, this.aBubblePos[i].x - this.oBubblesImgData.oData.spriteWidth / 2 - Math.sin(this.aBubblePos[i].inc) * (vx * jiggleMultipier), this.ceiling + this.aBubblePos[i].y - this.oBubblesImgData.oData.spriteHeight / 2 - Math.sin(this.aBubblePos[i].inc) * (vy * jiggleMultipier), this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
            }
        };
        return BubbleStack;
    })();
    Elements.BubbleStack = BubbleStack;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var BasicFallingBubble = (function () {
        function BasicFallingBubble() {
            this.x = 0;
            this.y = 0;
            this.removeMe = false;
            this.flickerInc = 0;
            this.flickerIncTarg = Math.random() * .2 + .05;
            this.bounceInc = 0;
            this.flipX = 1;
            this.state = 0;
            this.flashInc = 0;
            this.scale = 1;
            this.fallSpeed = 1000;
            this.oBubblesImgData = assetLib.getData("bubbles");
            this.reset();
            this.y = Math.random() * canvas.height;
        }
        BasicFallingBubble.prototype.reset = function () {
            this.id = Math.floor(Math.random() * 5);
            this.x = 50 + Math.random() * (canvas.width - 100);
            this.y = -50 - Math.random() * 300;
            this.vx = Math.random() * 100 - 50;
            this.vy = Math.random() * 150 + 200;
        };
        BasicFallingBubble.prototype.update = function () {
            this.x += this.vx * delta;
            this.y += this.vy * delta;
            if(this.x > canvas.width - (wallDepth + ballRadius)) {
                this.x = canvas.width - (wallDepth + ballRadius);
                this.vx *= -1;
            } else if(this.x < wallDepth + ballRadius) {
                this.x = wallDepth + ballRadius;
                this.vx *= -1;
            }
            if(this.y > canvas.height + 50) {
                this.reset();
            }
        };
        BasicFallingBubble.prototype.render = function () {
            var imgX = (this.id * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
            var imgY = Math.floor(this.id / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
            ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, this.x - (this.oBubblesImgData.oData.spriteWidth / 2) * this.scale, this.y - (this.oBubblesImgData.oData.spriteHeight / 2) * this.scale, this.oBubblesImgData.oData.spriteWidth * this.scale, this.oBubblesImgData.oData.spriteHeight * this.scale);
        };
        return BasicFallingBubble;
    })();
    Elements.BasicFallingBubble = BasicFallingBubble;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var FallingBubble = (function () {
        function FallingBubble(_angle, _order, _id) {
            this.x = 0;
            this.y = 0;
            this.removeMe = false;
            this.flickerInc = 0;
            this.flickerIncTarg = Math.random() * .2 + .05;
            this.bounceInc = 0;
            this.flipX = 1;
            this.state = 0;
            this.flashInc = 0;
            this.scale = 1;
            this.fallSpeed = 1000;
            this.oBubblesImgData = assetLib.getData("bubbles");
            var power = Math.random() * 200 + 400;
            if(_angle == null) {
                _angle = (Math.random() * 360) * radian;
                power = Math.random() * 100 + 100;
            } else {
                _angle = _angle + (Math.random() * 10 - 5) * radian;
            }
            if(_order == null) {
                this.flashIncTarg = 0;
            } else {
                this.flashIncTarg = (_order - 1) / 20;
            }
            this.vx = -power * Math.cos(_angle);
            this.vy = -power * Math.sin(_angle);
            if(_id > 9 && _id < 15) {
                _id += 7;
                this.scale = 3;
                TweenLite.to(this, 2, {
                    scale: 1.5,
                    ease: "Elastic.easeOut"
                });
                this.vy = -100;
                this.fallSpeed = 500;
            }
            this.setId(_id);
            this.vTween = TweenLite.to(this, 3, {
                vx: this.vx * .25,
                ease: "Quad.easeOut"
            });
        }
        FallingBubble.prototype.setId = function (_id) {
            this.flickerId = this.id = _id;
        };
        FallingBubble.prototype.update = function () {
            if(this.state == 0) {
                this.flashInc += delta;
                if(this.flashInc >= this.flashIncTarg) {
                    this.state = 1;
                }
            } else {
                this.x += (this.vx * delta) * this.flipX;
                this.vy += this.fallSpeed * delta;
                this.y += (this.vy * delta);
                if(this.x > canvas.width - (wallDepth + ballRadius)) {
                    this.x = canvas.width - (wallDepth + ballRadius);
                    this.flipX *= -1;
                } else if(this.x < wallDepth + ballRadius) {
                    this.x = wallDepth + ballRadius;
                    this.flipX *= -1;
                }
                if(this.bounceInc < 0 && this.y > 600 - ballRadius) {
                    this.bounceInc++;
                    this.y = 600 - ballRadius;
                    this.vy *= -.5;
                }
                if(this.y > canvas.height + 50) {
                    this.removeMe = true;
                }
            }
        };
        FallingBubble.prototype.render = function () {
            var imgX = (this.id * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
            var imgY = Math.floor(this.id / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
            ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, this.x - (this.oBubblesImgData.oData.spriteWidth / 2) * this.scale, this.y - (this.oBubblesImgData.oData.spriteHeight / 2) * this.scale, this.oBubblesImgData.oData.spriteWidth * this.scale, this.oBubblesImgData.oData.spriteHeight * this.scale);
        };
        return FallingBubble;
    })();
    Elements.FallingBubble = FallingBubble;
})(Elements || (Elements = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Elements;
(function (Elements) {
    var Firework = (function (_super) {
        __extends(Firework, _super);
        function Firework(_id) {
                _super.call(this, assetLib.getData("firework" + _id), 30, 30, "explode");
            this.vy = 0;
            this.setAnimType("once", "explode");
            this.animEndedFunc = function () {
                this.removeMe = true;
            };
            var tempScale = 3;
            if(_id == 1) {
                tempScale = 4;
            }
            TweenLite.to(this, 1, {
                scaleX: tempScale,
                scaleY: tempScale,
                ease: "Quad.easeOut"
            });
        }
        Firework.prototype.update = function () {
            this.vy += 150 * delta;
            this.y += this.vy * delta;
            _super.prototype.updateAnimation.call(this, delta);
        };
        Firework.prototype.render = function () {
            _super.prototype.renderSimple.call(this, ctx);
        };
        return Firework;
    })(Utils.AnimSprite);
    Elements.Firework = Firework;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Glint = (function () {
        function Glint(_id, _screen) {
            this.x = 0;
            this.y = 0;
            this.scale = 0;
            this.inc = 0;
            this.canShow = true;
            this.oGameElementsImgData = assetLib.getData("gameElements");
            this.id = _id;
            TweenLite.to(this, 1, {
                scale: 4,
                ease: "Quad.easeOut"
            });
            if(_screen == "game") {
                this.resetInGame();
            } else if(_screen == "map") {
                this.resetInMap();
            }
        }
        Glint.prototype.resetInGame = function () {
            if(bubbleStack.aBubblePos.length / 4 > this.id) {
                this.bubbleTargId = Math.floor(Math.random() * bubbleStack.aBubblePos.length);
                this.incRate = Math.random() * 3 + 1;
                this.canShow = true;
            } else {
                this.canShow = false;
            }
        };
        Glint.prototype.resetInMap = function () {
            this.incRate = Math.random() * 3 + 1;
            this.canShow = true;
            this.targX = Math.random() * 400 + 25;
            this.targY = Math.random() * 1200 + 100;
        };
        Glint.prototype.updateInGame = function () {
            if(!bubbleStack.aBubblePos[this.bubbleTargId]) {
                this.resetInGame();
                this.canShow = false;
                return;
            }
            this.x = bubbleStack.aBubblePos[this.bubbleTargId].x + 3;
            this.y = bubbleStack.aBubblePos[this.bubbleTargId].y - 13 + bubbleStack.ceiling;
            this.inc += this.incRate * delta;
            this.scale = Math.sin(this.inc) * 2;
            if(this.inc > 3.14) {
                this.inc = 0;
                this.resetInGame();
            }
        };
        Glint.prototype.updateInMap = function () {
            this.x = this.targX;
            this.y = this.targY - panel.mapPosRealY;
            this.inc += this.incRate * delta;
            this.scale = Math.sin(this.inc) * 1.5;
            if(this.inc > 3.14) {
                this.inc = 0;
                this.resetInMap();
            }
        };
        Glint.prototype.render = function () {
            if(!this.canShow) {
                return;
            }
            var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.glint].x;
            var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.glint].y;
            var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.glint].width;
            var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.glint].height;
            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, this.x - (bWidth / 2) * this.scale, this.y - (bHeight / 2) * this.scale, bWidth * this.scale, bHeight * this.scale);
        };
        return Glint;
    })();
    Elements.Glint = Glint;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Pop = (function (_super) {
        __extends(Pop, _super);
        function Pop(_delay, _id, _score) {
                _super.call(this, assetLib.getData("pop"), 20, 10, "hide");
            this.explodeStage = 0;
            this.incY = 0;
            this.oBubblesImgData = assetLib.getData("bubbles");
            this.oGameElementsImgData = assetLib.getData("gameElements");
            this.bubbleId = _id;
            this.score = _score;
            var _this = this;
            setTimeout(function () {
                _this.startAnim();
            }, (_delay - 1) * 50);
        }
        Pop.prototype.startAnim = function () {
            playSound("pop" + Math.floor(Math.random() * 4));
            this.bubbleId = Math.min(this.bubbleId, 5);
            this.setAnimType("once", "explode" + this.bubbleId);
            this.explodeStage = 1;
            this.animEndedFunc = function () {
                this.startY = this.y;
                this.explodeStage = 2;
                this.scaleX = 0;
                this.scaleY = 0;
                TweenLite.to(this, .5, {
                    scaleX: 1,
                    scaleY: 1,
                    ease: "Back.easeOut"
                });
            };
        };
        Pop.prototype.update = function () {
            if(this.explodeStage == 1) {
                this.offsetY = bubbleStack.ceiling;
                _super.prototype.updateAnimation.call(this, delta);
            } else if(this.explodeStage == 2) {
                this.incY += 7 * delta;
                this.y = this.startY + Math.sin(this.incY + this.x + this.startY) * 5;
                if(this.incY > 8) {
                    TweenLite.to(this, 1, {
                        x: canvas.width / 2,
                        y: -300,
                        scaleX: 0,
                        scaleY: 0,
                        ease: "Back.easeIn",
                        onComplete: function (_this) {
                            _this.removeMe = true;
                        },
                        onCompleteParams: [
                            this
                        ]
                    });
                    this.explodeStage = 3;
                }
            }
        };
        Pop.prototype.render = function () {
            if(this.explodeStage == 0) {
                var imgX = (this.bubbleId * this.oBubblesImgData.oData.spriteWidth) % this.oBubblesImgData.img.width;
                var imgY = Math.floor(this.bubbleId / (this.oBubblesImgData.img.width / this.oBubblesImgData.oData.spriteWidth)) * this.oBubblesImgData.oData.spriteHeight;
                ctx.drawImage(this.oBubblesImgData.img, imgX, imgY, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight, this.x - this.oBubblesImgData.oData.spriteWidth / 2, this.y - this.oBubblesImgData.oData.spriteHeight / 2 + bubbleStack.ceiling, this.oBubblesImgData.oData.spriteWidth, this.oBubblesImgData.oData.spriteHeight);
            } else if(this.explodeStage == 1) {
                _super.prototype.renderSimple.call(this, ctx);
            } else if(this.explodeStage == 2 || this.explodeStage == 3) {
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds["score" + this.score]].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds["score" + this.score]].y;
                var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds["score" + this.score]].width;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds["score" + this.score]].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, this.x - (bWidth / 2) * this.scaleX, this.y - (bHeight / 2) * this.scaleY + bubbleStack.ceiling, bWidth * this.scaleX, bHeight * this.scaleY);
            }
        };
        return Pop;
    })(Utils.AnimSprite);
    Elements.Pop = Pop;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Flame = (function (_super) {
        __extends(Flame, _super);
        function Flame() {
                _super.call(this, assetLib.getData("flame"), 12, 10, "burn");
            this.x = 170;
            this.y = 550;
        }
        Flame.prototype.update = function () {
            _super.prototype.updateAnimation.call(this, delta);
        };
        Flame.prototype.render = function () {
            _super.prototype.renderSimple.call(this, ctx);
        };
        return Flame;
    })(Utils.AnimSprite);
    Elements.Flame = Flame;
})(Elements || (Elements = {}));
var Utils;
(function (Utils) {
    var SaveDataHandler = (function () {
        function SaveDataHandler(_saveDataId) {
            this.dataGroupNum = 2;
            this.saveDataId = _saveDataId;
            (window).famobi = (window).famobi ? (window).famobi : {
            };
            (window).famobi.localStorage = (window).famobi.localStorage ? (window).famobi.localStorage : (window).localStorage;
            (window).famobi.sessionStorage = (window).famobi.sessionStorage ? (window).famobi.sessionStorage : (window).sessionStorage;
            this.clearData();
            this.setInitialData();
        }
        SaveDataHandler.prototype.clearData = function () {
            this.aLevelStore = new Array();
            this.aLevelStore.push(1);
            this.aLevelStore.push(0);
            for(var i = 0; i < aMapButs.length - 1; i++) {
                this.aLevelStore.push(0);
                this.aLevelStore.push(0);
            }
        };
        SaveDataHandler.prototype.resetData = function () {

            window.famobi_analytics.trackEvent("EVENT_CUSTOM", {event: "EVENT_RESETDATA"}).then(function() {
                this.clearData();
                this.saveData();
            }.bind(this));
        };
        SaveDataHandler.prototype.setInitialData = function () {
            if((window).famobi.localStorage.getItem(this.saveDataId) != null && (window).famobi.localStorage.getItem(this.saveDataId) != "") {
                this.aLevelStore = (window).famobi.localStorage.getItem(this.saveDataId).split(",");
                for(var a in this.aLevelStore) {
                    this.aLevelStore[a] = parseInt(this.aLevelStore[a]);
                }
            } else {
                this.saveData();
            }
        };
        SaveDataHandler.prototype.setData = function (_levelNum, _stars, _score) {
            if(_score > this.aLevelStore[_levelNum * 2 + 1]) {
                this.aLevelStore[_levelNum * 2 + 1] = _score;
            }
            if(_stars + 1 > this.aLevelStore[_levelNum * 2]) {
                this.aLevelStore[_levelNum * 2] = _stars + 1;
            }
            if(_levelNum < aMapButs.length - 1 && this.aLevelStore[(_levelNum + 1) * 2] == 0) {
                this.aLevelStore[(_levelNum + 1) * 2] = 1;
            }
        };
        SaveDataHandler.prototype.getStars = function (_levelNum) {
            return this.aLevelStore[_levelNum * 2];
        };
        SaveDataHandler.prototype.getTotalScore = function () {
            var tempScore = 0;
            for(var i = 0; i < saveDataHandler.aLevelStore.length; i++) {
                tempScore += saveDataHandler.aLevelStore[i + 1];
                i++;
            }
            return tempScore;
        };
        SaveDataHandler.prototype.getScore = function (_levelNum) {
            return this.aLevelStore[_levelNum * 2 + 1];
        };
        SaveDataHandler.prototype.saveData = function () {
            var str = "";
            for(var i = 0; i < this.aLevelStore.length; i++) {
                str += this.aLevelStore[i];
                if(i < this.aLevelStore.length - 1) {
                    str += ",";
                }
            }
            (window).famobi.localStorage.setItem(this.saveDataId, str);
        };
        return SaveDataHandler;
    })();
    Utils.SaveDataHandler = SaveDataHandler;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var TextDisplay = (function () {
        function TextDisplay() {
            this.oTextData = {
            };
            this.inc = 0;
            this.kernOffset = 1;
            this.createTextObjects();
        }
        TextDisplay.prototype.createTextObjects = function () {

            /*
                famobi: translate via famobi.json
            */

            // var cnt = 0;
            // for(var i in assetLib.textData.langText.text[curLang]) {
            //     this.oTextData[i] = {
            //     };
            //     this.oTextData[i].aLineData = this.getCharData(assetLib.textData.langText.text[curLang][i]["@text"], assetLib.textData.langText.text[curLang][i]["@fontId"]);
            //     this.oTextData[i].aLineWidths = this.getLineWidths(this.oTextData[i].aLineData);
            //     this.oTextData[i].blockWidth = this.getBlockWidth(this.oTextData[i].aLineData);
            //     this.oTextData[i].blockHeight = this.getBlockHeight(this.oTextData[i].aLineData, assetLib.textData.langText.text[curLang][i]["@fontId"]);
            //     this.oTextData[i].lineHeight = parseInt(assetLib.textData["fontData" + assetLib.textData.langText.text[curLang][i]["@fontId"]].text.common["@lineHeight"]);
            //     this.oTextData[i].oFontImgData = assetLib.getData("font" + assetLib.textData.langText.text[curLang][i]["@fontId"]);
            // }

            for (var b in assetLib.textData.langText.text[curLang]) {
                this.oTextData[b] = {},
                this.oTextData[b].aLineData = this.getCharData(
                    window.famobi.__(b)["@text"],
                    window.famobi.__(b)["@fontId"]),
                this.oTextData[b].aLineWidths = this.getLineWidths(
                    this.oTextData[b].aLineData),
                this.oTextData[b].blockWidth = this.getBlockWidth(this.oTextData[b].aLineData),
                this.oTextData[b].blockHeight = this.getBlockHeight(this.oTextData[b].aLineData, window.famobi.__(b)["@fontId"]),
                this.oTextData[b].lineHeight = parseInt(assetLib.textData["fontData" + window.famobi.__(b)["@fontId"]].text.common["@lineHeight"]),
                this.oTextData[b].oFontImgData = assetLib.getData("font" + window.famobi.__(b)["@fontId"])
            }
        };
        TextDisplay.prototype.getLineWidths = function (_aCharData) {
            var lineLength;
            var aLineWidths = new Array();
            for(var i = 0; i < _aCharData.length; i++) {
                lineLength = 0;
                for(var j = 0; j < _aCharData[i].length; j++) {
                    lineLength += parseInt(_aCharData[i][j]["@xadvance"]) + this.kernOffset;
                    if(j == 0) {
                        lineLength -= parseInt(_aCharData[i][j]["@xoffset"]);
                    } else if(j == _aCharData[i].length - 1) {
                        lineLength += parseInt(_aCharData[i][j]["@xoffset"]);
                    }
                }
                aLineWidths.push(lineLength);
            }
            return aLineWidths;
        };
        TextDisplay.prototype.getBlockWidth = function (_aCharData) {
            var lineLength;
            var longestLineLength = 0;
            for(var i = 0; i < _aCharData.length; i++) {
                lineLength = 0;
                for(var j = 0; j < _aCharData[i].length; j++) {
                    lineLength += parseInt(_aCharData[i][j]["@xadvance"]) + this.kernOffset;
                    if(j == 0) {
                        lineLength -= parseInt(_aCharData[i][j]["@xoffset"]);
                    } else if(j == _aCharData[i].length - 1) {
                        lineLength += parseInt(_aCharData[i][j]["@xoffset"]);
                    }
                }
                if(lineLength > longestLineLength) {
                    longestLineLength = lineLength;
                }
            }
            return longestLineLength;
        };
        TextDisplay.prototype.getBlockHeight = function (_aCharData, _fontId) {
            return _aCharData.length * parseInt(assetLib.textData["fontData" + _fontId].text.common["@lineHeight"]);
        };
        TextDisplay.prototype.getCharData = function (_aLines, _fontId) {
            var aCharData = new Array();
            for(var k = 0; k < _aLines.length; k++) {
                aCharData[k] = new Array();
                for(var i = 0; i < _aLines[k].length; i++) {
                    for(var j = 0; j < assetLib.textData["fontData" + _fontId].text.chars.char.length; j++) {
                        if(_aLines[k][i].charCodeAt() == assetLib.textData["fontData" + _fontId].text.chars.char[j]["@id"]) {
                            aCharData[k].push(assetLib.textData["fontData" + _fontId].text.chars.char[j]);
                        }
                    }
                }
            }
            return aCharData;
        };
        TextDisplay.prototype.renderText = function (_oTextDisplayData) {
            var aLinesToRender = this.oTextData[_oTextDisplayData.text].aLineData;
            var oFontImgData = this.oTextData[_oTextDisplayData.text].oFontImgData;
            var shiftX;
            var offsetX = 0;
            var offsetY = 0;
            var lineOffsetY = 0;
            var manualScale = 1;
            var animY = 0;
            var tempKern = 0;
            if(_oTextDisplayData.lineOffsetY) {
                lineOffsetY = _oTextDisplayData.lineOffsetY;
            }
            if(_oTextDisplayData.scale) {
                manualScale = _oTextDisplayData.scale;
            }
            var textScale = 1 * manualScale;
            if(_oTextDisplayData.maxWidth && this.oTextData[_oTextDisplayData.text].blockWidth * manualScale > _oTextDisplayData.maxWidth) {
                textScale = _oTextDisplayData.maxWidth / this.oTextData[_oTextDisplayData.text].blockWidth;
            }
            if(_oTextDisplayData.anim) {
                this.inc += delta * 7;
            }
            for(var i = 0; i < aLinesToRender.length; i++) {
                shiftX = 0;
                if(_oTextDisplayData.alignX == "centre") {
                    offsetX = this.oTextData[_oTextDisplayData.text].aLineWidths[i] / 2;
                }
                if(_oTextDisplayData.alignY == "centre") {
                    offsetY = this.oTextData[_oTextDisplayData.text].blockHeight / 2 + (lineOffsetY * (aLinesToRender.length - 1)) / 2;
                }
                for(var j = 0; j < aLinesToRender[i].length; j++) {
                    var bX = aLinesToRender[i][j]["@x"];
                    var bY = aLinesToRender[i][j]["@y"];
                    var bWidth = aLinesToRender[i][j]["@width"];
                    var bHeight = aLinesToRender[i][j]["@height"];
                    if(_oTextDisplayData.anim) {
                        animY = Math.sin(this.inc + j / 2) * ((bHeight / 10) * textScale);
                    }
                    ctx.drawImage(oFontImgData.img, bX, bY, bWidth, bHeight, _oTextDisplayData.x + (shiftX + parseInt(aLinesToRender[i][j]["@xoffset"]) - offsetX) * textScale, _oTextDisplayData.y + (parseInt(aLinesToRender[i][j]["@yoffset"]) + (i * this.oTextData[_oTextDisplayData.text].lineHeight) + (i * lineOffsetY) - offsetY) * textScale + animY, bWidth * textScale, bHeight * textScale);
                    shiftX += parseInt(aLinesToRender[i][j]["@xadvance"]) + this.kernOffset;
                }
            }
        };
        return TextDisplay;
    })();
    Utils.TextDisplay = TextDisplay;
})(Utils || (Utils = {}));
var requestAnimFrame = (function () {
    return window.requestAnimationFrame || (window).webkitRequestAnimationFrame || (window).mozRequestAnimationFrame || (window).oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60, new Date().getTime());
    };
})();
var previousTime;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
canvas.width = 450;
canvas.height = 700;
var canvasX;
var canvasY;
var canvasScaleX;
var canvasScaleY;
var div = document.getElementById('canvas-wrapper');
var sound;
var music;
var audioType = 0;
var muted = false;
var splash;
var splashTimer = 0;
var assetLib;
var preAssetLib;
var rotatePause = false;
var manualPause = false;
var isMobile = false;
var gameState = "loading";
var aLangs = new Array("EN");
var curLang = "";
var isBugBrowser = false;
var isIE10 = false;
var delta;
var radian = Math.PI / 180;
var ios9FirstTouch = false;
var textDisplay;
if(navigator.userAgent.match(/MSIE\s([\d]+)/)) {
    isIE10 = true;
}
var deviceAgent = navigator.userAgent.toLowerCase();
if(deviceAgent.match(/(iphone|ipod|ipad)/) || deviceAgent.match(/(android)/) || deviceAgent.match(/(iemobile)/) || deviceAgent.match(/iphone/i) || deviceAgent.match(/ipad/i) || deviceAgent.match(/ipod/i) || deviceAgent.match(/blackberry/i) || deviceAgent.match(/bada/i)) {
    isMobile = true;
    if(deviceAgent.match(/(android)/) && !/Chrome/.test(navigator.userAgent)) {
        isBugBrowser = true;
    }
}
var userInput = new Utils.UserInput(canvas, isBugBrowser);
resizeCanvas();
window.onresize = function () {
    setTimeout(function () {
        resizeCanvas();
    }, 1);
};
function visibleResume() {
    if(!muted && !manualPause) {
        Howler.unmute();
    }
}
function visiblePause() {
    Howler.mute();
}
window.addEventListener("load", function () {
    setTimeout(function () {
        resizeCanvas();
    }, 0);
    window.addEventListener("orientationchange", function () {
        setTimeout(function () {
            resizeCanvas();
        }, 500);
        setTimeout(function () {
            resizeCanvas();
        }, 2000);
    }, false);
});
function isStock() {
    var matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
    return matches && parseFloat(matches[1]) < 537;
}
var ua = navigator.userAgent;
var isSharpStock = ((/SHL24|SH-01F/i).test(ua)) && isStock();
var isXperiaAStock = ((/SO-04E/i).test(ua)) && isStock();
var isFujitsuStock = ((/F-01F/i).test(ua)) && isStock();
if(!isIE10 && (typeof (window).AudioContext !== 'undefined' || typeof (window).webkitAudioContext !== 'undefined' || navigator.userAgent.indexOf('Android') == -1 || isSharpStock || isXperiaAStock || isFujitsuStock)) {
    audioType = 1;
    sound = new Howl({
        urls: [
            'audio/sound.ogg',
            'audio/sound.m4a'
        ],
        sprite: {
            click: [
                0,
                450
            ],
            explode0: [
                500,
                800
            ],
            explode1: [
                1500,
                800
            ],
            explode2: [
                2500,
                800
            ],
            explode3: [
                3500,
                800
            ],
            gemRelease: [
                4500,
                1400
            ],
            levelSuccess: [
                6000,
                1900
            ],
            pop0: [
                8000,
                300
            ],
            pop1: [
                8500,
                300
            ],
            pop2: [
                9000,
                300
            ],
            pop3: [
                9500,
                300
            ],
            switchBubbles: [
                10000,
                400
            ],
            startLevel: [
                10500,
                2000
            ],
            levelFail: [
                13000,
                1200
            ],
            fire0: [
                14500,
                600
            ],
            fire1: [
                15500,
                600
            ],
            fire2: [
                16500,
                600
            ],
            fire3: [
                17500,
                600
            ],
            bonusBubble: [
                18500,
                2000
            ],
            starProgress: [
                21000,
                1600
            ],
            bounce: [
                23000,
                500
            ],
            praise: [
                24000,
                1300
            ]
        }
    });
    music = new Howl({
        urls: [
            'audio/music.ogg',
            'audio/music.m4a'
        ],
        volume: .01,
        loop: true
    });
} else {
    audioType = 0;
}
var panel;
var hud;
var background;
var totalScore = 0;
var levelScore = 0;
var levelNum = 0;
var aLevelUps;
var levelBonusScore;
var bonusScore;
var aTutorials = new Array();
var panelFrame;
var oLogoData = {
};
var oLogoBut;
var musicTween;
var oImageIds = {
};
var bubbleStartX = canvas.width / 2;
var bubbleStartY = 530;
var userBubble;
var launcher;
var bubbleStack;
var gameTouchState;
var aimX;
var aimY;
var aimRot;
var testVar = "------";
var ballRadius = 20;
var wallDepth = 25;
var bubbleTarget;
var aFallingBubbles;
var aEffects;
var aGlints;
var aimingFlipped = false;
var aPopScores = new Array(10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100);
var curPopChain;
var aimClickStartY;
var bubbleTargNum;
var bubbleTargId;
var bubblesToFire;
var gameControlState;
var inGameText;
var animTextY;
var startPanelInc;
var topSpacesFilled;
var aLevelSpecificTarget;
var aStarMarkers;
var starBarLength;
var messageTween;
var firstPop;
var gameIsInPlay;
var aAllowedBubbleStates;
var curStarLevel;
var flame;
var aMapButs = new Array([
    248,
    1342
], [
    321,
    1325
], [
    394,
    1294
], [
    374,
    1233
], [
    299,
    1224
], [
    221,
    1245
], [
    147,
    1255
], [
    75,
    1230
], [
    51,
    1169
], [
    112,
    1128
], [
    187,
    1117
], [
    259,
    1112
], [
    329,
    1099
], [
    384,
    1053
], [
    399,
    994
], [
    350,
    946
], [
    279,
    966
], [
    210,
    953
], [
    158,
    906
], [
    146,
    841
], [
    109,
    785
], [
    70,
    732
], [
    69,
    669
], [
    101,
    611
], [
    166,
    626
], [
    211,
    678
], [
    273,
    712
], [
    341,
    691
], [
    384,
    641
], [
    392,
    579
], [
    394,
    516
], [
    395,
    454
], [
    392,
    392
], [
    373,
    329
], [
    304,
    312
], [
    259,
    361
], [
    198,
    394
], [
    129,
    396
], [
    83,
    347
], [
    96,
    283
], [
    158,
    239
], [
    233,
    221
], [
    308,
    223
], [
    382,
    207
], [
    404,
    144
], [
    360,
    94
], [
    292,
    70
], [
    215,
    62
], [
    142,
    63
], [
    73,
    78
]);
var aLevelData = new Array();
var saveDataHandler = new Utils.SaveDataHandler("magicbubblesv3");

/*
    famobi: translate via famobi.json
*/
// try  {
//     curLang = (window).famobi.getCurrentLanguage();
// } catch (e) {
    curLang = "en";
// }
curLang = curLang.toUpperCase();

preAssetLib = new Utils.AssetLoader(curLang, [
    {
        id: "preloadImage",
        file: "images/preloadImage.png"
    }
], ctx, canvas.width, canvas.height, false);
preAssetLib.onReady(initLoadAssets);
function initSplash() {

    window.famobi_analytics.trackScreen("SCREEN_SPLASH");

    gameState = "splash";
    resizeCanvas();

    window.famobi_onPauseRequested = function () {
        window.famobi_unmuteAfterPause = !muted;
        if (!muted)
            toggleMute(true);
    };
    window.famobi_onResumeRequested = function () {
        if (window.famobi_unmuteAfterPause && muted)
            toggleMute(true);
        window.famobi_unmuteAfterPause = false;
    };

    if(!!window.famobi.localStorage.getItem("muted")) {
        muted = false;
        toggleMute(true);
    }

    if(audioType == 1 && !muted) {
        music.play();
    }

    textDisplay = new Utils.TextDisplay();
    aLevelData = assetLib.textData.levelData.text;
    totalScore = saveDataHandler.getTotalScore();
    initStartScreen();
}
function initStartScreen() {
    gameState = "start";

    (window).famobi_analytics.trackScreen(famobi_analytics.SCREEN_HOME);

    userInput.removeHitArea("moreGames");
    if(!muted && audioType == 1) {
        if(musicTween) {
            musicTween.kill();
        }
        musicTween = TweenLite.to(music, 1, {
            volume: .2,
            ease: "Linear.easeNone"
        });
    }
    totalScore = saveDataHandler.getTotalScore();
    background = new Elements.Background();
    background.renderState = "ripple";
    background.setBackground(0);
    aFallingBubbles = new Array();
    for(var i = 0; i < 10; i++) {
        var bub = new Elements.BasicFallingBubble();
        aFallingBubbles.push(bub);
    }
    userInput.addHitArea("mute", butEventHandler, null, "rect", {
        aRect: [
            372,
            0,
            445,
            52
        ]
    }, true);
    var oPlayBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2,
            500
        ],
        id: oImageIds.bigPlayBut
    };
    var oInfoBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            72,
            650
        ],
        id: oImageIds.infoBut,
        noMove: true
    };
    var oMoreGamesBut = {
        oImgData: assetLib.getData("moreGamesBut"),
        aPos: [
            350,
            650
        ],
        id: "none",
        scale: .28,
        noMove: true
    };
    userInput.addHitArea("startScreenPlayBut", butEventHandler, {
        multiTouch: true
    }, "image", oPlayBut);
    userInput.addHitArea("moreGames", butEventHandler, null, "image", oMoreGamesBut);

    var aButs = new Array(oPlayBut, oInfoBut, oMoreGamesBut);
    if(window.famobi.hasFeature("credits")) {
        userInput.addHitArea("credits", butEventHandler, null, "image", oInfoBut);
    } else {
        aButs = new Array(oPlayBut, oMoreGamesBut);
    }
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween1();
    previousTime = new Date().getTime();
    updateStartScreenEvent();
}
function initMapScreen() {
    gameState = "map";
    (window).famobi_analytics.trackScreen(famobi_analytics.SCREEN_LEVELSELECT);

    if(!muted && audioType == 1) {
        if(musicTween) {
            musicTween.kill();
        }
        musicTween = TweenLite.to(music, .5, {
            volume: .2,
            ease: "Linear.easeNone"
        });
    }
    totalScore = saveDataHandler.getTotalScore();
    userInput.addHitArea("mute", butEventHandler, null, "rect", {
        aRect: [
            372,
            0,
            445,
            52
        ]
    }, true);
    var oBackBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            72,
            650
        ],
        id: oImageIds.backBut,
        noMove: true
    };
    userInput.addHitArea("backFromMap", butEventHandler, null, "image", oBackBut);
    var aButs = new Array(oBackBut);
    panel = new Elements.Panel(gameState, aButs);
    var highestLevelButY = 1400;
    userInput.addHitArea("mapTouch", butEventHandler, {
        isDraggable: true,
        multiTouch: true
    }, "rect", {
        aRect: [
            0,
            0,
            canvas.width,
            canvas.height
        ]
    }, true);
    panel.mapDragY = 10000;
    panel.mapButIdToHighlight = -1;
    for(var i = 0; i < aMapButs.length; i++) {
        if(aMapButs[i][1] < highestLevelButY && saveDataHandler.getStars(i) > 0) {
            highestLevelButY = aMapButs[i][1];
        }
        if(saveDataHandler.getStars(i) == 1 && saveDataHandler.getScore(i) == 0) {
            panel.mapButIdToHighlight = i;
        }
    }
    panel.mapPosY = panel.mapPosRealY = Math.max(Math.min(highestLevelButY - canvas.height / 2, 1400 - canvas.height), 0);
    panel.startTween1();
    aGlints = new Array();
    for(var i = 0; i < 5; i++) {
        var glint = new Elements.Glint(i, "map");
        aGlints.push(glint);
    }
    previousTime = new Date().getTime();
    updateMapScreenEvent();
}
function initCreditsScreen() {
    gameState = "credits";
    (window).famobi_analytics.trackScreen(famobi_analytics.SCREEN_CREDITS);

    userInput.addHitArea("mute", butEventHandler, null, "rect", {
        aRect: [
            372,
            0,
            445,
            52
        ]
    }, true);
    var oBackBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            72,
            650
        ],
        id: oImageIds.backBut
    };
    var oResetBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            72,
            50
        ],
        id: oImageIds.resetBut,
        noMove: true
    };
    userInput.addHitArea("backFromCredits", butEventHandler, null, "image", oBackBut);
    userInput.addHitArea("resetGame", butEventHandler, null, "image", oResetBut);
    var aButs = new Array(oBackBut, oResetBut);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween2();
    previousTime = new Date().getTime();
    updateCreditsScreenEvent();
}
function initGame(_restart) {
    if(_restart) {
        logEvent({event: "LEVEL_RESTART", level: (levelNum + 1)});
    } else {
        logEvent({event: "LEVEL_START", level: (levelNum + 1)});
    }
    // ToDo: strip out all famobi_analytics?
    (window).famobi_analytics.trackEvent(_restart ? famobi_analytics.EVENT_LEVELRESTART : famobi_analytics.EVENT_LEVELSTART, {
            levelName: (levelNum + 1).toString()
        }).then(function() {
            _initGame();
        });
}
function _initGame() {
    gameState = "game";
    background = new Elements.Background();
    background.renderState = "none";
    levelReset();
    previousTime = new Date().getTime();
    updateGameEvent();
}
function levelReset(_track, _restart) {
    // ToDo: strip out all famobi_analytics?
    if(_track) {
        (window).famobi_analytics.trackEvent(_restart ? famobi_analytics.EVENT_LEVELRESTART : famobi_analytics.EVENT_LEVELSTART, {
                levelName: (levelNum + 1).toString()
            }).then(function() {
                _levelReset();
            });
    } else {
        _levelReset();
    }
}
function _levelReset() {

    if(!muted && audioType == 1) {
        musicTween.kill();
        musicTween = TweenLite.to(music, 1, {
            volume: .4,
            ease: "Linear.easeNone"
        });
    }
    gameTouchState = 3;
    curPopChain = -1;
    curStarLevel = 0;
    gameIsInPlay = true;
    levelScore = 0;
    totalScore = saveDataHandler.getTotalScore() - saveDataHandler.getScore(levelNum);
    gameControlState = true;
    aimX = bubbleStartX;
    aimY = 0;
    aimRot = 90 * radian;
    animTextY = -100;
    startPanelInc = 0;
    firstPop = true;
    aAllowedBubbleStates = new Array(0, 0, 0, 0, 0);
    for(var i = 0; i < aLevelData[levelNum]["@grid"].length; i++) {
        if(aLevelData[levelNum]["@grid"][i] != -1) {
            var tempId = aLevelData[levelNum]["@grid"][i];
            if(tempId < 5) {
                aAllowedBubbleStates[tempId] = true;
            }
        }
    }
    flame = new Elements.Flame();
    hud = new Elements.Hud();
    panel = new Elements.Panel("startPanel", new Array());
    panel.startTween1();
    setTimeout(function () {
        userInput.addHitArea("startPanelTouch", butEventHandler, {
            multiTouch: true
        }, "rect", {
            aRect: [
                0,
                0,
                canvas.width,
                canvas.height
            ]
        }, true);
        userInput.addHitArea("pause", butEventHandler, null, "rect", {
            aRect: [
                372,
                0,
                445,
                52
            ]
        }, true);
    }, 1000);
    userBubble = new Elements.UserBubble();
    aFallingBubbles = new Array();
    launcher = new Elements.Launcher();
    launcher.x = bubbleStartX;
    launcher.y = bubbleStartY;
    bubbleStack = new Elements.BubbleStack(aLevelData[levelNum]["@grid"]);
    aStarMarkers = new Array();
    starBarLength = 0;
    aStarMarkers.push(aLevelData[levelNum]["@1Star"]);
    aStarMarkers.push(aLevelData[levelNum]["@2Star"]);
    aStarMarkers.push(aLevelData[levelNum]["@3Star"]);
    background.setBackground(aLevelData[levelNum]["@levelTheme"]);
    if(aLevelData[levelNum]["@levelType"] == 0) {
        bubbleTargNum = aLevelData[levelNum]["@bTargNum"];
        bubbleTargId = aLevelData[levelNum]["@bTargId"];
    } else {
        bubbleTargNum = 0;
    }
    if(aLevelData[levelNum]["@bLimit"] != 0) {
        bubblesToFire = aLevelData[levelNum]["@bLimit"] - 1;
    } else {
        bubblesToFire = 0;
    }
    playSound("startLevel");
    aGlints = new Array();
    for(var i = 0; i < 5; i++) {
        var glint = new Elements.Glint(i, "game");
        aGlints.push(glint);
    }
    aEffects = new Array();

    window.famobi_analytics.trackScreen("SCREEN_LEVEL");
}
function butEventHandler(_id, _oData) {
    switch(_id) {
        case "langSelect":
            curLang = _oData.lang;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            userInput.removeHitArea("langSelect");
            preAssetLib = new Utils.AssetLoader(curLang, [
                {
                    id: "preloadImage",
                    file: "images/preloadImage.png"
                }
            ], ctx, canvas.width, canvas.height, false);
            preAssetLib.onReady(initLoadAssets);
            break;
        case "startScreenPlayBut":
            if(!_oData.isDown) {
                playSound("click");
                userInput.removeHitArea("startScreenPlayBut");
                userInput.removeHitArea("mute");
                userInput.removeHitArea("credits");
                userInput.removeHitArea("moreGames");
                if(isMobile) {
                }
                initMapScreen();
            }
            break;
        case "backFromMap":
            playSound("click");
            userInput.removeHitArea("mute");
            userInput.removeHitArea("backFromMap");
            userInput.removeHitArea("mapTouch");
            initStartScreen();
            break;
        case "mapTouch":
            if(_oData.isBeingDragged && !_oData.hasLeft) {
                panel.mapPosY = Math.max(Math.min(panel.mapStartY - _oData.y, 1400 - canvas.height), 0);
            } else if(_oData.isDown) {
                if(panel.mapTween) {
                    panel.mapTween.kill();
                }
                toggleMapButs(false);
                panel.mapStartY = panel.mapPosRealY + _oData.y;
                panel.mapDragY = _oData.y;
            } else {
                toggleMapButs(true);
                if(Math.abs(panel.mapDragY - _oData.y) < 10) {
                    for(var i = 0; i < aMapButs.length; i++) {
                        if(saveDataHandler.getStars(i) > 0 && _oData.x > aMapButs[i][0] - 22 && _oData.x < aMapButs[i][0] + 22 && _oData.y + panel.mapPosY > aMapButs[i][1] - 22 && _oData.y + panel.mapPosY < aMapButs[i][1] + 22) {
                            levelNum = i;
                            userInput.removeHitArea("mute");
                            userInput.removeHitArea("backFromMap");
                            userInput.removeHitArea("mapTouch");
                            initGame();
                            break;
                        }
                    }
                }
            }
            break;
        case "credits":
            if(!window.famobi.hasFeature("credits")) break;
            playSound("click");
            userInput.removeHitArea("startScreenPlayBut");
            userInput.removeHitArea("mute");
            userInput.removeHitArea("credits");
            userInput.removeHitArea("moreGames");
            if(isMobile) {
            }
            initCreditsScreen();
            break;
        case "backFromCredits":
            playSound("click");
            userInput.removeHitArea("backFromCredits");
            userInput.removeHitArea("resetGame");
            initStartScreen();
            break;
        case "resetGame":
            playSound("click");
            userInput.removeHitArea("backFromCredits");
            userInput.removeHitArea("resetGame");
            saveDataHandler.resetData();
            initStartScreen();
            break;
        case "moreGames":
        case "moreGamesPause":
            playSound("click");
            try  {
                (window).famobi.moreGamesLink();
            } catch (e) {
            }
            break;
        case "switchBubble":
            if(_oData.isDown) {
                var tempId = hud.nextBubbleId;
                hud.nextBubbleId = userBubble.id;
                userBubble.id = tempId;
                playSound("switchBubbles");
                toggleGameTouch(false);
                if(gameTouchState == 0) {
                    gameTouchState = 2;
                }
            } else {
                toggleGameTouch(true);
                gameTouchState = 0;
            }
            break;
        case "firstGameTouch":
            if(!_oData.isDown) {
                userInput.removeHitArea("firstGameTouch");
                userInput.addHitArea("gameTouch", butEventHandler, {
                    isDraggable: true,
                    multiTouch: true
                }, "rect", {
                    aRect: [
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    ]
                }, true);
            }
            break;
        case "startPanelTouch":
            startPanelInc = 100;
            aimX = _oData.x;
            aimY = _oData.y;
            break;
        case "gameTouch":
            if(gameTouchState >= 2 || (_oData.y > bubbleStartY - ballRadius && _oData.y < bubbleStartY + ballRadius && _oData.x > bubbleStartX - ballRadius && _oData.x < bubbleStartX + ballRadius)) {
                launcher.aimLineAlpha = 0;
                toggleHudButs(true);
                return;
            }
            if(_oData.isBeingDragged && !_oData.hasLeft) {
                if(gameTouchState == 0) {
                    aimX = _oData.x;
                    aimY = _oData.y;
                    launcher.aimLineAlpha = 1;
                }
            } else if(_oData.isDown) {
                aimClickStartY = _oData.y;
                if(gameTouchState == 0) {
                    toggleHudButs(false);
                    aimX = _oData.x;
                    aimY = _oData.y;
                }
                if(_oData.hasLeft) {
                    launcher.aimLineAlpha = 0;
                } else {
                    launcher.aimLineAlpha = 1;
                }
            } else {
                toggleHudButs(true);
                if(gameTouchState == 0) {
                    playSound("fire" + Math.floor(Math.random() * 4));
                    gameTouchState = 2;
                    userBubble.shoot();
                    launcher.aimLineAlpha = 0;
                    return;
                }
            }
            break;
        case "mute":
            if(!manualPause) {
                playSound("click");
                toggleMute();
            }
            break;
        case "muteFromPause":
            playSound("click");
            toggleMute();
            var tempImgData = assetLib.getData("uiButs");
            var tempId = 0;
            if(muted) {
                tempId = 1;
            }
            var oMuteBut = {
                oImgData: assetLib.getData("uiButs"),
                aPos: [
                    canvas.width / 2,
                    310
                ],
                id: oImageIds.muteBut1
            };
            var bX = tempImgData.oData.oAtlasData[oImageIds["muteBut" + tempId]].x;
            var bY = tempImgData.oData.oAtlasData[oImageIds["muteBut" + tempId]].y;
            var bWidth = tempImgData.oData.oAtlasData[oImageIds["muteBut" + tempId]].width;
            var bHeight = tempImgData.oData.oAtlasData[oImageIds["muteBut" + tempId]].height;
            ctx.drawImage(tempImgData.img, bX + 26, bY + 12, bWidth - 52, bHeight - 24, canvas.width / 2 - 70 - ((bWidth - 52) / 2), 355 - ((bHeight - 24) / 2), bWidth - 52, bHeight - 24);
            break;
        case "pause":
            playSound("click");
            toggleManualPause(true);
            break;
        case "resumeFromPause":
            if(!_oData.isDown) {
                playSound("click");
                toggleManualPause(true);
            }
            break;
        case "menuFromPause":
            if(!_oData.isDown) {
                playSound("click");
                toggleManualPause();
                userInput.removeHitArea("pause");
                userInput.removeHitArea("firstGameTouch");
                userInput.removeHitArea("startPanelTouch");
                userInput.removeHitArea("gameTouch");
                userInput.removeHitArea("switchBubble");
                userInput.removeHitArea("retryFromPause");
                userInput.removeHitArea("resumeFromPause");
                userInput.removeHitArea("muteFromPause");
                userInput.removeHitArea("menuFromPause");
                logEvent({event: "LEVEL_QUIT", level: (levelNum + 1), score: levelScore});
                window.famobi_analytics.trackEvent("EVENT_LEVELFAIL", {levelName: (levelNum+1).toString(), reason: "quit"}).then(initMapScreen);
            }
            break;
        case "retryFromPause":
            if(!_oData.isDown) {
                playSound("click");
                toggleManualPause();
                userInput.removeHitArea("pause");
                userInput.removeHitArea("firstGameTouch");
                userInput.removeHitArea("startPanelTouch");
                userInput.removeHitArea("gameTouch");
                userInput.removeHitArea("switchBubble");
                userInput.removeHitArea("retryFromPause");
                userInput.removeHitArea("resumeFromPause");
                userInput.removeHitArea("muteFromPause");
                userInput.removeHitArea("menuFromPause");
                initGame(true);
            }
            break;
        case "retryLevel":
            userInput.removeHitArea("retryLevel");
            userInput.removeHitArea("nextLevel");
            levelReset(true, true);  // ToDo: set first arg to false? (_track)
            break;
        case "retryFromFail":
            userInput.removeHitArea("retryFromFail");
            userInput.removeHitArea("menuFromFail");
            levelReset(true, true);  // ToDo: set first arg to false? (_track)
            break;
        case "menuFromFail":
            userInput.removeHitArea("retryFromFail");
            userInput.removeHitArea("menuFromFail");
            window.famobi_analytics.trackEvent("EVENT_LEVELFAIL", {levelName: (levelNum+1).toString(), reason: "quit"}).then(initMapScreen);
            break;
        case "nextLevel":
            userInput.removeHitArea("retryLevel");
            userInput.removeHitArea("nextLevel");
            levelNum++;
            if(levelNum >= aLevelData.length) {
                levelNum = 0;
                initMapScreen();
            } else {
                levelReset(true);
            }
            break;
    }
}
function addFallingBubble(_id, _x, _y, _angle, _order) {
    if (typeof _angle === "undefined") { _angle = null; }
    if (typeof _order === "undefined") { _order = null; }
    if(_id > 9 && _id < 15) {
        playSound("gemRelease");
    }
    var fallingBubble = new Elements.FallingBubble(_angle, _order, _id);
    fallingBubble.x = _x;
    fallingBubble.y = _y;
    aFallingBubbles.push(fallingBubble);
    if(aLevelData[levelNum]["@levelType"] == 0) {
        if(bubbleTargId == 0 || _id == bubbleTargId - 1) {
            if(gameIsInPlay && --bubbleTargNum <= 0) {
                bubbleTargNum = 0;
                gameIsInPlay = false;
                initLevelCompleteSequence();
            }
        }
    }
}
function addFirework(_id, _x, _y) {
    var firework = new Elements.Firework(_id);
    firework.x = _x;
    firework.y = _y;
    firework.scaleX = firework.scaleY = 1;
    aEffects.push(firework);
}
function addPop(_x, _y, _delay, _id) {
    var tempScore;
    if(_id == 9) {
        tempScore = 500;
    } else {
        tempScore = getPopScore();
    }
    var pop = new Elements.Pop(_delay, _id, tempScore);
    pop.x = _x;
    pop.y = _y;
    aEffects.push(pop);
    updateScore(tempScore);
    if(aLevelData[levelNum]["@levelType"] == 0) {
        if(bubbleTargId == 0 || _id == bubbleTargId - 1) {
            if(firstPop) {
                firstPop = false;
                return;
            }
            if(gameIsInPlay && --bubbleTargNum <= 0) {
                bubbleTargNum = 0;
                gameIsInPlay = false;
                initLevelCompleteSequence();
            }
        }
    }
}
function initLevelCompleteSequence() {
    setTimeout(function () {
        initBubbleRain();
    }, 100);
    if(!muted && audioType == 1) {
        if(musicTween) {
            musicTween.kill();
        }
        musicTween = TweenLite.to(music, .1, {
            volume: .1,
            ease: "Linear.easeNone"
        });
    }
    userInput.removeHitArea("pause");
    userInput.removeHitArea("gameTouch");
    userInput.removeHitArea("switchBubble");
    gameControlState = false;
    displayInGameText("levelComplete", .3, initLevelComplete);
    playSound("levelSuccess");
    aGlints = new Array();
}
function initLevelComplete() {
    if(!muted && audioType == 1) {
        if(musicTween) {
            musicTween.kill();
        }
        musicTween = TweenLite.to(music, .5, {
            volume: .4,
            ease: "Linear.easeNone"
        });
    }
    var oRetryBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            65,
            650
        ],
        id: oImageIds.retryBut,
        scale: 0.0001
    };
    var oNextBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2,
            445
        ],
        id: oImageIds.nextBut,
        scale: 0.0001
    };

    var aButs = new Array(oRetryBut, oNextBut);
    var tempStars = 0;
    if(starBarLength >= aStarMarkers[2] / aStarMarkers[2]) {
        tempStars = 3;
    } else if(starBarLength >= aStarMarkers[1] / aStarMarkers[2]) {
        tempStars = 2;
    } else if(starBarLength >= aStarMarkers[0] / aStarMarkers[2]) {
        tempStars = 1;
    }
    saveDataHandler.setData(levelNum, tempStars, levelScore);
    saveDataHandler.saveData();
    panel = new Elements.Panel("endPanel", aButs);
    panel.startTween1();

    var showButtons = function() {
        oRetryBut.scale = .75;
        oNextBut.scale = 1;

        userInput.addHitArea("retryLevel", butEventHandler, null, "image", oRetryBut);
        userInput.addHitArea("nextLevel", butEventHandler, null, "image", oNextBut);
    };

    setTimeout(function() {
        Promise.all([
            logEvent({event: "LEVEL_PASSED", level: (levelNum + 1), score: levelScore})
        ]).then(showButtons, showButtons);
    }.bind(this), 1500);
}
function initLevelFailSequence() {
    logEvent({event:"LEVEL_FAILED", level: (levelNum + 1), score: levelScore});
    userInput.removeHitArea("pause");
    userInput.removeHitArea("gameTouch");
    userInput.removeHitArea("switchBubble");
    gameControlState = false;
    displayInGameText("outOfBubbles", .3, initLevelFail);
    if(!muted && audioType == 1) {
        if(musicTween) {
            musicTween.kill();
        }
        musicTween = TweenLite.to(music, .1, {
            volume: .1,
            ease: "Linear.easeNone"
        });
    }
    playSound("levelFail");
    aGlints = new Array();
}
function initLevelFail() {
    if(!muted && audioType == 1) {
        if(musicTween) {
            musicTween.kill();
        }
        musicTween = TweenLite.to(music, .5, {
            volume: .4,
            ease: "Linear.easeNone"
        });
    }
    var oRetryBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2 - 70,
            450
        ],
        id: oImageIds.retryBut,
        scale: 0.0001
    };
    var oMenuBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2 + 70,
            450
        ],
        id: oImageIds.menuBut,
        scale: 0.0001
    };

    var aButs = new Array(oRetryBut, oMenuBut);
    panel = new Elements.Panel("endFailPanel", aButs);
    panel.startTween1();

    var showButtons = function() {
        oRetryBut.scale = 1;
        oMenuBut.scale = 1;

        userInput.addHitArea("retryFromFail", butEventHandler, null, "image", oRetryBut);
        userInput.addHitArea("menuFromFail", butEventHandler, null, "image", oMenuBut);
    };

    setTimeout(function() {
        Promise.all([
            //(window).famobi_analytics.trackScreen(famobi_analytics.SCREEN_LEVELRESULT),
            //(window).famobi_analytics.trackEvent(famobi_analytics.EVENT_LEVELFAIL, {
            //    levelName: (levelNum + 1).toString(), reason: "dead"
            //})
        ]).then(showButtons, showButtons);
    }.bind(this), 1500);
}
function initBubbleRain() {
    for(var i = 0; i < bubbleStack.aBubblePos.length; i++) {
        addFallingBubble(bubbleStack.aBubblePos[i].id, bubbleStack.aBubblePos[i].x, bubbleStack.aBubblePos[i].y + bubbleStack.ceiling, null, Math.random() * 10);
        bubbleStack.aBubblePos.splice(i, 1);
        i -= 1;
    }
}
function displayInGameText(_text, _delay, _callback) {
    if (typeof _delay === "undefined") { _delay = 0; }
    if (typeof _callback === "undefined") { _callback = null; }
    var _this = this;
    inGameText = _text;
    animTextY = -100;
    if(messageTween) {
        messageTween.kill();
    }
    messageTween = TweenLite.to(this, .4, {
        animTextY: 290,
        ease: "Back.easeOut",
        delay: _delay,
        onComplete: function () {
            TweenLite.to(_this, .4, {
                animTextY: -100,
                delay: .7,
                ease: "Back.easeIn",
                onComplete: function () {
                    if(_callback) {
                        _callback();
                    }
                }
            });
        }
    });
}
function getPopScore() {
    return aPopScores[Math.min(curPopChain, aPopScores.length - 1)];
}
function toggleHudButs(_on) {
    if(_on) {
        userInput.addHitArea("pause", butEventHandler, null, "rect", {
            aRect: [
                372,
                0,
                445,
                52
            ]
        }, true);
        userInput.addHitArea("switchBubble", butEventHandler, {
            multiTouch: true
        }, "rect", {
            aRect: [
                48,
                545,
                119,
                663
            ]
        }, true);
        userInput.addHitArea("gameTouch", butEventHandler, {
            isDraggable: true,
            multiTouch: true
        }, "rect", {
            aRect: [
                0,
                0,
                canvas.width,
                canvas.height
            ]
        }, true);
    } else {
        userInput.removeHitArea("pause");
        userInput.removeHitArea("switchBubble");
    }
}
function toggleMapButs(_on) {
    if(_on) {
        userInput.addHitArea("mute", butEventHandler, null, "rect", {
            aRect: [
                372,
                0,
                445,
                52
            ]
        }, true);
        var oBackBut = {
            oImgData: assetLib.getData("uiButs"),
            aPos: [
                55,
                canvas.height - 45
            ],
            id: oImageIds.backBut,
            noMove: true
        };
        userInput.addHitArea("backFromMap", butEventHandler, null, "image", oBackBut);
        userInput.addHitArea("mapTouch", butEventHandler, {
            isDraggable: true,
            multiTouch: true
        }, "rect", {
            aRect: [
                0,
                0,
                canvas.width,
                canvas.height
            ]
        }, true);
    } else {
        userInput.removeHitArea("mute");
        userInput.removeHitArea("backFromMap");
    }
}
function toggleGameTouch(_on) {
    if(_on) {
        userInput.addHitArea("gameTouch", butEventHandler, {
            isDraggable: true,
            multiTouch: true
        }, "rect", {
            aRect: [
                0,
                0,
                canvas.width,
                canvas.height
            ]
        }, true);
    } else {
        userInput.removeHitArea("firstGameTouch");
        userInput.removeHitArea("gameTouch");
    }
}
function updateScore(_inc) {
    levelScore += _inc;
    totalScore += _inc;
    starBarLength = Math.min(levelScore / aStarMarkers[2], 1);
    if(curStarLevel < 3 && starBarLength >= aStarMarkers[curStarLevel] / aStarMarkers[2]) {
        playSound("starProgress");
        curStarLevel++;
    }
}
function setAimRot() {
    var vx = (bubbleStartX - aimX);
    var vy = (bubbleStartY - aimY);
    var tempAimRot = Math.atan2(vy, vx);
    if(aimClickStartY > bubbleStartY) {
        aimingFlipped = true;
        aimRot = Math.max(Math.min(160 * radian, tempAimRot + 180 * radian), 20 * radian);
        if(aimX > canvas.width / 2 && aimRot == 160 * radian) {
            aimRot = 20 * radian;
        }
    } else {
        aimRot = Math.max(Math.min(160 * radian, tempAimRot), 20 * radian);
        aimingFlipped = false;
        if(aimX > canvas.width / 2 && aimRot == 20 * radian) {
            aimRot = 160 * radian;
        }
    }
}
function updateGameEvent() {
    if(manualPause || rotatePause || gameState != "game") {
        return;
    }
    delta = getDelta();
    setAimRot();
    background.update();
    background.render();
    bubbleStack.update();
    bubbleStack.render();
    for(var i = 0; i < aGlints.length; i++) {
        aGlints[i].updateInGame();
        aGlints[i].render();
    }
    hud.renderUnder();
    flame.update();
    flame.render();
    launcher.update();
    launcher.render();
    userBubble.update();
    userBubble.render();
    hud.renderOver();
    for(var i = 0; i < aFallingBubbles.length; i++) {
        aFallingBubbles[i].update();
        aFallingBubbles[i].render();
        if(aFallingBubbles[i].removeMe) {
            aFallingBubbles.splice(i, 1);
            updateScore(10);
            i -= 1;
        }
    }
    for(var i = 0; i < aEffects.length; i++) {
        aEffects[i].update();
        aEffects[i].render();
        if(aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    if(panel.posY < 550) {
        panel.render(ctx);
        if(startPanelInc >= 0) {
            startPanelInc += delta;
        }
        if(startPanelInc > 3) {
            startPanelInc = -1;
            userInput.removeHitArea("startPanelTouch");
            var func = function () {
                userInput.addHitArea("pause", butEventHandler, null, "rect", {
                    aRect: [
                        372,
                        0,
                        445,
                        52
                    ]
                }, true);
                userInput.addHitArea("switchBubble", butEventHandler, {
                    multiTouch: true
                }, "rect", {
                    aRect: [
                        48,
                        545,
                        119,
                        663
                    ]
                }, true);
                userInput.addHitArea("gameTouch", butEventHandler, {
                    isDraggable: true,
                    multiTouch: true
                }, "rect", {
                    aRect: [
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    ]
                }, true);
            };
            panel.tweenOffScreen(func);
        }
        if(panel.panelType == "endPanel" && Math.random() < .05) {
            addFirework(Math.floor(Math.random() * 2), Math.random() * (canvas.width - 200) + 100, Math.random() * (canvas.height - 200) + 100);
        }
    }
    if(animTextY > -50) {
        var bX = panel.oGameElementsImgData.oData.oAtlasData[oImageIds.messagePanel].x;
        var bY = panel.oGameElementsImgData.oData.oAtlasData[oImageIds.messagePanel].y;
        var bWidth = panel.oGameElementsImgData.oData.oAtlasData[oImageIds.messagePanel].width;
        var bHeight = panel.oGameElementsImgData.oData.oAtlasData[oImageIds.messagePanel].height;
        ctx.drawImage(panel.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, animTextY - bHeight / 2, bWidth, bHeight);
        var oTextDisplayData = {
            text: inGameText,
            x: canvas.width / 2,
            y: animTextY,
            alignX: "centre",
            alignY: "centre",
            scale: 1,
            lineOffsetY: -5,
            anim: true,
            maxWidth: 400
        };
        textDisplay.renderText(oTextDisplayData);
    }
    requestAnimFrame(updateGameEvent);
}
function updateCreditsScreenEvent() {
    if(rotatePause || gameState != "credits") {
        return;
    }
    delta = getDelta();
    panel.update(delta);
    panel.render(ctx);
    renderMuteBut();
    requestAnimFrame(updateCreditsScreenEvent);
}
function updateLevelComplete() {
    if(rotatePause || gameState != "levelComplete") {
        return;
    }
    delta = getDelta();
    background.render();
    panel.render(ctx);
    renderMuteBut();
    requestAnimFrame(updateLevelComplete);
}
function updateGameEndFail() {
    if(rotatePause || gameState != "gameEndFail") {
        return;
    }
    delta = getDelta();
    background.render();
    panel.render(ctx);
    renderMuteBut();
    requestAnimFrame(updateGameEndFail);
}
function updateSplashScreenEvent() {
    if(rotatePause || gameState != "splash") {
        return;
    }
    delta = getDelta();
    splashTimer += delta;
    if(splashTimer > 2.5) {
        if(audioType == 1 && !muted) {
            music.play();
        }
        initStartScreen();
        return;
    }
    splash.render(ctx, delta);
    requestAnimFrame(updateSplashScreenEvent);
}
function updateStartScreenEvent() {
    if(rotatePause || gameState != "start") {
        return;
    }
    delta = getDelta();
    background.update();
    background.render();
    for(var i = 0; i < aFallingBubbles.length; i++) {
        aFallingBubbles[i].update();
        aFallingBubbles[i].render();
    }
    panel.update(delta);
    panel.render(ctx);
    renderMuteBut();
    requestAnimFrame(updateStartScreenEvent);
}
function updateMapScreenEvent() {
    if(rotatePause || gameState != "map") {
        return;
    }
    delta = getDelta();
    panel.update(delta);
    panel.render(ctx);
    renderMuteBut();
    for(var i = 0; i < aGlints.length; i++) {
        aGlints[i].updateInMap();
        aGlints[i].render();
    }
    requestAnimFrame(updateMapScreenEvent);
}
function getDelta() {
    var currentTime = new Date().getTime();
    var deltaTemp = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    if(deltaTemp > .5) {
        deltaTemp = 0;
    }
    return deltaTemp;
}
function checkSpriteCollision(_s1, _s2) {
    var s1XOffset = _s1.x;
    var s1YOffset = _s1.y;
    var s2XOffset = _s2.x;
    var s2YOffset = _s2.y;
    var distance_squared = (((s1XOffset - s2XOffset) * (s1XOffset - s2XOffset)) + ((s1YOffset - s2YOffset) * (s1YOffset - s2YOffset)));
    var radii_squared = (_s1.radius) * (_s2.radius);
    if(distance_squared < radii_squared) {
        return true;
    } else {
        return false;
    }
}
function getScaleImageToMax(_oImgData, _aLimit) {
    var newScale;
    if(_oImgData.isSpriteSheet) {
        if(_aLimit[0] / _oImgData.oData.spriteWidth < _aLimit[1] / _oImgData.oData.spriteHeight) {
            newScale = Math.min(_aLimit[0] / _oImgData.oData.spriteWidth, 1);
        } else {
            newScale = Math.min(_aLimit[1] / _oImgData.oData.spriteHeight, 1);
        }
    } else {
        if(_aLimit[0] / _oImgData.img.width < _aLimit[1] / _oImgData.img.height) {
            newScale = Math.min(_aLimit[0] / _oImgData.img.width, 1);
        } else {
            newScale = Math.min(_aLimit[1] / _oImgData.img.height, 1);
        }
    }
    return newScale;
}
function getCentreFromTopLeft(_aTopLeft, _oImgData, _imgScale) {
    var aCentre = new Array();
    aCentre.push(_aTopLeft[0] + (_oImgData.oData.spriteWidth / 2) * _imgScale);
    aCentre.push(_aTopLeft[1] + (_oImgData.oData.spriteHeight / 2) * _imgScale);
    return aCentre;
}
function loadPreAssets() {
    if(aLangs.length > 1) {
        var aLangLoadData = new Array();
        for(var i = 0; i < aLangs.length; i++) {
            aLangLoadData.push({
                id: "lang" + aLangs[i],
                file: "images/lang" + aLangs[i] + ".png"
            });
        }
        preAssetLib = new Utils.AssetLoader(curLang, aLangLoadData, ctx, canvas.width, canvas.height, false);
        preAssetLib.onReady(initLangSelect);
    } else {
        curLang = aLangs[0];
        preAssetLib = new Utils.AssetLoader(curLang, [
            {
                id: "preloadImage",
                file: "images/preloadImage.png"
            }
        ], ctx, canvas.width, canvas.height, false);
        preAssetLib.onReady(initLoadAssets);
    }
}
function initLangSelect() {
    var oImgData;
    var j;
    var k;
    var gap = 10;
    var tileWidthNum = 0;
    var tileHeightNum = 0;
    var butScale = 1;
    for(var i = 0; i < aLangs.length; i++) {
        oImgData = preAssetLib.getData("lang" + aLangs[i]);
        if((i + 1) * (oImgData.img.width * butScale) + (i + 2) * gap < canvas.width) {
            tileWidthNum++;
        } else {
            break;
        }
    }
    tileHeightNum = Math.ceil(aLangs.length / tileWidthNum);
    for(var i = 0; i < aLangs.length; i++) {
        oImgData = preAssetLib.getData("lang" + aLangs[i]);
        j = canvas.width / 2 - (tileWidthNum / 2) * (oImgData.img.width * butScale) - ((tileWidthNum - 1) / 2) * gap;
        j += (i % tileWidthNum) * ((oImgData.img.width * butScale) + gap);
        k = canvas.height / 2 - (tileHeightNum / 2) * (oImgData.img.height * butScale) - ((tileHeightNum - 1) / 2) * gap;
        k += (Math.floor(i / tileWidthNum) % tileHeightNum) * ((oImgData.img.height * butScale) + gap);
        ctx.drawImage(oImgData.img, 0, 0, oImgData.img.width, oImgData.img.height, j, k, (oImgData.img.width * butScale), (oImgData.img.height * butScale));
        var oBut = {
            oImgData: oImgData,
            aPos: [
                j + (oImgData.img.width * butScale) / 2,
                k + (oImgData.img.height * butScale) / 2
            ],
            scale: butScale,
            id: "none",
            noMove: true
        };
        userInput.addHitArea("langSelect", butEventHandler, {
            lang: aLangs[i]
        }, "image", oBut);
    }
}
function initLoadAssets() {
    loadAssets();
}
function loadAssets() {
    var mg;
    try  {
        mg = (window).famobi.getMoreGamesButtonImage();
    } catch (e) {
        mg = "images/More_Games600x253_onWhite.png";
    }
    assetLib = new Utils.AssetLoader(curLang, [
        {
            id: "background0",
            file: "images/background0.jpg"
        },
        {
            id: "background1",
            file: "images/background1.jpg"
        },
        {
            id: "background2",
            file: "images/background2.jpg"
        },
        {
            id: "background3",
            file: "images/background3.jpg"
        },
        {
            id: "background4",
            file: "images/background4.jpg"
        },
        {
            id: "rotateDeviceMessage",
            file: "images/rotateDeviceMessage.jpg"
        },
        {
            id: "splash",
            file: "images/splashScreen.jpg"
        },
        {
            id: "hud",
            file: "images/hud_450x700.png"
        },
        {
            id: "muteBut",
            file: "images/mute_54x50.png"
        },
        {
            id: "uiButs",
            file: "images/uiButs.png",
            oAtlasData: {
                id0: {
                    x: 180,
                    y: 0,
                    width: 129,
                    height: 86
                },
                id1: {
                    x: 0,
                    y: 216,
                    width: 129,
                    height: 86
                },
                id10: {
                    x: 262,
                    y: 322,
                    width: 61,
                    height: 56
                },
                id11: {
                    x: 131,
                    y: 128,
                    width: 129,
                    height: 86
                },
                id12: {
                    x: 0,
                    y: 0,
                    width: 178,
                    height: 126
                },
                id13: {
                    x: 311,
                    y: 0,
                    width: 54,
                    height: 50
                },
                id14: {
                    x: 0,
                    y: 304,
                    width: 129,
                    height: 86
                },
                id15: {
                    x: 0,
                    y: 128,
                    width: 129,
                    height: 86
                },
                id2: {
                    x: 262,
                    y: 88,
                    width: 129,
                    height: 86
                },
                id3: {
                    x: 262,
                    y: 176,
                    width: 129,
                    height: 86
                },
                id4: {
                    x: 131,
                    y: 304,
                    width: 129,
                    height: 86
                },
                id5: {
                    x: 131,
                    y: 216,
                    width: 129,
                    height: 86
                },
                id6: {
                    x: 325,
                    y: 264,
                    width: 24,
                    height: 24
                },
                id7: {
                    x: 311,
                    y: 52,
                    width: 44,
                    height: 24
                },
                id8: {
                    x: 180,
                    y: 88,
                    width: 60,
                    height: 28
                },
                id9: {
                    x: 262,
                    y: 264,
                    width: 61,
                    height: 56
                }
            }
        },
        {
            id: "gameElements",
            file: "images/gameElements.png",
            oAtlasData: {
                id0: {
                    x: 0,
                    y: 0,
                    width: 1010,
                    height: 12
                },
                id1: {
                    x: 0,
                    y: 801,
                    width: 137,
                    height: 147
                },
                id10: {
                    x: 263,
                    y: 844,
                    width: 33,
                    height: 26
                },
                id11: {
                    x: 298,
                    y: 788,
                    width: 31,
                    height: 26
                },
                id12: {
                    x: 228,
                    y: 788,
                    width: 34,
                    height: 26
                },
                id13: {
                    x: 264,
                    y: 788,
                    width: 32,
                    height: 26
                },
                id14: {
                    x: 228,
                    y: 816,
                    width: 34,
                    height: 26
                },
                id15: {
                    x: 281,
                    y: 872,
                    width: 32,
                    height: 26
                },
                id16: {
                    x: 251,
                    y: 957,
                    width: 33,
                    height: 26
                },
                id17: {
                    x: 286,
                    y: 956,
                    width: 31,
                    height: 26
                },
                id18: {
                    x: 215,
                    y: 957,
                    width: 34,
                    height: 26
                },
                id19: {
                    x: 281,
                    y: 928,
                    width: 32,
                    height: 26
                },
                id2: {
                    x: 0,
                    y: 56,
                    width: 1010,
                    height: 12
                },
                id20: {
                    x: 228,
                    y: 844,
                    width: 33,
                    height: 26
                },
                id21: {
                    x: 286,
                    y: 984,
                    width: 31,
                    height: 26
                },
                id22: {
                    x: 98,
                    y: 950,
                    width: 34,
                    height: 26
                },
                id23: {
                    x: 264,
                    y: 816,
                    width: 32,
                    height: 26
                },
                id24: {
                    x: 98,
                    y: 978,
                    width: 34,
                    height: 26
                },
                id25: {
                    x: 281,
                    y: 900,
                    width: 32,
                    height: 26
                },
                id26: {
                    x: 0,
                    y: 978,
                    width: 46,
                    height: 26
                },
                id27: {
                    x: 0,
                    y: 950,
                    width: 52,
                    height: 26
                },
                id28: {
                    x: 0,
                    y: 291,
                    width: 388,
                    height: 495
                },
                id29: {
                    x: 0,
                    y: 160,
                    width: 450,
                    height: 129
                },
                id3: {
                    x: 0,
                    y: 14,
                    width: 1010,
                    height: 12
                },
                id30: {
                    x: 0,
                    y: 788,
                    width: 179,
                    height: 11
                },
                id31: {
                    x: 0,
                    y: 1006,
                    width: 1,
                    height: 1
                },
                id32: {
                    x: 0,
                    y: 1006,
                    width: 1,
                    height: 1
                },
                id33: {
                    x: 0,
                    y: 1006,
                    width: 1,
                    height: 1
                },
                id34: {
                    x: 0,
                    y: 1006,
                    width: 1,
                    height: 1
                },
                id35: {
                    x: 0,
                    y: 1006,
                    width: 1,
                    height: 1
                },
                id36: {
                    x: 0,
                    y: 1006,
                    width: 1,
                    height: 1
                },
                id37: {
                    x: 0,
                    y: 1006,
                    width: 1,
                    height: 1
                },
                id38: {
                    x: 390,
                    y: 291,
                    width: 386,
                    height: 302
                },
                id39: {
                    x: 54,
                    y: 950,
                    width: 42,
                    height: 43
                },
                id4: {
                    x: 0,
                    y: 42,
                    width: 1010,
                    height: 12
                },
                id40: {
                    x: 139,
                    y: 801,
                    width: 87,
                    height: 87
                },
                id41: {
                    x: 139,
                    y: 890,
                    width: 74,
                    height: 110
                },
                id42: {
                    x: 0,
                    y: 84,
                    width: 453,
                    height: 74
                },
                id5: {
                    x: 0,
                    y: 28,
                    width: 1010,
                    height: 12
                },
                id6: {
                    x: 215,
                    y: 890,
                    width: 64,
                    height: 65
                },
                id7: {
                    x: 0,
                    y: 70,
                    width: 1010,
                    height: 12
                },
                id8: {
                    x: 298,
                    y: 816,
                    width: 29,
                    height: 26
                },
                id9: {
                    x: 298,
                    y: 844,
                    width: 26,
                    height: 26
                }
            }
        },
        {
            id: "numbers0",
            file: "images/numbers0_28x48.png"
        },
        {
            id: "bubbles",
            file: "images/bubbles_48x52.png"
        },
        {
            id: "flare",
            file: "images/flare.png"
        },
        {
            id: "firework0",
            file: "images/firework0_175x175.png",
            oAnims: {
                explode: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26,
                    27,
                    28,
                    29
                ]
            }
        },
        {
            id: "flame",
            file: "images/flame_247x176.png",
            oAnims: {
                burn: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                ]
            }
        },
        {
            id: "firework1",
            file: "images/firework1_175x175.png",
            oAnims: {
                explode: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26,
                    27,
                    28,
                    29
                ]
            }
        },
        {
            id: "pop",
            file: "images/pop_166x167.png",
            oAnims: {
                hide: [
                    30
                ],
                explode0: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                ],
                explode1: [
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15
                ],
                explode2: [
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23
                ],
                explode3: [
                    24,
                    25,
                    26,
                    27,
                    28,
                    29,
                    30,
                    31
                ],
                explode4: [
                    32,
                    33,
                    34,
                    35,
                    36,
                    37,
                    38,
                    39
                ],
                explode5: [
                    40,
                    41,
                    42,
                    43,
                    44,
                    45,
                    46,
                    47,
                    48
                ]
            }
        },
        {
            id: "langText",
            file: "json/text.json"
        },
        {
            id: "font0",
            file: "images/font0.png"
        },
        {
            id: "fontData0",
            file: "json/font0.json"
        },
        {
            id: "levelData",
            file: "json/levelData.json"
        },
        {
            id: "title",
            file: "images/preloadImage.png"
        },
        {
            id: "map",
            file: "images/map.jpg"
        },
        {
            id: "moreGamesBut",
            file: mg
        }
    ], ctx, canvas.width, canvas.height);
    oImageIds.playBut = "id0";
    oImageIds.retryBut = "id1";
    oImageIds.nextBut = "id2";
    oImageIds.muteBut1 = "id3";
    oImageIds.muteBut0 = "id4";
    oImageIds.menuBut = "id5";
    oImageIds.mapStars0 = "id6";
    oImageIds.mapStars1 = "id7";
    oImageIds.mapStars2 = "id8";
    oImageIds.mapBut0 = "id9";
    oImageIds.mapBut1 = "id10";
    oImageIds.backBut = "id11";
    oImageIds.bigPlayBut = "id12";
    oImageIds.pauseBut = "id13";
    oImageIds.infoBut = "id14";
    oImageIds.resetBut = "id15";
    oImageIds.aimLine0 = "id0";
    oImageIds.star = "id1";
    oImageIds.aimLine1 = "id2";
    oImageIds.aimLine2 = "id3";
    oImageIds.aimLine3 = "id4";
    oImageIds.aimLine4 = "id5";
    oImageIds.glint = "id6";
    oImageIds.aimLine5 = "id7";
    oImageIds.score10 = "id8";
    oImageIds.score15 = "id9";
    oImageIds.score20 = "id10";
    oImageIds.score25 = "id11";
    oImageIds.score30 = "id12";
    oImageIds.score35 = "id13";
    oImageIds.score40 = "id14";
    oImageIds.score45 = "id15";
    oImageIds.score50 = "id16";
    oImageIds.score55 = "id17";
    oImageIds.score60 = "id18";
    oImageIds.score65 = "id19";
    oImageIds.score70 = "id20";
    oImageIds.score75 = "id21";
    oImageIds.score80 = "id22";
    oImageIds.score85 = "id23";
    oImageIds.score90 = "id24";
    oImageIds.score95 = "id25";
    oImageIds.score100 = "id26";
    oImageIds.score500 = "id27";
    oImageIds.infoPanel = "id28";
    oImageIds.messagePanel = "id29";
    oImageIds.starBar = "id30";
    oImageIds.launcher0 = "id31";
    oImageIds.launcher1 = "id32";
    oImageIds.launcher2 = "id33";
    oImageIds.launcher3 = "id34";
    oImageIds.launcher4 = "id35";
    oImageIds.launcher15 = "id36";
    oImageIds.launcher5 = "id37";
    oImageIds.launcher6 = "id37";
    oImageIds.launcher7 = "id37";
    oImageIds.introPanel = "id38";
    oImageIds.allColourBubble = "id39";
    oImageIds.starFade = "id40";
    oImageIds.hintFinger = "id41";
    oImageIds.ceiling = "id42";
    assetLib.onReady(initSplash);
}
function resizeCanvas() {
    var a = window.innerWidth, b = window.innerHeight;
    var w = canvas.width, h = canvas.height;
    if(a > 480) {
        (a -= 1 , b -= 1);
    }
    if(a > b && isMobile && ("loading" != gameState)) {
        rotatePauseOn();
    } else if(rotatePause && isMobile) {
        rotatePauseOff();
    }
    if(a / b < canvas.width / canvas.height) {
        canvas.style.width = a + "px";
        canvas.style.height = (a * h / w) + "px";
        canvasX = 0;
        canvasY = (b - a * h / w) / 2;
        canvasScaleX = canvasScaleY = w / a;
    } else {
        canvas.style.width = b / h * w + "px";
        canvas.style.height = b + "px";
        canvasX = (a - b / h * w) / 2;
        canvasY = 0;
        canvasScaleX = canvasScaleY = h / b;
    }
    canvas.style.marginTop = canvasY + "px";
    canvas.style.marginLeft = canvasX + "px";
    userInput.setCanvas(canvasX, canvasY, canvasScaleX, canvasScaleY);
}
function playSound(_id) {
    if(audioType == 1) {
        sound.play(_id);
    }
}
function toggleMute(skipTrackEvent) {
    muted = !muted;
    if(audioType == 1) {
        if(muted) {
            Howler.mute();
            if(musicTween) {
                musicTween.kill();
            }
            music.pause();
            if(!skipTrackEvent) {
                window.famobi_analytics.trackEvent("EVENT_VOLUMECHANGE", {
                    bgmVolume: 0,
                    sfxVolume: 0
                });
                window.famobi.localStorage.setItem("muted", "1");
            }

        } else {
            Howler.unmute();
            if(musicTween) {
                musicTween.kill();
            }
            music.play();
            if(gameState == "game") {
                music.volume(.4);
            } else {
                music.volume(.2);
            }

            if(!skipTrackEvent) {
                window.famobi_analytics.trackEvent("EVENT_VOLUMECHANGE", {
                    bgmVolume: 1,
                    sfxVolume: 1
                });
                window.famobi.localStorage.removeItem("muted");
            }
        }
    } else if(audioType == 2) {
        if(muted) {
            music.pause();
        } else {
            music.play();
        }
    }
    if(gameState == "start") {
        renderMuteBut();
    }
}
function renderMuteBut() {
    if(audioType == 0) {
        return;
    }
    var oImgData = assetLib.getData("muteBut");
    var id = 0;
    if(muted) {
        id = 1;
    }
    var imgX = (id * oImgData.oData.spriteWidth) % oImgData.img.width;
    var imgY = Math.floor(id / (oImgData.img.width / oImgData.oData.spriteWidth)) * oImgData.oData.spriteHeight;
    ctx.drawImage(oImgData.img, imgX, imgY, oImgData.oData.spriteWidth, oImgData.oData.spriteHeight, 385, 0, oImgData.oData.spriteWidth, oImgData.oData.spriteHeight);
}
function toggleManualPause(manual) {
    if(manual) {
        if(manualPause) {
            logEvent({event: "GAME_RESUME"});
        } else {
            logEvent({event: "GAME_PAUSE"});
        }
        //window.famobi_analytics.trackScreen(manualPause ? "SCREEN_LEVEL" : "SCREEN_PAUSE")
        window.famobi_analytics.trackEvent(manualPause ? "EVENT_RESUME" : "EVENT_PAUSE").then(_toggleManualPause);
    } else {
        _toggleManualPause();
    }
}
function _toggleManualPause() {
    if(!manualPause) {
        manualPause = true;
        pauseCoreOn();
        var oRetryBut = {
            oImgData: assetLib.getData("uiButs"),
            aPos: [
                canvas.width / 2 - 70,
                255
            ],
            id: oImageIds.retryBut
        };
        var oResumeBut = {
            oImgData: assetLib.getData("uiButs"),
            aPos: [
                canvas.width / 2 + 70,
                255
            ],
            id: oImageIds.playBut
        };
        if(muted) {
            var oMuteBut = {
                oImgData: assetLib.getData("uiButs"),
                aPos: [
                    canvas.width / 2 - 70,
                    355
                ],
                id: oImageIds.muteBut1
            };
        } else {
            var oMuteBut = {
                oImgData: assetLib.getData("uiButs"),
                aPos: [
                    canvas.width / 2 - 70,
                    355
                ],
                id: oImageIds.muteBut0
            };
        }
        var oMenuBut = {
            oImgData: assetLib.getData("uiButs"),
            aPos: [
                canvas.width / 2 + 70,
                355
            ],
            id: oImageIds.menuBut
        };
        userInput.addHitArea("retryFromPause", butEventHandler, {
            multiTouch: true
        }, "image", oRetryBut);
        userInput.addHitArea("resumeFromPause", butEventHandler, {
            multiTouch: true
        }, "image", oResumeBut);
        userInput.addHitArea("muteFromPause", butEventHandler, null, "image", oMuteBut);
        userInput.addHitArea("menuFromPause", butEventHandler, {
            multiTouch: true
        }, "image", oMenuBut);
        var aButs = new Array(oRetryBut, oResumeBut, oMuteBut, oMenuBut);
        panel = new Elements.Panel("pause", aButs);
        panel.render(ctx);
    } else {
        manualPause = false;
        userInput.removeHitArea("retryFromPause");
        userInput.removeHitArea("resumeFromPause");
        userInput.removeHitArea("muteFromPause");
        userInput.removeHitArea("menuFromPause");
        pauseCoreOff();
    }
}
function rotatePauseOn() {
    rotatePause = true;
    ctx.drawImage(assetLib.getImg("rotateDeviceMessage"), 0, 0);
    userInput.pauseIsOn = true;
    pauseCoreOn();
}
function rotatePauseOff() {
    rotatePause = false;
    userInput.removeHitArea("retryFromPause");
    userInput.removeHitArea("resumeFromPause");
    userInput.removeHitArea("muteFromPause");
    userInput.removeHitArea("menuFromPause");
    pauseCoreOff();
}
function pauseCoreOn() {
    if(audioType == 1) {
        Howler.mute();
    } else if(audioType == 2) {
        music.pause();
    }
    switch(gameState) {
        case "start":
            break;
        case "help":
            break;
        case "game":
            userInput.removeHitArea("pause");
            userInput.removeHitArea("startPanelTouch");
            userInput.removeHitArea("gameTouch");
            userInput.removeHitArea("switchBubble");
            userInput.removeHitArea("firstGameTouch");
            break;
        case "end":
            break;
    }
}
function pauseCoreOff() {
    if(audioType == 1) {
        if(!muted) {
            Howler.unmute();
        }
    } else if(audioType == 2) {
        if(!muted) {
            music.play();
        }
    }
    previousTime = new Date().getTime();
    userInput.pauseIsOn = false;
    switch(gameState) {
        case "splash":
            updateSplashScreenEvent();
            break;
        case "start":
            initStartScreen();
            break;
        case "map":
            initMapScreen();
            break;
        case "credits":
            initCreditsScreen();
            break;
        case "game":
            if(panel.panelType != "endFailPanel" && panel.panelType != "endPanel") {
                panel.posY = 550;
                panel.panelType = "game";
                panel.aButs = new Array();
            }
            if(!manualPause) {
                if(gameControlState) {
                    userInput.addHitArea("pause", butEventHandler, null, "rect", {
                        aRect: [
                            372,
                            0,
                            445,
                            52
                        ]
                    }, true);
                    userInput.addHitArea("switchBubble", butEventHandler, {
                        multiTouch: true
                    }, "rect", {
                        aRect: [
                            48,
                            545,
                            119,
                            663
                        ]
                    }, true);
                    userInput.addHitArea("gameTouch", butEventHandler, {
                        isDraggable: true,
                        multiTouch: true
                    }, "rect", {
                        aRect: [
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        ]
                    }, true);
                }
                updateGameEvent();
            } else {
                manualPause = false;
                updateGameEvent();
                toggleManualPause();
            }
            break;
    }
}
