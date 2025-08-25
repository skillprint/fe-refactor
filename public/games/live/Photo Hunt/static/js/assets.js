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



(lib.chipmunk = function() {
	this.initialize(img.chipmunk);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,375,499);


(lib.chipmunk_sm = function() {
	this.initialize(img.chipmunk_sm);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,90,120);


(lib.timer_sm = function() {
	this.initialize(img.timer_sm);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,97,100);// helper functions:

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
	this.txt = new cjs.Text("YOU WON IN 6 MOVES!", "bold 18px 'Arial'", "#FFFFFF");
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
	this.txt = new cjs.Text("SELECT LEVEL", "26px 'Alphakind'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 31;
	this.txt.lineWidth = 303;
	this.txt.parent = this;
	this.txt.setTransform(0,4);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_header, new cjs.Rectangle(-153.2,2,306.5,35), null);


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
	this.txt_msg = new cjs.Text("YOU COMPLETED LEVEL X IN 20:00!", "16px 'Alphakind'", "#FFFFFF");
	this.txt_msg.name = "txt_msg";
	this.txt_msg.textAlign = "center";
	this.txt_msg.lineHeight = 21;
	this.txt_msg.lineWidth = 394;
	this.txt_msg.parent = this;
	this.txt_msg.setTransform(0.25,21.05);

	this.txt_hrd = new cjs.Text("INCREDIBLE", "70px 'Alphakind'", "#FFFFFF");
	this.txt_hrd.name = "txt_hrd";
	this.txt_hrd.textAlign = "center";
	this.txt_hrd.lineHeight = 85;
	this.txt_hrd.lineWidth = 395;
	this.txt_hrd.parent = this;
	this.txt_hrd.setTransform(1,-57.95);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_hrd},{t:this.txt_msg}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.result_text, new cjs.Rectangle(-198.9,-59.9,399.4,108.3), null);


(lib.mc_ready = function(mode,startPosition,loop,reversed) {
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
	this.txt = new cjs.Text("READY.", "32px 'Alphakind'", "#993399");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 40;
	this.txt.lineWidth = 189;
	this.txt.parent = this;
	this.txt.setTransform(0.25,-18.85);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AuDD6QhkAAAAhkIAAkrQAAhkBkAAIcHAAQBkAAAABkIAAErQAABkhkAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.mc_ready, new cjs.Rectangle(-100,-25,200,50), null);


(lib.mc_lock = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.f("#AC540D").s().p("AjIF4Qh+jGAijoQAqgWArgRIgXhqQgMg5AggwQAggxA5gNIApgIQA5gNAwAgQAwAgAMA5IAXBpQAugBAuAEQCADFgkDpQjIBrjeAAQgjAAgjgDgAgXgGQgYAFgNASQgNAUAGAYQAEAXAUANQAHAFAJADIAPB9IBJgPIgkh6QAGgFAEgIQAOgUgFgXQgFgYgUgNQgOgIgOAAQgHAAgHACgAg6kQIgqAIQgPAEgHAMQgIAMADAPIAUBdQA2gQA4gIIgThdQgDgPgMgHQgJgGgKAAIgIABg");
	this.shape.setTransform(0.0017,0.0261);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.mc_lock, new cjs.Rectangle(-30,-37.8,60,75.69999999999999), null);


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
	this.txt = new cjs.Text("Alphakind", "26px 'Alphakind'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 31;
	this.txt.lineWidth = 428;
	this.txt.parent = this;
	this.txt.setTransform(216.0012,-17.6);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.font_loader, new cjs.Rectangle(0,-19.6,432,51.400000000000006), null);


(lib.level_tag = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
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
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer_6
	this.txt_level = new cjs.Text("LEVEL", "14px 'Alphakind'", "#AC540D");
	this.txt_level.name = "txt_level";
	this.txt_level.textAlign = "center";
	this.txt_level.lineHeight = 19;
	this.txt_level.lineWidth = 45;
	this.txt_level.parent = this;
	this.txt_level.setTransform(2.35,-32.5);

	this.txt = new cjs.Text("2", "30px 'Alphakind'", "#AC540D");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 38;
	this.txt.lineWidth = 35;
	this.txt.parent = this;
	this.txt.setTransform(2,-22);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt},{t:this.txt_level}]}).wait(2));

	// panel
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(255,255,153,0.498)").s().p("Ag0A1QgWgWAAgfQAAgeAWgWQAWgWAeAAQAfAAAWAWQAWAWAAAeQAAAfgWAWQgWAWgfAAQgeAAgWgWg");
	this.shape.setTransform(22.3815,2.4108,0.3499,0.3498);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(255,255,153,0.498)").s().p("AhHBJQgfgfAAgqQAAgpAfgfQAegeApAAQAqAAAfAeQAdAfABApQgBAqgdAfQgfAegqAAQgpAAgegeg");
	this.shape_1.setTransform(15.2438,5.7216,0.4096,0.4096);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.498)").s().p("AhHBIQgegdAAgrQAAgpAegfQAdgdAqAAQArAAAeAdQAdAfAAApQAAArgdAdQgeAegrABQgqgBgdgeg");
	this.shape_2.setTransform(-11.3112,-36.0776,0.4096,0.4096);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(255,255,255,0.498)").s().p("Ag/BAQgagaAAgmQAAglAagaQAagaAlAAQAlAAAaAaQAbAaAAAlQAAAmgbAaQgaAaglAAQglAAgagag");
	this.shape_3.setTransform(-16.9806,-29.9506,0.3499,0.3498);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.lf(["rgba(247,247,247,0.498)","rgba(251,239,67,0.498)"],[0,1],-0.2,41.7,-0.2,-41.9).s().p("AsCGjIgGilIGopTIEzhNILPEfIBnD5IgHEtg");
	this.shape_4.setTransform(1.0779,-28.1822,0.3499,0.3498);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.rf(["#FCF045","#F48F1C"],[0,1],-6,-5.5,0,-6,-5.5,92.3).s().p("AlCLuIm4ntIgOmEIGopVIEzhNILPEfIBnD7IgPJ+IhZB7IoiE3g");
	this.shape_5.setTransform(1.0779,-14.6522,0.3499,0.3498);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.lf(["#EA9316","#EF6A14"],[0,1],0,-45.5,0,45.4).s().p("Ai5GmIj1kRIgIjlIDolHIC8gvIGKCdIA/CbIgIFZIg8BTIkpCpg");
	this.shape_6.setTransform(0.435,-14.715,0.6999,0.6999);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.lf(["#EA9316","#EF6A14"],[0,1],0,-40.2,0,40.2).s().p("AihF3Ijbj2IgHjCIDTkqICagnIFnCQIAzB9IgHE+IgtA+IkRCcg");
	this.shape_7.setTransform(0.45,-15,0.7,0.7,0,0,0,0.1,-0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-30.3,-46.5,61.5,63.7);


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
	this.txt_ss = new cjs.Text("00", "30px 'Alphakind'", "#FFFFFF");
	this.txt_ss.name = "txt_ss";
	this.txt_ss.lineHeight = 36;
	this.txt_ss.lineWidth = 44;
	this.txt_ss.parent = this;
	this.txt_ss.setTransform(68.5,-37.7);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgHAvQgEgCgDgDIgDgGQgCgDAAgFIACgIIADgGIAHgEIAHgCIAIACIAGAEIAFAGIABAIQAAAFgBADIgFAGQgDADgDACIgIABIgHgBgAgHgJIgHgEIgDgGQgCgEAAgEQAAgEACgEQABgEACgCQADgDAEgCIAHgBIAIABQADACADADQADACACAEQABAEAAAEQAAAEgBAEIgFAGIgGAEQgEACgEAAQgDAAgEgCg");
	this.shape.setTransform(64.45,-18.925);

	this.txt_m = new cjs.Text("0", "30px 'Alphakind'", "#FFFFFF");
	this.txt_m.name = "txt_m";
	this.txt_m.textAlign = "center";
	this.txt_m.lineHeight = 36;
	this.txt_m.lineWidth = 19;
	this.txt_m.parent = this;
	this.txt_m.setTransform(52,-38.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_m},{t:this.shape},{t:this.txt_ss}]}).wait(1));

	// Layer_2
	this.instance = new lib.timer_sm();
	this.instance.setTransform(-8.95,-45.75,0.5,0.5);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#5C1E5C").s().p("AnfDIQhkAAAAhkIAAjHQAAhkBkAAIO/AAQBkAAAABkIAADHQAABkhkAAg");
	this.shape_1.setTransform(58,-20);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.game_time, new cjs.Rectangle(-8.9,-45.7,124.9,50), null);


