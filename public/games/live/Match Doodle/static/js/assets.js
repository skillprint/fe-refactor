(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [];


(lib.AnMovieClip = function(){
	this.actionFrames = [];
	this.ignorePause = false;
	this.gotoAndPlay = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.play = function(){
		cjs.MovieClip.prototype.play.call(this);
	}
	this.gotoAndStop = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndStop.call(this,positionOrLabel);
	}
	this.stop = function(){
		cjs.MovieClip.prototype.stop.call(this);
	}
}).prototype = p = new cjs.MovieClip();
// symbols:
// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop, this.reversed));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.txt_instructions = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.txt = new cjs.Text("YOU WON IN 6 MOVES!", "bold 18px 'Arial'", "#4C4C4C");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 14;
	this.txt.lineWidth = 376;
	this.txt.parent = this;
	this.txt.setTransform(0,2);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.txt_instructions, new cjs.Rectangle(-190,0,380,24.1), null);


(lib.tutorial_dot = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {off:0,on:1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer_4
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AhGBGQgdgdAAgpQAAgpAdgdQAdgdApAAQAqAAAdAdQAdAdAAApQAAApgdAdQgdAegqAAQgpAAgdgeg");
	this.shape.setTransform(-0.006,-0.0102,0.3,0.3);
	this.shape._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1).to({_off:false},0).wait(1));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#333333").ss(3,1,1).p("ABkAAQAAApgdAeQgdAdgqAAQgpAAgdgdQgdgeAAgpQAAgoAdgeQAdgdApAAQAqAAAdAdQAdAeAAAog");
	this.shape_1.setTransform(-0.0067,-0.0113,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-6.5,-6.5,13,13);


(lib.title_2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_5
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("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");
	this.shape.setTransform(0.025,0);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.title_2, new cjs.Rectangle(-116.5,-92.6,233.1,185.2), null);


(lib.scene_header = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.txt = new cjs.Text("How to Play", "26px 'jsbdoublejointed'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 38;
	this.txt.lineWidth = 303;
	this.txt.parent = this;
	this.txt.setTransform(0,4);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_header, new cjs.Rectangle(-153.2,2,306.5,41.5), null);


(lib.result_text = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.txt_msg = new cjs.Text("You Completed the game by matching 40 doodles!", "20px 'jsbdoublejointed'", "#333333");
	this.txt_msg.name = "txt_msg";
	this.txt_msg.textAlign = "center";
	this.txt_msg.lineHeight = 31;
	this.txt_msg.lineWidth = 339;
	this.txt_msg.parent = this;
	this.txt_msg.setTransform(2.5,32.55);

	this.txt_hrd = new cjs.Text("Great Job!", "60px 'jsbdoublejointed'", "#333333");
	this.txt_hrd.name = "txt_hrd";
	this.txt_hrd.textAlign = "center";
	this.txt_hrd.lineHeight = 89;
	this.txt_hrd.lineWidth = 395;
	this.txt_hrd.parent = this;
	this.txt_hrd.setTransform(1,-58.95);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_hrd},{t:this.txt_msg}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.result_text, new cjs.Rectangle(-198.4,-60.9,398.9,155.2), null);


