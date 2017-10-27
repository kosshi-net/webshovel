'use strict';

/* globals mat4, WebGLDebugUtils, Shader, Morton*/ 

class Renderer {
	constructor(args){
		

		this.canvas3d = args.canvas3d;
		// this.canvas2d = args.canvas2d;
		this.settings = args.settings;
		var settings = this.settings;
		this.morton = new Morton();


		if(settings.debug){
			this.gl = WebGLDebugUtils.makeDebugContext(this.canvas3d.getContext('webgl'));
			this.debug = true;
		}else{
			this.gl = this.canvas3d.getContext('webgl');
		}

		// this.ctx = this.canvas2d.getContext('2d');

		if(!this.gl){
			alert(	'Failed to get WebGL rendering context.\n'+
					"Use a modern browser with hardware acceleration enabled."
			);
			throw "Failed to initialise renderer.";
		}
		var gl = this.gl;
		// var ctx = this.ctx;



		this.renderedChunks = 0;
		this.renderCalls = 0;
		this.traversedChunks = 0;


	// Do stuff
		this.shader = new Shader(gl, 
			'./src/client/renderer/chunk_shader.glsl',
		   [['vertPos', 	'aVertexPosition' ],
			['vertNorm',	'aVertexNormal' ],
			['texCoord',	'aTextureCoord' ]],

		   [['projMat', "uMP"],
			['modelMat', "uMV"],
			['viewdist', "viewdist"],
			['texture', "uSampler"]]
		);

		this.xhairshader = new Shader(gl, 
			'./src/client/renderer/crosshair_shader.glsl',
		   [['vertPos', 'aVertexPosition' ]],

		   [['projMat', "uMP"],
			['modelMat', "uMV"]]
		);

		// this.allocateTexture(document.getElementById('tex0'));
		this.texture = this.createTexture(this.addPadding(document.getElementById('tex0')));

		this.textRenderer = new TextRenderer({renderer:this});
		this.AABBRenderer = new AABBRenderer({renderer:this});

		this.bufGeom = {};

		this.bufGeom.crosshair = gl.createBuffer();
		let _geom = new Float32Array([
			 0,	-1,	 0,
			 0,	 1,	 0,
			-1,	 0,	 0,
			 1,	 0,	 0
		]);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufGeom.crosshair);
		gl.bufferData(gl.ARRAY_BUFFER, _geom, gl.STATIC_DRAW);


	// Gl stuff
		gl.clearColor(0.8, 0.8, 1.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.FRONT);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