(lib.game_prog = function(mode,startPosition,loop,reversed) {
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
	this.txt_total = new cjs.Text("0", "30px 'Alphakind'", "#FFFFFF");
	this.txt_total.name = "txt_total";
	this.txt_total.textAlign = "center";
	this.txt_total.lineHeight = 36;
	this.txt_total.lineWidth = 19;
	this.txt_total.parent = this;
	this.txt_total.setTransform(88,-38.2);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AglBBIAyiKIAZAJIgyCKg");
	this.shape.setTransform(71.45,-19.4);

	this.txt_found = new cjs.Text("0", "30px 'Alphakind'", "#FFFFFF");
	this.txt_found.name = "txt_found";
	this.txt_found.textAlign = "center";
	this.txt_found.lineHeight = 36;
	this.txt_found.lineWidth = 19;
	this.txt_found.parent = this;
	this.txt_found.setTransform(57,-38.2);

	this.instance = new lib.chipmunk_sm();
	this.instance.setTransform(-5,-53.5,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance},{t:this.txt_found},{t:this.shape},{t:this.txt_total}]}).wait(1));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#5C1E5C").s().p("AnfDIQhkAAAAhkIAAjHQAAhkBkAAIO/AAQBkAAAABkIAADHQAABkhkAAg");
	this.shape_1.setTransform(58,-20);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.game_prog, new cjs.Rectangle(-5,-53.5,121,60), null);


