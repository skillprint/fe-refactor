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



(lib.icon_air = function() {
	this.initialize(img.icon_air);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,128,128);


(lib.icon_earth = function() {
	this.initialize(img.icon_earth);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,128,128);


(lib.icon_fire = function() {
	this.initialize(img.icon_fire);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,128,128);


(lib.icon_water = function() {
	this.initialize(img.icon_water);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,128,128);// helper functions:

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
	this.txt = new cjs.Text("YOU WON IN 6 MOVES!", "bold 16px 'Arial'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 16;
	this.txt.lineWidth = 376;
	this.txt.parent = this;
	this.txt.setTransform(0,2);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.txt_instructions, new cjs.Rectangle(-190,0,380,21.9), null);


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


(lib.triangle_2 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.f().s("#CE00F6").ss(8).p("AAAT9MAXagoiMguzAAAg");
	this.shape.setTransform(0,42.25,1,1,0,0,0,0,-3);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.triangle_2, new cjs.Rectangle(-156.7,-90.5,313.4,271.5), null);


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
	this.txt = new cjs.Text("PLAY AGAIN", "30px 'Nova Oval'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 36;
	this.txt.lineWidth = 223;
	this.txt.parent = this;
	this.txt.setTransform(-0.05,7);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_header, new cjs.Rectangle(-113.5,5,227,40.8), null);


(lib.portrait_found = function(mode,startPosition,loop,reversed) {
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
	this.txt_found = new cjs.Text("5 of 100 FOUND", "12px 'Nova Oval'", "#FFFFFF");
	this.txt_found.name = "txt_found";
	this.txt_found.textAlign = "right";
	this.txt_found.lineHeight = 14;
	this.txt_found.lineWidth = 154;
	this.txt_found.parent = this;
	this.txt_found.setTransform(155.75,2);

	this.timeline.addTween(cjs.Tween.get(this.txt_found).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.portrait_found, new cjs.Rectangle(0,0,157.8,19.6), null);


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
p.nominalBounds = new cjs.Rectangle(-6,-6,12,12);


(lib.magic_circle_icon = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.f("rgba(206,0,246,0.498)").s().p("AjRDSQhXhXAAh7QAAh6BXhXQBXhXB6AAQB7AABXBXQBXBXAAB6QAAB7hXBXQhXBXh7AAQh6AAhXhXgAC9C9QATgTAOgVIm7AAQAOAVATATQBOBOBuAAQBvAABOhOgAi8i8QhOBOAABuQAABFAeA5IDjmIQhoAEhLBKgADtB9QAeg5AAhEQAAhuhOhOQhKhKhogEgADHB3IjGlXIjGFXIGMAAgAhKBKIAAAAQgegeAAgsQAAgqAegfIAAAAQAfgfArAAQArAAAfAfIAAAAQAfAeAAArQAAAsgfAeIAAAAQgfAfgrAAQgrAAgfgfgAg0gzQgXAVAAAeQAAAfAXAWIAAAAIAAAAQAVAWAfAAQAfAAAWgWIAAAAQAWgWAAgfQAAgegWgVIAAgBQgWgWgfAAQgfAAgVAWIAAAAg");
	this.shape.setTransform(0,-0.025);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.magic_circle_icon, new cjs.Rectangle(-29.7,-29.7,59.4,59.4), null);


(lib.logo = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.lf(["#CCFF66","#FFFFFF"],[0,1],0,-29.1,0,29.1).s().p("AbNEjIAAjQQgvA1hFAAQheAAg7hLQgogzgDhFIgBgNQAAhUAtg6QAkgxAvgbIAEAAIAbA2QggAWgUAdQghAygBA/IABANQADA4AhAkQAkApAzAAQAxAAAignQAggkABgxIAAjPIBFghIADAAIAAIkIhFAhgASKEjIgcg2QBBgfAghAQAZgwAAheQAAgggDgbQgFgzgRgfQgohPhEAAQhDAAgoBPQgQAfgGAzQgDAbAAAgIAAECIhFAhIgEAAIAAkjQAAgggDgbQgGgzgQgfQgphPhDAAQhEAAgnBPQgQAfgGAzQgDAbAAAgQgBBeAaAwQAgBABBAfIgcA2IgEAAQhPgbgxhdQgkhCABhpQAAgfADgcQAHhCAZgtQA8hxBuAAQBsAAA+BuQA9huBrAAQBuAAA9BxQAZAtAIBCQACAcAAAfQABBpgkBCQgxBdhQAbgAiCEjIgbg2QBAgfAhhAQAUgoADhHIkAAAIAADjIhGAhIgEAAIAAokIBGghIAEAAIAAEEIEAAAIgCgdQgFgzgQgfQghhAhAgfIAbg2IADAAQBQAbAxBdQAYAuAHBBQADAcABAfQgBBpgiBCQgxBdhQAbgA4hEjIgbg2QBBgfAghAQAVgoADhHIkJAAIAADjIhFAhIgEAAIAAkjQABgfADgcQAHhCAZgtQA9hxBtAAQBtAAA+BxQAYAtAIBCQADAcAAAfQAABpgjBCQgxBdhQAbgA6yiNQgRAfgFAzIgDAdIEIAAIgCgdQgGgzgQgfQgohPhEAAQhEAAgnBPgAtSCrQgjhAAAhrQAAgfADgcQAIhCAYgtQA+hxBtAAQBtAAA+BxIg8AdIgDAAQgohPhEAAQhEAAgoBPQgQAfgFAzQgEAbAAAgQAABeAZAwQAoBPBEAAQBEAAAohPIBTgnIAFAAQgIAjgRAhQg+BxhtAAQhtAAg+hxgAD5EUQhbABAAhPIAAjGQAAgfADgcQAHhCAZgtQA9hxBtAAIBjAAIAAAEIgcA7IhHAAQhEAAgnBPQgRAfgFAzIgDAdIDQAAIAAADIgbA6Ii2AAIAACnQAAAQATAAICQAAQArAAALgrIAEAAIA3AaQgWBPhbAAgAydEUQhcABAAhPIAAnHIBGghIADAAIAAHoQAAAQATAAIB+AAQArAAALgrIAEAAIA3AaQgWBPhbAAg");
	this.shape.setTransform(0,-0.1);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#B300B3").ss(4).p("AD5EVQhbAAAAhPIAAjGQAAgfADgdQAHhBAZgtQA9hxBtAAIBjAAIAAAEIgcA6IhHAAQhEAAgnBPQgQAggGAyQgBAOgBAQIDQAAIAAADIgcA6Ii1AAIAACnQAAAQASAAICRAAQArAAALgqIADAAIA3AaQgWBPhaAAgAlvEjIAAokIBGghIADAAIAAEEIEBAAQgBgQgBgOQgGgygQggQggg/hBgfIAcg2IADAAQBQAbAxBdQAYAuAIBAQADAdAAAfQAABpgjBCQgxBdhQAbIgDAAIgcg2QBBgfAgg/QAVgpADhHIkBAAIAADjIhFAhgAOWEjIAAkjQAAgggDgcQgGgygQggQgohPhEAAQhEAAgnBPQgQAggGAyQgDAcAAAgQAABeAZAxQAgA/BBAfIgcA2IgDAAQhQgbgxhdQgjhCAAhpQAAgfADgdQAHhBAZgtQA9hxBtAAQBsAAA+BuQA9huBsAAQBtAAA+BxQAYAtAIBBQADAdAAAfQAABpgjBCQgyBdhPAbIgEAAIgcg2QBBgfAhg/QAYgxAAheQAAgggDgcQgFgygQggQgohPhEAAQhEAAgoBPQgQAggFAyQgEAcAAAgIAAECIhFAhgAbNEjIAAjQQguA1hGAAQheAAg7hLQgogzgDhGQAAgGAAgGQAAhUAsg6QAlgxAugbIAEAAIAbA2QggAWgTAcQgiAzAAA/QAAAGAAAGQADA5AhAkQAkApAzAAQAyAAAhgmQAhglAAgxIAAjPIBFghIAEAAIAAIkIhGAhgA8VEjIAAkjQAAgfAEgdQAHhBAYgtQA+hxBtAAQBtAAA+BxQAYAtAIBBQADAdAAAfQAABpgjBCQgyBdhPAbIgEAAIgbg2QBBgfAgg/QAUgpAEhHIkJAAIAADjIhFAhgA7LgeIEIAAQgBgQgBgOQgGgygQggQgohPhEAAQhEAAgoBPQgQAggFAyQgCAOgBAQgAnkBnQgHAjgSAhQg9BxhuAAQhtAAg9hxQgjhAAAhrQAAgfADgdQAHhBAZgtQA9hxBtAAQBuAAA9BxIg7AcIgEAAQgnhPhFAAQhDAAgoBPQgQAggGAyQgDAcAAAgQAABeAZAxQAoBPBDAAQBEAAAohPIBUgogAydEVQhcAAAAhPIAAnHIBGghIADAAIAAHoQAAAQATAAIB+AAQArAAALgqIAEAAIA3AaQgWBPhbAAg");
	this.shape_1.setTransform(0,-0.1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFFFF").s().p("AbNEjIAAjQQgvA1hFAAQheAAg7hLQgogzgDhFIgBgNQAAhUAtg6QAkgxAvgbIAEAAIAbA2QggAWgUAdQghAygBA/IABANQADA4AhAkQAkApAzAAQAxAAAignQAggkABgxIAAjPIBFghIADAAIAAIkIhFAhgASKEjIgcg2QBBgfAghAQAZgwAAheQAAgggDgbQgFgzgRgfQgohPhEAAQhDAAgoBPQgQAfgGAzQgDAbAAAgIAAECIhFAhIgEAAIAAkjQAAgggDgbQgGgzgQgfQgphPhDAAQhEAAgnBPQgQAfgGAzQgDAbAAAgQgBBeAaAwQAgBABBAfIgcA2IgEAAQhPgbgxhdQgkhCABhpQAAgfADgcQAHhCAZgtQA8hxBuAAQBsAAA+BuQA9huBrAAQBuAAA9BxQAZAtAIBCQACAcAAAfQABBpgkBCQgxBdhQAbgAiCEjIgbg2QBAgfAhhAQAUgoADhHIkAAAIAADjIhGAhIgEAAIAAokIBGghIAEAAIAAEEIEAAAIgCgdQgFgzgQgfQghhAhAgfIAbg2IADAAQBQAbAxBdQAYAuAHBBQADAcABAfQgBBpgiBCQgxBdhQAbgA4hEjIgbg2QBBgfAghAQAVgoADhHIkJAAIAADjIhFAhIgEAAIAAkjQABgfADgcQAHhCAZgtQA9hxBtAAQBtAAA+BxQAYAtAIBCQADAcAAAfQAABpgjBCQgxBdhQAbgA6yiNQgRAfgFAzIgDAdIEIAAIgCgdQgGgzgQgfQgohPhEAAQhEAAgnBPgAtSCrQgjhAAAhrQAAgfADgcQAIhCAYgtQA+hxBtAAQBtAAA+BxIg8AdIgDAAQgohPhEAAQhEAAgoBPQgQAfgFAzQgEAbAAAgQAABeAZAwQAoBPBEAAQBEAAAohPIBTgnIAFAAQgIAjgRAhQg+BxhtAAQhtAAg+hxgAD5EUQhbABAAhPIAAjGQAAgfADgcQAHhCAZgtQA9hxBtAAIBjAAIAAAEIgcA7IhHAAQhEAAgnBPQgRAfgFAzIgDAdIDQAAIAAADIgbA6Ii2AAIAACnQAAAQATAAICQAAQArAAALgrIAEAAIA3AaQgWBPhbAAgAydEUQhcABAAhPIAAnHIBGghIADAAIAAHoQAAAQATAAIB+AAQArAAALgrIAEAAIA3AaQgWBPhbAAg");
	this.shape_2.setTransform(0,-0.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(1));

	// Layer_3
	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("#FFFFFF").ss(8).p("AD5EVQhbAAAAhPIAAjGQAAgfADgcQAHhCAZgtQA9hxBtAAIBjAAIAAAEIgcA6IhHAAQhEAAgnBQQgQAggGAyQgBAOgBAPIDQAAIAAAEIgcA5Ii1AAIAACnQAAAQASAAICRAAQArAAALgqIADAAIA3AaQgWBPhaAAgAlvEjIAAokIBGghIADAAIAAEEIEBAAQgBgPgBgOQgGgzgQgfQgghAhBgfIAcg2IADAAQBQAbAxBdQAYAuAIBBQADAcAAAfQAABpgjBCQgxBdhQAbIgDAAIgcg2QBBgfAgg/QAVgpADhHIkBAAIAADjIhFAhgAOWEjIAAkjQAAgggDgbQgGgygQggQgohQhEAAQhEAAgnBQQgQAggGAyQgDAbAAAgQAABeAZAxQAgA/BBAfIgcA2IgDAAQhQgbgxhdQgjhCAAhpQAAgfADgcQAHhBAZguQA9hxBtAAQBsAAA+BvQA9hvBsAAQBtAAA+BxQAYAuAIBBQADAcAAAfQAABpgjBCQgyBdhPAbIgEAAIgcg2QBBgfAhg/QAYgxAAheQAAgggDgbQgFgygQggQgohQhEAAQhEAAgoBQQgQAggFAyQgEAbAAAgIAAECIhFAhgAbNEjIAAjQQguA1hGAAQheAAg7hLQgogzgDhFQAAgGAAgHQAAhUAsg6QAlgxAugbIAEAAIAbA2QggAWgTAcQgiAzAAA/QAAAHAAAGQADA5AhAjQAkApAzAAQAyAAAhgmQAhglAAgxIAAjPIBFghIAEAAIAAIkIhGAhgA7LgeIEIAAQgBgPgBgOQgGgygQggQgohQhEAAQhEAAgoBQQgQAggFAyQgCAOgBAPgA8VEjIAAkjQAAgfAEgcQAHhCAYgtQA+hxBtAAQBtAAA+BxQAYAuAIBBQADAcAAAfQAABpgjBCQgyBdhPAbIgEAAIgbg2QBBgfAgg/QAUgpAEhHIkJAAIAADjIhFAhgAnkBnQgHAjgSAhQg9BxhuAAQhtAAg9hxQgjhAAAhrQAAgfADgcQAHhCAZgtQA9hxBtAAQBuAAA9BxIg7AdIgEAAQgnhQhFAAQhDAAgoBQQgQAggGAyQgDAbAAAgQAABeAZAxQAoBPBDAAQBEAAAohPIBUgogAydEVQhcAAAAhPIAAnHIBGghIADAAIAAHoQAAAQATAAIB+AAQArAAALgqIAEAAIA3AaQgWBPhbAAg");
	this.shape_3.setTransform(0,-0.1);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AbNEjIAAjQQgvA1hFAAQheAAg7hLQgogzgDhFIgBgNQAAhUAtg6QAkgxAvgbIAEAAIAbA2QggAWgUAdQghAygBA/IABANQADA4AhAkQAkApAzAAQAxAAAignQAggkABgxIAAjPIBFghIADAAIAAIkIhFAhgASKEjIgcg2QBBgfAghAQAZgwAAheQAAgggDgbQgFgzgRgfQgohPhEAAQhDAAgoBPQgQAfgGAzQgDAbAAAgIAAECIhFAhIgEAAIAAkjQAAgggDgbQgGgzgQgfQgphPhDAAQhEAAgnBPQgQAfgGAzQgDAbAAAgQgBBeAaAwQAgBABBAfIgcA2IgEAAQhPgbgxhdQgkhCABhpQAAgfADgcQAHhCAZgtQA8hxBuAAQBsAAA+BuQA9huBrAAQBuAAA9BxQAZAtAIBCQACAcAAAfQABBpgkBCQgxBdhQAbgAiCEjIgbg2QBAgfAhhAQAUgoADhHIkAAAIAADjIhGAhIgEAAIAAokIBGghIAEAAIAAEEIEAAAIgCgdQgFgzgQgfQghhAhAgfIAbg2IADAAQBQAbAxBdQAYAuAHBBQADAcABAfQgBBpgiBCQgxBdhQAbgA4hEjIgbg2QBBgfAghAQAVgoADhHIkJAAIAADjIhFAhIgEAAIAAkjQABgfADgcQAHhCAZgtQA9hxBtAAQBtAAA+BxQAYAtAIBCQADAcAAAfQAABpgjBCQgxBdhQAbgA6yiNQgRAfgFAzIgDAdIEIAAIgCgdQgGgzgQgfQgohPhEAAQhEAAgnBPgAtSCrQgjhAAAhrQAAgfADgcQAIhCAYgtQA+hxBtAAQBtAAA+BxIg8AdIgDAAQgohPhEAAQhEAAgoBPQgQAfgFAzQgEAbAAAgQAABeAZAwQAoBPBEAAQBEAAAohPIBTgnIAFAAQgIAjgRAhQg+BxhtAAQhtAAg+hxgAD5EUQhbABAAhPIAAjGQAAgfADgcQAHhCAZgtQA9hxBtAAIBjAAIAAAEIgcA7IhHAAQhEAAgnBPQgRAfgFAzIgDAdIDQAAIAAADIgbA6Ii2AAIAACnQAAAQATAAICQAAQArAAALgrIAEAAIA3AaQgWBPhbAAgAydEUQhcABAAhPIAAnHIBGghIADAAIAAHoQAAAQATAAIB+AAQArAAALgrIAEAAIA3AaQgWBPhbAAg");
	this.shape_4.setTransform(0,-0.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_4},{t:this.shape_3}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.logo, new cjs.Rectangle(-185.3,-54.3,370.70000000000005,108.3), null);


(lib.library_scrollpanel = function(mode,startPosition,loop,reversed) {
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
p.nominalBounds = new cjs.Rectangle(0,0,0,0);


(lib.library_fader = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.lf(["#640081","rgba(100,0,129,0)"],[0.349,0.984],0,-25,0,25).s().p("AnzD6IAAnzIPnAAIAAHzg");
	this.shape.setTransform(50,25);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.library_fader, new cjs.Rectangle(0,0,100,50), null);


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
	this.txt = new cjs.Text("Arial Bold", "bold 30px 'Arial'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 34;
	this.txt.lineWidth = 428;
	this.txt.parent = this;
	this.txt.setTransform(216.0012,-115.95);

	this.txt_1 = new cjs.Text("Nova Oval", "30px 'Nova Oval'", "#FFFFFF");
	this.txt_1.name = "txt_1";
	this.txt_1.textAlign = "center";
	this.txt_1.lineHeight = 36;
	this.txt_1.lineWidth = 428;
	this.txt_1.parent = this;
	this.txt_1.setTransform(216.0012,-52.95);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_1},{t:this.txt}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.font_loader, new cjs.Rectangle(0,-117.9,432,114.4), null);


(lib.icon = function(mode,startPosition,loop,reversed) {
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
		///* this.stop();*/
	}
	this.frame_1 = function() {
		///* this.stop();*/
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(0,0,0,0.298)").s().p("AjiDiQhdheAAiEQAAiDBdheQBeheCEAAQCFAABdBeQBeBeAACDQAACEheBeQhdBeiFAAQiEAAheheg");

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("rgba(255,255,255,0.498)").ss(2,1,1).p("AAAk/QCFAABdBeQBeBdAACEQAACFheBdQhdBeiFAAQiEAAhdheQhehdAAiFQAAiEBehdQBdheCEAAg");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape},{t:this.shape_1}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-33,-33,66,66);


(lib.header_library = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_4
	this.txt_found = new cjs.Text("5 / 100", "12px 'Nova Oval'", "#FFFFFF");
	this.txt_found.name = "txt_found";
	this.txt_found.textAlign = "center";
	this.txt_found.lineHeight = 14;
	this.txt_found.lineWidth = 172;
	this.txt_found.parent = this;
	this.txt_found.setTransform(0,25.75);

	this.txt = new cjs.Text("LIBRARY", "12px 'Nova Oval'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 14;
	this.txt.lineWidth = 94;
	this.txt.parent = this;
	this.txt.setTransform(-0.45,6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt},{t:this.txt_found}]}).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.lf(["rgba(0,0,0,0.8)","rgba(0,0,0,0.2)"],[0,1],30,-12,30,14).s().p("AoHB4QhQAAAAhQIAAifISvAAIAACfQAABQhQAAg");
	this.shape.setTransform(0,12);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.header_library, new cjs.Rectangle(-88,0,176,43.4), null);


(lib.header_builder = function(mode,startPosition,loop,reversed) {
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
	this.txt = new cjs.Text("WORKSPACE", "12px 'Nova Oval'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 14;
	this.txt.lineWidth = 113;
	this.txt.parent = this;
	this.txt.setTransform(0,6);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.lf(["rgba(0,0,0,0.8)","rgba(0,0,0,0.2)"],[0,1],30,-12,30,14).s().p("AoHB4QhQAAAAhQIAAifISvAAIAACfQAABQhQAAg");
	this.shape.setTransform(0,12);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.header_builder, new cjs.Rectangle(-60,0,120,24), null);


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
	this.txt = new cjs.Text(" PLAYING", "28px 'Nova Oval'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 34;
	this.txt.lineWidth = 179;
	this.txt.parent = this;
	this.txt.setTransform(102.5,14);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(2));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(2,1,1).p("AuXkDIf3AAIAAE/QAABTg6A7Qg7A6hTAAI/3AAIAAk/QAAhTA6g7QA7g6BTAAg");
	this.shape_1.setTransform(116,29.9992);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#058C24","#8AD626"],[0,1],-112,0,112,0).s().p("AxfEEIAAk/QAAhTA7g7QA6g6BTAAIf3AAIAAE/QAABTg6A6Qg7A7hTAAg");
	this.shape_2.setTransform(116,29.9992);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(3,3,226,54);


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
	this.txt = new cjs.Text("?", "bold 30px 'Arial'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 34;
	this.txt.lineWidth = 26;
	this.txt.parent = this;
	this.txt.setTransform(29,13.6);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(2));

	// Layer_8
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(2,1,1).p("Ag7kDIE/AAIAAE/QAABTg6A7Qg7A6hTAAIk/AAIAAk/QAAhTA6g7QA7g6BTAAg");
	this.shape.setTransform(30,29.9992);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#058C24","#8AD626"],[0,1],-26,0,26,0).s().p("AkDEEIAAk/QAAhTA7g7QA6g6BTAAIE/AAIAAE/QAABTg6A6Qg7A7hTAAg");
	this.shape_1.setTransform(30,29.9992);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(3,3,54,54);


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
	this.txt = new cjs.Text("RESET PROGRESS", "bold 14px 'Arial'", "#4C4C4C");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 18;
	this.txt.lineWidth = 145;
	this.txt.parent = this;
	this.txt.setTransform(-0.6,11.8);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#999999").ss(2,1,1).p("AprifITXAAQBCAAAvAvQAvAvAABBQAABCgvAvQgvAvhCAAIzXAAQhCAAgvgvQgvgvAAhCQAAhBAvgvQAvgvBCAAg");
	this.shape.setTransform(-0.0071,20,0.9999,1);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FFFFFF","#999999"],[0,1],-45.9,-16,-45.9,48).s().p("AprCgQhCAAgvgvQgvgvAAhCQAAhBAvgvQAvgvBCAAITXAAQBCAAAvAvQAvAvAABBQAABCgvAvQgvAvhCAAg");
	this.shape_1.setTransform(-0.0071,20,0.9999,1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FFFFFF","#999999"],[0,1],-50,-20,-50,44).s().p("ApsDIQhTAAg6g6Qg7g7AAhTQAAhSA7g7QA6g6BTAAITZAAQBTAAA6A6QA7A7AABSQAABTg7A7Qg6A6hTAAg");
	this.shape_2.setTransform(-0.0095,20,0.9987,1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_reset, new cjs.Rectangle(-82,0,164,40), null);


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

}).prototype = getMCSymbolPrototype(lib.b_home, new cjs.Rectangle(0,0,58,50), null);


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

	// Layer_3
	this.instance = new lib.icon_water();
	this.instance.setTransform(80.7,20.05,0.2916,0.2916);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(2).p("AGnAAQAACvh9B8Qh7B8ivAAQiuAAh8h8Qh8h8AAivQAAiuB8h8QB8h8CuAAQCvAAB7B8QB9B8AACug");
	this.shape.setTransform(99.3335,38.8759,0.6039,0.6039);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(0,0,0,0.498)").s().p("AkqEqQh7h7AAivQAAiuB7h8QB8h8CuAAQCvAAB7B8QB8B8ABCuQgBCvh8B7Qh7B9ivgBQiuABh8h9g");
	this.shape_1.setTransform(99.3335,38.8759,0.6039,0.6039);

	this.instance_1 = new lib.icon_fire();
	this.instance_1.setTransform(14,20.05,0.2916,0.2916);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#FFFFFF").ss(2).p("AGnAAQAACvh9B8Qh7B8ivAAQiuAAh8h8Qh8h8AAivQAAiuB8h8QB8h8CuAAQCvAAB7B8QB9B8AACug");
	this.shape_2.setTransform(33.0335,38.8759,0.6039,0.6039);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(0,0,0,0.498)").s().p("AkqEqQh7h7AAivQAAiuB7h8QB8h8CuAAQCvAAB7B8QB8B8ABCuQgBCvh8B7Qh7B9ivgBQiuABh8h9g");
	this.shape_3.setTransform(33.0335,38.8759,0.6039,0.6039);

	this.instance_2 = new lib.icon_earth();
	this.instance_2.setTransform(-52.45,20.05,0.2916,0.2916);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#FFFFFF").ss(2).p("AGnAAQAACvh9B8Qh7B8ivAAQiuAAh8h8Qh8h8AAivQAAiuB8h8QB8h8CuAAQCvAAB7B8QB9B8AACug");
	this.shape_4.setTransform(-33.4165,38.8759,0.6039,0.6039);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("rgba(0,0,0,0.498)").s().p("AkqEqQh7h7AAivQAAiuB7h8QB8h8CuAAQCvAAB7B8QB8B8ABCuQgBCvh8B7Qh7B9ivgBQiuABh8h9g");
	this.shape_5.setTransform(-33.4165,38.8759,0.6039,0.6039);

	this.instance_3 = new lib.icon_air();
	this.instance_3.setTransform(-119.1,20.05,0.2916,0.2916);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#FFFFFF").ss(2).p("AGnAAQAACvh9B8Qh7B8ivAAQiuAAh8h8Qh8h8AAivQAAiuB8h8QB8h8CuAAQCvAAB7B8QB9B8AACug");
	this.shape_6.setTransform(-99.9165,38.8759,0.6039,0.6039);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("rgba(0,0,0,0.498)").s().p("AkqEqQh7h7AAivQAAiuB7h8QB8h8CuAAQCvAAB7B8QB8B8ABCuQgBCvh8B7Qh7B9ivgBQiuABh8h9g");
	this.shape_7.setTransform(-99.9165,38.8759,0.6039,0.6039);

	this.instance_4 = new lib.logo();
	this.instance_4.setTransform(0,-66.45,1,1,0,0,0,0,-29.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_4},{t:this.shape_7},{t:this.shape_6},{t:this.instance_3},{t:this.shape_5},{t:this.shape_4},{t:this.instance_2},{t:this.shape_3},{t:this.shape_2},{t:this.instance_1},{t:this.shape_1},{t:this.shape},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.title_2, new cjs.Rectangle(-185.3,-91.6,370.70000000000005,157), null);


(lib.scene_library = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = false; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.found = new lib.portrait_found();
	this.found.name = "found";
	this.found.setTransform(436.55,3.75,1,1,0,0,0,157.8,0);

	this.hdr = new lib.header_library();
	this.hdr.name = "hdr";
	this.hdr.setTransform(202.05,4.65);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.hdr},{t:this.found}]}).wait(1));

	// Layer_3
	this.fader = new lib.library_fader();
	this.fader.name = "fader";
	this.fader.setTransform(49,56);

	this.timeline.addTween(cjs.Tween.get(this.fader).wait(1));

	// ui
	this.scroll_panel = new lib.library_scrollpanel();
	this.scroll_panel.name = "scroll_panel";

	this.timeline.addTween(cjs.Tween.get(this.scroll_panel).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_library, new cjs.Rectangle(49,3.8,387.5,102.2), null);


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

}).prototype = getMCSymbolPrototype(lib.scene_instructions, new cjs.Rectangle(10,5,490,480), null);


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

	// ui
	this.b_home = new lib.b_home();
	this.b_home.name = "b_home";
	this.b_home.setTransform(388.75,388.05,1,1,0,0,0,58,50);

	this.b_restart = new lib.b_resetlevel();
	this.b_restart.name = "b_restart";
	this.b_restart.setTransform(324,388.05,1,1,0,0,0,58,50);

	this.hdr = new lib.header_builder();
	this.hdr.name = "hdr";
	this.hdr.setTransform(207.05,4.65);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.hdr},{t:this.b_restart},{t:this.b_home}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_game, new cjs.Rectangle(147.1,4.7,241.70000000000002,383.40000000000003), null);


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


