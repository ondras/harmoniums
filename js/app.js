import Render from "./render.js";
import * as Shape from "./shape.js";

Array.prototype.random = function() {
	return this[Math.floor(Math.random()*this.length)];
}

let render = null;
let count = 0;
let timeout = null;
let randomPhrase = null;
let randomWord = -1;
let word = "";
let wordMode = false;

function drawShape(shape) {
	const points = shape.getPoints(count);
	render.setPosition(points);
}

function scheduleRandom() {
	timeout && clearTimeout(timeout);
	const delay = (randomPhrase ? 2000 : 8000);
	timeout = setTimeout(random, delay);
}

function onKeypress(e) {
	randomPhrase = null;
	scheduleRandom();

	if (e.keyCode == 13) {
		if (wordMode && word) { drawShape(new Shape.Canvas(word)); }
		word = "";
		wordMode = !wordMode;
		return;
	}

	if (e.charCode == 32 || e.keyCode == 32) {
		// random();
		drawShape(new Shape.Spiral());
		return;
	}

	const ch = e.charCode;
	if (!ch) { return; }

	if (wordMode) {
		word += String.fromCharCode(ch);
	} else {
		const str = String.fromCharCode(ch);
		drawShape(new Shape.Canvas(str));
	}
}

function random() {
	clearTimeout(timeout);
	timeout = null;

	let shape = null;

	if (!randomPhrase) { // pick something new
		if (Math.random() > 0.33) { // start new phrase
			randomPhrase = PHRASES.random();
			randomWord = 0;
		} else { // start new symbol
			if (Math.random() > 0.8) {
				shape = new Shape.Spiral(3 + Math.floor(Math.random()*4));
			} else {
				shape = new Shape.Symbol();
			}
		}
	}

	if (randomPhrase) { // pick a word or end phrase
		if (randomWord == randomPhrase.length) { // end with random dots
			randomPhrase = null;
			shape = new Shape.Random();
		} else { // draw next word
			shape = new Shape.Canvas(randomPhrase[randomWord]);
			randomWord++;
		}
	}

	drawShape(shape);
	scheduleRandom();
}

function onClick(e)	{
	e.preventDefault();

	count = Number(e.target.getAttribute("data-count"));
	render = new Render(count);
	document.body.innerHTML = "";
	document.body.appendChild(render.getNode());

	drawShape(new Shape.Random());

	document.addEventListener("keypress", onKeypress);
	scheduleRandom();
}


function init() {
	[...document.querySelectorAll("a[data-count]")].forEach(a => a.addEventListener("click", onClick));
}

const PHRASES = [
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

init();

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
