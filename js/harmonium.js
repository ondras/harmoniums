var Harmonium = OZ.Class();
Harmonium.prototype.init = function(parent, useTransform) {
	this._node = OZ.DOM.elm("div");
	this._useTransform = useTransform;
	this._position = [0, 0];
	
	this._range = {
		radius: [15, 30],
		opacity: [0.4, 0.9],
		red: [0, 50],
		green: [50, 200],
		blue: [200, 255],
		position: [-5, 5]
	};
	
	this._radius = Math.round(this._fromRange("radius"));
	var size = 2*this._radius + "px";
	this._node.style.width = size;
	this._node.style.height = size;

	var alpha = this._fromRange("opacity");
	var r = this._fromRange("red");
	var g = this._fromRange("green");
	var b = this._fromRange("blue");
	this._node.style.backgroundColor = "rgba(" + Math.round(r) + ", " + Math.round(g) + ", " + Math.round(b) + ", " + alpha + ")";

	parent.appendChild(this._node);
}

Harmonium.prototype.setPosition = function(position) {
	this._position = position;
	for (var i=0;i<2;i++) {
		this._position[i] = Math.round(this._position[i] + this._fromRange("position"));
	}
	
	if (this._useTransform) {
		OZ.CSS3.set(this._node, "transform", "translate3d(" + (this._position[0] - this._radius) + "px, " + (this._position[1] - this._radius) + "px, 0)");
	} else {
		this._node.style.left = (this._position[0] - this._radius) + "px";
		this._node.style.top = (this._position[1] - this._radius) + "px";

	}

	return this;
}

Harmonium.prototype.getPosition = function() {
	return this._position;
}

Harmonium.prototype._fromRange = function(range) {
	range = this._range[range];
	return range[0] + Math.random()*(range[1]-range[0]);
}
