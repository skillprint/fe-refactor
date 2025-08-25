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
	this.txt = new cjs.Text("YOU WON IN 6 MOVES!", "20px 'Kanit'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 26;
	this.txt.lineWidth = 376;
	this.txt.parent = this;
	this.txt.setTransform(0,2);
	this.txt.shadow = new cjs.Shadow("rgba(153,102,0,1)",0,0,10);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.txt_instructions, new cjs.Rectangle(-201,-11,406,61), null);


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
	this.shape = new cjs.Shape();
	this.shape.graphics.lf(["#000000","#666666"],[0,1],104.4,26.1,104.4,-26.1).s().p("AidD7IAAn1IE7AAIAABWIjbAAIAAB5IDKAAIAABVIjKAAIAADRg");
	this.shape.setTransform(-124.65,75.325);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#000000","#666666"],[0,1],155.9,26,155.9,-26.2).s().p("AiWDRQg4g0AAhiIAAh3QAAhhA4g0QA4gzBeAAQBfAAA3AzQA4A0AABhIAAB3QAABig4A0Qg3A0hfABQhegBg4g0gAhSiRQgdAfAAA0IAAB9QAAAzAdAfQAeAfA0AAQA1AAAdgfQAdgfABgzIAAh9QgBg0gdgfQgdgfg1AAQg0AAgeAfg");
	this.shape_1.setTransform(-180.55,75.35);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#000000","#666666"],[0,1],30.9,26.1,30.9,-26.1).s().p("ABcD7IAAjRIi4AAIAADRIhfAAIAAn1IBfAAIAADPIC4AAIAAjPIBgAAIAAH1g");
	this.shape_2.setTransform(-38.325,75.325);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.lf(["#000000","#666666"],[0,1],-22.4,26.1,-22.4,-26.1).s().p("AB1D7IgbhuIizAAIgcBuIhhAAICEn1ICkAAICFH1gAhDA1ICHAAIg+j0IgMAAg");
	this.shape_3.setTransform(23.475,75.325);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.lf(["#000000","#666666"],[0,1],-76,26.1,-76,-26.1).s().p("AAND7Ihjm1IgNAAIAAG1IhdAAIAAn1IC0AAIBjG0IANAAIAAm0IBdAAIAAH1g");
	this.shape_4.setTransform(85.725,75.325);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.lf(["#000000","#666666"],[0,1],-171.7,26.1,-171.7,-26.1).s().p("AguD7IAAn1IBdAAIAAH1g");
	this.shape_5.setTransform(198.775,75.325);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.lf(["#000000","#666666"],[0,1],-131.2,26,-131.2,-26.2).s().p("AiWDRQg3g0gBhiIAAh3QABhhA3g0QA5gzBdAAQBfAAA3AzQA5A0gBBhIAAB3QABBig5A0Qg3A0hfABQhdgBg5g0gAhRiRQgfAfABA0IAAB9QgBAzAfAfQAfAfAyAAQA1AAAdgfQAegfAAgzIAAh9QAAg0gegfQgdgfg1AAQgyAAgfAfg");
	this.shape_6.setTransform(149.55,75.35);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer_2
	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f().s("#FFFFFF").ss(7,2,0,3).p("AXMEGQheAAg5g1Qg3g0AAhhIAAh4QAAhgA3g0QA5g0BeAAQBfAAA3A0QA4A0AABgIAAB4QAABhg4A0Qg3A1hfAAgAeJD7IAAn1IBfAAIAAH1gAKND7IAAn1IC0AAIBkG0IANAAIAAm0IBdAAIAAH1Ii0AAIhkm1IgNAAIAAG1gAXMCwQA1AAAegfQAdgfAAgzIAAh9QAAg0gdgfQgegfg1AAQgzAAgfAfQgeAfAAA0IAAB9QAAAzAeAfQAfAfAzAAgAAID7ICEn1IClAAICFH1IhiAAIgbhuIi0AAIgcBugACbA1ICIAAIg+j0IgNAAgApGD7IAAn1IBfAAIAADPIC5AAIAAjPIBgAAIAAH1IhgAAIAAjRIi5AAIAADRgA2HD7IAAn1IE8AAIAABWIjdAAIAAB5IDMAAIAABVIjMAAIAADRgA8ZEGQheAAg5g1Qg3g0AAhhIAAh4QAAhgA3g0QA5g0BeAAQBgAAA3A0QA4A0AABgIAAB4QAABhg4A0Qg3A1hgAAgA8ZCwQA2AAAdgfQAdgfAAgzIAAh9QAAg0gdgfQgdgfg2AAQg0AAgeAfQgdAfAAA0IAAB9QAAAzAdAfQAeAfA0AAg");
	this.shape_7.setTransform(1.15,75.35);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#333333").s().p("AU1DRQg3g0gBhiIAAh3QABhhA3g0QA5gzBeAAQBfAAA3AzQA5A0gBBhIAAB3QABBig5A0Qg3A0hfABQhegBg5g0gAV6iRQgfAfABA0IAAB9QgBAzAfAfQAfAfAzAAQA1AAAdgfQAegfAAgzIAAh9QAAg0gegfQgdgfg1AAQgzAAgfAfgA+vDRQg4g0AAhiIAAh3QAAhhA4g0QA4gzBeAAQBgAAA3AzQA4A0AABhIAAB3QAABig4A0Qg3A0hgABQhegBg4g0gA9riRQgdAfAAA0IAAB9QAAAzAdAfQAeAfA0AAQA2AAAdgfQAdgfABgzIAAh9QgBg0gdgfQgdgfg2AAQg0AAgeAfgAeJD7IAAn1IBeAAIAAH1gANbD7Ihkm1IgNAAIAAG1IhdAAIAAn1IC0AAIBkG0IANAAIAAm0IBdAAIAAH1gAFUD7IgbhuIi0AAIgcBuIhhAAICFn1ICkAAICFH1gACbA1ICIAAIg9j0IgOAAgAktD7IAAjSIi6AAIAADSIheAAIAAn1IBeAAIAADPIC6AAIAAjPIBfAAIAAH1gA2HD7IAAn1IE8AAIAABVIjcAAIAAB6IDLAAIAABUIjLAAIAADSg");
	this.shape_8.setTransform(1.15,75.35);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_8},{t:this.shape_7}]}).wait(1));

	// Layer_36
	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.lf(["#5CFFFF","rgba(94,255,255,0.698)","rgba(255,255,255,0)"],[0,0.078,1],0.2,-30.4,0.2,30.7).s().p("AnjEyIAApjQHLBOG1hOIAACUIngAAIAACcIInAAIAAEzg");
	this.shape_9.setTransform(-62.675,-1.675);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.lf(["#5CFFFF","rgba(94,255,255,0.698)","rgba(255,255,255,0)"],[0,0.078,1],0.3,-31.3,0.3,31.7).s().p("AmfCYQiciLgVj6QgDgmAAgnQDeA9DJg9QAAAqAHAjQAOBcAzAtQBGBCCGAAQBUAAA/gUIAAiBIjiAAIAAiDQE9BeD+heIAAIBQhKAvh5AjQh6AiisAAQlWAAi0ijg");
	this.shape_10.setTransform(-188.95,-0.725);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.lf(["#5CFFFF","rgba(94,255,255,0.698)","rgba(255,255,255,0)"],[0,0.078,1],-0.2,-31.5,-0.2,31.4).s().p("AklEmQh2gVhRgpIAAlCQBdAqBqAbQBvAaBbAAQBMAAAqgOQAqgPgBgrQAAgwhAgWIi2g/Qg2gSgrgTQg5gagpgdIgcgWQHPBNFvhNQAXAeAOAjIAEAMQAXBJAABfQAACtiFBqQiJBpkPAAQiAAAh1gVg");
	this.shape_11.setTransform(202.15,-0.725);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.lf(["#5CFFFF","rgba(94,255,255,0.698)","rgba(255,255,255,0)"],[0,0.078,1],-0.1,-30.4,-0.1,30.7).s().p("AEHEyIAAoQIicE9IjWAAIibk9IAAIQImgAAIAApjQLGBsKHhsIAAJjg");
	this.shape_12.setTransform(68.675,-1.675);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9}]}).wait(1));

	// Layer_35
	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.rf(["#80FCFF","#0098FF"],[0,1],-41.4,-54.1,0,-41.4,-54.1,131.7).s().p("Am7JGIAAyLIN3AAIAADjIn/AAQgRAAgMAMIAAAAQgMAMgBARIAACdQABARAMANIAAAAQAMALARAAIG3AAIAADoIm3AAQgRAAgMAMIAAABQgMALgBASIAACcQABARAMANIAAAAQAMALARAAIH/AAIAADig");
	this.shape_13.setTransform(-62.65,-33.375);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.rf(["#80FCFF","#0098FF"],[0,1],-25.3,-48.5,0,-25.3,-48.5,110.3).s().p("AmDHBIgBgBQimiYAAkiQAAkmCuiaQCyieFQAAQB2AABbANQBMALBGAVIAAELQhDgUhEgJQhcgNhhAAQivAAhhBNQhrBMAAC3QAACwBVBIIABAAIAAABQBPBNCZAAQBaAABGgWQANgFAHgLQAIgKAAgNIAAiBQAAgRgMgLIAAgBQgMgMgRAAIi5AAIAAipIHpAAIAAI6QhCAlhkAcQh1AiimAAQlCAAiriYg");
	this.shape_14.setTransform(-188.925,-33.325);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.rf(["#80FCFF","#0098FF"],[0,1],-23.7,-50.8,0,-23.7,-50.8,104).s().p("AkYJDIAAAAQhfgRhGgeIAAjsQBFAaBLAVIAFACQBzAbBhAAQBSgBAtgPIADgBQBGgZAAhIIAAAAQAEhMhhghIi2g/QhzgmhDgvIgCgCQg9gqgag7QgbhAAAhdIAAgBQAGlTHiAAQBBAABHAIQBJAIBDANIACAAQAuAIAkAJIAADsQhHgYg/gMQhVgQhGAAQhIABg5AIIgCABQhbASADBMQgFBCBOAeIADABQAwATB1AeQCPAnBJA3QBEAyAZA/QAZBKAABeQAACah2BeIgDACQh/Bfj7gBQh9ABhygWg");
	this.shape_15.setTransform(201.525,-33.3);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.rf(["#80FCFF","#0098FF"],[0,1],-45,-54.1,0,-45,-54.1,133.1).s().p("AEwJGIAAnoQABgPgKgLIAAAAQgJgMgNgDQgOgDgNAGQgOAHgFAMIgBAAIiQEnIijAAIiQknQgHgMgMgHIAAAAQgOgGgNADQgOADgIAMIAAAAQgKALAAAPIAAHoIlOAAIAAyLIFNAAIEOIoQAIAPAPAGQAOAGAOgGIABAAQAPgGAGgPIEMooIFLAAIAASLg");
	this.shape_16.setTransform(68.65,-33.375);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13}]}).wait(1));

	// Layer_28
	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.lf(["#C3F7FF","#69EAFF"],[0,1],0.1,62.4,0.1,-62.1).s().p("AnjJvIAAzdIPHAAIAAE1IonAAIAACdIHgAAIAAE7IngAAIAACcIInAAIAAE0g");
	this.shape_17.setTransform(-62.675,-33.4);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.lf(["#C3F7FF","#69EAFF"],[0,1],0.1,64.2,0.1,-64.1).s().p("AmfHeQi0ihAAk2QAAk7C8ilQC7ioFiABQB6AABeAMQBeAOBWAeIAAFhQhZghhbgMQhbgMheAAQigAAhWBDQhcBEABCgQgBCbBJA/QBGBCCGAAQBUAAA/gUIAAiAIjiAAIAAj8II7AAIAAJ6QhKAvh5AjQh6AjisgBQlWAAi0ijg");
	this.shape_18.setTransform(-188.95,-33.35);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.lf(["#C3F7FF","#69EAFF"],[0,1],0,64.2,0,-64.1).s().p("AkgJsQh1gVhRgoIAAlEQBcAqBrAbQBuAaBcAAQBMAAApgOQAqgPAAgrQAAgwhAgWIi2g/Qh9gqhGgyQhGgwgfhGQgehGAAhpQAAl8IRAAQBCgBBKAJQBLAIBEANQBGAMAvAPIAAFHQhignhTgQQhRgPhDgBQhEABg3AIQg3ALAAAtQAAAmAxASQAvATByAeQCZAqBOA5QBOA7AeBMQAaBOAABmQAACviGBoQiHBqkPAAQiCABh1gWg");
	this.shape_19.setTransform(201.625,-33.35);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.lf(["#C3F7FF","#69EAFF"],[0,1],0,62.4,0,-62.1).s().p("AEHJvIAAoRIicE+IjWAAIibk+IAAIRImgAAIAAzdIGPAAIEaI/IEXo/IGNAAIAATdg");
	this.shape_20.setTransform(68.675,-33.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_20},{t:this.shape_19},{t:this.shape_18},{t:this.shape_17}]}).wait(1));

	// Layer_34
	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f().s("#333333").ss(10,2,0,3).p("AgGJvIAAzeIGPAAIEaI/IEXo/IGOAAIAATeImhAAIAAoRIibE+IjXAAIick+IAAIRgAenKCQiBAAh1gWQh1gVhSgoIAAlEQBdAqBqAbQBvAbBcAAQBMAAAqgPQAqgOAAgrQAAgwhBgXQg/gWh4goQh8grhHgxQhGgwgehHQgfhHAAhnQAAl9ISAAQBCAABLAIQBKAIBEANQBGAMAwAQIAAFGQhjgnhTgPQhRgRhDAAQhFAAg4AKQg2ALAAAsQAAAnAxARQAxATByAeQCYAqBPA6QBOA6AcBNQAbBOAABlQAACviFBqQiJBpkPAAgA8FKCQlWAAi0ijQi0iiAAk3QAAk6C8ilQC7ioFjAAQB6AABdANQBfAOBXAdIAAFiQhagihcgLQhagMheAAQifAAhYBDQhcBEAACfQAACcBJA/QBGBDCHAAQBUAAA/gVIAAiAIjjAAIAAj8II8AAIAAJ6QhJAwh6AjQh6AiitAAgAxkJvIAAzeIPIAAIAAE2IooAAIAACdIHhAAIAAE7InhAAIAACcIIoAAIAAE0g");
	this.shape_21.setTransform(1.45,-33.35);

	this.timeline.addTween(cjs.Tween.get(this.shape_21).wait(1));

	// Layer_29
	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f().s("#FFFFFF").ss(18,2,0,3).p("AgGJvIAAzeIGPAAIEaI/IEXo/IGOAAIAATeImhAAIAAoRIibE+IjXAAIick+IAAIRgAenKCQiBAAh1gWQh1gVhSgoIAAlEQBdAqBqAbQBvAbBcAAQBMAAAqgPQAqgOAAgrQAAgwhBgXQg/gWh4goQh8grhHgxQhGgwgehHQgfhHAAhnQAAl9ISAAQBCAABLAIQBKAIBEANQBGAMAwAQIAAFGQhjgnhTgPQhRgRhDAAQhFAAg4AKQg2ALAAAsQAAAnAxARQAxATByAeQCYAqBPA6QBOA6AcBNQAbBOAABlQAACviFBqQiJBpkPAAgA8EKCQlXAAi0ijQi0iiAAk3QAAk6C8ilQC7ioFkAAQB5AABeANQBeAOBXAdIAAFiQhagihbgLQhagMhfAAQifAAhYBDQhbBEAACfQAACcBIA/QBHBDCGAAQBUAAA/gVIAAiAIjiAAIAAj8II7AAIAAJ6QhJAwh6AjQh6AiisAAgAxkJvIAAzeIPIAAIAAE2IooAAIAACdIHhAAIAAE7InhAAIAACcIIoAAIAAE0g");
	this.shape_22.setTransform(1.45,-33.35);

	this.timeline.addTween(cjs.Tween.get(this.shape_22).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.title_2, new cjs.Rectangle(-257.5,-107.7,518,212.7), null);


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
	this.txt = new cjs.Text("PLAY AGAIN", "bold 20px 'Kanit'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 32;
	this.txt.lineWidth = 223;
	this.txt.parent = this;
	this.txt.setTransform(-0.05,3);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#0099FF").s().p("AxzC0QhCAAgvgvQgvgvAAhCIAAjHMAonAAAIAADHQAABCgvAvQgvAvhCAAg");
	this.shape.setTransform(0,18);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_header, new cjs.Rectangle(-130,0,260,36.6), null);


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
	this.txt_msg = new cjs.Text("YOU WON IN 6 MOVES!", "16px 'Kanit'", "#FFFFFF");
	this.txt_msg.name = "txt_msg";
	this.txt_msg.textAlign = "center";
	this.txt_msg.lineHeight = 27;
	this.txt_msg.lineWidth = 483;
	this.txt_msg.parent = this;
	this.txt_msg.setTransform(-1.9,36.05);
	this.txt_msg.shadow = new cjs.Shadow("rgba(153,102,0,1)",0,0,10);

	this.txt_hrd = new cjs.Text("INCREDIBLE", "bold 70px 'Kanit'", "#FFFFFF");
	this.txt_hrd.name = "txt_hrd";
	this.txt_hrd.textAlign = "center";
	this.txt_hrd.lineHeight = 113;
	this.txt_hrd.lineWidth = 507;
	this.txt_hrd.parent = this;
	this.txt_hrd.setTransform(-0.05,-57.95);
	this.txt_hrd.shadow = new cjs.Shadow("rgba(153,102,0,1)",0,0,10);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_hrd},{t:this.txt_msg}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.result_text, new cjs.Rectangle(-277.3,-81.9,561,164), null);