(lib.mc_tile = function(mode,startPosition,loop,reversed) {
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
	this.icon_dummy = new lib.mc_dummy();
	this.icon_dummy.name = "icon_dummy";

	this.timeline.addTween(cjs.Tween.get(this.icon_dummy).wait(1));

	// Layer_1
	this.txt = new cjs.Text("FIRE", "11px 'Nova Oval'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 15;
	this.txt.lineWidth = 75;
	this.txt.parent = this;
	this.txt.setTransform(0,34.25);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	// Layer_4
	this.spinner_dummy = new lib.magic_circle_icon();
	this.spinner_dummy.name = "spinner_dummy";
	this.spinner_dummy.setTransform(-0.3,0.2);

	this.timeline.addTween(cjs.Tween.get(this.spinner_dummy).wait(1));

	// Layer_2
	this.button = new lib.icon();
	this.button.name = "button";

	this.timeline.addTween(cjs.Tween.get(this.button).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.mc_tile, new cjs.Rectangle(-39.5,-32,79,81.5), null);


(lib.magic_circle = function(mode,startPosition,loop,reversed) {
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
	this.triangle_2 = new lib.triangle_2();
	this.triangle_2.name = "triangle_2";
	this.triangle_2.setTransform(0,0,1,1,180);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#CE00F6").ss(2).p("AKtAIQAAEcjIDJQjJDJkcAAQkbAAjIjJQjIjJAAkcQAAkaDIjHQDIjKEbAAQEcAADJDKQDIDHAAEagAdXAAQAAMKokIoQopIlsKAAQsNAAololQokooAAsKQAAsJIkolQIlooMNAAQMKAAIpIoQIkIlAAMJg");
	this.shape.setTransform(0.075,-0.6);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#CE00F6").ss(8).p("AMmAMQAAFOjrDtQjtDrlOAAQlOAAjsjrQjrjtAAlOQAAlNDrjrQDsjtFOAAQFOAADtDtQDrDrAAFNgAbrAAQAALdoFIJQoJIFrdAAQrgAAoFoFQoFoJAArdQAArcIFoFQIFoILgAAQLdAAIJIIQIFIFAALcg");
	this.shape_1.setTransform(0.075,-0.55);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.triangle_2}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.magic_circle, new cjs.Rectangle(-188.8,-189.5,377.8,377.8), null);


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


(lib.complete_popup = function(mode,startPosition,loop,reversed) {
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
	this.txt_msg = new cjs.Text("FANTASTIC JOB! YOU CREATED ALL 100 ITEMS STARTING WITH JUST 4 ELEMENTS!", "16px 'Nova Oval'", "#FFFFFF");
	this.txt_msg.name = "txt_msg";
	this.txt_msg.textAlign = "center";
	this.txt_msg.lineHeight = 19;
	this.txt_msg.lineWidth = 309;
	this.txt_msg.parent = this;
	this.txt_msg.setTransform(2.55,-0.25);

	this.b_ok = new lib.b_play();
	this.b_ok.name = "b_ok";
	this.b_ok.setTransform(4,71,1,1,0,0,0,116,4);

	this.txt_hdr = new cjs.Text("ALL ITEMS FOUND!", "40px 'Nova Oval'", "#FFFFFF");
	this.txt_hdr.name = "txt_hdr";
	this.txt_hdr.textAlign = "center";
	this.txt_hdr.lineHeight = 48;
	this.txt_hdr.lineWidth = 392;
	this.txt_hdr.parent = this;
	this.txt_hdr.setTransform(0,-49.65);
	this.txt_hdr.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_hdr},{t:this.b_ok},{t:this.txt_msg}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.complete_popup, new cjs.Rectangle(-203,-56.6,410,180.6), null);


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
	this.b_help = new lib.b_help();
	this.b_help.name = "b_help";
	this.b_help.setTransform(57.05,371,1,1,0,0,0,30,56);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(218,372,1,1,0,0,0,116,56);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_play},{t:this.b_help}]}).wait(1));

	// logo
	this.logo = new lib.title_2();
	this.logo.name = "logo";
	this.logo.setTransform(220.5,189.95);

	this.timeline.addTween(cjs.Tween.get(this.logo).wait(1));

	// circle
	this.magic_circle = new lib.magic_circle();
	this.magic_circle.name = "magic_circle";
	this.magic_circle.setTransform(220.1,197.85,0.9,0.9,0,0,0,0,0.1);

	this.timeline.addTween(cjs.Tween.get(this.magic_circle).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_title, new cjs.Rectangle(30.1,27.2,375.79999999999995,345.8), null);


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


