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



(lib.bg_candy_left = function() {
	this.initialize(img.bg_candy_left);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,297,614);


(lib.bg_candy_right = function() {
	this.initialize(img.bg_candy_right);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,428,653);


(lib.card_spritesheet = function() {
	this.initialize(img.card_spritesheet);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,1440,504);// helper functions:

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
	this.txt.lineHeight = 18;
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

	// highlights
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(255,255,255,0.8)").s().p("ArZJ1IgvgCQgvgEgBgCIBwgHIAEBlgA19KfIA4isIgsDBIgfAKQgDABAWgggAjMKgIBKilIhAC7IggAGQgCAAAYgcgAgQERIhfgOIBzgEIBQGygAJBKeQBLhBgBhpQABhFgkg3Qgkg3g5gcQg1gbhBgCIANAAQBHAAA7AdQA5AcAjA3QAlA3gDBWQgDBXhWA9IgUAPIAMgKgAztD+IhhgEIBzgQIB/GmgAXiIOICwjlIgigVQghgUABgBIBbAnIi6DqIgTBKgARwHkQAXgrgHg4QgFgygigmQAjAcAMAZQAPAhgEAlQgEAlgOASQgNASgPAPIgOAHgAr1HQIgYgEIgWgDIA8gHIACAxgA4rEyIhAgLIg/gJICKgCIBUDXgAlQEiIhAgRIg8gQICJAMIA8DfgArdEQIjvAAIEBgQIAABXgAWRETIhEgNIBQAEIAMBCgAPfh4IhGgFQhGgFAAgDICmgLIAGCVgAFGh4IhGgFQhGgFAAgDIClgLIAGCVgAyph0QBDhdglhxQgdhchNggQBjAWAgBqQAiBrg+BVQg7BRhkAmQBRgoAzhFgAkQp/IidhKIDLAtIhADpQgVBOgyDnQAajyA/kPgA6Bl1QgZhOAYhDQAYhDA0grQAsgkA5gQQgyAVglAkQg2AwgWBIQgVBHAYBOQAKAeARAXQgdgdgOgrgAO3luIgkgGIghgFIBZgKIACBIgAEdluIgkgGIghgFIBZgKIACBIgAqDoFIAwBGIgsgmIgyA1gAtIpjIilAbIC2hAIBADHgAaIp6Ilfg0IF9AfIgTCBgAPZqFIljAAIF+gYIAACBgAFAqFIljAAIF9gYIAACBg");
	this.shape.setTransform(1.3,-1.1);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// outlines
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#000000").ss(2.5,1,0,3).p("AGMrMIAADRIjfAUIAABGICugVIAACqIiuAUIAABIIDngUIAADkInqAVQAUl0gWl4gASVoOIAijmIInA/IgfDRIiagIIhLH4Ij4gkIBJnmgAQprMIAADRIjgAUIAABGICwgVIAACqIiwAUIAABIIDngUIAADkInrAVQAVl0gWl4gAW/DfIAfCLIAEAAIBkikICoBBIjSEJIgcDKIiugJIAejZQgxiQhDiPgAMULiIAAn9IDagEQACAAAEAAQBbAAA1AoQA3ApAABcQAAA7gRAdQgSAcg0ARIAAAFQAfAkAlAwQAmAvAUAeIAVAeIjYASIhZiuIgCAAIAACXgAPEHDIAMAAQAbgBASgJQAQgJAAgZQAAgagQgJQgOgIgZAAQgDAAgCAAIgNAAgACjHeQAAhyBPhHQBOhIB0AAQBOAABAAgQA/AeAnA8QAmA7AABMQAAB0hSBGQhSBFh2AAQh1AAhOhFQhOhGAAh0gAFlHhQAAAqAbAbQAbAbAoAAQApAAAagbQAagbAAgqQAAgogagdQgZgcgqAAQgpAAgaAcQgbAdAAAogAn6DTIDZAQIBIECIAFAAQAAgFAjh/QASg/ASg/IC7gPIBXH4IizAQIgZkdIgEAAQgEARhTD8IhuAQQhPkIgBgVIgGAAIgaENQivAPgeACQAvkDAkkHgA5EAHIAGjKQALAGAVAFQAVAHA1ADQA1AEAsgOQAWgHASgQQARgQgGgTQgCgFgCgEQgEgEgDgCQgDgCgFgCQgGgCgCAAQgDAAgHAAQgHAAgDAAQgCAAgHABQgJABgBABIgyAHQhRALg+geQg/gdgXhJQgZhPAWhKQAXhLA3gyQA2gyBLgYQA3gSA5gGQA6gFAeACIAfAEIAXDJQgKgCgSgCQgRgEgxAAQgyACgtAOQgSAGgPAOQgOANAFASQABAEADADQADAEAEACIAKACQADACAGgBQAHAAAEAAQADAAAHgBQAGAAACAAIA9gGQDBgSAzCfQAkByhDBcQhEBch3AmQiFAqiEgbgAw9pcIEphuQA2CaAXBaIBOiGIBSB9IBgklIEsA8IgqCEQgZBSgyDEQgyDFgSCAIjDAPIhUh5Ig8ByIiOgeQgKgfgTg3QgTg3hEifQhEiehQiTgAqfDVIAACOIiYAPIAAAwIB3gOIAABzIh3AOIAAAxICcgOIAACcIjjAKIhqAEQABgjACgkQAJjbgOjcgA4ADsIBkD4IAEgBQAAgEAWiCQALhBALhAIC5gkICNHsIiwAjIg5kZIgEABQgCARg3EEIhsAbQhqj9gEgVIgGAAIACEPQirAhgeAGQATkGAIkKg");
	this.shape_1.setTransform(-0.0667,0.2641);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

	// shade
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,65,75,0.498)").s().p("AgXA3QhCiChRiBIAugFQBOB7A/B9IAADUICAgLIAAANIioAOgABohvIgNglIAzh2IAdAIIg/CTg");
	this.shape_2.setTransform(145.4,46.6,1.0328,1.0328,7.7379,0,0,3.2,0.8);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(255,65,75,0.498)").s().p("AgXCaIAAhZIADAAIBUCpIChgNIAJAMIjSASgAjpj5IAogBIAAHdICCgMIAAAMIiqAQgAAHhMQAAgagOgIQgHgEgxgDIAogRIANAAIAEAAQAYABAOAHQAPAIAAAaQAAAYgQAJQgMAHgTACQAHgKAAgQg");
	this.shape_3.setTransform(102.9729,48.9676,1.0328,1.0328);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(255,65,75,0.498)").s().p("AiBCuQhKhDAAhvQAAhvBLhFQAtgoA3gRQggAQgbAZQhNBFAABvQAABvBMBDQBMBEBwAAQA0AAAtgOQg9AehMAAQhwAAhNhEgACLBAQAZgaABgoQAAgngagcQgYgbgoAAIgOABQAWgRAfAAQApAAAZAbQAYAcAAAnQAAAogZAaQgVAVgdAFIAKgKg");
	this.shape_4.setTransform(37.4025,48.6835,1.0328,1.0328);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("rgba(255,65,75,0.498)").s().p("AkMj8IAmADQgjD1gsDxICggOIgCANIjGARQAuj7Ajj+gACeA1QAchTACgKIAEAAIAYETICEgLIACAMIiuAPgAhgBDIALhrIAGAAQABAVBLD+IBGgKIgDALIhqAPIg2i4gAAygDIgQg6IAPg1IAjh7IAkgDIgfBuQgjB7ABAEg");
	this.shape_5.setTransform(-22.9118,47.5475,1.0328,1.0328);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("rgba(255,65,75,0.498)").s().p("AidCzQAJjTgNjVIAogCQANDWgJDUIgDA1IA/gCIDcgJIAAANIjcAKIhnAEIADhFgAAyAhIBMgIIAAALIhzANgAAyh8IBsgKIAAAMIiTAOg");
	this.shape_6.setTransform(-83.6023,48.5028,1.0328,1.0328);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("rgba(255,65,75,0.498)").s().p("AkMj8IAmADQgjD1gsDxICggOIgCANIjGARQAtj7Akj+gACfA0QAbhSACgKIAEAAIAZETICDgLIACAMIitAPgAhfBCIAKhqIAHAAQABAVBLD+IBFgKIgEALIhpAPIg1i5gAAygDIgQg5IAQg2IAjh7IAkgDIggBuIgjB/g");
	this.shape_7.setTransform(-142.3,49.4,1.0328,1.0328,-6.2359,0,0,2.4,2);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("rgba(255,65,75,0.498)").s().p("Ah6FcIAAnbIiRAGIAAjhIAvgBIAADLICSgHIAAHbIDCAAIAAAYgACoipIBlgKIAAATIiVAOg");
	this.shape_8.setTransform(145.1,-37,1.0328,1.0328,8.4526,0,0,2.1,-1.4);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("rgba(255,65,75,0.498)").s().p("AjtlpIAxgCQAUFigVFdIGsgSIAAAWInbAUQAUlpgVlsgAA+AwIB7gOIAAASIiqAUgAA+i3ICpgPIAAAUIjYATg");
	this.shape_9.setTransform(82.45,-31.95,1.0328,1.0328,0,0,0,-0.1,0);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("rgba(255,65,75,0.498)").s().p("AjulpIAygCQAUFigUFdIGqgSIAAAWInaAUQAUlpgWlsgAA/AwIB5gOIAAASIiqAUgAA/i3ICogPIAAAUIjZATg");
	this.shape_10.setTransform(15.6999,-31.9955,1.0328,1.0328);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("rgba(255,65,75,0.498)").s().p("ABtEwIAbg2IBRB2ICRgKIgDAUIi+APgAhrFlQgIgfgUg2QgRg0hCibQhDiYhMiNIAzgTQBLCLBBCWQBCCZARA2QAUA1AJAeIBoAYIgPAegAAlijIAmhBIASAbIhdB6QArg/gGgVgACwisIBHjbIAmAHIh9Ewg");
	this.shape_11.setTransform(-71.217,-36.4623,1.0328,1.0328);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("rgba(255,65,75,0.498)").s().p("AjtEcIgUgMIBCi4QAIAIASALIAFADIgxCLIAUALQByA/CGAAQBMAABAgaQhSAyhqAAQiGAAhyg/gAA3B3IgBgLIgEgHIgGgFIgIgFIgJgCIgJgDQgCgCgHgBIgJgBIgwgIQhNgNgxguQgxgtAAhKQAAhRArg9QArg+BBgeIASgIQgtAdghAvQgrA9AABSQAABJAxAuQAxAsBNAOIAwAIIAJABQAHABACACIAJACIAJADIAIAFIAGAFIAEAHIABALQAAATgUAJQgPAHgQADQADgHAAgHgADiiOQgQgIgtgOQgvgNgtgBIgEAAQAEgKAMgGQARgIATABQAtAAAvAMIAtAQIgIArIgYgMg");
	this.shape_12.setTransform(-142.6,-31.8,1.0328,1.0328,-17.7033,0,0,0.4,2.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2}]}).wait(1));

	// stripes
	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("rgba(255,65,75,0.8)").s().p("A4dJLIABBzIggAoIhvAVgAS3JvQAaAiATAZIg4A4IhyAKgAvbLlIAEhHIABghIDfjeIBFgIIAAArIkjEjgA27K6ICtjWIgiCfIhBBRIg5APIgRgpgAG3LgIEkkjQACASAAASQAAAogJAiIikCkQgyASg7gBIgMAAgAoyKXIE/k+IAXBRIkyEzIgxADIANhJgArIJBIA8gGIAAAxIhwBwIhsAEgAPSKDIAABRIhaAJgAW4LYIgBgBIBjhLIgLBRgAB+JWIAPBZIgjAkIhxAKgAh5J/IgbBQIg+AJgAqMLUIAAADIgEAAgAluKkIgEArIgrAEgAEZKvIB+h+QAZATAiAAQAQAAANgEIiRCSQgmgNgfgWgAMjJiICvivIAAATIANAAQAbgBARgJQARgJAAgZQAAgagOgIIB2h3QAIAFAHAFQAWARAOAaImUGVgAzWKHICFilIAZBXIhvCKIghAHgA7ZJKID3k0IAfBOIkeFlIAIh/gAVyJTIFPj/IiXC+IgCAUIjECUgAPrJpIDfjeIAAAGQAAA7gRAdQgSAcg1ARIAAAFIAWAaIh5B6gAkoJeIFqlqIAOBYIlgFjIgYhRgAwfKPIAHAYIgfAHgAgvI0ICPiPIAPBYIiVCXgAC+I5IFRlRQAiAJAfAPIALAFIh/B/IgKgBQgqAAgZAcQgbAcAAApIABAGIiSCSQgYgegNglgA36IgIBXhtIAVA0IAEAAIARhpICTi2IBBgNIAKAjIlAGPIgfhNgAz7HMIB5iWIAYBWIh+CegAoJGfIC9i9IA5AEIAJAiIkSESIATh7gAvUGsIDPjPIBsgEIk7E7QABg0gBg0gAIvHkQAAghgRgZIB4h5QASATAOAWIAMATIiYCZQAFgQAAgSgAMjGSICuitIArgBIAGAAQAcAAAYADIkTETgAVgGoICDhjIAJAoIAEAAIA5hdIBMg7IBQAgIlKD8IgbhJgADzE1IAJgKIAEgEQBIhBBngGIj9D+QABhlBAhEgA7NFRIBJhcIBigEIixDbIAGh7gAijFkIAkh+IBwgJIiYCYIAEgRgAqRE4IAAAuIgzAGgAUnEcIBOg8IBZADIAEATIiOBrQgOgjgPgigAvcDmIBqgDIhlBkIgFhhgAMjDnIBEgBIhEBFgAnrDWIA+AFIhJBKIALhPgA1eDeIAHgBIgIAMIABgLgAC7jJIAAAcIBTgHIjoDnIhsAFgANfitIBygLIjqDpIhtAFgAGAi+IAigDIAABIIijCjIhtAFgAQ/i9IAABoIh/B9IhsAFgAojADIEckcQgSBJgNA/Ii3C3IgsACgAGigQIAAAzIg3ADgAQ/ASIAAARIgSABgAr9ANIJDpBQgQA0gYBbIlsFrIgPgXIgpBQIghAggAk/gQIgHAqIgnAEgA4VARIBhi7QArABAlgMIAJgDIhsDRQgngBgngHgAyEm6QAgAXAVAlIjFF9IgCAAQguAPguAGgAWKABIBthQIgOBegATxgVIAIg1IEcjTIgPBnIjjCpgAJbh5IEqkqIB3gPImlGlIAEhsgAtEhSIgLgeIJnpnIBYARIqkKkIgQgwgAhAidIEBkCIB2gNIl6F6IADhrgAwwkaQAIBSgyBFQggAsgqAegA4vjAQALAFAVAGIAMAEIgvBbgAUXkXIHLlUIgPBmIgtAiIhygHIgPBmIkdDUgAuLkDIE1k2IAqA/IlBFAIgehJgAJelLIF5l5IBggFIAAALInaHaIABhngA4qkIID7nmQAjgCAWACIAZADIhmDFQgeAEgcAJQgTAGgPANQgOAOAGARIADAIQADAEAFABIAJACQADACAGgBIALAAIAKgBIAJAAIABAAIh0DhQgogDgjgOgAFql4IAABvIh+APgA09j/IgHgDIgJgCIgKABIgJAAQgDgCgHACIgKACIgVACIB0jgQArgCAjAJIhxDdIgFgEgAQHlWIAABNIhWAKgAg+luIFUlVIBsgFInAHBIAAhngA6LlzIgEgRICkk+QAVgJAXgIQAbgIAcgHIjeGwQgYgagNgngAvLmTIDijiIAZBPIjbDaIgghHgAU2nkIErjeIBqAMImlE4gAJaoXICkilIBtgEIkOEOIgDhlgAhDo5ICAiBIBsgFIjpDqIgDhkgAwQofIBuhtICdg7IABAFIjpDpIgjhGgAGap4IAABnIgbAcIhyAKgAQ3pWIAABeIhnAJgASioLIAGgoIDjinIBqAMIkRDKgAzcomQgHgBgMgBIAlhJIAJBQIgbgFgAnOrAIA5g6IBXASIjDDBgAJSq1IBAgCIg9A9IgDg7gATFrwIBaAKIhnBLgAhKq1IAbgBIgZAZIgCgYg");
	this.shape_13.setTransform(-1.475,0);

	this.timeline.addTween(cjs.Tween.get(this.shape_13).wait(1));

	// color
	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],0.7,-27.6,-6.7,27).s().p("AiiEBIAejZQgxiOhDiPIDEAGIAeCKIAEABIBjilICoBBIjSEIIgbDKg");
	this.shape_14.setTransform(152.425,46.675);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],0,-26,0,26).s().p("Ag+BVIgDAAIAACXIivARIAAn9IDZgDIAGAAQBaAAA2AnQA2AqAABcQAAA6gRAcQgSAdg0ARIAAAFQAfAjAlAxQAmAvAUAeIAVAeIjYASgAhBghIAMAAQAcgBARgJQAPgJAAgZQAAgbgPgIQgNgIgaAAIgEAAIgOAAg");
	this.shape_15.setTransform(102.975,48.825);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],0,-25.7,0,25.6).s().p("AjHC7QhOhGAAh0QAAhwBPhJQBPhIBzAAQBNABBAAgQA/AeAnA8QAnA7AABLQAAB0hSBGQhTBFh1AAQh0AAhPhFgAg4hAQgaAcAAAoQAAAqAaAbQAbAbAnAAQApAAAagbQAagbAAgqQAAgogagcQgZgcgqAAQgoAAgaAcg");
	this.shape_16.setTransform(44.075,48);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],0,-26.1,0,26.1).s().p("AkVkEIDYAQIBHEAIAFAAQAAgEAkh+IAjh+IC9gPIBWH3Ii0AQIgZkdIgEAAQgDARhUD8IhtAQQhOkHgCgWIgGAAIgaENIjMARQAukDAlkGg");
	this.shape_17.setTransform(-22.9,47.55);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],0,-26.2,0,26.3).s().p("AihC/QAIjagOjcIFKgOIAACOIiYAOIAAAwIB3gOIAAByIh3AOIAAAxICdgOIAACcIjjAKIhrAEIAFhHg");
	this.shape_18.setTransform(-83.6,47.875);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],-5.5,-26.5,0.1,25.4).s().p("AlLjpIDZgIIBkD3IAEAAIAUiFIAXiDIC4gjICNHrIiwAjIg5kXIgEABQgBAQg4EEIhrAbQhqj+gDgUIgHABIADENIjJAoQASkHAIkIg");
	this.shape_19.setTransform(-142.225,48.1);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],-187.1,-67.7,-199.2,13.9).s().p("AjWFcIBInmIiWgQIAijlIInA+IgfDRIiagIIhLH4g");
	this.shape_20.setTransform(146.475,-36.925);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],-105.5,-44,-105.5,38.5).s().p("Aj1lsIHkgUIAADRIjgAUIAABGICwgVIAACpIiwAUIAABIIDngUIAADlInqAVQAVl1gWl4g");
	this.shape_21.setTransform(82.575,-32.9);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],-25.9,-44,-25.9,38.5).s().p("Aj1lsIHjgUIAADRIjfAUIAABGICvgVIAACpIivAUIAABIIDngUIAADlInqAVQAVl1gWl4g");
	this.shape_22.setTransform(15.7,-32.9);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],82,-40.5,82,42).s().p("AAAEbIg6B0IiPgfQgJgfgUg3QgSg3hEifQhFiehPiSIEphuQA2CaAXBZIBOiFIBRB9IBfklIEtA7IgqCEQgZBSgyDEQgyDFgSCBIjEAOg");
	this.shape_23.setTransform(-62.125,-36.475);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.lf(["#FECED3","#FEC7CD","#FE90A0","#FF768B","#FECDD3"],[0,0.416,0.498,0.831,1],166.4,-96.4,191.5,-17.8).s().p("Ai6F6IgXgFIAGjKQALAFAVAFQAVAHA1ADQA1AEAsgOQAVgHARgQQARgQgFgSIgFgKQgCgEgEgCIgIgEIgJgCIgJABIgKAAQgCgBgHABIgJACIgzAHQhQALg+gdQg/gegXhHQgahQAXhKQAXhKA3gyQA2gzBLgYQA2gRA5gHQA6gFAfACIAeAEIAXDJIgcgFQgSgDgxAAQgyACgrAOQgTAGgOANQgOAOAFASIAEAHQADAEAEABIAKADQACACAHgBIALAAIAJgBIAJgBIA8gFQDBgSAzCeQAkByhDBbQhEBdh3AmQhRAahTAAQgyAAgygKg");
	this.shape_24.setTransform(-139.5382,-36.3456);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_24},{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20},{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14}]}).wait(1));

	// outter_white
	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("AgxjeIAvCBIADAAIBKirICqApIinEYIAADGIinAOIAAjUQhCiDhSiAg");
	this.shape_25.setTransform(149.1275,46.152,1.0328,1.0328,7.7379);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#FFFFFF").s().p("AhdA3QhCiChRiBIC8gTIAvCAIAEAAIBJirICqApIinEYIAADGIioAOg");
	this.shape_26.setTransform(149.44,46.3682,1.0328,1.0328,7.7379);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("Aj5D0IAAntIDSgDQADAAADAAQBXAAA0AmQA1ApAABYQAAA5gQAcQgSAbgzAQIAAAFQAfAiAkAvQAkAuAUAdIAUAdIjRASIhViqIgDAAIAACTgAhQghIAMAAQAbgBARgJQAQgIAAgZQAAgagQgIQgNgHgZAAIgSAAg");
	this.shape_27.setTransform(104.6794,48.9215,1.0328,1.0328);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#FFFFFF").s().p("Ag8BTIgDAAIAACSIiqAQIAAnsIDTgEIAFAAQBYAAA0AnQA1AoAABYQAAA5gRAbQgRAcgzAQIAAAGQAeAhAkAwQAkAtAUAdIAVAdIjSASgAg/ggIAMAAQAbgBAQgIQAPgJAAgZQAAgZgOgJQgOgHgZAAIgRAAg");
	this.shape_28.setTransform(102.9729,48.8126,1.0328,1.0328);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("AkMABQAAhtBMhGQBMhFBwAAQBLAAA+AfQA9AdAlA6QAmA6AABIQAABwhQBEQhQBDhxAAQhxAAhMhDQhLhEAAhwgAhQAEQAAAoAaAaQAaAbAmAAQAnAAAZgbQAagaAAgoQAAgmgZgcQgZgbgoAAQgnAAgZAbQgaAcAAAmg");
	this.shape_29.setTransform(44.064,48.0122,1.0328,1.0328);

	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("#FFFFFF").s().p("AjBC1QhLhEAAhwQAAhtBMhGQBMhFBxAAQBKAAA+AfQA9AdAlA6QAmA6AABIQAABwhQBEQhQBDhwAAQhyAAhMhDgAg2g+QgaAcAAAmQAAAoAaAaQAaAbAmAAQAoAAAZgbQAZgaAAgoQAAgmgZgcQgZgbgoAAQgnAAgZAbg");
	this.shape_30.setTransform(44.064,48.0122,1.0328,1.0328);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("AkLj9IDSAPIBFD4IAEAAQAAgEAih6QASg9ARg9IC2gPIBUHnIiuAQIgYkTIgEAAQgDAQhRDzIhqAQQhMj/gBgUIgGAAIgaEDQioAOgeADQAuj7Ajj9g");
	this.shape_31.setTransform(-23.018,47.6976,1.0328,1.0328);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("#FFFFFF").s().p("AkMj8IDRAPIBGD5IADAAQAAgEAjh6IAjh7IC2gOIBUHnIiuAPIgZkTIgDAAQgEARhQDzIhqAPQhMj+gCgVIgFAAIgaEEIjGARQAuj7Ajj+g");
	this.shape_32.setTransform(-22.9118,47.5475,1.0328,1.0328);

	this.shape_33 = new cjs.Shape();
	this.shape_33.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("ACfj9IAACKIiTAOIAAAuIBzgOIAABvIhzANIAAAwICYgOIAACYIjcAJIhnAEQACgiACgjQAIjTgNjVg");
	this.shape_33.setTransform(-83.7313,47.881,1.0328,1.0328);

	this.shape_34 = new cjs.Shape();
	this.shape_34.graphics.f("#FFFFFF").s().p("AidC5QAJjTgNjVIE/gOIAACJIiTAOIAAAuIBzgNIAABvIhzANIAAAwICYgOIAACXIjcAKIhnAEIADhFg");
	this.shape_34.setTransform(-83.6023,47.8831,1.0328,1.0328);

	this.shape_35 = new cjs.Shape();
	this.shape_35.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("Ag5juIBFD4IAEAAQAAgEAjh6QARg9ASg9IC1gPIBUHnIitAQIgZkTIgEAAQgDAQhRDzIhqAQQhLj/gBgUIgHAAIgaEDQioAOgeADQAuj7Ajj9g");
	this.shape_35.setTransform(-145.0766,47.7513,1.0328,1.0328,-6.2359);

	this.shape_36 = new cjs.Shape();
	this.shape_36.graphics.f("#FFFFFF").s().p("AkMj8IDSAPIBFD5IADAAIAkh+IAjh7IC1gOIBUHnIitAPIgZkTIgEAAQgEARhRDzIhpAPQhLj+gCgVIgGAAIgaEEIjGARQAtj7Akj+g");
	this.shape_36.setTransform(-144.9858,47.6109,1.0328,1.0328,-6.2359);

	this.shape_37 = new cjs.Shape();
	this.shape_37.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("AkMhvIAAjhIIZgTIAADMIiVAPIAAHtIjyAAIAAnbg");
	this.shape_37.setTransform(142.9177,-36.8483,1.0328,1.0328,8.4526);

	this.shape_38 = new cjs.Shape();
	this.shape_38.graphics.f("#FFFFFF").s().p("Ah6FlIAAnbIiRAGIAAjhIIYgTIAADNIiVAOIAAHug");
	this.shape_38.setTransform(142.9067,-36.7747,1.0328,1.0328,8.4526);

	this.shape_39 = new cjs.Shape();
	this.shape_39.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("ADol0IAADKIjYAUIAABDICqgUIAACkIiqATIAABGIDggUIAADeInbAUQAUlpgVlrg");
	this.shape_39.setTransform(82.4579,-32.8929,1.0328,1.0328);

	this.shape_40 = new cjs.Shape();
	this.shape_40.graphics.f("#FFFFFF").s().p("AjtlgIHUgUIAADLIjYATIAABDICqgTIAACjIiqATIAABGIDggUIAADfInbAUQAUlqgVlrg");
	this.shape_40.setTransform(82.5781,-32.8992,1.0328,1.0328);

	this.shape_41 = new cjs.Shape();
	this.shape_41.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("ADol0IAADKIjYAUIAABDICpgUIAACkIipATIAABGIDggUIAADeInbAUQAUlpgVlrg");
	this.shape_41.setTransform(15.5797,-32.8929,1.0328,1.0328);

	this.shape_42 = new cjs.Shape();
	this.shape_42.graphics.f("#FFFFFF").s().p("AjulgIHVgUIAADLIjZATIAABDICqgTIAACjIiqATIAABGIDggUIAADfInaAUQAUlqgWlrg");
	this.shape_42.setTransform(15.6999,-32.8992,1.0328,1.0328);

	this.shape_43 = new cjs.Shape();
	this.shape_43.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("AnUjiIEghrQA0CVAWBXIBLiBIBPB4IBckbIEjA5IgoCAQgZBQgwC9QgwC/gSB9Ii9AOIhQh3Ig6BwIiKgdQgJgfgTg1QgSg1hCiaQhCiZhNiNg");
	this.shape_43.setTransform(-60.1799,-36.696,1.0328,1.0328);

	this.shape_44 = new cjs.Shape();
	this.shape_44.graphics.f("#FFFFFF").s().p("AAAESIg4BwIiLgdQgIgfgUg2QgRg0hCibQhDiYhMiNIEghrQAzCVAWBWIBMiAIBOB4IBdkbIEjA5IgpCAQgYBQgxC8QgvC/gSB9Ii+APg");
	this.shape_44.setTransform(-62.1284,-36.4623,1.0328,1.0328);

	this.shape_45 = new cjs.Shape();
	this.shape_45.graphics.f().s("#FFFFFF").ss(8,1,0,3).p("AkXEcIBCi5QAIAIASALQARAMAwATQAwATAtAAQAWAAAUgKQAUgJAAgTQAAgFgBgFQgCgEgCgEQgCgCgEgDQgFgDgDgCQgCgBgHgBQgFgCgDgBQgCgCgHgBQgHgBgCAAIgxgIQhNgNgxguQgxgtAAhJQAAhSArg9QArg+BBgeQBBgeBLAAQA3AAA3ALQA3AMAcALIAbAMIgmDAQgJgEgPgIQgQgIgtgOQgvgNgtAAQgTAAgRAHQgQAJAAASQAAAEABAEQAAAEAEADIAIAFQACACAGACQAHACADABQADAAAHACQAGACACAAIA5ANQC4AoAAChQAABzhZBBQhaBBh4AAQiHAAhyg/g");
	this.shape_45.setTransform(-141.9253,-35.7135,1.0328,1.0328,-17.7033);

	this.shape_46 = new cjs.Shape();
	this.shape_46.graphics.f("#FFFFFF").s().p("AkIEnIgUgLIBDi5QAIAIARALQASAMAwATQAvATAtAAQAWAAAVgKQAUgJAAgTIgBgKIgFgIIgFgFIgIgFIgJgCIgIgDQgCgCgHgBIgJgBIgxgIQhNgNgxguQgxgtAAhJQAAhSArg9QAqg+BCgeQBBgeBKAAQA4AAA3ALQA3AMAcALIAbAMIgmDAIgZgMQgPgIgugOQgugNgtAAQgTAAgSAHQgPAJgBASIABAIQACAEADADIAIAFQACACAGACIAKADIAKACIAIACIA5ANQC4AogBChQAABzhYBBQhaBBh5AAQiGAAhzg/g");
	this.shape_46.setTransform(-141.4875,-35.8532,1.0328,1.0328,-17.7033);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_46},{t:this.shape_45},{t:this.shape_44},{t:this.shape_43},{t:this.shape_42},{t:this.shape_41},{t:this.shape_40},{t:this.shape_39},{t:this.shape_38},{t:this.shape_37},{t:this.shape_36},{t:this.shape_35},{t:this.shape_34},{t:this.shape_33},{t:this.shape_32},{t:this.shape_31},{t:this.shape_30},{t:this.shape_29},{t:this.shape_28},{t:this.shape_27},{t:this.shape_26},{t:this.shape_25}]}).wait(1));

	// outter_black
	this.shape_47 = new cjs.Shape();
	this.shape_47.graphics.f().s("#000000").ss(14,1,0,3).p("AgvjdIAvCBIAEAAIBJirICqApIimEYIAADGIioAOIAAjUQhCiDhSiAg");
	this.shape_47.setTransform(148.8931,45.9898,1.0328,1.0328,7.7379);

	this.shape_48 = new cjs.Shape();
	this.shape_48.graphics.f("#000000").s().p("AhdA3QhCiChRiBIC8gTIAvCAIAEAAIBJirICqApIinEYIAADGIioAOg");
	this.shape_48.setTransform(149.44,46.3682,1.0328,1.0328,7.7379);

	this.shape_49 = new cjs.Shape();
	this.shape_49.graphics.f().s("#000000").ss(14,1,0,3).p("AhcgiIAMAAQAbAAAQgJQAQgJAAgYQAAgagPgIQgOgIgZAAIgRAAgAkGDzIAAnsIDTgEQACAAADAAQBYAAA0AnQA1AoAABZQAAA5gRAcQgRAagzARIAAAFQAeAiAkAvQAkAuAUAdIAVAdIjRARIhVipIgDAAIAACSg");
	this.shape_49.setTransform(105.9592,49.0031,1.0328,1.0328);

	this.shape_50 = new cjs.Shape();
	this.shape_50.graphics.f("#000000").s().p("Ag8BTIgDAAIAACSIiqAQIAAnsIDTgEIAFAAQBYAAA0AnQA1AoAABYQAAA5gRAbQgRAcgzAQIAAAGQAeAhAkAwQAkAtAUAdIAVAdIjSASgAg/ggIAMAAQAbgBAQgIQAPgJAAgZQAAgZgOgJQgOgHgZAAIgRAAg");
	this.shape_50.setTransform(102.9729,48.8126,1.0328,1.0328);

	this.shape_51 = new cjs.Shape();
	this.shape_51.graphics.f().s("#000000").ss(14,1,0,3).p("AkMABQAAhtBMhGQBMhFBwAAQBLAAA+AfQA9AdAlA6QAmA6AABIQAABwhQBEQhQBDhxAAQhxAAhMhDQhLhEAAhwgAhQAEQAAAoAaAaQAaAbAmAAQAnAAAZgbQAagaAAgoQAAgmgZgcQgZgbgoAAQgnAAgZAbQgaAcAAAmg");
	this.shape_51.setTransform(44.064,48.0122,1.0328,1.0328);

	this.shape_52 = new cjs.Shape();
	this.shape_52.graphics.f("#000000").s().p("AjBC1QhLhEAAhwQAAhtBMhGQBMhFBxAAQBKAAA+AfQA9AdAlA6QAmA6AABIQAABwhQBEQhQBDhwAAQhyAAhMhDgAg2g+QgaAcAAAmQAAAoAaAaQAaAbAmAAQAoAAAZgbQAZgaAAgoQAAgmgZgcQgZgbgoAAQgnAAgZAbg");
	this.shape_52.setTransform(44.064,48.0122,1.0328,1.0328);

	this.shape_53 = new cjs.Shape();
	this.shape_53.graphics.f().s("#000000").ss(14,1,0,3).p("AkKj+IDRAPIBFD4IAEAAQAAgEAjh6QARg9ARg9IC3gPIBUHnIiuAQIgZkTIgDAAQgEAQhRDzIhqAQQhLj/gCgUIgGAAIgZEDQipAOgdADQAtj6Akj+g");
	this.shape_53.setTransform(-23.0977,47.7908,1.0328,1.0328);

	this.shape_54 = new cjs.Shape();
	this.shape_54.graphics.f("#000000").s().p("AkMj8IDRAPIBGD5IADAAQAAgEAjh6IAjh7IC2gOIBUHnIiuAPIgZkTIgDAAQgEARhQDzIhqAPQhMj+gCgVIgFAAIgaEEIjGARQAuj7Ajj+g");
	this.shape_54.setTransform(-22.9118,47.5475,1.0328,1.0328);

	this.shape_55 = new cjs.Shape();
	this.shape_55.graphics.f().s("#000000").ss(14,1,0,3).p("ACgj9IAACKIiTAOIAAAuIBzgOIAABvIhzANIAAAwICYgOIAACYIjcAJIhnAEQACgiACgjQAIjTgNjVg");
	this.shape_55.setTransform(-83.828,47.8795,1.0328,1.0328);

	this.shape_56 = new cjs.Shape();
	this.shape_56.graphics.f("#000000").s().p("AidC5QAJjTgNjVIE/gOIAACJIiTAOIAAAuIBzgNIAABvIhzANIAAAwICYgOIAACXIjcAKIhnAEIADhFg");
	this.shape_56.setTransform(-83.6023,47.8831,1.0328,1.0328);

	this.shape_57 = new cjs.Shape();
	this.shape_57.graphics.f().s("#000000").ss(14,1,0,3).p("Ag5jvIBFD5IAEAAQABgEAih6QASg+ARg9IC2gOIBUHnIitAPIgZkTIgEAAQgEARhRDzIhpAPQhMj+gBgVIgGAAIgaEEQioAOgeADQAtj7Akj+g");
	this.shape_57.setTransform(-145.1448,47.8567,1.0328,1.0328,-6.2359);

	this.shape_58 = new cjs.Shape();
	this.shape_58.graphics.f("#000000").s().p("AkMj8IDSAPIBFD5IADAAIAkh+IAjh7IC1gOIBUHnIitAPIgZkTIgEAAQgEARhRDzIhpAPQhLj+gCgVIgGAAIgaEEIjGARQAtj7Akj+g");
	this.shape_58.setTransform(-144.9858,47.6109,1.0328,1.0328,-6.2359);

	this.shape_59 = new cjs.Shape();
	this.shape_59.graphics.f().s("#000000").ss(14,1,0,3).p("AkMhuIAAjhIIZgTIAADMIiVAPIAAHtIjyAAIAAnbg");
	this.shape_59.setTransform(142.9259,-36.9035,1.0328,1.0328,8.4526);

	this.shape_60 = new cjs.Shape();
	this.shape_60.graphics.f("#000000").s().p("Ah6FlIAAnbIiRAGIAAjhIIYgTIAADNIiVAOIAAHug");
	this.shape_60.setTransform(142.9067,-36.7747,1.0328,1.0328,8.4526);

	this.shape_61 = new cjs.Shape();
	this.shape_61.graphics.f().s("#000000").ss(14,1,0,3).p("ADpl0IAADKIjYAUIAABDICqgUIAACkIiqATIAABGIDggUIAADeInbAUQAUlpgVlrg");
	this.shape_61.setTransform(82.3678,-32.8881,1.0328,1.0328);

	this.shape_62 = new cjs.Shape();
	this.shape_62.graphics.f("#000000").s().p("AjtlgIHUgUIAADLIjYATIAABDICqgTIAACjIiqATIAABGIDggUIAADfInbAUQAUlqgVlrg");
	this.shape_62.setTransform(82.5781,-32.8992,1.0328,1.0328);

	this.shape_63 = new cjs.Shape();
	this.shape_63.graphics.f().s("#000000").ss(14,1,0,3).p("ADpl0IAADKIjYAUIAABDICpgUIAACkIipATIAABGIDggUIAADeInbAUQAUlpgVlrg");
	this.shape_63.setTransform(15.4896,-32.8882,1.0328,1.0328);

	this.shape_64 = new cjs.Shape();
	this.shape_64.graphics.f("#000000").s().p("AjulgIHVgUIAADLIjZATIAABDICqgTIAACjIiqATIAABGIDggUIAADfInaAUQAUlqgWlrg");
	this.shape_64.setTransform(15.6999,-32.8992,1.0328,1.0328);

	this.shape_65 = new cjs.Shape();
	this.shape_65.graphics.f().s("#000000").ss(14,1,0,3).p("AnijhIEfhqQA0CVAWBWIBMiBIBOB5IBdkcIEjA6IgpCAQgYBPgxC9QgwC/gRB9Ii+AOIhQh2Ig6BwIiKgeQgJgegTg2QgSg1hBiaQhDiYhMiOg");
	this.shape_65.setTransform(-58.7185,-36.8538,1.0328,1.0328);

	this.shape_66 = new cjs.Shape();
	this.shape_66.graphics.f("#000000").s().p("AAAESIg4BwIiLgdQgIgfgUg2QgRg0hCibQhDiYhMiNIEghrQAzCVAWBWIBMiAIBOB4IBdkbIEjA5IgpCAQgYBQgxC8QgvC/gSB9Ii+APg");
	this.shape_66.setTransform(-62.1284,-36.4623,1.0328,1.0328);

	this.shape_67 = new cjs.Shape();
	this.shape_67.graphics.f().s("#000000").ss(14,1,0,3).p("AkUEcIBCi5QAJAIARALQARAMAwATQAwATAtAAQAWAAAUgKQAVgJAAgTQAAgFgBgFQgCgEgDgEQgCgCgEgDQgFgDgCgCQgCgBgHgBQgHgCgCgBQgBgCgHgBQgIgBgBAAIgxgIQhNgNgxguQgxgtAAhJQAAhSAqg9QArg+BBgeQBBgeBLAAQA4AAA2ALQA4AMAbALIAbAMIgmDAQgIgEgQgIQgPgIgugOQgugNgtAAQgTAAgSAHQgRAJAAASQAAAEABAEQACAEAEADIAIAFQACACAGACQAGACAEABQACAAAHACQAGACACAAIA6ANQC4AogBChQAABzhYBBQhaBBh5AAQiGAAhzg/g");
	this.shape_67.setTransform(-142.2536,-35.6086,1.0328,1.0328,-17.7033);

	this.shape_68 = new cjs.Shape();
	this.shape_68.graphics.f("#000000").s().p("AkIEnIgUgLIBDi5QAIAIARALQASAMAwATQAvATAtAAQAWAAAVgKQAUgJAAgTIgBgKIgFgIIgFgFIgIgFIgJgCIgIgDQgCgCgHgBIgJgBIgxgIQhNgNgxguQgxgtAAhJQAAhSArg9QAqg+BCgeQBBgeBKAAQA4AAA3ALQA3AMAcALIAbAMIgmDAIgZgMQgPgIgugOQgugNgtAAQgTAAgSAHQgPAJgBASIABAIQACAEADADIAIAFQACACAGACIAKADIAKACIAIACIA5ANQC4AogBChQAABzhYBBQhaBBh5AAQiGAAhzg/g");
	this.shape_68.setTransform(-141.4875,-35.8532,1.0328,1.0328,-17.7033);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_68},{t:this.shape_67},{t:this.shape_66},{t:this.shape_65},{t:this.shape_64},{t:this.shape_63},{t:this.shape_62},{t:this.shape_61},{t:this.shape_60},{t:this.shape_59},{t:this.shape_58},{t:this.shape_57},{t:this.shape_56},{t:this.shape_55},{t:this.shape_54},{t:this.shape_53},{t:this.shape_52},{t:this.shape_51},{t:this.shape_50},{t:this.shape_49},{t:this.shape_48},{t:this.shape_47}]}).wait(1));

	// Layer_10
	this.shape_69 = new cjs.Shape();
	this.shape_69.graphics.f().s("rgba(0,0,0,0.4)").ss(14,1,0,3).p("AF8rOIAADRIjfAUIAABFICvgUIAACqIivAUIAABIIDngUIAADkInqAUQAVlzgXl5gAQZrOIAADRIjgAUIAABFICwgUIAACqIiwAUIAABIIDogUIAADkInsAUQAVlzgWl5gASEoQIAjjmIInA+IgfDRIiZgIIhLH5Ij5gkIBInngAWwDdIAeCKIAEABIBkilICoBCIjSEIIgbDLIivgJIAejZQgxiQhDiPgAMFLgIAAn+IDZgDQADAAADAAQBbAAA2AnQA3AqAABcQAAA6gRAdQgSAdg1ARIAAAFQAgAjAlAxQAlAvAVAeIAVAeIjZASIhYivIgDAAIAACXgAO0HBIAMAAQAcgBARgJQARgJAAgZQAAgbgQgIQgOgIgaAAIgSAAgAFWHfQAAAqAbAaQAaAcApAAQAoAAAagcQAbgaAAgqQAAgpgagcQgagcgpAAQgqAAgZAcQgbAcAAApgACUHcQAAhyBOhIQBPhIB0AAQBOAAA/AgQBAAfAmA8QAnA7AABMQAAB0hSBGQhTBFh1AAQh1AAhPhFQhNhGAAh0gAoJDRIDYAQIBIEBIAFAAQAAgEAjh/QASg/ASg/IC7gPIBXH4IizAQIgZkdIgEAAQgDARhUD8IhuAQQhOkIgCgVIgGAAIgaENQiuAOgfADQAvkDAlkHgA5UAFIAHjKQALAFAVAGQAUAHA1ADQA2AEAsgOQAWgHARgRQARgQgGgSQgCgFgCgFQgDgDgEgDQgCgBgFgCQgGgBgDgBQgDgBgHABQgHAAgCAAQgDgBgHABQgIACgCAAIgyAIQhQALg/geQg/gdgXhJQgZhQAXhJQAXhLA2gyQA3gyBKgYQA3gRA5gHQA6gGAfADIAeADIAXDJQgKgCgRgCQgSgEgxABQgyACgsAOQgTAGgPANQgOAOAGARQABAFACADQADAEAFABIAJACQADACAGgBQAHAAAEAAQACAAAIgBQAHAAACAAIA8gFQDCgTAyCgQAkByhCBbQhEBch4AmQiEAqiFgagAxMpeIEphuQA1CaAXBZIBOiFIBSB9IBgklIEsA7IgqCEQgZBSgyDFQgyDFgSCAIjDAOIhUh5Ig8BzIiOgeQgKgfgTg3QgTg3hEifQhEifhPiSgAqvDTIAACOIiYAPIAAAvIB3gOIAAB0Ih3ANIAAAxICdgOIAACdIjkAKIhrAEQACgkACgkQAJjagOjdgA4QDpIBkD5IAEgBQAAgEAWiCQALhBALhBIC5gjICNHsIiwAjIg5kYIgEAAQgCARg3EEIhsAbQhqj9gEgVIgGABIACEOQirAhgeAGQASkGAIkKg");
	this.shape_69.setTransform(3.5047,5.519);

	this.timeline.addTween(cjs.Tween.get(this.shape_69).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.title_2, new cjs.Rectangle(-826,-85.1,1016.7,288.79999999999995), null);