(lib.mc_star = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {"on":0,"off":1,off2:2};
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
	this.frame_2 = function() {
		///* this.stop();*/
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().ls(["#80FCFF","#0098FF"],[0,1],-24.1,0,24.1,0).ss(2,1,1).p("AAYjNIA5BzIB/ASQAQACAFAQQAGAQgMAMIhcBZIAVB+QADAQgNAKQgOAKgPgIIhxg7IhxA7QgOAIgOgKQgOgKADgQIAWh+IhchZQgMgMAFgQQAGgQAQgCIB/gSIA5hzQAHgPAQAAQARAAAHAPg");
	this.shape.setTransform(0.0129,0.0028);

	this.timeline.addTween(cjs.Tween.get(this.shape).to({_off:true},1).wait(2));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["rgba(255,255,255,0.6)","rgba(255,255,255,0)"],[0,1],0.6,-62.3,0.6,61.4).s().p("AIdJcIodkdIobEdQhIAlhAgvQhBgvAOhPIBnpZIm1mqQgdgbgHghQS7I9PXo9QgJAhgcAbIm2GqIBoJZQANBPhAAvQgkAagmAAQgeAAgfgQg");
	this.shape_1.setTransform(0.0156,9.0891,0.2099,0.2099);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).to({_off:true},1).wait(2));

	// Layer_8
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.rf(["#80FCFF","#0098FF"],[0,1],-0.5,-9.1,0,-0.5,-9.1,34.2).s().p("ABxDZIhxg7IhxA7QgOAIgOgKQgOgKADgQIAWh+IhchZQgMgMAFgQQAGgQAQgCIB/gSIA5hzQAHgPAQAAQARAAAHAPIA5BzIB/ASQAQACAFAQQAGAQgMAMIhcBZIAVB+QADAQgNAKQgIAGgIAAQgGAAgHgEg");
	this.shape_2.setTransform(0.0129,0.0028);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(123,95,22,0.498)").s().p("ABxDZIhxg7IhxA7QgOAIgOgKQgOgKADgQIAWh+IhchZQgMgMAFgQQAGgQAQgCIB/gSIA5hzQAHgPAQAAQARAAAHAPIA5BzIB/ASQAQACAFAQQAGAQgMAMIhcBZIAVB+QADAQgNAKQgIAGgIAAQgGAAgHgEg");
	this.shape_3.setTransform(0.0129,0.0028);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(0,0,0,0.298)").s().p("ABxDZIhxg7IhxA7QgOAIgOgKQgOgKADgQIAWh+IhchZQgMgMAFgQQAGgQAQgCIB/gSIA5hzQAHgPAQAAQARAAAHAPIA5BzIB/ASQAQACAFAQQAGAQgMAMIhcBZIAVB+QADAQgNAKQgIAGgIAAQgGAAgHgEg");
	this.shape_4.setTransform(0.0129,0.0028);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2}]}).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).wait(1));

	// Layer_9
	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("#333333").ss(8,1,1).p("AAYjNIA5BzIB/ASQAQACAFAQQAGAQgMAMIhcBZIAVB+QADAQgNAKQgOAKgPgIIhxg7IhxA7QgOAIgOgKQgOgKADgQIAWh+IhchZQgMgMAFgQQAGgQAQgCIB/gSIA5hzQAHgPAQAAQARAAAHAPg");
	this.shape_5.setTransform(0.0129,0.0028);

	this.timeline.addTween(cjs.Tween.get(this.shape_5).to({_off:true},1).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-27.1,-26.1,54.2,52.2);


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
	this.shape.graphics.f().s("#666666").ss(2,1,1).p("Akkg2QgiDoB+DGQEFATDnh7QAkjpiAjFQgugEguABIgXhpQgMg5gwggQgwggg5ANIgpAIQg5ANggAxQggAwAMA5IAXBqQgrARgqAWgAhkkIIAqgIQAPgDAMAIQAMAHADAPIATBdQg4AIg2AQIgUhdQgDgPAIgMQAHgMAPgEgAAsAlQAFAXgOAUQgEAIgGAFIAkB6IhJAPIgPh9QgJgDgHgFQgUgNgEgXQgGgYANgUQANgSAYgFQAXgGATAMQAUANAFAYg");
	this.shape.setTransform(0.0017,0.0261);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#393939","#171717"],[0,1],-11.9,-30.9,5.7,30.6).s().p("AjIF4Qh+jGAijoQAqgWArgRIgXhqQgMg5AggwQAggxA5gNIApgIQA5gNAwAgQAwAgAMA5IAXBpQAugBAuAEQCADFgkDpQjIBrjeAAQgjAAgjgDgAgXgGQgYAFgNASQgNAUAGAYQAEAXAUANQAHAFAJADIAPB9IBJgPIgkh6QAGgFAEgIQAOgUgFgXQgFgYgUgNQgOgIgOAAQgHAAgHACgAg6kQIgqAIQgPAEgHAMQgIAMADAPIAUBdQA2gQA4gIIgThdQgDgPgMgHQgJgGgKAAIgIABg");
	this.shape_1.setTransform(0.0017,0.0261);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.mc_lock, new cjs.Rectangle(-31,-38.8,62,77.69999999999999), null);


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
	this.txt = new cjs.Text("RUSSO ONE", "30px 'Kanit SemiBold'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 47;
	this.txt.lineWidth = 428;
	this.txt.parent = this;
	this.txt.setTransform(216.0012,30.4);

	this.txt_1 = new cjs.Text("RUSSO ONE", "bold 30px 'Kanit'", "#FFFFFF");
	this.txt_1.name = "txt_1";
	this.txt_1.textAlign = "center";
	this.txt_1.lineHeight = 47;
	this.txt_1.lineWidth = 428;
	this.txt_1.parent = this;
	this.txt_1.setTransform(216.0012,-52.95);

	this.txt_2 = new cjs.Text("RUSSO ONE", "30px 'Kanit'", "#FFFFFF");
	this.txt_2.name = "txt_2";
	this.txt_2.textAlign = "center";
	this.txt_2.lineHeight = 47;
	this.txt_2.lineWidth = 428;
	this.txt_2.parent = this;
	this.txt_2.setTransform(216.0012,-7.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_2},{t:this.txt_1},{t:this.txt}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.font_loader, new cjs.Rectangle(0,-54.9,432,134.7), null);


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
	this.txt = new cjs.Text("-", "20px 'Roboto'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 24;
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
	this.txt = new cjs.Text("PLAY AGAIN", "bold 26px 'Kanit'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 41;
	this.txt.lineWidth = 163;
	this.txt.parent = this;
	this.txt.setTransform(98.5,10);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgKBdIhshOQgGgGAAgGQgBgFAGgFIBrhVQAFgFAFADQADABAAAIIABAsQAjALAZgDQAYgDAogZQgYA2gXAQQgYAQgTAHIghAKIAAAsQAAAHgDACIgEABQgCAAgEgDg");
	this.shape.setTransform(191.0403,28.323,1.2806,1.2806);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape},{t:this.txt}]}).wait(2));

	// Layer_8
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#666666").ss(2,1,0,3).p("AtbkDIa3AAQBTAAA7A6QA6A7AABTIAAB3QAABTg6A7Qg7A6hTAAI63AAQhTAAg6g6Qg7g7AAhTIAAh3QAAhTA7g7QA6g6BTAAg");
	this.shape_1.setTransform(110,29.9992);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(2));

	// Layer_2
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#3C3C3C","#000000"],[0,1],18,-30,18,34).s().p("AtbEsQhkAAhGhGQhGhGAAhkIAAh3QAAhkBGhGQBGhGBkAAIa3AAQBkAABFBGQBHBGAABkIAAB3QAABkhHBGQhFBGhkAAg");
	this.shape_2.setTransform(110,29.9991);

	this.timeline.addTween(cjs.Tween.get(this.shape_2).wait(2));

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
	this.shape.graphics.f("#FFFFFF").s().p("AhQCAQgUgLAAgXIAAi7QAAgXAUgLQAWgLATAOIB9BeQAPAMAAASQAAATgPAMIh9BeQgLAIgMAAQgJAAgJgFg");
	this.shape.setTransform(194,28.575);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	// Layer_5
	this.txt = new cjs.Text("PLAY AGAIN", "bold 26px 'Kanit'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 41;
	this.txt.lineWidth = 163;
	this.txt.parent = this;
	this.txt.setTransform(98.5,10);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(2));

	// Layer_8
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#666666").ss(2,1,0,3).p("AtbkDIa3AAQBTAAA7A6QA6A7AABTIAAB3QAABTg6A7Qg7A6hTAAI63AAQhTAAg6g6Qg7g7AAhTIAAh3QAAhTA7g7QA6g6BTAAg");
	this.shape_1.setTransform(110,29.9992);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(2));

	// Layer_2
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#3C3C3C","#000000"],[0,1],18,-30,18,34).s().p("AtbEsQhkAAhGhGQhGhGAAhkIAAh3QAAhkBGhGQBGhGBkAAIa3AAQBkAABFBGQBHBGAABkIAAB3QAABkhHBGQhFBGhkAAg");
	this.shape_2.setTransform(110,29.9991);

	this.timeline.addTween(cjs.Tween.get(this.shape_2).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,220,60);


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
	this.txt = new cjs.Text("-", "20px 'Roboto'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 24;
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
	this.txt = new cjs.Text("-", "20px 'Roboto'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 24;
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
	this.txt = new cjs.Text("RESET PROGRESS", "18px 'Kanit SemiBold'", "#4C4C4C");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 30;
	this.txt.lineWidth = 171;
	this.txt.parent = this;
	this.txt.setTransform(100.2,10.3);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#999999").ss(2,1,1).p("AsVjRIYrAAQBHAAAxAxQAyAyAABHIAABPQAABHgyAxQgxAyhHAAI4rAAQhGAAgygyQgygxAAhHIAAhPQAAhHAygyQAygxBGAAg");
	this.shape.setTransform(99.9413,25,0.9999,1);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FFFFFF","#999999"],[0,1],-63.9,-21,-63.9,43).s().p("AsVDSQhGAAgygyQgygyAAhGIAAhPQAAhGAygzQAygxBGAAIYrAAQBHAAAxAxQAyAzAABGIAABPQAABGgyAyQgxAyhHAAg");
	this.shape_1.setTransform(99.9413,25,0.9999,1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FFFFFF","#999999"],[0,1],-68,-25,-68,39).s().p("AsgD6QhTAAg6g7Qg7g6AAhTIAAhjQAAhTA7g7QA6g6BTAAIZBAAQBTAAA6A6QA7A7AABTIAABjQAABTg7A6Qg6A7hTAAg");
	this.shape_2.setTransform(99.9467,25,0.999,1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_reset, new cjs.Rectangle(0,0,200,50), null);


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


(lib.scene_tutorial = function(mode,startPosition,loop,reversed) {
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
	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(251,488,1,1,0,0,0,110,60);

	this.header = new lib.scene_header();
	this.header.name = "header";
	this.header.setTransform(260,0);

	this.b_next_image = new lib.b_next();
	this.b_next_image.name = "b_next_image";
	this.b_next_image.setTransform(500,256,1,1,0,0,0,36,25);

	this.b_prev_image = new lib.b_prev();
	this.b_prev_image.name = "b_prev_image";
	this.b_prev_image.setTransform(20,256,1,1,0,0,0,0,25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_prev_image},{t:this.b_next_image},{t:this.header},{t:this.b_play}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_tutorial, new cjs.Rectangle(20,0,480,488), null);


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
	this.logo.setTransform(213,239.95);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(251,488,1,1,0,0,0,110,60);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_play},{t:this.logo}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_title, new cjs.Rectangle(-47.5,130.5,524,357.5), null);


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
	this.b_replay = new lib.b_replay();
	this.b_replay.name = "b_replay";
	this.b_replay.setTransform(251,423,1,1,0,0,0,110,60);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(251,488,1,1,0,0,0,110,60);

	this.result_block = new lib.result_text();
	this.result_block.name = "result_block";
	this.result_block.setTransform(196.7,220.1);

	this.star_3 = new lib.mc_star();
	this.star_3.name = "star_3";
	this.star_3.setTransform(320,310);

	this.star_2 = new lib.mc_star();
	this.star_2.name = "star_2";
	this.star_2.setTransform(258.05,310);

	this.star_1 = new lib.mc_star();
	this.star_1.name = "star_1";
	this.star_1.setTransform(196.1,310);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.star_1},{t:this.star_2},{t:this.star_3},{t:this.result_block},{t:this.b_play},{t:this.b_replay}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_recap, new cjs.Rectangle(-69.6,149.2,536,338.8), null);


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
	this.b_reset.setTransform(490,492,1,1,0,0,0,200,50);

	this.header = new lib.scene_header();
	this.header.name = "header";
	this.header.setTransform(250.95,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.header},{t:this.b_reset}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_levels, new cjs.Rectangle(121,0,369,492), null);


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

}).prototype = getMCSymbolPrototype(lib.scene_instructions, new cjs.Rectangle(10,0,490,488), null);


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
	this.b_home = new lib.b_home();
	this.b_home.name = "b_home";
	this.b_home.setTransform(388.75,127.1,1,1,0,0,0,58,50);
	this.b_home.shadow = new cjs.Shadow("rgba(255,198,46,1)",0,0,2);

	this.b_restart = new lib.b_resetlevel();
	this.b_restart.name = "b_restart";
	this.b_restart.setTransform(324,127.1,1,1,0,0,0,58,50);
	this.b_restart.shadow = new cjs.Shadow("rgba(255,198,46,1)",0,0,2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_restart},{t:this.b_home}]}).wait(1));

	// Layer_5
	this.digit_9 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_9.name = "digit_9";
	this.digit_9.textAlign = "center";
	this.digit_9.lineHeight = 51;
	this.digit_9.lineWidth = 30;
	this.digit_9.parent = this;
	this.digit_9.setTransform(237.25,45);
	this.digit_9.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.digit_8 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_8.name = "digit_8";
	this.digit_8.textAlign = "center";
	this.digit_8.lineHeight = 51;
	this.digit_8.lineWidth = 30;
	this.digit_8.parent = this;
	this.digit_8.setTransform(211.75,45);
	this.digit_8.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.digit_7 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_7.name = "digit_7";
	this.digit_7.textAlign = "center";
	this.digit_7.lineHeight = 51;
	this.digit_7.lineWidth = 30;
	this.digit_7.parent = this;
	this.digit_7.setTransform(187.25,45);
	this.digit_7.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.digit_6 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_6.name = "digit_6";
	this.digit_6.textAlign = "center";
	this.digit_6.lineHeight = 51;
	this.digit_6.lineWidth = 30;
	this.digit_6.parent = this;
	this.digit_6.setTransform(162.75,45);
	this.digit_6.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.digit_5 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_5.name = "digit_5";
	this.digit_5.textAlign = "center";
	this.digit_5.lineHeight = 51;
	this.digit_5.lineWidth = 30;
	this.digit_5.parent = this;
	this.digit_5.setTransform(136.75,45);
	this.digit_5.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.digit_4 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_4.name = "digit_4";
	this.digit_4.textAlign = "center";
	this.digit_4.lineHeight = 51;
	this.digit_4.lineWidth = 30;
	this.digit_4.parent = this;
	this.digit_4.setTransform(112.25,45);
	this.digit_4.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.digit_3 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_3.name = "digit_3";
	this.digit_3.textAlign = "center";
	this.digit_3.lineHeight = 51;
	this.digit_3.lineWidth = 30;
	this.digit_3.parent = this;
	this.digit_3.setTransform(86.75,45);
	this.digit_3.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.digit_2 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_2.name = "digit_2";
	this.digit_2.textAlign = "center";
	this.digit_2.lineHeight = 51;
	this.digit_2.lineWidth = 30;
	this.digit_2.parent = this;
	this.digit_2.setTransform(62.25,45);
	this.digit_2.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.digit_1 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_1.name = "digit_1";
	this.digit_1.textAlign = "center";
	this.digit_1.lineHeight = 51;
	this.digit_1.lineWidth = 30;
	this.digit_1.parent = this;
	this.digit_1.setTransform(37.25,45);
	this.digit_1.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.digit_0 = new cjs.Text("0", "bold 32px 'Kanit'", "#FFFFFF");
	this.digit_0.name = "digit_0";
	this.digit_0.textAlign = "center";
	this.digit_0.lineHeight = 51;
	this.digit_0.lineWidth = 30;
	this.digit_0.parent = this;
	this.digit_0.setTransform(12.75,45);
	this.digit_0.shadow = new cjs.Shadow("rgba(255,255,255,1)",0,0,2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.digit_0},{t:this.digit_1},{t:this.digit_2},{t:this.digit_3},{t:this.digit_4},{t:this.digit_5},{t:this.digit_6},{t:this.digit_7},{t:this.digit_8},{t:this.digit_9}]}).wait(1));

	// Layer_4
	this.txt_moves = new cjs.Text("-", "bold 20px 'Kanit'", "#FFFFFF");
	this.txt_moves.name = "txt_moves";
	this.txt_moves.textAlign = "center";
	this.txt_moves.lineHeight = 32;
	this.txt_moves.lineWidth = 120;
	this.txt_moves.parent = this;
	this.txt_moves.setTransform(80,94);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#0099FF").s().p("AxzC0QhCAAgvgvQgvgvAAhCIAAjHMAonAAAIAADHQAABCgvAvQgvAvhCAAg");
	this.shape.setTransform(130,110);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape},{t:this.txt_moves}]}).wait(1));

	// Layer_1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF0000").s().p("AgEAFIAAgJIAJAAIAAAJg");
	this.shape_1.setTransform(0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.ui_spritesheet, new cjs.Rectangle(-34.2,-1,547.2,168), null);


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
	this.b_help = new lib.b_help();
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
	this.txt = new cjs.Text("ARE YOU SURE?", "16px 'Kanit SemiBold'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 25;
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
	this.lock.setTransform(0,12.95,0.6,0.6);

	this.timeline.addTween(cjs.Tween.get(this.lock).wait(2));

	// Layer_6
	this.star_2 = new lib.mc_star();
	this.star_2.name = "star_2";
	this.star_2.setTransform(0,4.95,0.8,0.8);

	this.star_3 = new lib.mc_star();
	this.star_3.name = "star_3";
	this.star_3.setTransform(35.75,14.95,0.7,0.7);

	this.star_1 = new lib.mc_star();
	this.star_1.name = "star_1";
	this.star_1.setTransform(-35.75,14.95,0.7,0.7);

	this.txt = new cjs.Text("2", "bold 26px 'Kanit'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 43;
	this.txt.lineWidth = 35;
	this.txt.parent = this;
	this.txt.setTransform(-2.45,-61.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt},{t:this.star_1},{t:this.star_3},{t:this.star_2}]}).wait(2));

	// frame
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#999999").ss(2,1,1).p("AnDopIOHAAQCWAAAACWIAAKRQAAB8hYBYQhYBYh8AAIpbAAQh8AAhYhYQhYhYAAh8IAAqRQAAiWCWAAg");
	this.shape.setTransform(-0.011,0.4871,0.9973,1.0016);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(2,1,1).p("AnDopIOHAAQCWAAAACWIAAKRQAAB8hYBYQhYBYh8AAIpbAAQh8AAhYhYQhYhYAAh8IAAqRQAAiWCWAAg");
	this.shape_1.setTransform(0,0.5492);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1}]},1).wait(1));

	// panel
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#575757","#151515"],[0,1],0,-14.9,0,15).s().p("ApYCWIAAizQgBgxAkgkQAjgjAxAAIPCAAQAyAAAjAjQAkAkAAAxIAACzg");
	this.shape_2.setTransform(-0.011,-40.002,0.9973,1.0016);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.lf(["#E3E3E3","#FFFFFF"],[0,1],-2.9,-45.8,5.2,42).s().p("AlBGVQh0AAhRhSQhShSAAh0IAAoRISyAAIAAIRQAAB0hTBSQhSBSh0AAg");
	this.shape_3.setTransform(0,15.5994);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2}]}).wait(2));

	// stuff
	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#FFFFFF").ss(8,1,1).p("AnCoqIOEAAQCWAAAACWIAAKTQAAB8hYBYQhYBYh7AAIpZAAQh8AAhXhYQhYhYAAh8IAAqTQAAiWCVAAg");
	this.shape_4.setTransform(0,0.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("#0099FF").ss(8,1,1).p("AnCoqIOEAAQCWAAAACWIAAKTQAAB8hYBYQhYBYh7AAIpZAAQh8AAhXhYQhYhYAAh8IAAqTQAAiWCVAAg");
	this.shape_5.setTransform(0,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_4}]}).to({state:[{t:this.shape_5}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-64,-63.9,128,123.9);


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
(lib.stackstower = function(mode,startPosition,loop,reversed) {
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
	this.instance_1.setTransform(488,26,1,1,0,0,0,25,25);

	this.instance_2 = new lib.scene_title();
	this.instance_2.setTransform(222.8,250.7,1,1,0,0,0,242.8,250.7);

	this.instance_3 = new lib.button_level();
	this.instance_3.setTransform(188,129.95,1,1,0,0,0,0,-0.5);

	this.instance_4 = new lib.scene_levels();
	this.instance_4.setTransform(385,247.6,1,1,0,0,0,385,247.6);

	this.instance_5 = new lib.scene_instructions();

	this.instance_6 = new lib.scene_game();
	this.instance_6.setTransform(383.4,264.4,1,1,0,0,0,383.4,264.4);

	this.instance_7 = new lib.scene_recap();
	this.instance_7.setTransform(387.3,329.6,1,1,0,0,0,387.3,329.6);

	this.instance_8 = new lib.font_loader();
	this.instance_8.setTransform(1035.6,451.05,1,1,0,0,0,211,66.2);

	this.instance_9 = new lib.popup_pause();
	this.instance_9.setTransform(1001.9,104.2,1,1,0,0,0,3.5,10.2);

	this.instance_10 = new lib.ui_spritesheet();
	this.instance_10.setTransform(256,256,1,1,0,0,0,256,256);

	this.instance_11 = new lib.popup_confirm();
	this.instance_11.setTransform(382.9,257.4,1,1,0,0,0,382.9,257.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_2},{t:this.instance_1}]}).to({state:[{t:this.instance_4},{t:this.instance_3}]},1).to({state:[{t:this.instance_5}]},1).to({state:[{t:this.instance_6,p:{regX:383.4,regY:264.4,x:383.4,y:264.4}}]},1).to({state:[{t:this.instance_7}]},1).to({state:[{t:this.instance_6,p:{regX:384,regY:256,x:384,y:256}}]},1).to({state:[{t:this.instance_10},{t:this.instance_9},{t:this.instance_8}]},1).to({state:[{t:this.instance_11}]},1).to({state:[]},1).to({state:[]},3).wait(10));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(0,-1,1461.9,770);
// library properties:
lib.properties = {
	id: '35A5558F002BB0439538A2940A14BBA4',
	width: 400,
	height: 512,
	fps: 30,
	color: "#FFC62E",
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