(lib.mc_messages = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.txt = new cjs.Text("Round 2", "32px 'jsbdoublejointed'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 46;
	this.txt.lineWidth = 371;
	this.txt.parent = this;
	this.txt.setTransform(0,-21);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.mc_messages, new cjs.Rectangle(-187.4,-23,374.9,50.2), null);


(lib.mc_dummy = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-21,-21,42,42);


(lib.font_loader = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.txt = new cjs.Text("jsDoubleJointed", "26px 'jsbdoublejointed'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 38;
	this.txt.lineWidth = 428;
	this.txt.parent = this;
	this.txt.setTransform(216.0012,-17.6);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.font_loader, new cjs.Rectangle(0,-19.6,432,41.5), null);


(lib.game_time = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.txt_ss = new cjs.Text("00", "26px 'jsbdoublejointed'", "#333333");
	this.txt_ss.name = "txt_ss";
	this.txt_ss.lineHeight = 38;
	this.txt_ss.lineWidth = 44;
	this.txt_ss.parent = this;
	this.txt_ss.setTransform(4,2.5);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AgHAvQgEgCgDgDIgDgGQgCgDAAgFIACgIIADgGIAHgEIAHgCIAIACIAGAEIAFAGIABAIQAAAFgBADIgFAGQgDADgDACIgIABIgHgBgAgHgJIgHgEIgDgGQgCgEAAgEQAAgEACgEQABgEACgCQADgDAEgCIAHgBIAIABQADACADADQADACACAEQABAEAAAEQAAAEgBAEIgFAGIgGAEQgEACgEAAQgDAAgEgCg");
	this.shape.setTransform(-1.05,21.275);

	this.txt_m = new cjs.Text("00", "26px 'jsbdoublejointed'", "#333333");
	this.txt_m.name = "txt_m";
	this.txt_m.textAlign = "right";
	this.txt_m.lineHeight = 38;
	this.txt_m.lineWidth = 43;
	this.txt_m.parent = this;
	this.txt_m.setTransform(-8.95,2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_m},{t:this.shape},{t:this.txt_ss}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.game_time, new cjs.Rectangle(-53.9,0,103.9,42), null);


(lib.mc_mutelines = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(3,2,1).p("AAJhjQBBBjhBBlAgjgeQAWAmgWAo");
	this.shape.setTransform(3.5923,10.0469);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.mc_mutelines, new cjs.Rectangle(-2,-2,11.2,24.2), null);


(lib.bFullscreenOff = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgIHTImkmkQgUgTAAgcQAAgbAUgTIGkmkQATgUAZALQAaAKAAAcIAAD9IE2AAQAgAAAWAXQAXAWAAAfIAADZQAAAfgXAXQgWAWggAAIk2AAIAAD9QAAAcgaAKQgJAEgIAAQgPAAgMgNg");
	this.shape.setTransform(24.098,6.5206,0.1919,0.1919,-45);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AgIHTImkmkQgUgTAAgcQAAgbAUgTIGkmkQATgUAZALQAaAKAAAcIAAD9IE2AAQAgAAAWAXQAXAWAAAfIAADZQAAAfgXAXQgWAWggAAIk2AAIAAD9QAAAcgaAKQgJAEgIAAQgPAAgMgNg");
	this.shape_1.setTransform(6.502,23.9794,0.1919,0.1919,135);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.bFullscreenOff, new cjs.Rectangle(-1.4,-1.4,33.5,33.4), null);


(lib.bFullScreen = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgIHTImkmkQgUgTAAgcQAAgbAUgTIGkmkQATgUAZALQAaAKAAAcIAAD9IE2AAQAgAAAWAXQAXAWAAAfIAADZQAAAfgXAXQgWAWggAAIk2AAIAAD9QAAAcgaAKQgJAEgIAAQgPAAgMgNg");
	this.shape.setTransform(24.102,6.4794,0.1919,0.1919,135);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AgIHTImkmkQgUgTAAgcQAAgbAUgTIGkmkQATgUAZALQAaAKAAAcIAAD9IE2AAQAgAAAWAXQAXAWAAAfIAADZQAAAfgXAXQgWAWggAAIk2AAIAAD9QAAAcgaAKQgJAEgIAAQgPAAgMgNg");
	this.shape_1.setTransform(6.498,24.0206,0.1919,0.1919,-45);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.bFullScreen, new cjs.Rectangle(0,0,30.6,30.5), null);


(lib.b_resumegame = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {norm:0,over:1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		///* this.stop();*/
	}
	this.frame_1 = function() {
		///* this.stop();*/
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer_6
	this.txt = new cjs.Text("-", "bold 20px 'Arial'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 22;
	this.txt.lineWidth = 166;
	this.txt.parent = this;
	this.txt.setTransform(118.1,12.65);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AgKBdIhshOQgGgGAAgGQgBgFAGgFIBrhVQAFgFAFADQADABAAAIIABAsQAjALAZgDQAYgDAogZQgYA2gXAQQgYAQgTAHIghAKIAAAsQAAAHgDACIgEABQgCAAgEgDg");
	this.shape.setTransform(23.0979,25.5154);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AuDD6QhTAAg7g7Qg6g6AAhTIAAhjQAAhTA6g6QA7g7BTAAIcHAAQBTAAA6A7QA7A6AABTIAABjQAABTg7A6Qg6A7hTAAg");
	this.shape_1.setTransform(110,25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.txt}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,220,50);


(lib.b_prev = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("Ah5AgQgPgNAAgTQAAgTAPgNIC/jCIBDBDIifCfICfCgIhDBDg");
	this.shape.setTransform(18,0);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(255,255,255,0.008)").s().p("AhPD6QhkAAAAhkIAAkrQAAhkBkAAICfAAQBkAAAABkIAAErQAABkhkAAg");
	this.shape_1.setTransform(18,0);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_prev, new cjs.Rectangle(0,-25,36,50), null);


(lib.b_play = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {"norm":0,"over":1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		///* this.stop();*/
	}
	this.frame_1 = function() {
		///* this.stop();*/
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer_5
	this.txt = new cjs.Text("play", "28px 'jsbdoublejointed'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 40;
	this.txt.lineWidth = 163;
	this.txt.parent = this;
	this.txt.setTransform(99.5,8);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AhPCAQgWgLAAgXIAAi7QAAgXAWgLQAVgLASAOIB+BeQAPAMABASQgBATgPAMIh+BeQgKAIgMAAQgJAAgIgFg");
	this.shape.setTransform(189,24.075);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape},{t:this.txt}]}).wait(2));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#262626").ss(3,1,1).p("AutjNQAbgTEjgJQEIgJFuADQFwACEDAMQEgANAVATQArAoAKBJQAKBDgUBNQgTBJgXAlQgXAlgjAPQgSAIkdAEQklAFlKgDQuAgJgdgxQgohEAIiOQAIiQAwghg");
	this.shape_1.setTransform(112.4863,25.7816);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.02)").s().p("AgoDwQuAgJgdgxQgohEAIiOQAIiQAwghQAbgTEjgJQEIgJFuADQFwACEDAMQEgANAVATQArAoAKBJQAKBDgUBNQgTBJgXAlQgXAlgjAPQgSAIkdAEQiwADi+AAIkBgBg");
	this.shape_2.setTransform(112.4863,25.7816);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(11.1,0.2,202.8,51.199999999999996);


(lib.b_pause_help = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {"norm":0,"over":1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		///* this.stop();*/
	}
	this.frame_1 = function() {
		///* this.stop();*/
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer_6
	this.txt = new cjs.Text("-", "bold 20px 'Arial'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 22;
	this.txt.lineWidth = 166;
	this.txt.parent = this;
	this.txt.setTransform(118.1,12.65);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AgLBFQgFgFAAgGQAAgGAFgFQADgEAIAAQAGAAAEAEQAFAFAAAGQAAAGgFAFQgEADgGAAQgIAAgDgDgAgMAcIABgLIABgJIAEgHIAGgFIAHgGIAGgIIAEgHQACgDAAgFQAAgEgCgDIgDgGIgGgCIgIgBIgGABIgFACQgDADgCADQgBADgBAEIgbAAQAAgJAEgIQADgHAHgFQAGgFAIgDQAIgCAJAAQALAAAIACQAJADAGAFQAGAFADAHQADAHAAAJQAAAIgCAFQgDAGgEAFIgHAJIgKAIIgFAFIgCAFIgBAFIAAAGg");
	this.shape.setTransform(22.1,24.25,1.6,1.5999,0,0,0,0,-0.1);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AuDD6QhTAAg7g7Qg6g6AAhTIAAhjQAAhTA6g6QA7g7BTAAIcHAAQBTAAA6A7QA7A6AABTIAABjQAABTg7A6Qg6A7hTAAg");
	this.shape_1.setTransform(110,25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.txt}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,220,50);


(lib.b_pause = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {"norm":0,"over":1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgJBkQgMAAgKgJQgIgJAAgMIAAiLQAAgMAIgJQAKgJAMAAIATAAQAMAAAJAJQAJAJAAAMIAACLQAAAMgJAJQgJAJgMAAg");
	this.shape.setTransform(33.5,26);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AgJBkQgMAAgKgJQgIgJAAgMIAAiLQAAgMAIgJQAKgJAMAAIATAAQAMAAAJAJQAJAJAAAMIAACLQAAAMgJAJQgJAJgMAAg");
	this.shape_1.setTransform(18.5,26);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(2));

	// Layer_1
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#FFFFFF").ss(3,1,1).p("AhFj5ICLAAQBLAAA0A0QA1A1AABLIAACLQAABLg1A0Qg0A1hLAAIiLAAQhLAAg1g1Qg0g0AAhLIAAiLQAAhLA0g1QA1g0BLAAg");
	this.shape_2.setTransform(25.5056,25.5,0.9992,1);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(0,0,0,0.298)").s().p("AhFD6QhLAAg1g1Qg0g0AAhLIAAiLQAAhKA0g1QA1g1BLAAICLAAQBLAAA0A1QA1A1AABKIAACLQAABLg1A0Qg0A1hLAAg");
	this.shape_3.setTransform(25.5056,25.5,0.9992,1);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(255,255,255,0.2)").s().p("AhFD6QhLAAg1g1Qg0g0AAhLIAAiLQAAhKA0g1QA1g1BLAAICLAAQBLAAA0A1QA1A1AABKIAACLQAABLg1A0Qg0A1hLAAg");
	this.shape_4.setTransform(25.5056,25.5,0.9992,1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2}]}).to({state:[{t:this.shape_4},{t:this.shape_2}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,-1,53,53);


(lib.b_next = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AiICgICfigIifigIBDhCIC/DCQAPANAAATQAAATgPAOIi/DBg");
	this.shape.setTransform(18,25);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(255,255,255,0.008)").s().p("AhPD6QhkAAAAhkIAAkrQAAhkBkAAICfAAQBkAAAABkIAAErQAABkhkAAg");
	this.shape_1.setTransform(18,25);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_next, new cjs.Rectangle(0,0,36,50), null);


(lib.b_help = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {"norm":0,"over":1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		///* this.stop();*/
	}
	this.frame_1 = function() {
		///* this.stop();*/
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer_5
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AgpByIgFgGQgEgEABgGQAAgGAEgEIAEgEQAFgDAGAAQAGAAAFADIAFAFQAEAFABAFIAAAGQgBAFgEAEIgBAAQgEAGgIAAQgIAAgGgGgAgiA6QgEgBgDgDIgCgDQgCgDgBgDIgBgGIAAgQQgBgXAEgIQAEgNAPgJQAIgEARgGIAIgDQAVgGAHgHQAIgHgCgMQgBgHgHgCQgJgEgRADQgPACgRAHQgPAGgHAGQgFAFgGAAQgHgBgFgFQgEgFAAgHQAAgGAGgFQAKgKAUgIQAVgJATgDQAZgEARAHQAZAJADAaQAFAegVASQgIAHgLAGIgUAHIgJAEQgNAEgFADIgEACIgBAAIAAACIgBAFIAAAPIAAANQACAEgBAFQgBAGgDADQgDADgDABIgGABIgEgBg");
	this.shape.setTransform(28.7372,22.5523);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	// Layer_6
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#333333").ss(3,1,1).p("AjXjCQAXgQC3gLQDHgMAvAkQAqAggGChQgFCPgSAfQgYAlgjAPQgQAHjEgHQjOgHgMgVQgohEAIiOQAIiQAwgig");
	this.shape_1.setTransform(27.3954,22.9484);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.02)").s().p("AgVDeQjOgHgMgVQgohEAIiOQAIiQAwgiQAXgQC3gLQDHgMAvAkQAqAggGChQgFCPgSAfQgYAlgjAPQgIADg1AAQg2AAhhgDg");
	this.shape_2.setTransform(27.3954,22.9484);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.5,-1,57.8,48);


(lib.b_exitgame = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {"norm":0,"over":1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		///* this.stop();*/
	}
	this.frame_1 = function() {
		///* this.stop();*/
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer_4
	this.txt = new cjs.Text("-", "bold 20px 'Arial'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 22;
	this.txt.lineWidth = 166;
	this.txt.parent = this;
	this.txt.setTransform(118.1,12.65);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AAAAjIg5A6IgkgjIA7g6Ig7g5IAkgjIA5A6IA7g7IAjAkIg7A5IA7A6IgjAkg");
	this.shape.setTransform(24.2,23.675);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape},{t:this.txt}]}).wait(2));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AuDD6QhTAAg7g7Qg6g6AAhTIAAhjQAAhTA6g6QA7g7BTAAIcHAAQBTAAA6A7QA7A6AABTIAABjQAABTg7A6Qg6A7hTAAg");
	this.shape_1.setTransform(110,25);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,220,50);


