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
	this.txt = new cjs.Text("YOU WON IN 6 MOVES!", "bold 20px 'Arial'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 16;
	this.txt.lineWidth = 376;
	this.txt.parent = this;
	this.txt.setTransform(0,2);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.txt_instructions, new cjs.Rectangle(-190,0,380,26.4), null);


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
	this.shape.graphics.f("#FFFFFF").s().p("AhGBGQgdgdAAgpQAAgpAdgdQAdgdApAAQAqAAAdAdQAdAdAAApQAAApgdAdQgdAegqAAQgpAAgdgeg");
	this.shape.setTransform(-0.006,-0.0102,0.3,0.3);
	this.shape._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1).to({_off:false},0).wait(1));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(3,1,1).p("ABkAAQAAApgdAeQgdAdgqAAQgpAAgdgdQgdgeAAgpQAAgoAdgeQAdgdApAAQAqAAAdAdQAdAeAAAog");
	this.shape_1.setTransform(-0.0067,-0.0113,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-6.5,-6.5,13,13);


(lib.thumbs_up = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.f("#F2F2ED").s().p("Ag8AAIAJgBQAigEALgMQAPgPgBgQQAAgIAEgCIAFgBQAHAAAEAFQAGAGAAALQgBAJgCAGIASgDIACAAQAKAAAAALQAAAFgDADQADADAAAEQAAAFgDADQADADAAAFQAAAFgDACQADADAAAGQAAAJgHACIgBAAIgtAHIg0AIIgGABgAAPg1QgBABAAAEQABASgQARQgJAJgTAEIgZAEIAJAyIBhgPQAEAAAAgGQAAgEgDgCIgDgBIgBgBQAAgBAAAAQAAAAAAAAQAAgBABAAQAAAAAAAAQAGgBgBgFQABgDgDgCIgDgCQAAAAAAAAQgBAAAAAAQAAAAAAgBQAAAAAAAAIABgCQAGAAgBgGQABgCgDgCIgDgBQAAAAAAAAQgBAAAAgBQAAAAAAAAQAAAAAAgBIABgBQAGgBgBgGQABgGgFAAIgBAAIgaAFIgBAAIgBgBIABgCQAFgEAAgPQAAgRgLAAg");
	this.shape.setTransform(-2.6361,-5.7625,6.0686,6.0685);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#87D853").ss(4,1,1).p("AJ7AAQAAEHi6C6Qi6C6kHAAQkGAAi6i6Qi6i6AAkHQAAkGC6i6QC6i6EGAAQEHAAC6C6QC6C6AAEGg");
	this.shape_1.setTransform(0.0115,-0.0025,0.9449,0.9449);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.rf(["#4FC700","#3C9900"],[0,1],-13.5,-27.4,0,-13.5,-27.4,74.4).s().p("AnAHBQi6i6AAkHQAAkGC6i6QC6i6EGAAQEHAAC6C6QC6C6AAEGQAAEHi6C6Qi6C6kHAAQkGAAi6i6g");
	this.shape_2.setTransform(0.0115,-0.0025,0.9449,0.9449);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.thumbs_up, new cjs.Rectangle(-62,-62,124,124), null);


