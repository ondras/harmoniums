var Shape = OZ.Class();
Shape.prototype.init = function() {}
Shape.prototype.getPoints = function(count) {
	return [];
}

Shape.Line = OZ.Class().extend(Shape);
Shape.Line.prototype.init = function(a, b) {
	this._a = a;
	this._b = b;
}
Shape.Line.prototype.getPoints = function(count) {
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
		results.push([this._a[0] + k*v[0], this._a[1] + k*v[1]]);
	}
	return results;
}

Shape.Canvas = OZ.Class().extend(Shape);
Shape.Canvas.prototype.init = function(str) {
	var size = [1, 200];
	var family = "sans-serif";
	
	var canvas = OZ.DOM.elm("canvas", {width:size[0], height:1.5*size[1]});
	this._context = canvas.getContext("2d");
	this._context.font = size[1] + "px " + family;
	size[0] = this._context.measureText(str).width;
	
	canvas.width = size[0];
	this._context.font = size[1] + "px " + family;
	this._context.textBaseline = "top";
	
	this._context.fillText(str, 0, 0);
	
//	document.body.appendChild(canvas);
}

Shape.Canvas.prototype.getPoints = function(count) {
	var remain = count;
	var results = [];
	var width = this._context.canvas.width;
	var height = this._context.canvas.height;
	var imageData = this._context.getImageData(0, 0, width, height);
	var stack = [
		[0, 0, width-1, height-1]
	];
	
	while (remain) {
		var tmpResults = [];
		var newStack = [];
		while (stack.length) {
			var item = stack.pop();
	/*		
			this._context.globalAlpha = 0.2;
			this._context.fillStyle = "black";
			this._context.fillRect(item[0], item[1], item[2]-item[0], item[3]-item[1]);
			this._context.globalAlpha = 1;
	*/		
			var center = [
				Math.round((item[0]+item[2])/2),
				Math.round((item[1]+item[3])/2)
			];
			
			var index = center[0] + width*center[1];
			var color = imageData.data[4*index + 3];
			if (color == 255) {
				tmpResults.push(center);
//				this._context.fillStyle = "red";
//				this._context.fillRect(center[0], center[1], 3, 3);
				
			} else {
//				this._context.fillStyle = "green";
//				this._context.fillRect(center[0], center[1], 3, 3);
			}
			
			var todo = [];
			todo.push([item[0],   item[1],   center[0], center[1]]); /* top left */
			todo.push([center[0], item[1],   item[2],   center[1]]); /* top right */
			todo.push([item[0],   center[1], center[0], item[3]]); /* bottom left */
			todo.push([center[0], center[1], item[2],   item[3]]); /* bottom right */
			
			newStack = newStack.concat(todo.randomize());
		}
		
		tmpResults = tmpResults.randomize();
		while (remain && tmpResults.length) {
			results.push(tmpResults.pop());
			remain--;
		}
		
		stack = newStack;
	}
	
	return results;
}