(lib.b_cancel = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AAAAyIhTBUIgzgzIBVhTIhVhTIAzgyIBTBTIBVhUIAyAzIhUBTIBUBTIgyA0g");
	this.shape.setTransform(25,25.025);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#666666","#000000"],[0,1],7.1,-25,7.1,39).s().p("AhPD6QhGAAgygyQgygxAAhHIAAifQAAhGAygzQAygxBGAAICfAAQBGAAAyAxQAyAzAABGIAACfQAABHgyAxQgyAyhGAAg");
	this.shape_1.setTransform(25.0049,25,1.0002,1);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_cancel, new cjs.Rectangle(0,0,50,50), null);


(lib.app_exit = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {"norm":0,"over":1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		///* this.stop();*/
	}
	this.frame_1 = function() {
		///* this.stop();*/
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AAAAyIhTBUIgzgzIBVhTIhVhTIAzgyIBTBTIBVhUIAyAzIhVBTIBVBTIgyA0g");
	this.shape.setTransform(27,23.025);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	// Layer_8
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#3C3C3C","#000000"],[0,1],103,-25,103,39).s().p("AgJD6QhkAAhGhGQhGhHAAhjIAAkDIHzAAIAAHzg");
	this.shape_1.setTransform(25,24.9993);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,50,50);


(lib.b_resetlevel = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AhUBaQgGgGAAgIQAAgIAGgGQAFgGAJAAQAIAAAGAGQAZAZAigBIABAAQAjABAZgZQAZgaAAgjQABgjgagYIAAgBQgZgZgjAAIgBAAQgeABgXAUIAmAmQADADgBAEQAAADgCACQgDADgEAAIhlADQgDAAgDgCQgDgEABgDIAChkQAAgEADgDQACgCAEAAQAEAAADACIAgAgIABgBQAigfAugBQA1AAAkAlIABAAQAlAlgBAzIAAAAQAAA0gkAlIAAAAQglAlg0gBIgBAAIgBAAQgxAAglgkg");
	this.shape.setTransform(27.4718,23.6253);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#333333").ss(3,1,1).p("AjXjCQAXgQC3gLQDHgMAvAkQAqAggGChQgFCPgSAfQgYAlgjAPQgQAHjEgHQjOgHgMgVQgohEAIiOQAIiQAwgig");
	this.shape_1.setTransform(27.3954,22.9484);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.02)").s().p("AgVDeQjOgHgMgVQgohEAIiOQAIiQAwgiQAXgQC3gLQDHgMAvAkQAqAggGChQgFCPgSAfQgYAlgjAPQgIADg1AAQg2AAhhgDg");
	this.shape_2.setTransform(27.3954,22.9484);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_resetlevel, new cjs.Rectangle(-1.5,-1,57.8,48), null);


