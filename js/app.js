Array.prototype.random = function() {
	return this[Math.floor(Math.random()*this.length)];
}

Array.prototype.randomize = function() {
	var result = [];
	while (this.length) {
		var index = this.indexOf(this.random());
		result.push(this.splice(index, 1)[0]);
	}
	return result;
}

var App = {
	_harmoniums: [],
	_padding: 50,
	_node: null,
	_word: "",
	_wordMode: false,
	_phrases: [],
	_timeout: null,
	_randomPhrase: null,
	_randomWord: -1
};

App.init = function() {
	this._node = OZ.DOM.elm("div", {position:"absolute", left:this._padding + "px", top:this._padding+"px", opacity:0});
	OZ.CSS3.set(this._node, "transition", "opacity 1000ms");
	
	this._resize();
	
	var all = document.getElementsByTagName("a");
	for (var i=0;i<all.length;i++) {
		if (all[i].getAttribute("data-count")) { OZ.Touch.onActivate(all[i], this._build.bind(this)); }
	}
}

App.drawShape = function(shape, options) {
	this._resize();

	var o = {
		center: true, /* center to viewport */
		scale: true /* scale to fit viewport */
	};
	for (var p in options) { o[p] = options[p]; }
	
	/* get points from shape */
	var points = shape.getPoints(this._harmoniums.length);
	if (!points.length) { return false; }

	/* normalnize, center, scale */
	points = this._adjust(points, o);
	
	/* add to match number of harmoniums */
	var index = 0;
	while (points.length < this._harmoniums.length) { 
		points.push(points[index++]);
	}
	
	points = this._sort(points);
	
	/* adjust harmoniums */
	for (var i=0;i<points.length;i++) {
		this._harmoniums[i].setPosition(points[i]);
	}
	
	return true;
}

App._build = function(e) {
	OZ.Event.prevent(e);
	document.body.innerHTML = "";
	document.body.appendChild(this._node);
	var target = OZ.Event.target(e);
	var count = parseInt(target.getAttribute("data-count"));

	for (var i=0;i<count;i++) {
		var h = new Harmonium(this._node);
		this._harmoniums.push(h);
	}
	this.drawShape(new Shape.Random(this._node));
	
	setTimeout(function(){
		this._node.style.opacity = "";
		OZ.Touch.onActivate(document, this._activate.bind(this));
	}.bind(this), 500);
	
	OZ.Event.add(document, "keypress", this._keypress.bind(this));
	this._scheduleRandom();
}

App._sort = function(points) {
	/*
	var cnt = this._harmoniums.length;
	var result = new Array(cnt);

	var distances = [];
//	console.log("requested", points);

	for (var i=0;i<cnt;i++) {
		var h = this._harmoniums[i];
		var pos = h.getPosition();
//		console.log("harmonium", i, "at", pos);
		var dist = Infinity;
		var pointIndex = -1;

		for (var j=0;j<cnt;j++) {
			var point = points[j];
			var dx = point[0]-pos[0];
			var dy = point[1]-pos[1];
			var d = dx*dx+dy*dy;
			if (d < dist) { 
				dist = d; 
				pointIndex = j;
			}
		}
		
		distances.push({
			index: i,
			dist: dist,
			pointIndex: pointIndex
		});
	}
	
	distances.sort(function(a, b) {
		return b.dist - a.dist;
	});
	
//	console.log("distances", distances);

	for (var i=0;i<cnt;i++) {
		var index = distances[i].index;
		var dist = Infinity;
		var h = this._harmoniums[index];
		var pos = h.getPosition();
		var pointIndex = -1;
		
		for (var j=0;j<cnt-i;j++) {
			var point = points[j];
			var dx = point[0]-pos[0];
			var dy = point[1]-pos[1];
			var d = dx*dx+dy*dy;
			if (d < dist) {
				dist = d;
				pointIndex = j;
			}
		}
		
//		console.log("moving", pos, "by", dist);
		result[index] = points[pointIndex];
		points.splice(pointIndex, 1);
	}
	
	return result;
	*/
	
	
	var result = [];
	var cnt = this._harmoniums.length;
	for (var i=0;i<cnt;i++) {
		var pos = this._harmoniums[i].getPosition();
		var dist = Infinity;
		var index = -1;
		for (var j=0;j<cnt-i;j++) {
			var point = points[j];
			var dx = point[0]-pos[0];
			var dy = point[1]-pos[1];
			var d = dx*dx+dy*dy;
			if (d < dist) {
				dist = d;
				index = j;
			}
		}
		result.push(points[index]);
		points.splice(index, 1);
	}
	
	return result;
}