(lib.chipmunk_1 = function(mode,startPosition,loop,reversed) {
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
	this.instance = new lib.chipmunk();
	this.instance.setTransform(0,-239.5,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.chipmunk_1, new cjs.Rectangle(0,-239.5,187.5,249.5), null);


(lib.checkmark = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.lf(["#65B600","#94CD00"],[0,1],0.7,-82.6,-2.2,82).s().p("AmILrIoUqtQgXgeABgiQADggAVgZQAWgaAfgIQAigHAhASIHMD2ISDu9QAagWAgADQAcACAWAVQAWAVADAdQAEAfgUAbIwXWRQgzBFhWABIgDAAQhUAAgzhDg");
	this.shape.setTransform(7.2473,-5.6214,0.3402,0.3402);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#65B600","#94CD00"],[0,1],2.6,-153.3,-2.7,153.6).s().p("ApWWGQkVh1jVjWQjVjXhzkVQh4kfACk5QACk3B4kaQBzkRDSjSQDSjTERh0QEah4E3gDQECgCDzBSQDrBPDHCVQAVAQAAAaQABAbgVAQQgNALgSABQgSABgOgKQiihvi7g7QjAg9jMAAQkLAAj1BoQjtBli3C3Qi3C3hlDtQhpD1AAELQAAEMBoD2QBkDtC3C3QC3C3DtBkQD1BoEMAAQELAADzhlQDshiC2izQC2izBmjpQBnjyAFkKQAEkmh0kIQgGgNAEgPQAEgOAMgIQAQgLATAFQASAEAHASQBJCZAhCbQAiCegDC1QgGE1h7EYQh1EPjUDQQjUDQkRByQkbB2k0AAQk5AAkeh6g");
	this.shape_1.setTransform(0.1159,-0.116,0.3402,0.3402);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#FFFFFF").ss(4,1,1).p("AjzghIC1DoQASAXAdAAQAcgBARgXIFlnkQAHgJgBgKQgBgLgIgHQgIgIgKAAQgKAAgJAGImJFGIichTQgKgGgMABQgLAEgHAIQgIAJAAALQgBAMAIAKgAHCjGQAoBagBBjQgCBagkBSQgjBQg+A9Qg+A+hQAgQhSAihbAAQhbAAhTgjQhRgig9g+Qg/g+gihSQgjhTAAhbQAAhbAjhSQAjhRA+g/QA+g+BQgiQBVgkBZAAQBGAABBAWQBAATA2AmQAGADAGgBQAGAAAEgDQAHgFAAgJQAAgJgIgGQhDgyhRgcQhSgbhXAAQhpABhgApQhdAohIBIQhHBHgnBdQgpBggBBqQgBBpApBiQAoBeBIBKQBJBIBeAoQBhAqBqAAQBpAABfgpQBegmBIhHQBIhHAphcQAqhfABhpQABg9gLg2QgLg1gag0QgDgGgGgBQgGgCgFADQgFADAAAFQgCAFACAFg");
	this.shape_2.setTransform(0.0028,-0.0255);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.lf(["#65B600","#94CD00"],[0,1],0.9,-52.2,-0.8,52.2).s().p("AjLHhQhegohJhIQhIhKgoheQgphiABhpQABhqAphgQAnhdBHhHQBIhIBdgoQBggpBpgBQBXAABSAbQBRAcBDAyQAIAGAAAJQAAAJgHAFQgEADgGAAQgGABgGgDQg2gmhAgTQhBgWhGAAQhZAAhVAkQhQAig+A+Qg+A/gjBRQgjBSAABbQAABbAjBTQAiBSA/A+QA9A+BRAiQBTAjBbAAQBbAABSgiQBQggA+g+QA+g9AjhQQAkhSAChaQABhjgohaQgCgFACgFQAAgFAFgDQAFgDAGACQAGABADAGQAaA0ALA1QALA2gBA9QgBBpgqBfQgpBchIBHQhIBHheAmQhfAphpAAQhqAAhhgqg");
	this.shape_3.setTransform(0.0028,-0.0255);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.lf(["#65B600","#94CD00"],[0,1],0.1,-28,-0.8,28).s().p("AiFD+Ii1jpQgIgKABgLQAAgLAIgJQAHgIALgEQAMgBAKAGICcBTIGJlGQAJgGAKAAQAKAAAIAIQAIAHABALQABAKgHAJIlkHkQgRAXgdABQgdAAgSgXg");
	this.shape_4.setTransform(7.1109,-5.5018);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.checkmark, new cjs.Rectangle(-54.2,-54.3,108.5,108.6), null);


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
	this.shape.graphics.f("#AC540D").s().p("AgNB4IiLhlQgIgHAAgIQAAgHAHgGICJhtQAHgGAGADQAEACAAAKIABA4QAtAPAggEQAfgEAzggQgeBFgeAUQgeAVgZAJIgqANIAAA5QAAAJgFABQAAABgBAAQAAAAgBABQAAAAgBAAQAAAAgBAAQgDAAgFgDg");
	this.shape.setTransform(191.0233,28.3197);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	// Layer_7
	this.txt = new cjs.Text("PLAY", "26px 'Alphakind'", "#AC540D");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 31;
	this.txt.lineWidth = 163;
	this.txt.parent = this;
	this.txt.setTransform(98.5,15);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(2));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(255,255,153,0.498)").s().p("Ag0A1QgWgWAAgfQAAgeAWgWQAWgWAeAAQAfAAAWAWQAWAWAAAeQAAAfgWAWQgWAWgfAAQgeAAgWgWg");
	this.shape_1.setTransform(204.2,47.375,0.5,0.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,153,0.498)").s().p("AhHBJQgfgfAAgqQAAgpAfgfQAegeApAAQAqAAAfAeQAdAfABApQgBAqgdAfQgfAegqAAQgpAAgegeg");
	this.shape_2.setTransform(194.0556,51.9987,0.5854,0.5854);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(255,255,255,0.498)").s().p("AhHBIQgegdAAgrQAAgpAegfQAdgdAqAAQArAAAeAdQAdAfAAApQAAArgdAdQgeAegrABQgqgBgdgeg");
	this.shape_3.setTransform(20.6318,12.7558,0.5854,0.5854);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(255,255,255,0.498)").s().p("Ag/BAQgagaAAgmQAAglAagaQAagaAlAAQAlAAAaAaQAbAaAAAlQAAAmgbAaQgaAaglAAQglAAgagag");
	this.shape_4.setTransform(12.5,21.625,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1}]}).to({state:[{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1}]},1).wait(1));

	// Layer_8
	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().ls(["#EA9015","#EE6B14"],[0,1],-112,0,112,0).ss(4,1,0,3).p("APtkXIBLBLIAAFOIiWCWI+OAAIhLhLIAAlOICWiWg");
	this.shape_5.setTransform(110,30);

	this.timeline.addTween(cjs.Tween.get(this.shape_5).wait(2));

	// Layer_2
	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.lf(["rgba(247,247,247,0.498)","rgba(251,239,67,0.498)"],[0,1],0,14.3,0,-14.2).s().p("Aw3CPIAAiIICWiVIeOAAIBLBLIAADSg");
	this.shape_6.setTransform(110,16.275);

	this.timeline.addTween(cjs.Tween.get(this.shape_6).wait(2));

	// Layer_6
	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.rf(["#FBE741","#F6A726"],[0,1],-11,4.1,0,-11,4.1,121.1).s().p("AvsEYIhLhLIAAlOICWiWIeOAAIBLBLIAAFOIiWCWg");
	this.shape_7.setTransform(110,30);

	this.timeline.addTween(cjs.Tween.get(this.shape_7).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,220,60);


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
	this.shape.graphics.f("#AC540D").s().p("AhQCAQgUgLAAgXIAAi7QAAgXAUgLQAWgLATAOIB9BeQAPAMAAASQAAATgPAMIh9BeQgLAIgMAAQgJAAgJgFg");
	this.shape.setTransform(194,28.575);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	// Layer_5
	this.txt = new cjs.Text("PLAY", "26px 'Alphakind'", "#AC540D");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 31;
	this.txt.lineWidth = 163;
	this.txt.parent = this;
	this.txt.setTransform(98.5,15);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(2));

	// Layer_8
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(255,255,153,0.498)").s().p("Ag0A1QgWgWAAgfQAAgeAWgWQAWgWAeAAQAfAAAWAWQAWAWAAAeQAAAfgWAWQgWAWgfAAQgeAAgWgWg");
	this.shape_1.setTransform(204.2,47.375,0.5,0.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,153,0.498)").s().p("AhHBJQgfgfAAgqQAAgpAfgfQAegeApAAQAqAAAfAeQAdAfABApQgBAqgdAfQgfAegqAAQgpAAgegeg");
	this.shape_2.setTransform(194.0556,51.9987,0.5854,0.5854);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(255,255,255,0.498)").s().p("AhHBIQgegdAAgrQAAgpAegfQAdgdAqAAQArAAAeAdQAdAfAAApQAAArgdAdQgeAegrABQgqgBgdgeg");
	this.shape_3.setTransform(20.6318,12.7558,0.5854,0.5854);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(255,255,255,0.498)").s().p("Ag/BAQgagaAAgmQAAglAagaQAagaAlAAQAlAAAaAaQAbAaAAAlQAAAmgbAaQgaAaglAAQglAAgagag");
	this.shape_4.setTransform(12.5,21.625,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1}]}).wait(2));

	// Layer_6
	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().ls(["#EA9015","#EE6B14"],[0,1],-112,0,112,0).ss(4,1,0,3).p("APtkXIBLBLIAAFOIiWCWI+OAAIhLhLIAAlOICWiWg");
	this.shape_5.setTransform(110,30);

	this.timeline.addTween(cjs.Tween.get(this.shape_5).wait(2));

	// Layer_7
	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.lf(["rgba(247,247,247,0.498)","rgba(251,239,67,0.498)"],[0,1],0,14.3,0,-14.2).s().p("Aw3CPIAAiIICWiVIeOAAIBLBLIAADSg");
	this.shape_6.setTransform(110,16.275);

	this.timeline.addTween(cjs.Tween.get(this.shape_6).wait(2));

	// Layer_2
	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.rf(["#FBE741","#F6A726"],[0,1],-11,4.1,0,-11,4.1,121.1).s().p("AvsEYIhLhLIAAlOICWiWIeOAAIBLBLIAAFOIiWCWg");
	this.shape_7.setTransform(110,30);

	this.timeline.addTween(cjs.Tween.get(this.shape_7).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,220,60);


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
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#AC540D").s().p("AgQCGQgMgMAAgOQAAgPAMgLQAKgJAQgBQASABAKAJQAKALABAPQgBAOgKAMQgKAKgSAAQgQAAgKgKgAgUAsQABgOAFgLQAEgLAHgIIAOgPIAPgNQAHgHAFgIQAEgHAAgIQAAgPgLgIQgNgKgSAAQgTAAgOAJQgQAHgJAOIgwgcQAQgZAcgOQAcgPAoAAQAeAAAWAJQAYAIAMARQAOAQAAAYQgBAQgFAMQgEALgHAKIgRAQIgQAOQgIAHgFAIQgEAIgBALg");
	this.shape.setTransform(29.9,29.85);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	// Layer_7
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(255,255,153,0.498)").s().p("Ag0A1QgWgWAAgfQAAgeAWgWQAWgWAeAAQAfAAAWAWQAWAWAAAeQAAAfgWAWQgWAWgfAAQgeAAgWgWg");
	this.shape_1.setTransform(49.2,47.375,0.5,0.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.498)").s().p("AhHBIQgegdAAgrQAAgpAegfQAdgdAqAAQArAAAeAdQAdAfAAApQAAArgdAdQgeAegrABQgqgBgdgeg");
	this.shape_2.setTransform(15.6318,12.7558,0.5854,0.5854);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(255,255,255,0.498)").s().p("Ag/BAQgagaAAgmQAAglAagaQAagaAlAAQAlAAAaAaQAbAaAAAlQAAAmgbAaQgaAaglAAQglAAgagag");
	this.shape_3.setTransform(7.5448,21.6325,0.3,0.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1}]}).wait(2));

	// Layer_8
	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().ls(["#EA9015","#EE6B14"],[0,1],-32.5,0,191.5,0).ss(4,1,0,3).p("ADSkXIBLBLIAAFOIiWCWIlYAAIhLhLIAAlOICWiWg");
	this.shape_4.setTransform(30.5,30);

	this.timeline.addTween(cjs.Tween.get(this.shape_4).wait(2));

	// Layer_2
	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.lf(["rgba(247,247,247,0.498)","rgba(251,239,67,0.498)"],[0,1],79.5,14.3,79.5,-14.2).s().p("AkcCPIAAiIICWiVIFYAAIBLBLIAADSg");
	this.shape_5.setTransform(30.5,16.275);

	this.timeline.addTween(cjs.Tween.get(this.shape_5).wait(2));

	// Layer_6
	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.rf(["#FBE741","#F6A726"],[0,1],-1,4.6,0,-1,4.6,39.3).s().p("AjREYIhLhLIAAlOICWiWIFYAAIBLBLIAAFOIiWCWg");
	this.shape_6.setTransform(30.5,30);

	this.timeline.addTween(cjs.Tween.get(this.shape_6).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,61,60);


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
	this.shape_1.graphics.f().s("#7F7F7F").ss(2,1,1).p("AC+jlIBLBLIAADqIiWCWIkwAAIhLhLIAAjqICWiWg");
	this.shape_1.setTransform(28.5,25);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FFFFFF","#999999"],[0,1],3,-25.5,3,38.5).s().p("Ai9DmIhLhLIAAjqICWiWIEwAAIBLBLIAADqIiWCWg");
	this.shape_2.setTransform(28.5,25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_resetlevel, new cjs.Rectangle(1,1,55,48), null);


