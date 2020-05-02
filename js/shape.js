export class Shape {
	getPoints(count) {
		return new Float32Array(2*count);
	}
}

export class Line extends Shape {
	constructor(a, b) {
		super();
		this._a = a;
		this._b = b;
	}

	getPoints(count) {
		let results = super.getPoints(count);

		let v = [];
		for (let i=0;i<2;i++) {
			v.push(this._b[i]-this._a[i]);
		}

		let start = 0.5;
		let step = 0;

		if (count > 1) {
			start = 0;
			step = 1/(count-1);
		}

		for (let i=0;i<count;i++) {
			let k = start + i*step;
			results[2*i+0] = this._a[0] + k*v[0];
			results[2*i+1] = this._a[1] + k*v[1];
		}
		return results;
	}
}

export class Random extends Shape {
	getPoints(count) {
		let results = super.getPoints(count);
		results.forEach((_, i, all) => all[i] = Math.random());
		return results;
	}
}

export class Spiral extends Shape {
	constructor(rotations = 3) {
		super();
		this._rotations = rotations;
	}

	getPoints(count) {
		let results = super.getPoints(count);

		const total = 2*Math.PI*this._rotations;
		for (let i=0;i<count;i++) {
			const angle = i*total/count;
			let dist = 0.45 * i/count;
			dist += 0.05*(Math.random()-0.5);
			results[2*i+0] = 0.5 + Math.cos(angle) * dist;
			results[2*i+1] = 0.5 + Math.sin(angle) * dist;
		}
		return results;
	}
}

export class Canvas extends Shape {
	static get FAMILY() { return "sans-serif"; }

	constructor(str) {
		super();

		const height = 200;
		const font = height + "px " + Canvas.FAMILY;

		const canvas = document.createElement("canvas");
		canvas.height = height;

		this._context = canvas.getContext("2d");
		this._context.font = font;
		const size = this._context.measureText(str);
		canvas.width = Math.max(size.width, height);

		this._context.font = font;
		this._context.textBaseline = "top";
		this._context.textAlign = "center";
		this._context.fillText(str, canvas.width/2, 0);

	//	document.body.appendChild(canvas);
	}

	getPoints(count) {
		let results = super.getPoints(count);
		let index = 0, tries = 0;

		const width = this._context.canvas.width;
		const height = this._context.canvas.height;
		const imageData = this._context.getImageData(0, 0, width, height);
		const len = width * height;

		while (index < count && tries < 4*count) {
			tries++;
			const pos = Math.floor(Math.random()*len);
			const color = imageData.data[4*pos + 3];
			if (color) {
				results[2*index+0] = (pos % width) / width;
				results[2*index+1] = Math.floor(pos / width) / height;
				index++;
			}
		}

		return results;
	}
}

const SYMBOLS = ["☺", "♥", "☮", "☢", "★", "☯", "♩", "⚫"];
export class Symbol extends Canvas {
	constructor() {
		super(SYMBOLS.random());
	}
}