		window.onresize = function(){
			this.setResolution(window.innerWidth, window.innerHeight);
		}.bind(this);




		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		
		this.setResolution(window.innerWidth, window.innerHeight);
		this.matrixStack = [];
	}

	pushMatrix(mat){
		var copy = mat4.create(mat);
		this.matrixStack.push(copy);
	}

	popMatrix(){
		return this.matrixStack.pop();
	}

	getCamera(args){
		var cam = args.loc;
		var mvMatrix = mat4.create();
		var gl = this.gl;

		mat4.identity(mvMatrix);

		mat4.rotate(mvMatrix, Math.degToRad(args.pitch), [1,0,0]);
		mat4.rotate(mvMatrix, Math.degToRad(args.yaw), [0, 1, 0]);
		mat4.translate(mvMatrix, [-cam[0], -cam[1], -cam[2]]);

		let p = mat4.create();

		mat4.perspective(80, gl.viewportWidth / gl.viewportHeight, 0.001, parseInt(this.settings.viewdist), p);

		return {mv:mvMatrix, p:p};
	}

	renderCrosshair(){
		let gl = this.gl;
		let shader = this.xhairshader;
		if(!shader.ready) return;
		let ortho = [];

		gl.useProgram(shader.program);
		shader.enableAttributes();

		let sc = 80;

		mat4.ortho(0, gl.viewportWidth / gl.viewportHeight * sc, 0, 1*sc, 0, 1, ortho);
		gl.uniformMatrix4fv(shader.uniform.projMat, false, ortho);
		
		
		let mvMatrix = mat4.create();
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [gl.viewportWidth / gl.viewportHeight*sc*0.5,sc*0.5,0]);
			
		gl.uniformMatrix4fv(shader.uniform.modelMat, false, mvMatrix);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufGeom.crosshair);
		gl.vertexAttribPointer(shader.attribute.vertPos, 3, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.LINES, 0, 4);

		gl.uniformMatrix4fv(shader.uniform.modelMat, false, mvMatrix);	
		
		shader.disableAttributes();

	}

	clearScreen(){
		let gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	setResolution(width, height){
		var gl = this.gl;
		this.canvas3d.width = width;
		this.canvas3d.height = height;

		gl.viewportWidth = width;
		gl.viewportHeight = height;
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	}

	addPadding(image, px) {
		px = px || 16;
		let canvas = document.createElement('canvas');
		canvas.height = image.height*2;
		canvas.width = image.width*2;
		let ctx = canvas.getContext('2d');
		for (var x = 0; x < canvas.width/px; x++)
		for (var y = 0; y < canvas.height/px; y++) {
			ctx.drawImage(image, px*x, px*y, px, px, x*px*2, y*px*2, px, px);
			ctx.drawImage(image, px*x, px*y, px, px, x*px*2, y*px*2+px, px, px);
			ctx.drawImage(image, px*x, px*y, px, px, x*px*2+px, y*px*2, px, px);
			ctx.drawImage(image, px*x, px*y, px, px, x*px*2+px, y*px*2+px, px, px);
		}
		return ctx.getImageData(0,0,canvas.width, canvas.height);
	}

	// Dont use these two, theyre just notes
	allocateTexture(texture){
		var gl = this.gl;
		this.texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, this.texture );
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); 

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
			(this.settings.mipmap) ? gl.NEAREST_MIPMAP_LINEAR : gl.NEAREST);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	createTexture(src){
		let gl = this.gl;
    	let tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return tex;
	}

	renderTerrain(args){
		if(!this.shader.ready) return;
		var gl = this.gl;
		gl.uniform1i(this.shader.uniform.texture, 0);
		gl.useProgram(this.shader.program);
		this.shader.enableAttributes();

		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		var world = args.world;


		var c = this.getCamera(args);
		var p = c.p;
		var mvp = mat4.create(p);
		var mv = c.mv;

		mat4.multiply(mvp, mv);
		var frustumplanes = this.extractPlanes(mvp);


		this.renderedChunks = 0;
		this.renderCalls = 0;
		this.test1 = 0;

		gl.uniformMatrix4fv(this.shader.uniform.projMat, false, p);

		gl.uniform1f(this.shader.uniform.viewdist, this.settings.viewdist);


		var chunk;

		var arr = world.chunkArray;

		for(let j = 0; j < arr.length; j++) {
			chunk = arr[j];

			if( !(chunk.FLAGS & world.FLAG.DRAW) 
			|| !chunk.frustumcull(frustumplanes)
			) continue;

			this.pushMatrix(mv);

			mat4.translate(mv, [
				chunk.loc[0]*world.chunkroot,
				chunk.loc[1]*world.chunkroot,
				chunk.loc[2]*world.chunkroot]
			);
			
			gl.uniformMatrix4fv(this.shader.uniform.modelMat, false, mv);

			this.renderedChunks++;

			gl.bindBuffer(gl.ARRAY_BUFFER, chunk.geometry.vertex);
			gl.vertexAttribPointer(this.shader.attribute.vertPos, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, chunk.geometry.normal);
			gl.vertexAttribPointer(this.shader.attribute.vertNorm, chunk.geometry.normal.itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, chunk.geometry.uv);
			gl.vertexAttribPointer(this.shader.attribute.texCoord, 2, gl.FLOAT, false, 0, 0);
			for( var i = 0; i < 6; i++ )
				if( ( chunk.FLAGS & 1 << i ) ){
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.geometry.index[i]);
					gl.drawElements(gl.TRIANGLES , chunk.geometry.index[i].numItems, gl.UNSIGNED_SHORT, 0);
					this.renderCalls++;
				}

			mv = this.popMatrix();

		}
		this.shader.disableAttributes();
	}


	extractPlanes(M) {
		var planes = [
			[ M[3]-M[0], M[7]-M[4], M[11]-M[8], M[15]-M[12]],
			[ M[3]+M[0], M[7]+M[4], M[11]+M[8], M[15]+M[12]],
			[ M[3]-M[1], M[7]-M[5], M[11]-M[9], M[15]-M[13]],
			[ M[3]+M[1], M[7]+M[5], M[11]+M[9], M[15]+M[13]],
			[ M[3]-M[2], M[7]-M[6], M[11]-M[10], M[15]-M[14]],
			[ M[3]+M[2], M[7]+M[6], M[11]+M[10], M[15]+M[14]]
		];
		for(var i = 0; i < 6; i++){
			var length = Math.vec3.length( planes[i] );
			planes[i][0] /= length;
			planes[i][1] /= length;
			planes[i][2] /= length;
			planes[i][3] /= length;
		}
		return planes;
	}
}