(lib.scene_header_score = function(mode,startPosition,loop,reversed) {
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
	this.txt = new cjs.Text("0", "bold 26px 'Walibi0615'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.lineHeight = 33;
	this.txt.lineWidth = 114;
	this.txt.parent = this;
	this.txt.setTransform(6.05,4);

	this.txt_score = new cjs.Text("SCORE:", "bold 26px 'Walibi0615'", "#FFFFFF");
	this.txt_score.name = "txt_score";
	this.txt_score.textAlign = "right";
	this.txt_score.lineHeight = 33;
	this.txt_score.lineWidth = 114;
	this.txt_score.parent = this;
	this.txt_score.setTransform(-1.75,4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_score},{t:this.txt}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_header_score, new cjs.Rectangle(-117.9,2,240.2,37.4), null);


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
	this.txt = new cjs.Text("0", "bold 26px 'Walibi0615'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 33;
	this.txt.lineWidth = 276;
	this.txt.parent = this;
	this.txt.setTransform(0,4);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_header, new cjs.Rectangle(-140.1,2,280.2,37.4), null);


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
	this.txt_msg = new cjs.Text("YOU COMPLETED LEVEL X IN 20:00!", "bold 14px 'Walibi0615'", "#FFFFFF");
	this.txt_msg.name = "txt_msg";
	this.txt_msg.textAlign = "center";
	this.txt_msg.lineHeight = 20;
	this.txt_msg.lineWidth = 394;
	this.txt_msg.parent = this;
	this.txt_msg.setTransform(0.25,21.05);

	this.txt_hrd = new cjs.Text("INCREDIBLE", "bold 50px 'Walibi0615'", "#FFFFFF");
	this.txt_hrd.name = "txt_hrd";
	this.txt_hrd.textAlign = "center";
	this.txt_hrd.lineHeight = 66;
	this.txt_hrd.lineWidth = 395;
	this.txt_hrd.parent = this;
	this.txt_hrd.setTransform(1,-48.95);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_hrd},{t:this.txt_msg}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.result_text, new cjs.Rectangle(-198.9,-50.9,399.4,91.9), null);