(lib.b_ok = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AivgIIA1g1IBYBWICdibIA1A2IjSDPg");
	this.shape.setTransform(25.525,25.75);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_3
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#666666","#000000"],[0,1],7.1,-25,7.1,39).s().p("AhPD6QhGAAgygyQgygxAAhHIAAifQAAhGAygzQAygxBGAAICfAAQBGAAAyAxQAyAzAABGIAACfQAABHgyAxQgyAyhGAAg");
	this.shape_1.setTransform(25.0049,25,1.0002,1);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_ok, new cjs.Rectangle(0,0,50,50), null);


(lib.b_home = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AAaCHIAAhMIgzAAIAABMIgtAAQgNAAgJgJQgJgKAAgOIAAhPIgRAAQgHAAgFgEQgEgFAAgHQAAgGAEgEIB5h+QAFgFAEAAQAHAAAEAFIB4B+QAEAEAAAGQAAAHgEAFQgFAEgGAAIgRAAIAABPQAAAOgJAKQgJAJgNAAg");
	this.shape.setTransform(28.825,23.525);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#333333").ss(3,1,1).p("AjXjCQAXgQC3gLQDHgMAvAkQAqAggGChQgFCPgSAfQgYAlgjAPQgQAHjEgHQjOgHgMgVQgohEAIiOQAIiQAwgig");
	this.shape_1.setTransform(27.3954,22.9484);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.02)").s().p("AgVDeQjOgHgMgVQgohEAIiOQAIiQAwgiQAXgQC3gLQDHgMAvAkQAqAggGChQgFCPgSAfQgYAlgjAPQgIADg1AAQg2AAhhgDg");
	this.shape_2.setTransform(27.3954,22.9484);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_home, new cjs.Rectangle(-1.5,-1,57.8,48), null);