(lib.b_reset = function(mode,startPosition,loop,reversed) {
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
	this.txt = new cjs.Text("RESET PROGRESS", "18px 'Alphakind'", "#4C4C4C");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 23;
	this.txt.lineWidth = 171;
	this.txt.parent = this;
	this.txt.setTransform(100.2,14.3);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#7F7F7F").ss(2,1,1).p("AOJjlIBLBLIAADqIiWCWI7GAAIhLhLIAAjqICWiWg");
	this.shape.setTransform(100,25);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FFFFFF","#999999"],[0,1],-68.5,-25.5,-68.5,38.5).s().p("AuIDmIhLhLIAAjqICWiWIbGAAIBLBLIAADqIiWCWg");
	this.shape_1.setTransform(100,25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_reset, new cjs.Rectangle(1,1,198,48), null);


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
	this.shape.graphics.f("#4C4C4C").s().p("AAaCHIAAhMIgzAAIAABMIgtAAQgNAAgJgJQgJgKAAgOIAAhPIgRAAQgHAAgFgEQgEgFAAgHQAAgGAEgEIB5h+QAFgFAEAAQAHAAAEAFIB4B+QAEAEAAAGQAAAHgEAFQgFAEgGAAIgRAAIAABPQAAAOgJAKQgJAJgNAAg");
	this.shape.setTransform(28.825,23.525);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#7F7F7F").ss(2,1,1).p("AC+jlIBLBLIAADqIiWCWIkwAAIhLhLIAAjqICWiWg");
	this.shape_1.setTransform(28.5,25);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FFFFFF","#999999"],[0,1],3,-25.5,3,38.5).s().p("Ai9DmIhLhLIAAjqICWiWIEwAAIBLBLIAADqIiWCWg");
	this.shape_2.setTransform(28.5,25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_home, new cjs.Rectangle(1,1,55,48), null);


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

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.lf(["#5DBEBA","#ECFFFD"],[0,1],0,-40.1,0,40.2).s().p("AtJGSIAAiTIi2AAIAAByIi3AAIAArdIC3AAIAAGyIC2AAIAAm5IC3AAIAAMFgAmaFgQgzggghg0Qgfg0gQhCQgQhDgFhHQgFhFAChDQADhDAFg1QAGg1AGghIAGgiICyAiIgDAXQgFAXgFAmQgFAmgFAvQgEAwgCAyQgBAxAEAvQADAvALAmQALAlAUAXQAVAWAhgBQAdAAAVgRQAVgRAPgbQAOgcAJgkQAHgkAEgmQAEgygBg1IgFhlIgIhYIgKg+IC1gdQAEAaAFAsQAGAsAFA1QAEA2ABA8QABA8gGA7QgHBHgRBBQgTBCgjAyQgjAyg2AfQg2AfhNAAIgJAAQhFAAgvgdgAHxFnIjfk8IAAEjIi2AAIAAqSIC2AAIDfFmIAAl1IC2AAIAAK6gAN9FiIAAo6IicgBIABi4IHVADIgCC4IiBgBIAAI5g");
	this.shape.setTransform(0.775,42.825);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#5DBEBA","#ECFFFD"],[0,1],0,-40.1,0,40.2).s().p("Ap8GSIAAiTIi3AAIAAByIi3AAIAArdIC3AAIAAGyIC3AAIAAm5IC2AAIAAMFgARkFNQg/gggxg3QgvgzgahEQgbhEABhLQgBhPAbhEQAahDAvg0QAxg3A/gfQBAgeBJAAQBLAAA/AeQBAAfAyA3QAtA0AZBDQAaBEAABPQAABLgaBEQgZBEgtAzQgyA3hAAgQg/AehLAAQhJAAhAgegASvjHQgdAOgVAYQgZAcgNAlQgPAlAAArQAAApAPAlQANAjAZAcQAVAaAdANQAeAPAfAAQAjAAAbgPQAdgNAYgaQAYgcAMgjQAOglABgpQgBgrgOglQgMglgYgcQgYgYgdgOQgbgPgjAAQgfAAgeAPgAiYFNQg/gggyg3QgtgzgbhEQgahEAAhLQAAhPAahEQAbhDAtg0QAyg3A/gfQBAgeBJAAQBKAAA/AeQBAAfAyA3QAtA0AaBDQAZBEAABPQAABLgZBEQgaBEgtAzQgyA3hAAgQg/AehKAAQhJAAhAgegAhMjHQgeAOgVAYQgZAcgNAlQgOAlAAArQAAApAOAlQANAjAZAcQAVAaAeANQAcAPAhAAQAhAAAcgPQAcgNAYgaQAYgcANgjQAOglAAgpQAAgrgOglQgNglgYgcQgYgYgcgOQgcgPghAAQghAAgcAPgA5IFoIAAruIC2AAQBYgHBCAYQBDAZAsAtQArAtAXA8QAVA7AABAQAAA/gYA7QgWA9gsAvQgrAvhCAcQhCAchXgCIAABogA2UjXIABEsQAzgEAlgYQAkgZAVggQAVgiADgmQACgmgRghQgQgggmgVQgkgTg5AAIgIAAgAIhFiIAAo6IibgBIABi4IHUADIgBC4IiCgBIAAI5g");
	this.shape_1.setTransform(0,-42.775);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer_5
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#2C9B98").ss(6,1,1).p("ALYqDIAAI6Ii2AAIAAo7IicgBIABi4IHUADIgBC4gABipNQgXgYgdgOQgcgPgiAAQggAAgdAPQgdAOgVAYQgZAcgNAlQgOAlAAArQAAAqAOAlQANAjAZAcQAVAaAdANQAdAPAgAAQAiAAAcgPQAdgNAXgaQAYgcANgjQAOglAAgqQAAgrgOglQgNglgYgcgAgPs6QBKAAA/AeQBBAfAxA3QAuA0AZBDQAZBEAABPQAABMgZBEQgZBEguAzQgxA3hBAgQg/AehKAAQhJAAhAgeQhAgggxg3QgtgzgbhEQgahEAAhMQAAhPAahEQAbhDAtg0QAxg3BAgfQBAgeBJAAgATts6QBLAAA/AeQBBAfAxA3QAtA0AaBDQAZBEAABPQAABMgZBEQgaBEgtAzQgxA3hBAgQg/AehLAAQhJAAhAgeQg/gggxg3QgugzgbhEQgahEAAhMQAAhPAahEQAbhDAug0QAxg3A/gfQBAgeBJAAgAVfpNQgYgYgcgOQgcgPgjAAQgfAAgeAPQgdAOgVAYQgZAcgNAlQgOAlAAArQAAAqAOAlQANAjAZAcQAVAaAdANQAeAPAfAAQAjAAAcgPQAcgNAYgaQAYgcANgjQAOglAAgqQAAgrgOglQgNglgYgcgA2SsyQBYgHBCAYQBDAZAsAtQArAtAWA8QAWA7AABAQgBA/gXA8QgWA9gsAvQgrAvhCAcQhCAchXgCIAABoIi2AAIAArvgAszsYIAAGzIC2AAIAAm6IC3AAIAAMGIi3AAIAAiTIi2AAIAAByIi3AAIAAregA2TlWQAygEAlgYQAlgZAVghQAVgiACgmQADgmgRghQgQgggngVQgmgVg+ACgAlhBhIgEAXQgEAXgFAmQgGAmgEAvQgEAwgCAyQgCAxAEAwQADAvAMAmQALAlAUAXQAUAWAhgBQAeAAAVgRQAVgRAOgbQAPgcAIgkQAIgkADgnQAFgygBg1QgCg1gDgwQgEgwgEgoQgGgngEgXIC0gdQAEAaAGAsQAGAsAFA1QAEA2ABA8QABA8gGA8QgHBHgSBBQgSBCgjAyQgjAyg2AfQg2AfhNAAQhLACgzgfQgzggggg0Qggg0gQhCQgQhDgFhHQgEhGAChDQAChDAGg1QAGg1AFghQAGggAAgCgAv3A/IAAGzIC2AAIAAm6IC3AAIAAMGIi3AAIAAiTIi2AAIAAByIi3AAIAAregAQ8DUIAAI6Ii3AAIAAo7IicgBIABi4IHVADIgCC4gABkL6IAAqTIC2AAIDfFnIAAl2IC2AAIAAK7Ii2AAIjfk8IAAEjg");
	this.shape_2.setTransform(0,0.025);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.lf(["#FBE741","#F6A726"],[0,1],134.2,-38.5,134.2,127.4).s().p("AkKF4IAAruIC2AAQBXgHBCAYQBDAZAsAtQArAtAWA8QAWA8AAA/QgBA+gXA8QgWA9gsAvQgrAwhCAcQhCAbhWgCIAABogAhWjHIABEsQAygEAkgYQAlgYAVgiQAVggACgnQADgmgRggQgQgggngVQgigUg5AAIgIAAg");
	this.shape_3.setTransform(-134.1994,-44.429);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AwOM+IAAiTIi2AAIAAByIi3AAIAAreIC3AAIAAGzIC2AAIAAm6IC3AAIAAMGgApfMMQg0ggggg0Qgfg0gRhCQgQhDgEhHQgFhGAChDQAChDAGg1QAGg1AGghIAFgiICzAiIgDAXQgFAXgFAmQgGAmgEAvQgEAwgCAyQgCAxAEAwQADAvAMAmQALAlAUAXQAUAWAhgBQAeAAAVgRQAVgRAPgbQAOgcAIgkQAIgkAEgnQAEgygBg1IgFhlIgIhYIgKg+IC0gdQAFAaAGAsQAGAsAFA1QAEA2ABA8QABA8gGA8QgHBHgTBBQgSBCgjAyQgjAyg2AfQg2AfhNAAIgJAAQhFAAgvgdgAEsMTIjfk8IAAEjIi1AAIAAqTIC1AAIDfFnIAAl2IC2AAIAAK7gAK4MOIAAo7IidgBIACi4IHUADIgBC4IiBgBIAAI6gAtJgZIAAiTIi3AAIAAByIi3AAIAAreIC3AAIAAGzIC3AAIAAm6IC2AAIAAMGgAOXheQg/gggxg3QgvgzgahEQgbhEABhMQgBhPAbhEQAahDAvg0QAxg3A/gfQBAgeBJAAQBLAAA/AeQBAAfAyA3QAtA0AZBDQAaBEAABPQAABMgaBEQgZBEgtAzQgyA3hAAgQg/AehLAAQhJAAhAgegAPipzQgdAOgVAYQgZAcgNAlQgPAlAAArQAAAqAPAlQANAjAZAcQAVAaAdANQAeAPAfAAQAjAAAbgPQAdgNAYgaQAYgcAMgjQAOglABgqQgBgrgOglQgMglgYgcQgYgYgdgOQgbgPgjAAQgfAAgeAPgAllheQg/gggyg3QgtgzgbhEQgahEAAhMQAAhPAahEQAbhDAtg0QAyg3A/gfQBAgeBJAAQBLAAA/AeQBAAfAxA3QAtA0AaBDQAZBEAABPQAABMgZBEQgaBEgtAzQgxA3hAAgQg/AehLAAQhJAAhAgegAkZpzQgeAOgVAYQgZAcgNAlQgOAlAAArQAAAqAOAlQANAjAZAcQAVAaAeANQAcAPAhAAQAiAAAcgPQAcgNAYgaQAYgcANgjQAOglAAgqQAAgrgOglQgNglgYgcQgYgYgcgOQgcgPgiAAQghAAgcAPgAFUhJIAAo7IibgBIABi4IHUADIgBC4IiCgBIAAI6g");
	this.shape_4.setTransform(20.5,0.025);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_4},{t:this.shape_3},{t:this.shape_2}]}).wait(1));

	// Layer_6
	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("#5C1E5C").ss(12,1,1).p("ALYqDIAAI6Ii2AAIAAo7IicgBIABi4IHUADIgBC4gABipNQgXgYgdgOQgcgPgiAAQggAAgdAPQgdAOgVAYQgZAcgNAlQgOAlAAArQAAAqAOAlQANAjAZAcQAVAaAdANQAdAPAgAAQAiAAAcgPQAdgNAXgaQAYgcANgjQAOglAAgqQAAgrgOglQgNglgYgcgAgPs6QBKAAA/AeQBBAfAxA3QAuA0AZBDQAZBEAABPQAABMgZBEQgZBEguAzQgxA3hBAgQg/AehKAAQhJAAhAgeQhAgggxg3QgtgzgbhEQgahEAAhMQAAhPAahEQAbhDAtg0QAxg3BAgfQBAgeBJAAgAVfpNQgYgYgcgOQgcgPgjAAQgfAAgeAPQgdAOgVAYQgZAcgNAlQgOAlAAArQAAAqAOAlQANAjAZAcQAVAaAdANQAeAPAfAAQAjAAAcgPQAcgNAYgaQAYgcANgjQAOglAAgqQAAgrgOglQgNglgYgcgATts6QBLAAA/AeQBBAfAxA3QAtA0AaBDQAZBEAABPQAABMgZBEQgaBEgtAzQgxA3hBAgQg/AehLAAQhJAAhAgeQg/gggxg3QgugzgbhEQgahEAAhMQAAhPAahEQAbhDAug0QAxg3A/gfQBAgeBJAAgA2SsyQBYgHBCAYQBDAZAsAtQArAtAWA8QAWA7AABAQgBA/gXA8QgWA9gsAvQgrAvhCAcQhCAchXgCIAABoIi2AAIAArvgAszsYIAAGzIC2AAIAAm6IC3AAIAAMGIi3AAIAAiTIi2AAIAAByIi3AAIAAregA2TlWQAygEAlgYQAlgZAVghQAVgiACgmQADgmgRghQgQgggngVQgmgVg+ACgAlhBhIgEAXQgEAXgFAmQgGAmgEAvQgEAwgCAyQgCAxAEAwQADAvAMAmQALAlAUAXQAUAWAhgBQAeAAAVgRQAVgRAOgbQAPgcAIgkQAIgkADgnQAFgygBg1QgCg1gDgwQgEgwgEgoQgGgngEgXIC0gdQAEAaAGAsQAGAsAFA1QAEA2ABA8QABA8gGA8QgHBHgSBBQgSBCgjAyQgjAyg2AfQg2AfhNAAQhLACgzgfQgzggggg0Qggg0gQhCQgQhDgFhHQgEhGAChDQAChDAGg1QAGg1AFghQAGggAAgCgAv3A/IAAGzIC2AAIAAm6IC3AAIAAMGIi3AAIAAiTIi2AAIAAByIi3AAIAAregAQ8DUIAAI6Ii3AAIAAo7IicgBIABi4IHVADIgCC4gABkL6IAAqTIC2AAIDfFnIAAl2IC2AAIAAK7Ii2AAIjfk8IAAEjg");
	this.shape_5.setTransform(0,0.025);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFFFF").s().p("AtBM+IAAiTIi2AAIAAByIi3AAIAAreIC3AAIAAGzIC2AAIAAm6IC3AAIAAMGgAmSMMQg0ggggg0Qgfg0gRhCQgQhDgEhHQgFhGAChDQAChDAGg1QAGg1AGghIAFgiICzAiIgDAXQgFAXgFAmQgGAmgEAvQgEAwgCAyQgCAxAEAwQADAvAMAmQALAlAUAXQAUAWAhgBQAeAAAVgRQAVgRAPgbQAOgcAIgkQAIgkAEgnQAEgygBg1IgFhlIgIhYIgKg+IC0gdQAEAaAGAsQAGAsAFA1QAEA2ABA8QABA8gGA8QgHBHgSBBQgSBCgjAyQgjAyg2AfQg2AfhNAAIgJAAQhFAAgvgdgAH5MTIjfk8IAAEjIi2AAIAAqTIC2AAIDfFnIAAl2IC2AAIAAK7gAOFMOIAAo7IidgBIACi4IHUADIgBC4IiBgBIAAI6gAp8gZIAAiTIi3AAIAAByIi3AAIAAreIC3AAIAAGzIC3AAIAAm6IC2AAIAAMGgARkheQg/gggxg3QgvgzgahEQgbhEABhMQgBhPAbhEQAahDAvg0QAxg3A/gfQBAgeBJAAQBLAAA/AeQBAAfAyA3QAtA0AZBDQAaBEAABPQAABMgaBEQgZBEgtAzQgyA3hAAgQg/AehLAAQhJAAhAgegASvpzQgdAOgVAYQgZAcgNAlQgPAlAAArQAAAqAPAlQANAjAZAcQAVAaAdANQAeAPAfAAQAjAAAbgPQAdgNAYgaQAYgcAMgjQAOglABgqQgBgrgOglQgMglgYgcQgYgYgdgOQgbgPgjAAQgfAAgeAPgAiYheQg/gggyg3QgtgzgbhEQgahEAAhMQAAhPAahEQAbhDAtg0QAyg3A/gfQBAgeBJAAQBKAAA/AeQBAAfAyA3QAtA0AaBDQAZBEAABPQAABMgZBEQgaBEgtAzQgyA3hAAgQg/AehKAAQhJAAhAgegAhMpzQgeAOgVAYQgZAcgNAlQgOAlAAArQAAAqAOAlQANAjAZAcQAVAaAeANQAcAPAhAAQAhAAAcgPQAcgNAYgaQAYgcANgjQAOglAAgqQAAgrgOglQgNglgYgcQgYgYgcgOQgcgPghAAQghAAgcAPgA5IhDIAArvIC2AAQBYgHBCAYQBDAZAsAtQArAtAXA8QAVA7AABAQAAA/gYA8QgWA9gsAvQgrAvhCAcQhCAchXgCIAABogA2UqDIABEtQAzgEAlgYQAkgZAVghQAVgiADgmQACgmgRghQgQgggmgVQgkgTg5AAIgIAAgAIhhJIAAo7IibgBIABi4IHUADIgBC4IiCgBIAAI6g");
	this.shape_6.setTransform(0,0.025);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_6},{t:this.shape_5}]}).wait(1));

	// Layer_4
	this.chipmunk = new lib.chipmunk_1();
	this.chipmunk.name = "chipmunk";
	this.chipmunk.setTransform(-83.8,6.5);

	this.timeline.addTween(cjs.Tween.get(this.chipmunk).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.title_2, new cjs.Rectangle(-166.9,-233,333.8,322), null);


