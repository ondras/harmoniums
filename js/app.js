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
	_padding: 30,
	_node: null
};

App.init = function() {
	this._node = OZ.DOM.elm("div", {position:"absolute", left:this._padding + "px", top:this._padding+"px"});
	
	OZ.Event.add(window, "resize", this._resize.bind(this));
	OZ.Event.add(document, "keypress", this._keypress.bind(this));
	this._resize();

	for (var i=0;i<500;i++) {
		var h = new Harmonium(this._node);
		this._harmoniums.push(h);
	}
	document.body.appendChild(this._node);
	
//	OZ.Touch.onActivate(document, this.go.bind(this));
}

App.drawShape = function(shape, options) {
	var o = {
		center: true, /* center to viewport */
		scale: true /* scale to fit viewport */
	};
	for (var p in options) { o[p] = options[p]; }
	
	var points = shape.getPoints(this._harmoniums.length);
	points = this._adjust(points, o);
	
	for (var i=0;i<points.length;i++) {
		this._harmoniums[i].setPosition(points[i]);
	}
	
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
//		console.log("shifting", p.join());
		for (var j=0;j<2;j++) {
			p[j] -= min[j];
			p[j] *= finalScale;
			p[j] += offset[j];
		}
//		console.log("to", p.join());
		
		
	}
	
	return points;
}

App.go = function() {
/*	var win = OZ.DOM.win();
	for (var i=0;i<this._harmoniums.length;i++) {
		var x = Math.round(Math.random()*win[0]);
		var y = Math.round(Math.random()*win[1]);
		this._harmoniums[i].setPosition([x, y]);
	}
	*/
	
	var p1 = [0, Math.random() > 0.5 ? 1 : 0];
	var p2 = [1, Math.random() > 0.5 ? 1 : 0];
	var line = new Shape.Line(p1, p2);
//	this.drawShape(line);
	
	var a = new Shape.Canvas("A");
	this.drawShape(a);
}

App._keypress = function(e) {
	var str = String.fromCharCode(e.charCode);
	var a = new Shape.Canvas(str);
	this.drawShape(a);
}