(lib.thumbs_dn = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.f("#F2F2ED").s().p("Ag8AAIAJgBQAigEALgMQAPgPgBgQQAAgIAEgCIAFgBQAHAAAEAFQAGAGAAALQgBAJgCAGIASgDIACAAQAKAAAAALQAAAFgDADQADADAAAEQAAAFgDADQADADAAAFQAAAFgDACQADADAAAGQAAAJgHACIgBAAIgtAHIg0AIIgGABgAAPg1QgBABAAAEQABASgQARQgJAJgTAEIgZAEIAJAyIBhgPQAEAAAAgGQAAgEgDgCIgDgBIgBgBQAAgBAAAAQAAAAAAAAQAAgBABAAQAAAAAAAAQAGgBgBgFQABgDgDgCIgDgCQAAAAAAAAQgBAAAAAAQAAAAAAgBQAAAAAAAAIABgCQAGAAgBgGQABgCgDgCIgDgBQAAAAAAAAQgBAAAAgBQAAAAAAAAQAAAAAAgBIABgBQAGgBgBgGQABgGgFAAIgBAAIgaAFIgBAAIgBgBIABgCQAFgEAAgPQAAgRgLAAg");
	this.shape.setTransform(3.0361,1.4625,6.0686,6.0685,180);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FF7C34").ss(4,1,1).p("AJ7AAQAAEHi6C6Qi6C6kHAAQkGAAi6i6Qi6i6AAkHQAAkGC6i6QC6i6EGAAQEHAAC6C6QC6C6AAEGg");
	this.shape_1.setTransform(0.0115,-0.0025,0.9449,0.9449);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.rf(["#FA6300","#E03500"],[0,1],-13.5,-27.4,0,-13.5,-27.4,74.4).s().p("AnAHBQi6i6AAkHQAAkGC6i6QC6i6EGAAQEHAAC6C6QC6C6AAEGQAAEHi6C6Qi6C6kHAAQkGAAi6i6g");
	this.shape_2.setTransform(0.0115,-0.0025,0.9449,0.9449);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.thumbs_dn, new cjs.Rectangle(-62,-62,124,124), null);


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

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,0,0);


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
	this.txt = new cjs.Text("PLAY AGAIN", "30px 'Luckiest Guy'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 37;
	this.txt.lineWidth = 223;
	this.txt.parent = this;
	this.txt.setTransform(-0.05,7);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_header, new cjs.Rectangle(-113.5,5,227,40.8), null);


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
	this.txt = new cjs.Text("Luckiest Guy", "30px 'Luckiest Guy'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 37;
	this.txt.lineWidth = 428;
	this.txt.parent = this;
	this.txt.setTransform(216.0012,-115.95);

	this.txt_1 = new cjs.Text("RUSSO ONE", "30px 'Kanit SemiBold'", "#FFFFFF");
	this.txt_1.name = "txt_1";
	this.txt_1.textAlign = "center";
	this.txt_1.lineHeight = 47;
	this.txt_1.lineWidth = 428;
	this.txt_1.parent = this;
	this.txt_1.setTransform(216.0012,30.4);

	this.txt_2 = new cjs.Text("RUSSO ONE", "bold 30px 'Kanit'", "#FFFFFF");
	this.txt_2.name = "txt_2";
	this.txt_2.textAlign = "center";
	this.txt_2.lineHeight = 47;
	this.txt_2.lineWidth = 428;
	this.txt_2.parent = this;
	this.txt_2.setTransform(216.0012,-52.95);

	this.txt_3 = new cjs.Text("RUSSO ONE", "30px 'Kanit'", "#FFFFFF");
	this.txt_3.name = "txt_3";
	this.txt_3.textAlign = "center";
	this.txt_3.lineHeight = 47;
	this.txt_3.lineWidth = 428;
	this.txt_3.parent = this;
	this.txt_3.setTransform(216.0012,-7.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_3},{t:this.txt_2},{t:this.txt_1},{t:this.txt}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.font_loader, new cjs.Rectangle(0,-117.9,432,197.7), null);


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
	this.shape.graphics.f().s("#FFFFFF").ss(3,2,1).p("AgjgeQAWAmgWAoAAJhjQBBBjhBBl");
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


