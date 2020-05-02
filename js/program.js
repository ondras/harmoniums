export default class Program {
	constructor(gl, vsSource, fsSource) {
		this._gl = gl;
		this.attributes = {};
		this._uniforms = {};

		const vs = shaderFromString(gl, gl.VERTEX_SHADER, vsSource);
		const fs = shaderFromString(gl, gl.FRAGMENT_SHADER, fsSource);

		const program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { throw new Error("Could not link the shader program"); }

		gl.deleteShader(vs);
		gl.deleteShader(fs);

		const aCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for (let i=0; i<aCount; i++) {
			const info = gl.getActiveAttrib(program, i);
			this.attributes[info.name] = gl.getAttribLocation(program, info.name);
		}

		const uCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for (let i=0; i<uCount; i++) {
			const info = gl.getActiveUniform(program, i);
			this._uniforms[info.name] = createUniformSetter(gl, info, program);
		}

		this._program = program;
	}

	use() {
		const gl = this._gl;
		gl.useProgram(this._program);

		for (let p in this.attributes) { gl.enableVertexAttribArray(this.attributes[p]); }
	}

	destroy() {
		this._gl.deleteProgram(this._program);
	}

	uniform(name, value) {
		this._uniforms[name](value);
	}
}

/*
function shaderFromId(gl, id) {
	let node = document.querySelector("#" + id);
	if (!node) { throw new Error("Cannot find shader for ID '"+id+"'"); }

	let src = "";
	let child = node.firstChild;

	while (child) {
		if (child.nodeType == child.TEXT_NODE) { src += child.textContent; }
		child = child.nextSibling;
	}

	if (node.type == "x-shader/x-fragment") {
		let type = gl.FRAGMENT_SHADER;
	} else if (node.type == "x-shader/x-vertex") {
		let type = gl.VERTEX_SHADER;
	} else {
		throw new Error("Unknown shader type '" + node.type +"'");
	}

	return shaderFromString(gl, type, src);
}
*/

function shaderFromString(gl, type, str) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error("Could not compile shader: " + gl.getShaderInfoLog(shader));
	}
	return shader;
}

function createUniformSetter(gl, info, program) {
	const location = gl.getUniformLocation(program, info.name);

	const type = info.type;
	// Check if this uniform is an array
	const isArray = (info.size > 1 && info.name.substr(-3) == "[0]");
	if (type == gl.FLOAT && isArray)
		return function(v) { gl.uniform1fv(location, v); };
	if (type == gl.FLOAT)
		return function(v) { gl.uniform1f(location, v); };
	if (type == gl.FLOAT_VEC2)
		return function(v) { gl.uniform2fv(location, v); };
	if (type == gl.FLOAT_VEC3)
		return function(v) { gl.uniform3fv(location, v); };
	if (type == gl.FLOAT_VEC4)
		return function(v) { gl.uniform4fv(location, v); };
	if (type == gl.INT && isArray)
		return function(v) { gl.uniform1iv(location, v); };
	if (type == gl.INT)
		return function(v) { gl.uniform1i(location, v); };
	if (type == gl.INT_VEC2)
		return function(v) { gl.uniform2iv(location, v); };
	if (type == gl.INT_VEC3)
		return function(v) { gl.uniform3iv(location, v); };
	if (type == gl.INT_VEC4)
		return function(v) { gl.uniform4iv(location, v); };
	if (type == gl.BOOL)
		return function(v) { gl.uniform1iv(location, v); };
	if (type == gl.BOOL_VEC2)
		return function(v) { gl.uniform2iv(location, v); };
	if (type == gl.BOOL_VEC3)
		return function(v) { gl.uniform3iv(location, v); };
	if (type == gl.BOOL_VEC4)
		return function(v) { gl.uniform4iv(location, v); };
	if (type == gl.FLOAT_MAT2)
		return function(v) { gl.uniformMatrix2fv(location, false, v); };
	if (type == gl.FLOAT_MAT3)
		return function(v) { gl.uniformMatrix3fv(location, false, v); };
	if (type == gl.FLOAT_MAT4)
		return function(v) { gl.uniformMatrix4fv(location, false, v); };
/*
	if ((type == gl.SAMPLER_2D || type == gl.SAMPLER_CUBE) && isArray) {
		let units = [];
		for (let i = 0; i < info.size; i++) { units.push(textureUnit++); }

		return function(bindPoint, units) {
			return function(textures) {
				gl.uniform1iv(location, units);
				textures.forEach(function(texture, index) {
					gl.activeTexture(gl.TEXTURE0 + units[index]);
					gl.bindTexture(bindPoint, tetxure);
				});
			}
		}(getBindPointForSamplerType(gl, type), units);
	}
	if (type == gl.SAMPLER_2D || type == gl.SAMPLER_CUBE)
		return function(bindPoint, unit) {
			return function(texture) {
				gl.uniform1i(location, unit);
				gl.activeTexture(gl.TEXTURE0 + unit);
				gl.bindTexture(bindPoint, texture);
			};
		}(getBindPointForSamplerType(gl, type), textureUnit++);
*/
	throw new Error("Unknown uniform type: 0x" + type.toString(16));
}