(lib.popup_complete = function(mode,startPosition,loop,reversed) {
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
	this.panel = new lib.complete_popup();
	this.panel.name = "panel";
	this.panel.setTransform(200,176);

	this.timeline.addTween(cjs.Tween.get(this.panel).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.popup_complete, new cjs.Rectangle(-3,119.4,410,180.6), null);


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
(lib.alchemy = function(mode,startPosition,loop,reversed) {
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

	this.instance_3 = new lib.popup_complete();
	this.instance_3.setTransform(256,256,1,1,0,0,0,256,256);

	this.instance_4 = new lib.scene_instructions();

	this.instance_5 = new lib.mc_tile();
	this.instance_5.setTransform(478,187.1);

	this.instance_6 = new lib.scene_library();
	this.instance_6.setTransform(618.1,15.1,1,1,0,0,0,206.2,16.8);

	this.instance_7 = new lib.scene_game();
	this.instance_7.setTransform(383.4,264.4,1,1,0,0,0,383.4,264.4);

	this.instance_8 = new lib.font_loader();
	this.instance_8.setTransform(1035.6,451.05,1,1,0,0,0,211,66.2);

	this.instance_9 = new lib.popup_pause();
	this.instance_9.setTransform(1001.9,104.2,1,1,0,0,0,3.5,10.2);

	this.instance_10 = new lib.popup_confirm();
	this.instance_10.setTransform(382.9,257.4,1,1,0,0,0,382.9,257.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_2},{t:this.instance_1}]}).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_4}]},1).to({state:[{t:this.instance_7},{t:this.instance_6},{t:this.instance_5}]},1).to({state:[]},1).to({state:[{t:this.instance_9},{t:this.instance_8}]},2).to({state:[{t:this.instance_10}]},1).to({state:[]},1).to({state:[]},3).wait(10));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1256.6,485);
// library properties:
lib.properties = {
	id: '35A5558F002BB0439538A2940A14BBA4',
	width: 400,
	height: 400,
	fps: 30,
	color: "#A000BF",
	opacity: 1.00,
	manifest: [
		{src:"media/images/icon_air.png", id:"icon_air"},
		{src:"media/images/icon_earth.png", id:"icon_earth"},
		{src:"media/images/icon_fire.png", id:"icon_fire"},
		{src:"media/images/icon_water.png", id:"icon_water"}
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