'use strict';
class Shader {
	constructor(gl, url, attributes, uniforms){
		this.gl = gl;
		this.ready = false;
		this.srcurl = url;

		this.attributes = attributes;
		this.uniforms = uniforms;
		this.attribute = {};
		this.uniform = {};

		this.program = gl.createProgram();
		this.http = new XMLHttpRequest();
		this.http.onreadystatechange = function(){
			if (this.http.readyState == 4 && this.http.status == 200){
				this.compile(this.http.responseText);
			}
		}.bind(this);

		this.fragshader = 0;
		this.vertshader = 0;
		this.observer = new Observer();

		this.load();
	}

	load(){
		this.http.open("GET", this.srcurl, true);
		this.http.send();
	}

	enableAttributes(){
		let gl = this.gl;
		for ( let i = 0; i < this.attributes.length; i++){
			let id = gl.getAttribLocation(this.program, this.attributes[i][1]);
			gl.enableVertexAttribArray(id);
		}
	}

	disableAttributes(){
		let gl = this.gl;
		for ( let i = 0; i < this.attributes.length; i++){
			let id = gl.getAttribLocation(this.program, this.attributes[i][1]);
			gl.disableVertexAttribArray(id);
		}
	}

	compile(src){
		console.log('Compiling shader...');
		let gl = this.gl;
		let vertsrc =  src.split('{VERTEX_SHADER}')  [1];
		let fragsrc =  src.split('{FRAGMENT_SHADER}')[1];

		if(this.fragshader){
			gl.detachShader(this.program, this.fragshader);
		}

		if(this.vertshader){
			gl.detachShader(this.program, this.vertshader);
		}

		let vertshader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertshader, vertsrc);
		gl.compileShader(vertshader);
		if (!gl.getShaderParameter(vertshader, gl.COMPILE_STATUS))
			throw(gl.getShaderInfoLog(vertshader));
		
		let fragshader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragshader, fragsrc);
		gl.compileShader(fragshader);
		if (!gl.getShaderParameter(fragshader, gl.COMPILE_STATUS))
			throw(gl.getShaderInfoLog(fragshader));

		gl.attachShader(this.program, vertshader);
		gl.attachShader(this.program, fragshader);
		gl.linkProgram(this.program);
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) 
			throw "Link Failure.";

		this.vertshader = vertshader;
		this.fragshader = fragshader;

		this.attribute = {};
		for ( let i = 0; i < this.attributes.length; i++){
			let id = gl.getAttribLocation(this.program, this.attributes[i][1]);
			gl.enableVertexAttribArray(id);
			this.attribute[this.attributes[i][0]] = id;
		}
		this.uniform = {};
		for ( let i = 0; i < this.uniforms.length; i++){
			let id = gl.getUniformLocation(this.program, this.uniforms[i][1]);
			this.uniform[this.uniforms[i][0]] = id;
		}

		this.ready = true;
		this.observer.fire('ready');
	}
}
