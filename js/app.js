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
	_render: null,
	_count: 0,
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
	var all = document.querySelectorAll("a[data-count]");
	for (var i=0;i<all.length;i++) {
		all[i].addEventListener("click", this);
	}
}

App.drawShape = function(shape) {
	var points = shape.getPoints(this._count);
	this._render.setPosition(points);
}

App.handleEvent = function(e) {
	switch (e.type) {
		case "click":
			e.preventDefault();

			this._count = parseInt(e.target.getAttribute("data-count"));
			this._render = new Render(this._count);
			document.body.innerHTML = "";
			document.body.appendChild(this._render.getNode());

			this.drawShape(new Shape.Random());
			
			document.addEventListener("keypress", this);
			this._scheduleRandom();
		break;

		case "keypress":
			this._keypress(e);
		break;
	}
}
/*
App._sort = function(points) {
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
*/
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
	
	var shape = null;

	if (!this._randomPhrase) { /* pick something new */
		if (Math.random() > 0.33) { /* start new phrase */
			this._randomPhrase = this._phrases.random(); 
			this._randomWord = 0;
		} else { /* start new symbol */
			if (Math.random() > 0.8) {
				shape = new Shape.Spiral(3 + Math.floor(Math.random()*4));
			} else {
				shape = new Shape.Symbol();
			}
		}
	}
	
	if (this._randomPhrase) { /* pick a word or end phrase */
		if (this._randomWord == this._randomPhrase.length) { /* end with random dots */
			this._randomPhrase = null;
			shape = new Shape.Random();
		} else { /* draw next word */
			shape = new Shape.Canvas(this._randomPhrase[this._randomWord]);
			this._randomWord++;
		}
	}
		
	this.drawShape(shape);
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
	["Have", "you", "seen", "my", "dog", "?"],
	["WTF", "OMG", "LOL"],
	["To", "be", "or", "not", "to", "be"],
	["Sůl", "nad", "zlato"],
	["The", "truth", "is", "out", "there"],
	["Pravda", "vítězí"],
	["My", "name", "is", "Indrid", "Cold"],
	["They", "killed", "Kenny"],
	["I", "know", "what", "you", "did"],
	["Velký", "bratr", "tě", "vidí"],
	["Malý", "bratr", "tě", "vidí"],
	["Why", "is", "the", "rum", "always", "gone"]
];
