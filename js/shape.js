var Shape = function() {
};
Shape.prototype.getPoints = function(count) {
	return new Float32Array(2*count);
}

Shape.Line = function(a, b) {
	Shape.call(this);
	this._a = a;
	this._b = b;
}
Shape.Line.prototype = Object.create(Shape.prototype);

Shape.Line.prototype.getPoints = function(count) {
	var results = Shape.prototype.getPoints.call(this, count);

	var v = [];
	for (var i=0;i<2;i++) {
		v.push(this._b[i]-this._a[i]);
	}
	
	var start = 0.5;
	var step = 0;
	
	if (count > 1) {
		start = 0;
		step = 1/(count-1);
	}
	
	var results = [];
	for (var i=0;i<count;i++) {
		var k = start + i*step;
		results[2*i+0] = this._a[0] + k*v[0];
		results[2*i+1] = this._a[1] + k*v[1];
	}
	return results;
}

Shape.Random = function() {
	Shape.call(this);
}
Shape.Random.prototype = Object.create(Shape.prototype);

Shape.Random.prototype.getPoints = function(count) {
	var results = Shape.prototype.getPoints.call(this, count);

	for (var i=0;i<results.length;i++) {
		results[i] = Math.random();
	}
	return results;
}

Shape.Spiral = function(rotations) {
	Shape.call(this);
	this._rotations = rotations || 3;
}
Shape.Spiral.prototype = Object.create(Shape.prototype);

Shape.Spiral.prototype.getPoints = function(count) {
	var results = Shape.prototype.getPoints.call(this, count);

	var total = 2*Math.PI*this._rotations;
	for (var i=0;i<count;i++) {
		var angle = i*total/count;
		var dist = 0.45 * i/count;
		results[2*i+0] = 0.5 + Math.cos(angle) * dist;
		results[2*i+1] = 0.5 + Math.sin(angle) * dist;
	}
	return results;
}

Shape.Canvas = function(str) {
	var height = 200;
	var font = height + "px " + Shape.Canvas.FAMILY;
	
	var canvas = document.createElement("canvas");
	canvas.height = height;

	this._context = canvas.getContext("2d");
	this._context.font = font;
	var size = this._context.measureText(str);
	canvas.width = Math.max(size.width, height);

	this._context.font = font;
	this._context.textBaseline = "top";
	this._context.textAlign = "center";
	this._context.fillText(str, canvas.width/2, 0);
	
//	document.body.appendChild(canvas);
}
Shape.Canvas.FAMILY = "sans-serif";
Shape.Canvas.prototype = Object.create(Shape.prototype);

Shape.Canvas.prototype.getPoints = function(count) {
	var results = Shape.prototype.getPoints.call(this, count);
	var index = 0, tries = 0;

	var width = this._context.canvas.width;
	var height = this._context.canvas.height;
	var imageData = this._context.getImageData(0, 0, width, height);
	var len = width * height;

	while (index < count && tries < 4*count) {
		tries++;
		var pos = Math.floor(Math.random()*len);
		var color = imageData.data[4*pos + 3];
		if (color) {
			results[2*index+0] = (pos % width) / width;
			results[2*index+1] = Math.floor(pos / width) / height;
			index++;
		}

	}

	console.log("index", index);
	
	return results;
}

Shape.Symbol = function() {
	var symbols = ["☺", "♥", "☮", "☢", "★", "☯", "♩", "⚫"];
	return new Shape.Canvas(symbols.random());
}