(lib.Symbol1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AABJvQg0AAgygFIACgUQAxAFAzAAIACAAIAAAUgABoJWQAygGAxgLIAFATQgwALg2AHgAkuI7IAHgTQAxASAwALIgFATQgzgLgwgSgAEsIoQAtgQAwgYIAJARQguAYgxASgAgIIfIAAhkIATAAIAABkgAnmHdIALgQQAqAcAtAXIgJASQgugXgrgegAHfHMQAqgdAlgjIAOAPQgmAjgrAegAp9FQIAPgMQAhAoAkAiIgOAOQgmgjgggpgAgIFXIAAhkIATAAIAABkgAJyFCQAggpAXgrIARAJQgXAsghAsgAreCZIATgGQAPAwAYAsIgSAKQgZgvgPgxgALPCSQAPgwAFgzIAUACQgGA1gPAxgAgICPIAAhkIATAAIAABkgAr2AAQACgbADgZIAUACQgEAagBAYQAAAZADAYIgUACQgDgZAAgagALMiWIATgFQAPAxAGA0IgTADQgHgzgOgwgAgIg4IAAhkIATAAIAABkgArciaQAPgzAXguIASAJQgXAvgOAvgAJylIIAQgMQAfApAYAvIgSAJQgWgsgfgpgAgIkAIAAhkIATAAIAABkgAp/lTQAegoAnglIAOAOQglAkgeAngAHgnRIALgRQAsAfAlAiIgOAPQgjgigrgdgAgInIIAAhkIATAAIAABkgAnpnhQArgdAvgXIAJASQguAXgpAcgAEroqIAGgTQAyARAuAWIgJASQgqgUgzgSgAkwo8QAwgRA0gLIAEATQgxALgwARgABlpVIADgUQAzAGAyAKIgEAUQgygLgygFgAhmppQA2gFAwAAIAAAUQgvAAg1AFg");
	this.shape.setTransform(-0.125,0.175);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#262626").ss(3.5).p("AM5AAQAACNhBCAQg+B8hzBfQhyBgiUA0QiZA2ioAAQinAAiZg2QiUg0hzhgQhyhfg+h8QhBiAAAiNQAAiLBBiBQA+h7ByhgQBzhgCUg0QCZg2CnAAQCoAACZA2QCUA1ByBfQBzBgA+B7QBBCBAACLg");

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.02)").s().p("AlAJ8QiUg1hyhfQhzhgg+h7QhBiBAAiMQAAiLBBiAQA+h8BzhgQByhfCUg0QCZg3CnAAQCoAACZA3QCUA0ByBfQByBgA/B8QBBCAAACLQAACMhBCBQg/B7hyBgQhyBfiUA1QiZA2ioAAQinAAiZg2g");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(1));

	// Layer_1
	this.drop_2 = new lib.mc_dummy();
	this.drop_2.name = "drop_2";
	this.drop_2.setTransform(32,0);

	this.drop_1 = new lib.mc_dummy();
	this.drop_1.name = "drop_1";
	this.drop_1.setTransform(-32,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.drop_1},{t:this.drop_2}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol1, new cjs.Rectangle(-84.2,-70.9,168.5,141.7), null);