(lib.timer_bar = function(mode,startPosition,loop,reversed) {
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
	this.instance = new lib.mc_dummy();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.timer_bar, new cjs.Rectangle(0,0,0,0), null);


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
	this.logo.setTransform(221.5,151.15,1,1,0,0,0,0,-67.8);

	this.b_help = new lib.b_help();
	this.b_help.name = "b_help";
	this.b_help.setTransform(67.05,375,1,1,0,0,0,30,60);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(212,376,1,1,0,0,0,110,60);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_play},{t:this.b_help},{t:this.logo}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_title, new cjs.Rectangle(37.1,-14,351.29999999999995,390), null);


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
	this.header.setTransform(260,0);

	this.b_replay = new lib.b_replay();
	this.b_replay.name = "b_replay";
	this.b_replay.setTransform(196,327,1,1,0,0,0,110,60);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(196,392,1,1,0,0,0,110,60);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_play},{t:this.b_replay},{t:this.header},{t:this.result_block}]}).wait(1));

	// Layer_2
	this.chipmunk = new lib.chipmunk_1();
	this.chipmunk.name = "chipmunk";
	this.chipmunk.setTransform(345.75,401.25,1,1,0,0,0,67.5,-11);

	this.timeline.addTween(cjs.Tween.get(this.chipmunk).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_recap, new cjs.Rectangle(0.8,2,465,420.3), null);


