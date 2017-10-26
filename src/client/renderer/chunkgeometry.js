'use strict';

class ChunkGeometry{
	constructor(args){
		var loc = args.loc;
		var chunkroot = args.world.chunkroot;
		this.blockArray = new Uint8Array(args.blockArray);
		this.sphere = args.world.chunkBoundingSphere;
		this.gl = args.renderer.gl;

		var gl = this.gl;

		this.loc = new Float32Array(loc);
		this.chunkroot = chunkroot;
		this.worldcenter = new Float32Array([
			((this.loc[0]*chunkroot)+(chunkroot*0.5)),
			((this.loc[1]*chunkroot)+(chunkroot*0.5)),
			((this.loc[2]*chunkroot)+(chunkroot*0.5))
		]);	

		this.aabb = {
			max: new Float32Array([
				loc[0]*chunkroot+chunkroot,
				loc[1]*chunkroot+chunkroot,
				loc[2]*chunkroot+chunkroot
			]), min: new Float32Array([
				loc[0]*chunkroot,
				loc[1]*chunkroot,
				loc[2]*chunkroot
			])
		};
		this.points = [
			new Float32Array([ this.aabb.min[0], this.aabb.min[1], this.aabb.min[2] ]),
			new Float32Array([ this.aabb.min[0], this.aabb.min[1], this.aabb.max[2] ]),
			new Float32Array([ this.aabb.min[0], this.aabb.max[1], this.aabb.min[2] ]),
			new Float32Array([ this.aabb.min[0], this.aabb.max[1], this.aabb.max[2] ]),
			new Float32Array([ this.aabb.max[0], this.aabb.min[1], this.aabb.min[2] ]),
			new Float32Array([ this.aabb.max[0], this.aabb.min[1], this.aabb.max[2] ]),
			new Float32Array([ this.aabb.max[0], this.aabb.max[1], this.aabb.min[2] ]),
			new Float32Array([ this.aabb.max[0], this.aabb.max[1], this.aabb.max[2] ]),
		];

		this.geometry = {
			original: [],
			vertex: gl.createBuffer(),
			uv: gl.createBuffer(),
			normal: gl.createBuffer(),
			index: [],
			fullindex: gl.createBuffer()
		};

		for(var i=0;i<6;i++){
			this.geometry.index[i] = gl.createBuffer();
		}

		this.FLAGS = 0;
	}
	
	setGeometry(geom) {
		var gl = this.gl;
		// this.blockArray = geom.block;
		let view = new Float32Array(geom.vertex);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vertex);
		gl.bufferData(gl.ARRAY_BUFFER, view, gl.STATIC_DRAW);

		this.geometry.vertex.numItems = Math.floor(view.length/3);
		this.geometry.vertex.itemSize = 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.uv);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.uv), gl.STATIC_DRAW);
		this.geometry.uv.itemSize = 4;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.normal);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.normal), gl.STATIC_DRAW);
		this.geometry.normal.itemSize = 3;

		for(var i=0;i<6;i++){
			view = new Uint16Array(geom.index[i]);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.index[i]);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, view , gl.STATIC_DRAW);
			this.geometry.index[i].itemSize = 3;
			this.geometry.index[i].numItems = view.length;
		}

	}

	setFullIndex(fullindex){
		let gl = this.gl;
		let view = new Uint16Array(fullindex);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.fullindex);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, view , gl.STATIC_DRAW);
		this.geometry.fullindex.itemSize = 3;
		this.geometry.fullindex.numItems = view.length;

	}

	setLocation(loc){
		this.loc = loc;
	}

	frustumcull(planes){
		for(var i = 0;i<6;i++){
			if( Math.vec3.dot( planes[i], this.worldcenter ) + planes[i][3] < -this.sphere ){
				return false;
			}
		}
		return true;
	}

}
