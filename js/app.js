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
	this._node = OZ.DOM.elm("div", {position:"absolute", left:this._padding + "px", top:this._padding+"px", opacity:0});
	OZ.CSS3.set(this._node, "transition", "opacity 1000ms");
	
	OZ.Event.add(window, "resize", this._resize.bind(this));
	OZ.Event.add(document, "keypress", this._keypress.bind(this));
	
	document.body.appendChild(this._node);
	this._resize();
	var size = [this._node.offsetWidth, this._node.offsetHeight];

	for (var i=0;i<500;i++) {
		var h = new Harmonium(this._node);
		h.setPosition([Math.random()*size[0], Math.random()*size[1]]);
		this._harmoniums.push(h);
	}
	
	setTimeout(function(){
		this._node.style.opacity = 1;
	}.bind(this), 2000);

//	OZ.Touch.onActivate(document, this.go.bind(this));
}

App.drawShape = function(shape, options) {
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

App._keypress = function(e) {
	OZ.Event.prevent(e);
	var str = String.fromCharCode(e.charCode);
	var a = new Shape.Canvas(str);
	this.drawShape(a);
}