(lib.multiplier = function(mode,startPosition,loop,reversed) {
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
	this.txt = new cjs.Text("x4", "bold 40px 'Walibi0615'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 51;
	this.txt.lineWidth = 88;
	this.txt.parent = this;
	this.txt.setTransform(0,-25.65);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.multiplier, new cjs.Rectangle(-46,-27.6,92,55.3), null);


(lib.messages = function(mode,startPosition,loop,reversed) {
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
	this.txt = new cjs.Text("ROUND 2", "bold 30px 'Walibi0615'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 39;
	this.txt.lineWidth = 378;
	this.txt.parent = this;
	this.txt.setTransform(-0.05,-19.25);

	this.timeline.addTween(cjs.Tween.get(this.txt).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.messages, new cjs.Rectangle(-191,-21.2,382,42.5), null);


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

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AkICMQgyAAAAgyIAAizQAAgyAyAAIIRAAQAyAAAAAyIAACzQAAAygyAAg");
	this.shape.setTransform(16.0686,-30.8346,0.0947,0.0947);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(3,1,1).p("ABQAAQAAAhgXAYQgYAXghAAQggAAgYgXQgXgYAAghQAAggAXgXQAYgYAgAAQAhAAAYAYQAXAXAAAgg");
	this.shape_1.setTransform(16.175,-19);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#FFFFFF").ss(2,0,1).p("AgOgqIAAAxIAhAc");
	this.shape_2.setTransform(17.7901,-19.6118);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer_1
	this.txt_ss = new cjs.Text("00", "bold 26px 'Walibi0615'", "#FFFFFF");
	this.txt_ss.name = "txt_ss";
	this.txt_ss.lineHeight = 33;
	this.txt_ss.lineWidth = 44;
	this.txt_ss.parent = this;
	this.txt_ss.setTransform(60,-36.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AgHAvQgDgCgDgDIgFgGQgBgDAAgFIABgIIAFgGIAGgEIAHgCIAIACIAHAEIADAGIACAIQAAAFgCADIgDAGQgDADgEACIgIABIgHgBgAgHgJIgGgEIgFgGQgBgEAAgEQAAgEABgEQACgEADgCQADgDADgCIAHgBIAIABQAEACADADQACACABAEQACAEAAAEQAAAEgCAEIgDAGIgHAEQgEACgEAAQgDAAgEgCg");
	this.shape_3.setTransform(55.95,-17.925);

	this.txt_m = new cjs.Text("0", "bold 26px 'Walibi0615'", "#FFFFFF");
	this.txt_m.name = "txt_m";
	this.txt_m.textAlign = "right";
	this.txt_m.lineHeight = 33;
	this.txt_m.lineWidth = 20;
	this.txt_m.parent = this;
	this.txt_m.setTransform(53.05,-37.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt_m},{t:this.shape_3},{t:this.txt_ss}]}).wait(1));

	// Layer_2
	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(255,255,255,0.498)").s().p("Ag/BAQgagaAAgmQAAglAagaQAagaAlAAQAlAAAaAaQAbAaAAAlQAAAmgbAaQgaAaglAAQglAAgagag");
	this.shape_4.setTransform(108.9887,-10.4969,0.3333,0.3333);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("rgba(255,255,255,0.498)").s().p("AhHBIQgegdAAgrQAAgpAegfQAdgdAqAAQArAAAeAdQAdAfAAApQAAArgdAdQgeAegrABQgqgBgdgeg");
	this.shape_5.setTransform(109.0289,-20.3136,0.5267,0.5267);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#FDD7E2").ss(2,1,1).p("AmjjHINHAAQBCAAAvAvQAvAvAABCIAABPQAABCgvAvQgvAvhCAAItHAAQhCAAgvgvQgvgvAAhCIAAhPQAAhCAvgvQAvgvBCAAg");
	this.shape_6.setTransform(58,-20);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.rf(["rgba(255,255,255,0.098)","rgba(255,255,255,0.6)"],[0,1],-1.4,1.8,0,-1.4,1.8,61.6).s().p("AmjDIQhCAAgvgvQgvgvAAhCIAAhPQAAhCAvgvQAvgvBCAAINHAAQBCAAAvAvQAvAvAABCIAABPQAABCgvAvQgvAvhCAAg");
	this.shape_7.setTransform(58,-20);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.game_time, new cjs.Rectangle(-1,-41,118,42), null);


(lib.card_back = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-1359.5,-376)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_back, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_16 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-1200,-376)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_16, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_15 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-1040,-376)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_15, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_14 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-880,-376)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_14, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_13 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-720,-380)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_13, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_12 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-560,-376)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_12, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_11 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-400,-376)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_11, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_10 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-240,-376)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_10, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_9 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-80,-376)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_9, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_8 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-1200,-124)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_8, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_7 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-1040,-124)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_7, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_6 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-880,-124)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_6, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_5 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-720,-124)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_5, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_4 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-560,-124)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_4, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_3 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-400,-124)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_3, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_2 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-240,-124)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_2, new cjs.Rectangle(-78,-124,156,248), null);