(lib.scene_recap = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// ui
	this.result_block = new lib.result_text();
	this.result_block.name = "result_block";
	this.result_block.setTransform(199.7,170.1);

	this.header = new lib.scene_header();
	this.header.name = "header";
	this.header.setTransform(203.05,0);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(196,392,1,1,0,0,0,110,60);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_play},{t:this.header},{t:this.result_block}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_recap, new cjs.Rectangle(1.3,2,398.9,381.4), null);


(lib.scene_instructions = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// ui
	this.txt_instructions = new lib.txt_instructions();
	this.txt_instructions.name = "txt_instructions";
	this.txt_instructions.setTransform(251.75,393.7);

	this.dots_holder = new lib.mc_dummy();
	this.dots_holder.name = "dots_holder";
	this.dots_holder.setTransform(251.75,393.7);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(251,488,1,1,0,0,0,110,60);

	this.header = new lib.scene_header();
	this.header.name = "header";
	this.header.setTransform(260,0);

	this.b_next_image = new lib.b_next();
	this.b_next_image.name = "b_next_image";
	this.b_next_image.setTransform(500,407,1,1,0,0,0,36,25);

	this.b_prev_image = new lib.b_prev();
	this.b_prev_image.name = "b_prev_image";
	this.b_prev_image.setTransform(10,383);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_prev_image},{t:this.b_next_image},{t:this.header},{t:this.b_play},{t:this.dots_holder},{t:this.txt_instructions}]}).wait(1));

	// Layer_2
	this.image_holder = new lib.mc_dummy();
	this.image_holder.name = "image_holder";
	this.image_holder.setTransform(250,240);

	this.timeline.addTween(cjs.Tween.get(this.image_holder).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_instructions, new cjs.Rectangle(10,2,490,477.4), null);


(lib.scene_global_quit = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.b_quit = new lib.app_exit();
	this.b_quit.name = "b_quit";
	this.b_quit.setTransform(50,0,1,1,0,0,0,50,0);

	this.timeline.addTween(cjs.Tween.get(this.b_quit).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_global_quit, new cjs.Rectangle(0,0,50,50), null);


(lib.mc_cardholder = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.mc_dummy();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.mc_cardholder, new cjs.Rectangle(0,0,0,0), null);


(lib.popup_pause = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_3
	this.b_help = new lib.b_pause_help();
	this.b_help.name = "b_help";
	this.b_help.setTransform(-16,56,1,1,0,0,0,90,22);

	this.b_resume = new lib.b_resumegame();
	this.b_resume.name = "b_resume";
	this.b_resume.setTransform(-16,-8,1,1,0,0,0,90,22);

	this.b_exit = new lib.b_exitgame();
	this.b_exit.name = "b_exit";
	this.b_exit.setTransform(-16,-72,1,1,0,0,0,90,22);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_exit},{t:this.b_resume},{t:this.b_help}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.popup_pause, new cjs.Rectangle(-106,-94,220,178), null);


(lib.confirm_popup = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.txt = new cjs.Text("ARE YOU SURE?", "bold 16px 'Arial'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 18;
	this.txt.lineWidth = 264;
	this.txt.parent = this;
	this.txt.setTransform(1,-41.45);

	this.b_cancel = new lib.b_cancel();
	this.b_cancel.name = "b_cancel";
	this.b_cancel.setTransform(-24.1,48.05,1,1,0,0,0,31.9,32);

	this.b_ok = new lib.b_ok();
	this.b_ok.name = "b_ok";
	this.b_ok.setTransform(46,47.05,1,1,0,0,0,40,32);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_ok},{t:this.b_cancel},{t:this.txt}]}).wait(1));

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.098)").ss(4,1,1).p("A1ttRMArbAAAQBsAABMBMQBMBMAABsIAASbQAABshMBLQhMBNhsAAMgrbAAAQhsAAhMhNQhMhLAAhsIAAybQAAhsBMhMQBMhMBsAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_3
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FFFFFF","#E5E5E5"],[0,1],0,-90,0,90).s().p("A13OEQh8AAhYhYQhYhYAAh8IAAyvQAAh8BYhYQBYhYB8AAMArvAAAQB8AABYBYQBYBYAAB8IAASvQAAB8hYBYQhYBYh8AAg");

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.confirm_popup, new cjs.Rectangle(-170,-90,340,180), null);


