var Harmonium = OZ.Class();
Harmonium.prototype.init = function(parent) {
	this._node = OZ.DOM.elm("div", {position:"absolute", left:"0px", top:"0px"});
	this._node.style.borderRadius = "50%";
	this._node.style.borderStyle = "solid";
	
	this._node.style.borderColor = "blue";
	
	OZ.CSS3.set(this._node, "transition", "all 1000ms ease-out");
	
	parent.appendChild(this._node);
	
	this._range = {
		radius: [15, 30],
		opacity:[0.6, 0.9],
		red: [0, 30],
		green: [50, 150],
		blue: [230, 255],
		position: [-5, 5]
	};
	
	this._radius = 30;
	this._position = [200, 0];
	this._sync();
}

Harmonium.prototype.setPosition = function(position) {
	this._position = position;
	for (var i=0;i<2;i++) {
		this._position[i] = Math.round(this._position[i] + this._fromRange("position"));
	}
	
	this._radius = Math.round(this._fromRange("radius"));
	
	var alpha = this._fromRange("opacity");
	var r = this._fromRange("red");
	var g = this._fromRange("green");
	var b = this._fromRange("blue");
	this._node.style.borderColor = "rgba(" + Math.round(r) + ", " + Math.round(g) + ", " + Math.round(b) + ", " + alpha + ")";
	
	this._sync();
	return this;
}

Harmonium.prototype.getPosition = function() {
	return this._position;
}

Harmonium.prototype._fromRange = function(range) {
	range = this._range[range];
	return range[0] + Math.random()*(range[1]-range[0]);
}

Harmonium.prototype._sync = function() {
	/* SLOW
	OZ.CSS3.set(this._node, "transform", "translate(" + (this._position[0] - this._radius) + "px, " + (this._position[1] - this._radius) + "px)");
	*/
	this._node.style.left = (this._position[0] - this._radius) + "px";
	this._node.style.top = (this._position[1] - this._radius) + "px";
	this._node.style.borderWidth = this._radius + "px";
}