(lib.scene_levels = function(mode,startPosition,loop,reversed) {
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
	this.b_reset = new lib.b_reset();
	this.b_reset.name = "b_reset";
	this.b_reset.setTransform(394,384,1,1,0,0,0,200,50);

	this.header = new lib.scene_header();
	this.header.name = "header";
	this.header.setTransform(197,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.header},{t:this.b_reset}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_levels, new cjs.Rectangle(43.8,2,349.2,381), null);


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

}).prototype = getMCSymbolPrototype(lib.scene_instructions, new cjs.Rectangle(10,2,490,486), null);


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
	this.ready = new lib.mc_ready();
	this.ready.name = "ready";
	this.ready.setTransform(198.75,191);

	this.level_tag = new lib.level_tag();
	this.level_tag.name = "level_tag";
	this.level_tag.setTransform(400.15,0.4,1,1,0,0,0,31.2,-46.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.level_tag},{t:this.ready}]}).wait(1));

	// ui
	this.game_time = new lib.game_time();
	this.game_time.name = "game_time";
	this.game_time.setTransform(134,337.65);

	this.game_prog = new lib.game_prog();
	this.game_prog.name = "game_prog";
	this.game_prog.setTransform(13.05,337.65);

	this.header = new lib.scene_header();
	this.header.name = "header";
	this.header.setTransform(213,0);

	this.timer_bar = new lib.timer_bar();
	this.timer_bar.name = "timer_bar";
	this.timer_bar.setTransform(150,17.55);

	this.image_2 = new lib.mc_dummy();
	this.image_2.name = "image_2";
	this.image_2.setTransform(256,180);

	this.image_1 = new lib.mc_dummy();
	this.image_1.name = "image_1";
	this.image_1.setTransform(91.05,180);

	this.b_home = new lib.b_home();
	this.b_home.name = "b_home";
	this.b_home.setTransform(388.75,388.05,1,1,0,0,0,58,50);

	this.b_restart = new lib.b_resetlevel();
	this.b_restart.name = "b_restart";
	this.b_restart.setTransform(324,388.05,1,1,0,0,0,58,50);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_restart},{t:this.b_home},{t:this.image_1},{t:this.image_2},{t:this.timer_bar},{t:this.header},{t:this.game_prog},{t:this.game_time}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_game, new cjs.Rectangle(8.1,0.5,392,386.6), null);


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