(lib.b_mute = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {"norm":0,"over":1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_4
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("ABICVIhWhXIhEAAQgHABgFgFQgFgFAAgIIAAhaQAAgHAFgEQAFgGAHAAIBEAAIBWhUQAFgGAGAAQAIAAAFAGQAEAEAAAGIAAEQQAAAHgEAGQgFAEgIAAQgGAAgFgEg");
	this.shape.setTransform(17.5,25);

	this.mc_mutelines = new lib.mc_mutelines();
	this.mc_mutelines.name = "mc_mutelines";
	this.mc_mutelines.setTransform(36.7,27.55,1,1,0,0,0,4.8,12.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.mc_mutelines},{t:this.shape}]}).wait(2));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(3,1,1).p("AhFj5ICLAAQBLAAA0A0QA1A1AABLIAACLQAABLg1A0Qg0A1hLAAIiLAAQhLAAg1g1Qg0g0AAhLIAAiLQAAhLA0g1QA1g0BLAAg");
	this.shape_1.setTransform(25.5056,25.5,0.9992,1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(0,0,0,0.298)").s().p("AhFD6QhLAAg1g1Qg0g0AAhLIAAiLQAAhKA0g1QA1g1BLAAICLAAQBLAAA0A1QA1A1AABKIAACLQAABLg1A0Qg0A1hLAAg");
	this.shape_2.setTransform(25.5056,25.5,0.9992,1);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(255,255,255,0.2)").s().p("AhFD6QhLAAg1g1Qg0g0AAhLIAAiLQAAhKA0g1QA1g1BLAAICLAAQBLAAA0A1QA1A1AABKIAACLQAABLg1A0Qg0A1hLAAg");
	this.shape_3.setTransform(25.5056,25.5,0.9992,1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).to({state:[{t:this.shape_3},{t:this.shape_1}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,-1,53,53);


(lib.b_fullscreen = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {"norm":0,"over":1};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_5
	this.mc_on = new lib.bFullscreenOff();
	this.mc_on.name = "mc_on";
	this.mc_on.setTransform(13.4,16.1,1,1,0,0,0,3.7,6.1);
	new cjs.ButtonHelper(this.mc_on, 0, 1, 1);

	this.timeline.addTween(cjs.Tween.get(this.mc_on).wait(2));

	// Layer_3
	this.mc_off = new lib.bFullScreen();
	this.mc_off.name = "mc_off";
	this.mc_off.setTransform(11.3,10,1,1,0,0,0,1.6,0);

	this.timeline.addTween(cjs.Tween.get(this.mc_off).wait(2));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(3,1,1).p("AhFj5ICLAAQBLAAA0A0QA1A1AABLIAACLQAABLg1A0Qg0A1hLAAIiLAAQhLAAg1g1Qg0g0AAhLIAAiLQAAhLA0g1QA1g0BLAAg");
	this.shape.setTransform(25.5056,25.5,0.9992,1);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(0,0,0,0.298)").s().p("AhFD6QhLAAg1g1Qg0g0AAhLIAAiLQAAhKA0g1QA1g1BLAAICLAAQBLAAA0A1QA1A1AABKIAACLQAABLg1A0Qg0A1hLAAg");
	this.shape_1.setTransform(25.5056,25.5,0.9992,1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.2)").s().p("AhFD6QhLAAg1g1Qg0g0AAhLIAAiLQAAhKA0g1QA1g1BLAAICLAAQBLAAA0A1QA1A1AABKIAACLQAABLg1A0Qg0A1hLAAg");
	this.shape_2.setTransform(25.5056,25.5,0.9992,1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_2},{t:this.shape}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,-1,53,53);


(lib.scene_title = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// ui
	this.logo = new lib.title_2();
	this.logo.name = "logo";
	this.logo.setTransform(221.5,173.9);

	this.b_help = new lib.b_help();
	this.b_help.name = "b_help";
	this.b_help.setTransform(76.45,362.5,1,1,0,0,0,27.4,45.5);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(207,366,1,1,0,0,0,105,50);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_play},{t:this.b_help},{t:this.logo}]}).wait(1));

	// Layer_3
	this.cards = new lib.mc_cardholder();
	this.cards.name = "cards";
	this.cards.setTransform(221.5,185.9);

	this.timeline.addTween(cjs.Tween.get(this.cards).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_title, new cjs.Rectangle(47.6,81.3,290.5,286.09999999999997), null);


