'use strict';

/* globals mat4, Shader */ 

class TextRenderer {
	constructor(args){
		this.renderer = args.renderer;
		this.gl = this.renderer.gl;

		let gl = this.gl;

		this.shader = new Shader(gl, 
			'./src/client/renderer/text_shader.glsl',
		   [['vertPos', 'aVertexPosition' ]],

		   [['projMat', "uMP"],
		   	['texCoord', "uTexCoord"],
			['modelMat', "uMV"],
			['texture', "uSampler"]]
		);

		this.bufferGeometry = gl.createBuffer();
		let _geom = new Float32Array([
			0,0,0,
			0,1,0,
			1,0,0,
			1,1,0
		]);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferGeometry);
		gl.bufferData(gl.ARRAY_BUFFER, _geom, gl.STATIC_DRAW);


		this.texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('tex1'));

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			// gl.NEAREST_MIPMAP_LINEAR : gl.NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	render(text){
		let gl = this.gl;
		let shader = this.shader;
		if(!shader.ready) return;
		let ortho = [];

		const tileSize = 1/16;

		gl.useProgram(shader.program);
		shader.enableAttributes();
		gl.uniform1i(shader.uniform.texture, 1);

		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		let sc = 50;

		mat4.ortho(0, gl.viewportWidth / gl.viewportHeight * sc, 0, 1*sc, 0, 1, ortho);
		gl.uniformMatrix4fv(shader.uniform.projMat, false, ortho);
		
		
		let mvMatrix = mat4.create();
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [0,sc-1,0]);
			
		gl.uniformMatrix4fv(shader.uniform.modelMat, false, mvMatrix);


		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferGeometry);
		gl.vertexAttribPointer(shader.attribute.vertPos, 3, gl.FLOAT, false, 0, 0);

		let column = 0;

		for (var i = 0; i < text.length; i++) {
			let code = text.charCodeAt(i);
			gl.uniform4f(shader.uniform.texCoord, 
				(code)%16, 
				(code/16)|0, 
				tileSize, 0.0);
			column++;
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			if(code==10){
				mat4.translate(mvMatrix, [-column,-1,0]);
				column=0;
			}
			mat4.translate(mvMatrix, [1,0,0]);
			gl.uniformMatrix4fv(shader.uniform.modelMat, false, mvMatrix);	
		}
		shader.disableAttributes();
	}

}