(lib.b_replay = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.f("#FFFFFF").s().p("AgKBdIhshOQgGgGAAgGQgBgFAGgFIBrhVQAFgFAFADQADABAAAIIABAsQAjALAZgDQAYgDAogZQgYA2gXAQQgYAQgTAHIghAKIAAAsQAAAHgDACIgEABQgCAAgEgDg");
	this.shape.setTransform(205.0403,30.323,1.2806,1.2806);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	// Layer_8
	this.txt = new cjs.Text("PLAY AGAIN", "30px 'Luckiest Guy'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 37;
	this.txt.lineWidth = 184;
	this.txt.parent = this;
	this.txt.setTransform(105.1,14);
	this.txt.shadow = new cjs.Shadow("rgba(166,54,19,1)",0,0,4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(4,1,0,3).p("AuXkDIcvAAQBTAAA7A6QA6A7AABTIAAB3QAABTg6A7Qg7A6hTAAI8vAAQhTAAg7g6Qg6g7AAhTIAAh3QAAhTA6g7QA7g6BTAAg");
	this.shape_1.setTransform(116,29.9992);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FE951B","#FBCB53"],[0,1],0,-26,0,26).s().p("AuXEEQhTAAg6g7Qg7g6AAhTIAAh3QAAhTA7g7QA6g6BTAAIcvAAQBTAAA7A6QA6A7AABTIAAB3QAABTg6A6Qg7A7hTAAg");
	this.shape_2.setTransform(116,29.9992);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.txt}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-3,-3,242,70);


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
	this.shape.graphics.f("#FFFFFF").s().p("Ah5AhQgPgOAAgTQAAgTAPgNIC/jCIBDBCIifCgICfCgIhDBCg");
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

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AhPCAQgWgLAAgXIAAi7QAAgXAWgLQAUgLATAOIB9BeQAQAMABASQgBATgQAMIh9BeQgKAIgMAAQgJAAgIgFg");
	this.shape.setTransform(207.5,28.575);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	// Layer_5
	this.txt = new cjs.Text("PLAY", "30px 'Luckiest Guy'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 37;
	this.txt.lineWidth = 184;
	this.txt.parent = this;
	this.txt.setTransform(105.1,14);
	this.txt.shadow = new cjs.Shadow("rgba(166,54,19,1)",0,0,4);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(2));

	// Layer_8
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(4,1,0,3).p("AuXkDIcvAAQBTAAA7A6QA6A7AABTIAAB3QAABTg6A7Qg7A6hTAAI8vAAQhTAAg7g6Qg6g7AAhTIAAh3QAAhTA6g7QA7g6BTAAg");
	this.shape_1.setTransform(116,29.9992);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FE951B","#FBCB53"],[0,1],0,-26,0,26).s().p("AuXEEQhTAAg6g7Qg7g6AAhTIAAh3QAAhTA7g7QA6g6BTAAIcvAAQBTAAA7A6QA6A7AABTIAAB3QAABTg6A6Qg7A7hTAAg");
	this.shape_2.setTransform(116,29.9992);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(2,2,228,59);


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
	this.shape.graphics.f("#FFFFFF").s().p("AiICgICfigIifigIBDhCIC/DCQAPANAAATQAAATgPAOIi/DBg");
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
	this.txt = new cjs.Text("?", "40px 'Luckiest Guy'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 49;
	this.txt.lineWidth = 26;
	this.txt.parent = this;
	this.txt.setTransform(30,9.6);
	this.txt.shadow = new cjs.Shadow("rgba(166,54,19,1)",0,0,4);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(2));

	// Layer_8
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(4,1,0,3).p("Ag7kDIB3AAQBTAAA7A6QA6A7AABTIAAB3QAABTg6A7Qg7A6hTAAIh3AAQhTAAg7g6Qg6g7AAhTIAAh3QAAhTA6g7QA7g6BTAAg");
	this.shape.setTransform(30,29.9992);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FE951B","#FBCB53"],[0,1],86,-26,86,26).s().p("Ag7EEQhTAAg6g7Qg7g6AAhTIAAh3QAAhTA7g7QA6g6BTAAIB3AAQBTAAA7A6QA6A7AABTIAAB3QAABTg6A6Qg7A7hTAAg");
	this.shape_1.setTransform(30,29.9992);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(2,2,56,67.6);


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
	this.shape.graphics.f("#4C4C4C").s().p("AhUBaQgGgGAAgIQAAgIAGgGQAFgGAJAAQAIAAAGAGQAZAZAigBIABAAQAjABAZgZIAAAAQAZgaAAgjIAAgBQABgigagZIAAAAQgZgZgjAAIgBAAQgeABgXAUIAmAmQADADgBAEQAAADgCACQgDADgEAAIhlADQgDAAgDgCQgDgEABgDIAChkQAAgEADgDQACgCAEAAQAEAAADACIAgAfIABAAQAigfAugBIAAAAQA1AAAkAlIABAAQAlAlgBAzIAAAAQAAA0gkAlIAAAAQglAlg0gBIgBAAIgBAAQgxAAglgkg");
	this.shape.setTransform(28.7718,25.6253);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#999999").ss(2,1,1).p("AhPjRICfAAQBGAAAyAxQAyAyAABHIAABPQAABHgyAxQgyAyhGAAIifAAQhHAAgygyQgxgxAAhHIAAhPQAAhHAxgyQAygxBHAAg");
	this.shape_1.setTransform(28.9978,25,0.9999,1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FFFFFF","#999999"],[0,1],7.1,-21,7.1,43).s().p("AhPDSQhGAAgygyQgygyAAhGIAAhPQAAhGAygzQAygxBGAAICfAAQBGAAAyAxQAyAzAABGIAABPQAABGgyAyQgyAyhGAAg");
	this.shape_2.setTransform(28.9978,25,0.9999,1);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.lf(["#FFFFFF","#999999"],[0,1],3,-25,3,39).s().p("AhZD6QhTAAg7g7Qg6g6AAhTIAAhjQAAhTA6g7QA7g6BTAAICzAAQBTAAA7A6QA6A7AABTIAABjQAABTg6A6Qg7A7hTAAg");
	this.shape_3.setTransform(29.0107,25,0.9995,1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_resetlevel, new cjs.Rectangle(0,0,58,50), null);


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
	this.b_help = new lib.b_help();
	this.b_help.name = "b_help";
	this.b_help.setTransform(57.05,371,1,1,0,0,0,30,56);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(218,372,1,1,0,0,0,116,56);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_play},{t:this.b_help}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_title, new cjs.Rectangle(29.1,317,302.9,67.60000000000002), null);


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

}).prototype = getMCSymbolPrototype(lib.scene_instructions, new cjs.Rectangle(10,5,490,484), null);


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
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333333").s().p("AAAdjQglAAgagbQgagaAAglMAAAg4RQAAglAagbQAagaAlAAIAAAAQAmAAAaAaQAaAbAAAlMAAAA4RQAAAlgaAaQgaAbgmAAg");
	this.shape.setTransform(145.228,-39.3572,0.1463,0.1463,45);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFCA49").s().p("AolHRIAAyqIIlEJIImkJIAASqIomEJg");
	this.shape_1.setTransform(157.1644,-50.7529,0.1463,0.1463,45);

	this.txt_avg = new cjs.Text("100%", "40px 'Luckiest Guy'", "#FFFFFF");
	this.txt_avg.name = "txt_avg";
	this.txt_avg.textAlign = "center";
	this.txt_avg.lineHeight = 51;
	this.txt_avg.lineWidth = 100;
	this.txt_avg.parent = this;
	this.txt_avg.setTransform(122.7,21.7);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#1E9FC4").s().p("A8RcSQrurtAAwlQAAwjLuruQLuruQjAAQQlAALuLuQLtLuAAQjQAAQlrtLtQruLuwlAAQwjAArurugA1M1MQozIyAAMaQAAMbIzIzQIxIyMbAAQMcAAIyoyQIyozAAsbQAAsaoyoyQoyozscAAQsbAAoxIzgAuIOJQl3l2AAoTQAAoRF3l3QF2l2ISAAQITAAF2F2QF3F3AAIRQAAITl3F2Ql2F3oTAAQoSAAl2l3gAnEnEQi7C8AAEIQAAEJC7C7QC8C8EIAAQEJAAC7i8QC8i7AAkJQAAkIi8i8Qi7i7kJAAQkIAAi8C7g");
	this.shape_2.setTransform(126.7458,-22.2528,0.1641,0.1641,45);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#E1F9FF").s().p("A7mbnQrdrcAAwLQAAwLLdrcQLcrcQKAAQQNAALbLcQLcLcAAQLQAAQLrcLcQrbLdwNAAQwKAArcrdg");
	this.shape_3.setTransform(126.7458,-22.2955,0.1641,0.1641,45);

	this.txt_wrong = new cjs.Text("000", "40px 'Luckiest Guy'", "#FFFFFF");
	this.txt_wrong.name = "txt_wrong";
	this.txt_wrong.textAlign = "center";
	this.txt_wrong.lineHeight = 51;
	this.txt_wrong.lineWidth = 80;
	this.txt_wrong.parent = this;
	this.txt_wrong.setTransform(-13.75,21.7);

	this.txt_correct = new cjs.Text("000", "40px 'Luckiest Guy'", "#FFFFFF");
	this.txt_correct.name = "txt_correct";
	this.txt_correct.textAlign = "center";
	this.txt_correct.lineHeight = 51;
	this.txt_correct.lineWidth = 80;
	this.txt_correct.parent = this;
	this.txt_correct.setTransform(-122.7,21.7);

	this.instance = new lib.thumbs_dn();
	this.instance.setTransform(-13.65,-22.2,0.7003,0.7003);

	this.instance_1 = new lib.thumbs_up();
	this.instance_1.setTransform(-122.7,-22.2,0.7003,0.7003);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance},{t:this.txt_correct},{t:this.txt_wrong},{t:this.shape_3},{t:this.shape_2},{t:this.txt_avg},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.result_text, new cjs.Rectangle(-166.1,-65.6,340.7,138.39999999999998), null);


