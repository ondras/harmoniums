import Program from "./program.js";

export default class Render {
	constructor(count) {
		this._count = count;
		this._node = document.createElement("canvas");

		let o = {alpha:true, premultipliedAlpha:true};
		const gl = this._node.getContext("webgl", o) || this._node.getContext("experimental-webgl", o);
		this._gl = gl;

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		this._program = createProgram(gl);
		this._createBuffers();

		this._tick = this._tick.bind(this);
		this._tick();
	}

	getNode() { return this._node; }

	setPosition(position) {
		const gl = this._gl;

		// switch position buffers
		let pos = this._buffers.position;
		pos.push(pos.shift());

		// mark first buffer as source
		gl.bindBuffer(gl.ARRAY_BUFFER, pos[0]);
		gl.vertexAttribPointer(this._program.attributes.a_source, 2, gl.FLOAT, false, 0, 0);

		// mark second buffer as source, upload data
		gl.bindBuffer(gl.ARRAY_BUFFER, pos[1]);
		gl.vertexAttribPointer(this._program.attributes.a_target, 2, gl.FLOAT, false, 0, 0);
		gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

		// upload current time
		this._program.uniform("u_start", performance.now());
	}

	_createBuffers() {
		const gl = this._gl;

		this._buffers = {
			position: [gl.createBuffer(), gl.createBuffer()],
			size: gl.createBuffer(),
			color: gl.createBuffer()
		}

		// zeros as initial positions
		const zeros = new Float32Array(this._count*2);
		this.setPosition(zeros);
		this.setPosition(zeros);

		// colors
		const colors = new Float32Array(4*this._count);
		for (let i=0;i<this._count;i++) {
			colors[4*i+0] = (50*Math.random())/255;
			colors[4*i+1] = (50+150*Math.random())/255;
			colors[4*i+2] = (200+55*Math.random())/255;
			colors[4*i+3] = 0.4 + 0.5*Math.random();
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.color);
		gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
		gl.vertexAttribPointer(this._program.attributes.a_color, 4, gl.FLOAT, false, 0, 0);

		// sizes
		const sizes = new Float32Array(this._count);
		let len = Math.log(this._count) / Math.LN10;
		let multiplier =  10*(7.5 - 1.5*len); /* 1000 => 30, 10000 => 15, 100000 => 0 */
		for (let i=0;i<this._count;i++) {
			sizes[i] = multiplier*(1 + Math.random());
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.size);
		gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
		gl.vertexAttribPointer(this._program.attributes.a_size, 1, gl.FLOAT, false, 0, 0);
	}

	_sync() {
		if (!this._node.parentNode) { return; }
		this._node.width = this._node.clientWidth;
		this._node.height = this._node.clientHeight;
		this._gl.viewport(0, 0, this._node.width, this._node.height);
	}

	_tick() {
		requestAnimationFrame(this._tick);

		if (this._node.width != this._node.clientWidth || this._node.height != this._node.clientHeight) {
			this._sync();
		}

		const gl  = this._gl;
		gl.clear(gl.COLOR_BUFFER_BIT);

		this._program.uniform("u_now", performance.now());
		gl.drawArrays(gl.POINTS, 0, this._count);
	}
}

function createProgram(gl) {
	const program = new Program(gl, VS, FS);
	program.use();
	program.uniform("u_duration", 1000);
	return program;
}


const VS = `
attribute vec2 a_source;
attribute vec2 a_target;
attribute float a_size;
attribute vec4 a_color;
varying vec4 v_color;
uniform float u_now;
uniform float u_start;
uniform float u_duration;
void main(void) {

v_color = a_color;
float frac = (u_now - u_start) / u_duration;
frac = smoothstep(0.0, 1.0, frac);
bool hidden_source = (a_source.x < 0.001 && a_source.y < 0.001);
bool hidden_target = (a_target.x < 0.001 && a_target.y < 0.001);

if (hidden_source && hidden_target) {
	gl_PointSize = 0.;
} else {
	float size_source = hidden_source ? 0. : a_size;
	float size_target = hidden_target ? 0. : a_size;
	gl_PointSize = mix(size_source, size_target, frac);
}

if (hidden_source) {
	gl_Position = vec4(a_target, 0, 1.0);
} else if (hidden_target) {
	gl_Position = vec4(a_source, 0, 1.0);
} else {
	gl_Position = vec4(mix(a_source, a_target, frac), 0, 1.0);
}

gl_Position.x = gl_Position.x*2.0 - 1.0;
gl_Position.y = gl_Position.y*-2.0 + 1.0;
gl_Position.x *= 0.95;
gl_Position.y *= 0.95;
}`;

const FS = `
precision highp float;
varying vec4 v_color;
void main(void) {
float dist = length((gl_PointCoord-0.5)*2.0);
float alpha = 1.0 - smoothstep(0.9, 1.0, dist);
gl_FragColor = v_color;
gl_FragColor.a *= alpha;
}`;

