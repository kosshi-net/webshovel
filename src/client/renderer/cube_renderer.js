'use strict';

/* globals mat4, Shader */ 

class CubeRenderer {
	constructor(args){
		this.renderer = args.renderer;
		this.gl = this.renderer.gl;

		let gl = this.gl;

		this.shader = new Shader(gl, 
			'./src/client/renderer/aabb_shader.glsl',
		   [['vertPos', 'aVertexPosition' ]],

		   [['projMat', "uMP"],
		   	['texCoord', "uTexCoord"],
			['modelMat', "uMV"],
			['texture', "uSampler"]]
		);

		this.bufferVertex = gl.createBuffer();
		this.bufferIndex = gl.createBuffer();
		
		var vertices = new Float32Array([
			1.0,	1.0,	1.0,
			0.0,	1.0,	1.0,
			1.0,	1.0,	0.0,
			0.0,	1.0,	0.0,
			1.0,	0.0,	1.0,
			0.0,	0.0,	1.0,
			0.0,	0.0,	0.0,
			1.0,	0.0,	0.0
		]);

		var elements = new Uint16Array([
			3, 2, 6, 7, 4, 2, 0,
			3, 1, 6, 5, 4, 1, 0
		]);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertex);
		this.bufferVertex.length = vertices.length/3;
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndex);
		this.bufferIndex.length = elements.length/3;
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elements, gl.STATIC_DRAW);

	}

	render(args){
		let shader = this.shader;
		if(!shader.ready) return;
		let gl = this.gl;
		gl.uniform1i(shader.uniform.texture, 0);
		gl.useProgram(shader.program);
		shader.enableAttributes();

		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		let entities = args.entities;
		let cam = args.loc;

		let mvMatrix = mat4.create();
		mat4.identity(mvMatrix);

		mat4.rotate(mvMatrix, Math.degToRad(args.pitch), [1,0,0]);
		mat4.rotate(mvMatrix, Math.degToRad(args.yaw), [0, 1, 0]);
		mat4.translate(mvMatrix, [-cam[0], -cam[1], -cam[2]]);
		let mvp = mat4.create();
		let p = mat4.create();
		mat4.multiply(mvp, mvMatrix);
		// var frustumplanes = this.extractPlanes(mvp);

		mat4.perspective(80, gl.viewportWidth / gl.viewportHeight, 0.001, parseInt(this.renderer.settings.viewdist), p);
		gl.uniformMatrix4fv(shader.uniform.projMat, false, p);

		gl.uniform1f(shader.uniform.viewdist, this.renderer.settings.viewdist);


		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferGeometry);
		gl.vertexAttribPointer(shader.attribute.vertPos, 3, gl.FLOAT, false, 0, 0);

		for(let j = 0; j < entities.length; j++) {
			let entity = entities[j];


			if( !entity.components.aabb 
			 ||	!entity.components.physics
			 ||	!entity.components.appearance
			) continue;

			let p = entity.components.physics;
			// || !chunk.frustumcull(frustumplanes)
			
			var min = Math.vec3.new.addVec(p.location, entity.components.aabb.min, Float32Array);
			var max = Math.vec3.new.subVec(entity.components.aabb.max, entity.components.aabb.min, Float32Array);

			this.renderer.pushMatrix(mvMatrix);

			mat4.translate(mvMatrix, min);
			mat4.scale(mvMatrix, max);
			
			gl.uniformMatrix4fv(shader.uniform.modelMat, false, mvMatrix);

			gl.drawArrays(gl.LINES, 0, this.bufferGeometry.length);

			mvMatrix = this.renderer.popMatrix();

		}
		shader.disableAttributes();

	}


}