(lib.ui_spritesheet = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_6
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AieC3IgGgGQgegggPgmQgPgmAAgtQAAhbBChCQA4g4BLgJIAAgsQAAgGAHgBIApAAQAGABABAGIAAAsQAfADAdANIAVgmQAEgGAFAEIAlAUQAGADgEAGIgVAmQAMAKALAMQBCBCAABbQAAAtgPAmQgPAmgeAgIgGAGQhCBChdAAQhcAAhChCgAh4hfQgyAyAABFQAAAuAUAlQAMAVASASQATATAXAMQAkASAqAAQArAAAkgSQAWgMATgTQATgSALgVQAUglABguQAAhFgzgyQgxgyhHAAQhGAAgyAygAgXAtQgKgKAAgOQAAgPAKgJQAKgJANgBQAGAAAGACIA9g9QAFgEAGAAQAGAAAEAEQAEAEAAAHQAAAGgEAEIg+A8QADAGAAAGQgBAOgJAKQgLAKgOAAQgNAAgKgKg");
	this.shape.setTransform(307.9617,24.4614,0.5111,0.5111);

	this.instance = new lib.thumbs_up();
	this.instance.setTransform(63.3,64);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F2F2ED").s().p("Ag8AAIAJgBQAigEALgMQAPgPgBgQQAAgIAEgCIAFgBQAHAAAEAFQAGAGAAALQgBAJgCAGIASgDIACAAQAKAAAAALQAAAFgDADQADADAAAEQAAAFgDADQADADAAAFQAAAFgDACQADADAAAGQAAAJgHACIgBAAIgtAHIg0AIIgGABgAAPg1QgBABAAAEQABASgQARQgJAJgTAEIgZAEIAJAyIBhgPQAEAAAAgGQAAgEgDgCIgDgBIgBgBQAAgBAAAAQAAAAAAAAQAAgBABAAQAAAAAAAAQAGgBgBgFQABgDgDgCIgDgCQAAAAAAAAQgBAAAAAAQAAAAAAgBQAAAAAAAAIABgCQAGAAgBgGQABgCgDgCIgDgBQAAAAAAAAQgBAAAAgBQAAAAAAAAQAAAAAAgBIABgBQAGgBgBgGQABgGgFAAIgBAAIgaAFIgBAAIgBgBIABgCQAFgEAAgPQAAgRgLAAg");
	this.shape_1.setTransform(195.1861,65.4625,6.0686,6.0685,180);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#FF7C34").ss(4,1,1).p("AJ7AAQAAEHi6C6Qi6C6kHAAQkGAAi6i6Qi6i6AAkHQAAkGC6i6QC6i6EGAAQEHAAC6C6QC6C6AAEGg");
	this.shape_2.setTransform(192.1615,63.9975,0.9449,0.9449);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.rf(["#FA6300","#E03500"],[0,1],-13.5,-27.4,0,-13.5,-27.4,74.4).s().p("AnAHBQi6i6AAkHQAAkGC6i6QC6i6EGAAQEHAAC6C6QC6C6AAEGQAAEHi6C6Qi6C6kHAAQkGAAi6i6g");
	this.shape_3.setTransform(192.1615,63.9975,0.9449,0.9449);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AieC3IgGgGQgegggPgmQgPgmAAgtQAAhbBChCQA4g4BLgJIAAgsQAAgGAHgBIApAAQAGABABAGIAAAsQAfADAdANIAVgmQAEgGAFAEIAlAUQAGADgEAGIgVAmQAMAKALAMQBCBCAABbQAAAtgPAmQgPAmgeAgIgGAGQhCBChdAAQhcAAhChCgAh4hfQgyAyAABFQAAAuAUAlQAMAVASASQATATAXAMQAkASAqAAQArAAAkgSQAWgMATgTQATgSALgVQAUglABguQAAhFgzgyQgxgyhHAAQhGAAgyAygAgXAtQgKgKAAgOQAAgPAKgJQAKgJANgBQAGAAAGACIA9g9QAFgEAGAAQAGAAAEAEQAEAEAAAHQAAAGgEAEIg+A8QADAGAAAGQgBAOgJAKQgLAKgOAAQgNAAgKgKg");
	this.shape_4.setTransform(486.7,229.85);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#016379").s().p("AubC8QgTAAgRgCQhtgOAAhqIAAiDQAAhqBtgOQARgCATAAIc4AAQCQABAAB5IAACDQAAB5iQABgAu/idQhSAHAABZIAAB8QAABZBSAIIAQAAIdgAAQBhAAAAhhIAAh8QAAhhhhAAI9gAAIgQABg");
	this.shape_5.setTransform(396.875,24.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFFFF").s().p("AugDeQgSABgQgCQiKgOAAiAIAAicQAAiCCKgNQAQgBASAAIdBAAQCsAAAACQIAACcQAACPisAAgAvCidQhSAHAABZIAAB7QAABaBSAHIAPABIdhAAQBhAAAAhiIAAh7QAAhhhhAAI9hAAIgPABg");
	this.shape_6.setTransform(397.225,24.7);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#000000").s().p("AubC7QgTAAgRgCQhtgNAAhpIAAiFQAAhoBtgOQARgCATAAIc4AAQCQAAAAB4IAACFQAAB4iQAAg");
	this.shape_7.setTransform(396.875,124.7);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.lf(["#F15400","#FFFF99"],[0,1],-10.2,36.2,-10.2,-42.9).s().p("A3nEDIAAoFMAvOAAAIAAIFg");
	this.shape_8.setTransform(388.8073,82.0991,0.6946,0.6944);

	this.b_restart = new lib.b_resetlevel();
	this.b_restart.name = "b_restart";
	this.b_restart.setTransform(434,254.65,1,1,0,0,0,58,50);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_restart},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.instance},{t:this.shape}]}).wait(1));

	// Layer_5
	this.txt_ready = new cjs.Text("READY...", "50px 'Luckiest Guy'", "#FFFFFF");
	this.txt_ready.name = "txt_ready";
	this.txt_ready.textAlign = "center";
	this.txt_ready.lineHeight = 61;
	this.txt_ready.lineWidth = 276;
	this.txt_ready.parent = this;
	this.txt_ready.setTransform(140.6,140.25);

	this.digit_9 = new cjs.Text("9", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_9.name = "digit_9";
	this.digit_9.textAlign = "center";
	this.digit_9.lineHeight = 61;
	this.digit_9.lineWidth = 32;
	this.digit_9.parent = this;
	this.digit_9.setTransform(356.3,205.75);

	this.digit_8 = new cjs.Text("8", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_8.name = "digit_8";
	this.digit_8.textAlign = "center";
	this.digit_8.lineHeight = 61;
	this.digit_8.lineWidth = 32;
	this.digit_8.parent = this;
	this.digit_8.setTransform(318.5,205.75);

	this.digit_7 = new cjs.Text("7", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_7.name = "digit_7";
	this.digit_7.textAlign = "center";
	this.digit_7.lineHeight = 61;
	this.digit_7.lineWidth = 32;
	this.digit_7.parent = this;
	this.digit_7.setTransform(281,205.75);

	this.digit_6 = new cjs.Text("6", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_6.name = "digit_6";
	this.digit_6.textAlign = "center";
	this.digit_6.lineHeight = 61;
	this.digit_6.lineWidth = 32;
	this.digit_6.parent = this;
	this.digit_6.setTransform(243.5,205.75);

	this.digit_5 = new cjs.Text("5", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_5.name = "digit_5";
	this.digit_5.textAlign = "center";
	this.digit_5.lineHeight = 61;
	this.digit_5.lineWidth = 32;
	this.digit_5.parent = this;
	this.digit_5.setTransform(206,205.75);

	this.digit_4 = new cjs.Text("4", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_4.name = "digit_4";
	this.digit_4.textAlign = "center";
	this.digit_4.lineHeight = 61;
	this.digit_4.lineWidth = 32;
	this.digit_4.parent = this;
	this.digit_4.setTransform(168.5,205.75);

	this.digit_3 = new cjs.Text("3", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_3.name = "digit_3";
	this.digit_3.textAlign = "center";
	this.digit_3.lineHeight = 61;
	this.digit_3.lineWidth = 32;
	this.digit_3.parent = this;
	this.digit_3.setTransform(131,205.75);

	this.digit_2 = new cjs.Text("2", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_2.name = "digit_2";
	this.digit_2.textAlign = "center";
	this.digit_2.lineHeight = 61;
	this.digit_2.lineWidth = 32;
	this.digit_2.parent = this;
	this.digit_2.setTransform(93.5,205.75);

	this.digit_1 = new cjs.Text("1", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_1.name = "digit_1";
	this.digit_1.textAlign = "center";
	this.digit_1.lineHeight = 61;
	this.digit_1.lineWidth = 32;
	this.digit_1.parent = this;
	this.digit_1.setTransform(56,205.75);

	this.digit_0 = new cjs.Text("0", "50px 'Luckiest Guy'", "#FFFFFF");
	this.digit_0.name = "digit_0";
	this.digit_0.textAlign = "center";
	this.digit_0.lineHeight = 61;
	this.digit_0.lineWidth = 32;
	this.digit_0.parent = this;
	this.digit_0.setTransform(18.5,205.75);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.digit_0},{t:this.digit_1},{t:this.digit_2},{t:this.digit_3},{t:this.digit_4},{t:this.digit_5},{t:this.digit_6},{t:this.digit_7},{t:this.digit_8},{t:this.digit_9},{t:this.txt_ready}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.ui_spritesheet, new cjs.Rectangle(-1.2,-1,514.2,270), null);


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
	this.header = new lib.scene_header();
	this.header.name = "header";
	this.header.setTransform(260,0);

	this.b_replay = new lib.b_replay();
	this.b_replay.name = "b_replay";
	this.b_replay.setTransform(196,327,1,1,0,0,0,110,60);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(196,392,1,1,0,0,0,110,60);

	this.result_block = new lib.result_text();
	this.result_block.name = "result_block";
	this.result_block.setTransform(197.25,138.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.result_block},{t:this.b_play},{t:this.b_replay},{t:this.header}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_recap, new cjs.Rectangle(31.2,5,342.3,388), null);


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
(lib.fruit_sorting = function(mode,startPosition,loop,reversed) {
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
	this.instance_6.setTransform(1035.6,451.05,1,1,0,0,0,211,66.2);

	this.instance_7 = new lib.popup_pause();
	this.instance_7.setTransform(1001.9,104.2,1,1,0,0,0,3.5,10.2);

	this.instance_8 = new lib.ui_spritesheet();
	this.instance_8.setTransform(256,256,1,1,0,0,0,256,256);

	this.instance_9 = new lib.popup_confirm();
	this.instance_9.setTransform(382.9,257.4,1,1,0,0,0,382.9,257.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_2},{t:this.instance_1}]}).to({state:[]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_4,p:{regX:383.4,regY:264.4,x:383.4,y:264.4}}]},1).to({state:[{t:this.instance_5}]},1).to({state:[{t:this.instance_4,p:{regX:384,regY:256,x:384,y:256}}]},1).to({state:[{t:this.instance_8},{t:this.instance_7},{t:this.instance_6}]},1).to({state:[{t:this.instance_9}]},1).to({state:[]},1).to({state:[]},3).wait(10));

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