(lib.scene_game = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_3
	this.messages = new lib.mc_messages();
	this.messages.name = "messages";
	this.messages.setTransform(201.5,163);

	this.timeline.addTween(cjs.Tween.get(this.messages).wait(1));

	// ui
	this.cards = new lib.mc_cardholder();
	this.cards.name = "cards";
	this.cards.setTransform(200,200);

	this.game_time = new lib.game_time();
	this.game_time.name = "game_time";
	this.game_time.setTransform(198.5,5.65);

	this.b_home = new lib.b_home();
	this.b_home.name = "b_home";
	this.b_home.setTransform(388.75,388.05,1,1,0,0,0,58,50);

	this.b_restart = new lib.b_resetlevel();
	this.b_restart.name = "b_restart";
	this.b_restart.setTransform(324,388.05,1,1,0,0,0,58,50);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_restart},{t:this.b_home},{t:this.game_time},{t:this.cards}]}).wait(1));

	// Layer_2
	this.drop_pad = new lib.Symbol1();
	this.drop_pad.name = "drop_pad";
	this.drop_pad.setTransform(199.5,314.5);

	this.timeline.addTween(cjs.Tween.get(this.drop_pad).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_game, new cjs.Rectangle(14.1,5.7,374.9,379.6), null);


(lib.popup_recap = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_3
	this.panel = new lib.confirm_popup();
	this.panel.name = "panel";
	this.panel.setTransform(256,256);

	this.timeline.addTween(cjs.Tween.get(this.panel).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.popup_recap, new cjs.Rectangle(86,166,340,180), null);


(lib.popup_confirm = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_3
	this.panel = new lib.confirm_popup();
	this.panel.name = "panel";
	this.panel.setTransform(256,256);

	this.timeline.addTween(cjs.Tween.get(this.panel).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.popup_confirm, new cjs.Rectangle(86,166,340,180), null);


(lib.scene_mute_panel = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.b_mute = new lib.b_mute();
	this.b_mute.name = "b_mute";

	this.timeline.addTween(cjs.Tween.get(this.b_mute).wait(1));

	// Layer_2
	this.b_pause = new lib.b_pause();
	this.b_pause.name = "b_pause";
	this.b_pause.setTransform(0,118);

	this.b_fullscreen = new lib.b_fullscreen();
	this.b_fullscreen.name = "b_fullscreen";
	this.b_fullscreen.setTransform(0,59);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_fullscreen},{t:this.b_pause}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_mute_panel, new cjs.Rectangle(-1,-1,53,171), null);


// stage content:
(lib.MatchDoodle = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// pause_menu
	this.instance = new lib.scene_mute_panel();
	this.instance.setTransform(10,10.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({_off:true},4).wait(17));

	// Layer_2
	this.instance_1 = new lib.scene_global_quit();
	this.instance_1.setTransform(375,26,1,1,0,0,0,25,25);

	this.instance_2 = new lib.scene_title();
	this.instance_2.setTransform(222.8,250.7,1,1,0,0,0,242.8,250.7);

	this.instance_3 = new lib.scene_instructions();

	this.instance_4 = new lib.scene_game();
	this.instance_4.setTransform(383.4,264.4,1,1,0,0,0,383.4,264.4);

	this.instance_5 = new lib.scene_recap();
	this.instance_5.setTransform(387.3,329.6,1,1,0,0,0,387.3,329.6);

	this.instance_6 = new lib.font_loader();
	this.instance_6.setTransform(633.6,451.05,1,1,0,0,0,211,66.2);

	this.instance_7 = new lib.popup_pause();
	this.instance_7.setTransform(599.9,104.2,1,1,0,0,0,3.5,10.2);

	this.instance_8 = new lib.popup_confirm();
	this.instance_8.setTransform(382.9,257.4,1,1,0,0,0,382.9,257.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_2},{t:this.instance_1}]}).to({state:[]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_4}]},1).to({state:[{t:this.instance_5}]},1).to({state:[]},1).to({state:[{t:this.instance_8},{t:this.instance_7},{t:this.instance_6}]},2).to({state:[]},1).to({state:[]},3).wait(10));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(0,-57,1461.9,826);
// library properties:
lib.properties = {
	id: '35A5558F002BB0439538A2940A14BBA4',
	width: 400,
	height: 400,
	fps: 30,
	color: "#999999",
	opacity: 1.00,
	manifest: [],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['35A5558F002BB0439538A2940A14BBA4'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}


an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}
an.handleSoundStreamOnTick = function(event) {
	if(!event.paused){
		var stageChild = stage.getChildAt(0);
		if(!stageChild.paused || stageChild.ignorePause){
			stageChild.syncStreamSounds();
		}
	}
}
an.handleFilterCache = function(event) {
	if(!event.paused){
		var target = event.target;
		if(target){
			if(target.filterCacheList){
				for(var index = 0; index < target.filterCacheList.length ; index++){
					var cacheInst = target.filterCacheList[index];
					if((cacheInst.startFrame <= target.currentFrame) && (target.currentFrame <= cacheInst.endFrame)){
						cacheInst.instance.cache(cacheInst.x, cacheInst.y, cacheInst.w, cacheInst.h);
					}
				}
			}
		}
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;