(lib.button_level = function(mode,startPosition,loop,reversed) {
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
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// lock
	this.lock = new lib.mc_lock();
	this.lock.name = "lock";
	this.lock.setTransform(2,0,0.6,0.6);

	this.timeline.addTween(cjs.Tween.get(this.lock).wait(2));

	// Layer_6
	this.txt = new cjs.Text("2", "50px 'Alphakind'", "#AC540D");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 62;
	this.txt.lineWidth = 35;
	this.txt.parent = this;
	this.txt.setTransform(0,-31.5);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(2));

	// panel
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(255,255,153,0.498)").s().p("Ag0A1QgWgWAAgfQAAgeAWgWQAWgWAeAAQAfAAAWAWQAWAWAAAeQAAAfgWAWQgWAWgfAAQgeAAgWgWg");
	this.shape.setTransform(27.5825,22.0928,0.45,0.45);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(255,255,153,0.498)").s().p("AhHBJQgfgfAAgqQAAgpAfgfQAegeApAAQAqAAAfAeQAdAfABApQgBAqgdAfQgfAegqAAQgpAAgegeg");
	this.shape_1.setTransform(18.4658,26.2564,0.5268,0.5268);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.498)").s().p("AhHBIQgegdAAgrQAAgpAegfQAdgdAqAAQArAAAeAdQAdAfAAApQAAArgdAdQgeAegrABQgqgBgdgeg");
	this.shape_2.setTransform(-15.7014,-27.5053,0.5268,0.5268);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(255,255,255,0.498)").s().p("Ag/BAQgagaAAgmQAAglAagaQAagaAlAAQAlAAAaAaQAbAaAAAlQAAAmgbAaQgaAaglAAQglAAgagag");
	this.shape_3.setTransform(-23.0392,-19.5294,0.45,0.45);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.lf(["rgba(247,247,247,0.498)","rgba(251,239,67,0.498)"],[0,1],-0.1,41.8,-0.1,-41.9).s().p("AsCGjIgGilIGopTIEzhNILPEfIBnD5IgHEtg");
	this.shape_4.setTransform(0.1781,-17.1982,0.45,0.45);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.rf(["#FCF045","#F48F1C"],[0,1],-5.9,-5.4,0,-5.9,-5.4,92.4).s().p("AlCLuIm4ntIgOmEIGopVIEzhNILPEfIBnD7IgPJ+IhZB7IoiE3g");
	this.shape_5.setTransform(0.1781,0.2043,0.45,0.45);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.lf(["#EA9316","#EF6A14"],[0,1],0,-45.5,0,45.4).s().p("Ai5GmIj1kRIgIjlIDolHIC8gvIGKCdIA/CbIgIFZIg8BTIkpCpg");
	this.shape_6.setTransform(0.045,0.045,0.8999,0.8999);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.lf(["#EA9316","#EF6A14"],[0,1],0,-40.3,0,40.2).s().p("AihF3Ijbj2IgHjCIDTkqICagnIFnCQIAzB9IgHE+IgtA+IkRCcg");
	this.shape_7.setTransform(0.045,0.0675,0.9,0.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-39.4,-40.9,79,81.9);


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
(lib.photo_hunt = function(mode,startPosition,loop,reversed) {
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

	this.instance_3 = new lib.button_level();
	this.instance_3.setTransform(472,53.95,1,1,0,0,0,0,-0.5);

	this.instance_4 = new lib.scene_levels();
	this.instance_4.setTransform(385,247.6,1,1,0,0,0,385,247.6);

	this.instance_5 = new lib.scene_instructions();

	this.instance_6 = new lib.checkmark();
	this.instance_6.setTransform(484.9,179.55);

	this.instance_7 = new lib.scene_game();
	this.instance_7.setTransform(383.4,264.4,1,1,0,0,0,383.4,264.4);

	this.instance_8 = new lib.scene_recap();
	this.instance_8.setTransform(387.3,329.6,1,1,0,0,0,387.3,329.6);

	this.instance_9 = new lib.font_loader();
	this.instance_9.setTransform(1035.6,451.05,1,1,0,0,0,211,66.2);

	this.instance_10 = new lib.popup_pause();
	this.instance_10.setTransform(1001.9,104.2,1,1,0,0,0,3.5,10.2);

	this.instance_11 = new lib.popup_confirm();
	this.instance_11.setTransform(382.9,257.4,1,1,0,0,0,382.9,257.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_2},{t:this.instance_1}]}).to({state:[{t:this.instance_4},{t:this.instance_3}]},1).to({state:[{t:this.instance_5}]},1).to({state:[{t:this.instance_7,p:{regX:383.4,regY:264.4,x:383.4,y:264.4}},{t:this.instance_6}]},1).to({state:[{t:this.instance_8}]},1).to({state:[{t:this.instance_7,p:{regX:384,regY:256,x:384,y:256}}]},1).to({state:[{t:this.instance_10},{t:this.instance_9}]},1).to({state:[{t:this.instance_11}]},1).to({state:[]},1).to({state:[]},3).wait(10));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(0,-57,1461.9,826);
// library properties:
lib.properties = {
	id: '35A5558F002BB0439538A2940A14BBA4',
	width: 400,
	height: 400,
	fps: 30,
	color: "#993399",
	opacity: 1.00,
	manifest: [
		{src:"media/images/chipmunk.png", id:"chipmunk"},
		{src:"media/images/chipmunk_sm.png", id:"chipmunk_sm"},
		{src:"media/images/timer_sm.png", id:"timer_sm"}
	],
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