(lib.card_1 = function(mode,startPosition,loop,reversed) {
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
	this.shape.graphics.bf(img.card_spritesheet, null, new cjs.Matrix2D(1,0,0,1,-80,-124)).s().p("ApDTYQjIAAAAjIMAAAggfQAAjIDIAAISHAAQDIAAAADIMAAAAgfQAADIjIAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.card_1, new cjs.Rectangle(-78,-124,156,248), null);


(lib.candy_right = function(mode,startPosition,loop,reversed) {
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
	this.instance = new lib.bg_candy_right();
	this.instance.setTransform(-214,-326.5,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.candy_right, new cjs.Rectangle(-214,-326.5,214,326.5), null);


(lib.candy_left = function(mode,startPosition,loop,reversed) {
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
	this.instance = new lib.bg_candy_left();
	this.instance.setTransform(0,-307,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.candy_left, new cjs.Rectangle(0,-307,148.5,307), null);


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

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgNB4IiLhlQgIgHAAgIQAAgHAHgGICJhtQAHgGAGADQAEACAAAKIABA4QAtAPAggEQAfgEAzggQgeBFgeAUQgeAVgZAJIgqANIAAA5QAAAJgFABQAAABgBAAQAAAAgBABQAAAAgBAAQAAAAgBAAQgDAAgFgDg");
	this.shape.setTransform(184.0233,24.3197);

	this.txt = new cjs.Text("PLAY", "bold 24px 'Walibi0615'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 31;
	this.txt.lineWidth = 163;
	this.txt.parent = this;
	this.txt.setTransform(99.5,10);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.txt},{t:this.shape}]}).wait(2));

	// Layer_8
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FBB1CF","#F54482"],[0,1],4,-21,4,29).s().p("AtRDSQhCAAgvgvQgvgvAAhCIAAhjQAAhCAvgvQAvgvBCAAIajAAQBCAAAvAvQAvAvAABCIAABjQAABCgvAvQgvAvhCAAg");
	this.shape_1.setTransform(105,25);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(2));

	// Layer_1
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FE6392","#FFD6E4","#FBACCC"],[0,0.569,1],0,-25,0,25).s().p("AtRD6QhTAAg6g6Qg7g7AAhTIAAhjQAAhTA7g6QA6g7BTAAIajAAQBTAAA6A7QA7A6AABTIAABjQAABTg7A7Qg6A6hTAAg");
	this.shape_2.setTransform(105,25);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AhQCAQgUgLAAgXIAAi7QAAgXAUgLQAWgLATAOIB9BeQAPAMAAASQAAATgPAMIh9BeQgLAIgMAAQgJAAgJgFg");
	this.shape_3.setTransform(194,28.575);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,210,50);


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

	// Layer_5
	this.txt = new cjs.Text("PLAY", "bold 24px 'Walibi0615'", "#FFFFFF");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 31;
	this.txt.lineWidth = 163;
	this.txt.parent = this;
	this.txt.setTransform(99.5,10);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AhQCAQgUgLAAgXIAAi7QAAgXAUgLQAWgLATAOIB9BeQAPAMAAASQAAATgPAMIh9BeQgLAIgMAAQgJAAgJgFg");
	this.shape.setTransform(189,24.075);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape},{t:this.txt}]}).wait(2));

	// Layer_9
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FBB1CF","#F54482"],[0,1],4,-21,4,29).s().p("AtRDSQhCAAgvgvQgvgvAAhCIAAhjQAAhCAvgvQAvgvBCAAIajAAQBCAAAvAvQAvAvAABCIAABjQAABCgvAvQgvAvhCAAg");
	this.shape_1.setTransform(105,25);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(2));

	// Layer_1
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FE6392","#FFD6E4","#FBACCC"],[0,0.569,1],0,-25,0,25).s().p("AtRD6QhTAAg6g6Qg7g7AAhTIAAhjQAAhTA7g6QA6g7BTAAIajAAQBTAAA6A7QA7A6AABTIAABjQAABTg7A7Qg6A6hTAAg");
	this.shape_2.setTransform(105,25);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AhQCAQgUgLAAgXIAAi7QAAgXAUgLQAWgLATAOIB9BeQAPAMAAASQAAATgPAMIh9BeQgLAIgMAAQgJAAgJgFg");
	this.shape_3.setTransform(194,28.575);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,210,50);


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
	this.shape.graphics.f("#FFFFFF").s().p("Ag8BkIAAgnIBHgGIAAAtgAg0AuQAAgPAGgMQAGgLAIgHIARgKQAIgFAGgFQAFgHAAgIQAAgEgEgEQgEgDgHAAQgLAAgNACIgVADIgHACIgJgwIAJgDIAWgHQAQgDAQAAQAQAAAOADQAOAEAMAGQAMAHAHANQAHANAAARQAAAQgIAMQgHAKgKAHIgVALQgLAEgHAHQgIAGAAAJg");
	this.shape.setTransform(29.375,24.6);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	// Layer_6
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FBB1CF","#F54482"],[0,1],80,-21,80,29).s().p("AhZDSQhCAAgvgvQgvgvAAhCIAAhjQAAhCAvgvQAvgvBCAAICzAAQBCAAAvAvQAvAvAABCIAABjQAABCgvAvQgvAvhCAAg");
	this.shape_1.setTransform(29,25);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FE6392","#FFD6E4","#FBACCC"],[0,0.569,1],76,-25,76,25).s().p("AhZD6QhTAAg6g6Qg7g7AAhTIAAhjQAAhTA7g6QA6g7BTAAICzAAQBTAAA6A7QA7A6AABTIAABjQAABTg7A7Qg6A6hTAAg");
	this.shape_2.setTransform(29,25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,58,50);


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
	this.shape.graphics.f("#FFFFFF").s().p("AhUBaQgGgGAAgIQAAgIAGgGQAFgGAJAAQAIAAAGAGQAZAZAigBIABAAQAjABAZgZIAAAAQAZgaAAgjIAAgBQABgigagZIAAAAQgZgZgjAAIgBAAQgeABgXAUIAmAmQADADgBAEQAAADgCACQgDADgEAAIhlADQgDAAgDgCQgDgEABgDIAChkQAAgEADgDQACgCAEAAQAEAAADACIAgAfIABAAQAigfAugBIAAAAQA1AAAkAlIABAAQAlAlgBAzIAAAAQAAA0gkAlIAAAAQglAlg0gBIgBAAIgBAAQgxAAglgkg");
	this.shape.setTransform(29.7718,23.6253);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FBB1CF","#F54482"],[0,1],80,-21,80,29).s().p("AhZDSQhCAAgvgvQgvgvAAhCIAAhjQAAhCAvgvQAvgvBCAAICzAAQBCAAAvAvQAvAvAABCIAABjQAABCgvAvQgvAvhCAAg");
	this.shape_1.setTransform(29,25);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FE6392","#FFD6E4","#FBACCC"],[0,0.569,1],76,-25,76,25).s().p("AhZD6QhTAAg6g6Qg7g7AAhTIAAhjQAAhTA7g6QA6g7BTAAICzAAQBTAAA6A7QA7A6AABTIAABjQAABTg7A7Qg6A6hTAAg");
	this.shape_2.setTransform(29,25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(1));

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
	this.shape.graphics.f("#FFFFFF").s().p("AAaCHIAAhMIgzAAIAABMIgtAAQgNAAgJgJQgJgKAAgOIAAhPIgRAAQgHAAgFgEQgEgFAAgHQAAgGAEgEIB5h+QAFgFAEAAQAHAAAEAFIB4B+QAEAEAAAGQAAAHgEAFQgFAEgGAAIgRAAIAABPQAAAOgJAKQgJAJgNAAg");
	this.shape.setTransform(28.825,23.525);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer_2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#FBB1CF","#F54482"],[0,1],80,-21,80,29).s().p("AhZDSQhCAAgvgvQgvgvAAhCIAAhjQAAhCAvgvQAvgvBCAAICzAAQBCAAAvAvQAvAvAABCIAABjQAABCgvAvQgvAvhCAAg");
	this.shape_1.setTransform(29,25);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.lf(["#FE6392","#FFD6E4","#FBACCC"],[0,0.569,1],76,-25,76,25).s().p("AhZD6QhTAAg6g6Qg7g7AAhTIAAhjQAAhTA7g6QA6g7BTAAICzAAQBTAAA6A7QA7A6AABTIAABjQAABTg7A7Qg6A6hTAAg");
	this.shape_2.setTransform(29,25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.b_home, new cjs.Rectangle(0,0,58,50), null);


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
	this.logo.setTransform(220.5,199.95);

	this.b_help = new lib.b_help();
	this.b_help.name = "b_help";
	this.b_help.setTransform(62.05,365,1,1,0,0,0,25,50);

	this.b_play = new lib.b_play();
	this.b_play.name = "b_play";
	this.b_play.setTransform(207,366,1,1,0,0,0,105,50);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_play},{t:this.b_help},{t:this.logo}]}).wait(1));

	// Layer_3
	this.candy_right = new lib.candy_right();
	this.candy_right.name = "candy_right";
	this.candy_right.setTransform(419.4,402.75);

	this.candy_left = new lib.candy_left();
	this.candy_left.name = "candy_left";
	this.candy_left.setTransform(19.4,404.25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.candy_left},{t:this.candy_right}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_title, new cjs.Rectangle(-605.5,76.3,1024.9,328), null);


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

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_recap, new cjs.Rectangle(0.8,2,399.4,380), null);


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

}).prototype = getMCSymbolPrototype(lib.scene_instructions, new cjs.Rectangle(10,2,490,476), null);


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
	this.messages = new lib.messages();
	this.messages.name = "messages";
	this.messages.setTransform(199.05,198);

	this.timeline.addTween(cjs.Tween.get(this.messages).wait(1));

	// ui
	this.game_time = new lib.game_time();
	this.game_time.name = "game_time";
	this.game_time.setTransform(20,383.65);

	this.score_panel = new lib.scene_header_score();
	this.score_panel.name = "score_panel";
	this.score_panel.setTransform(213,3);

	this.b_home = new lib.b_home();
	this.b_home.name = "b_home";
	this.b_home.setTransform(388.75,388.05,1,1,0,0,0,58,50);

	this.b_restart = new lib.b_resetlevel();
	this.b_restart.name = "b_restart";
	this.b_restart.setTransform(324,388.05,1,1,0,0,0,58,50);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.b_restart},{t:this.b_home},{t:this.score_panel},{t:this.game_time}]}).wait(1));

	// Layer_2
	this.cards = new lib.mc_dummy();
	this.cards.name = "cards";
	this.cards.setTransform(200,200);

	this.timeline.addTween(cjs.Tween.get(this.cards).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.scene_game, new cjs.Rectangle(8.1,5,381.9,383.1), null);


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
(lib.SweetMemory = function(mode,startPosition,loop,reversed) {
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
p.nominalBounds = new cjs.Rectangle(-425.5,-57,1887.4,826);
// library properties:
lib.properties = {
	id: '35A5558F002BB0439538A2940A14BBA4',
	width: 400,
	height: 400,
	fps: 30,
	color: "#999999",
	opacity: 1.00,
	manifest: [
		{src:"media/images/bg_candy_left.png", id:"bg_candy_left"},
		{src:"media/images/bg_candy_right.png", id:"bg_candy_right"},
		{src:"media/images/card_spritesheet.png", id:"card_spritesheet"}
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