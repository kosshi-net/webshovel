'use strict';

/* globals mat4, Shader */ 

class AABBRenderer {
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

		this.bufferGeometry = gl.createBuffer();
		let _geom = new Float32Array([
			0, 0, 0,
			0, 0, 1,

			0, 0, 0,
			0, 1, 0,

			0, 0, 0,
			1, 0, 0,

			1, 1, 1,
			1, 1, 0,

			1, 1, 1,
			1, 0, 1,

			1, 1, 1,
			0, 1, 1,

			0, 1, 0,
			0, 1, 1,

			0, 1, 0,
			1, 1, 0,

			1, 0, 1,
			1, 0, 0,

			1, 0, 1,
			0, 0, 1,

			0, 1, 1,
			0, 0, 1,

			1, 0, 0,
			1, 1, 0,

		]);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferGeometry);
		this.bufferGeometry.length = _geom.length/3;
		gl.bufferData(gl.ARRAY_BUFFER, _geom, gl.STATIC_DRAW);

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

		var mat = this.renderer.getCamera(args);

		gl.uniformMatrix4fv(shader.uniform.projMat, false, mat.p);

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

			this.renderer.pushMatrix(mat.mv);

			mat4.translate(mat.mv, min);
			mat4.scale(mat.mv, max);
			
			gl.uniformMatrix4fv(shader.uniform.modelMat, false, mat.mv);

			gl.drawArrays(gl.LINES, 0, this.bufferGeometry.length);

			mat.mv = this.renderer.popMatrix();

		}
		shader.disableAttributes();

	}


}