App._resize = function() {
	var win = OZ.DOM.win(true);
	win[0] -= 2*this._padding;
	win[1] -= 2*this._padding;
	this._node.style.width = win[0]+"px";
	this._node.style.height = win[1]+"px";
}

App._adjust = function(points, options) {
	var min = [Infinity, Infinity];
	var max = [-Infinity, -Infinity];
	var l = points.length;
	
	/* find extremes */
	for (var i=0;i<l;i++) {
		var p = points[i];
		for (var j=0;j<2;j++) {
			min[j] = Math.min(min[j], p[j]);
			max[j] = Math.max(max[j], p[j]);
		}
	}
	
	/* compute scale */
	var win = [this._node.offsetWidth, this._node.offsetHeight];
	var size = [0, 0];
	var finalScale = Infinity;

	for (var i=0;i<2;i++) {
		size[i] = max[i]-min[i];
		if (!size[i]) { continue; }
		
		var scale = win[i]/size[i];
		if (scale < finalScale) { finalScale = scale; }
	}
	
	if (finalScale == Infinity || !options.scale) { finalScale = 1; }

	/* compute offset */
	var offset = [0, 0];
	if (options.center) {
		for (var i=0;i<2;i++) {
			offset[i] = (win[i]-size[i]*finalScale)/2;
		}
	}

	
	for (var i=0;i<l;i++) {
		var p = points[i];
		for (var j=0;j<2;j++) {
			p[j] -= min[j];
			p[j] *= finalScale;
			p[j] += offset[j];
		}
	}
	
	return points;
}

App._keypress = function(e) {
	this._randomPhrase = null;
	this._scheduleRandom();

	if (e.keyCode == 13) {
		if (this._wordMode && this._word) {
			var a = new Shape.Canvas(this._word);
			this.drawShape(a);
		}
		this._word = "";
		this._wordMode = !this._wordMode;
		return;
	}
	
	if (e.charCode == 32 || e.keyCode == 32) {
		this._random();
		return;
	}

	var ch = e.charCode;
	if (!ch) { return; }
	
	if (this._wordMode) {
		this._word += String.fromCharCode(ch);
	} else {
		var str = String.fromCharCode(ch);
		var a = new Shape.Canvas(str);
		this.drawShape(a);
	}
	
}

App._activate = function(e) {
	this._randomPhrase = null;
	this._random();
}

App._scheduleRandom = function() {
	if (this._timeout) { clearTimeout(this._timeout); }
	var delay = (this._randomPhrase ? 2000 : 8000);
	this._timeout = setTimeout(this._random.bind(this), delay);
}

App._random = function() {
	clearTimeout(this._timeout);
	this._timeout = null;

	if (!this._randomPhrase) { 
		this._randomPhrase = this._phrases.random(); 
		this._randomWord = 0;
	}
	
	if (this._randomWord == this._randomPhrase.length) { /* end with random dots */
		this._randomPhrase = null;
		if (Math.random() > 0.5) {
			var shape = new Shape.Random(this._node);
		} else {
			var shape = new Shape.Spiral(3);
		}
		this.drawShape(shape);
	} else { /* draw next word */
		var word = this._randomPhrase[this._randomWord];
		var a = new Shape.Canvas(word);
		this.drawShape(a);
		this._randomWord++;
	}
	
	this._scheduleRandom();
}

App._phrases = [
	["We", "come", "in", "peace"],
	["The", "answer", "is", "42"],
	["Elvis", "is", "not", "dead"],
	["I", "see", "you"],
	["Alea", "iacta", "est"],
	["All", "work", "no", "play"],
	["Make", "love", "not", "war"],
	["The", "cake", "is", "a", "lie"],
	["1+1", "=", "?"],
	["I", "love", "bacon"],
	["Cheap", "viagra", "on", "sale"],
	["You", "have", "my", "sword"],
	["All", "your", "base", "are", "belong", "to", "us"],
	["This", "is", "Sparta"],
	["Hello", "world"],
	["Seznam", "dot", "cz"],
	["iddqd", "idkfa"],
	["caune", "pancau", "neasi"],
	["I", "love", "you"],
	["I", "see", "dead", "people"],
	["I", "am", "your", "father"],
	["Use", "the", "force", "Luke"],
	["Roses", "are", "red"],
	["Houston", "we", "have", "a", "problem"],
	["May", "the", "force", "be", "with", "you"],
	["Have", "you", "seen", "my", "dog", "?"]
];
