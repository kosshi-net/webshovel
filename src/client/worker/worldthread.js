"use strict";
/* globals importScripts, postMessage*/ 
importScripts('../../common/vec3math.js');
importScripts('../../common/simplex.js');
importScripts('../../common/alea.js');
importScripts('../../common/morton.js');

importScripts('../../common/indexfunctions.js');
importScripts('../../common/worldedit.js');
importScripts('../../common/chunkhash.js');

importScripts('../worker/worldgenerator.js');
importScripts('../worker/chunk.js');
importScripts('../worker/block.js');

console.log("Worker initialized.");

var world;

var WORLD_HEIGHT = 8; // in chunks

class World{
	constructor(args){
		console.log('World initialized, args:');
		console.log(args);
		this.bottom = -1; // This value is optional. In chunk coordinates
		this.chunktype = "chunk16_irgb";
		this.chunkroot = args.root;
		this.chunkbyte = args.byte;
		this.settings = args.settings;
		this.blockArrayItemSize = 1;
		this.blockArrayItemCount= ( this.chunkroot * this.chunkroot * this.chunkroot);
		this.blockArrayLength = ( this.blockArrayItemCount * this.blockArrayItemSize );
		console.log("blockArrayLength: "+this.blockArrayLength);
		this.chunkArray = [];
		this.chunkHash = new ChunkHash({world:this});
		this.indexHelper = new IndexHelper({world:this});
		this.block = new Blockhelper();
		this.edit = new WorldEdit({world:this});
		this.generator = new Generator();

		this.wmem = {
			vert: new Float32Array(this.settings.meshram_vertex),
			norm: new Float32Array(this.settings.meshram_normal),
			uv: new Float32Array  (this.settings.meshram_uv),
			i:[
				new Uint16Array(this.settings.meshram_index),
				new Uint16Array(this.settings.meshram_index),
				new Uint16Array(this.settings.meshram_index),
				new Uint16Array(this.settings.meshram_index),
				new Uint16Array(this.settings.meshram_index),
				new Uint16Array(this.settings.meshram_index)
			]
		};

		setTimeout( this.chunkGeometryTick.bind(this) ,100);
	}



	chunkGeometryTick(i){
		if( i === undefined || i < 0 ) i = this.chunkArray.length;

		let t = performance.now();
		while ( performance.now() - t < 1000 && i-- ) {
			
			if(this.chunkArray[i].geometryExpired){
				this.chunkArray[i].generateGeometry();
				this.chunkArray[i].geometryExpired = false;
			}
		}
		// console.log('Tick took ' + (performance.now()-t) +'ms');
		setTimeout( function(){ // Wrapped inside a function because of 'Maximum call stack size exceeded'
			this.chunkGeometryTick(i); }.bind(this), 
		50 - (performance.now()-t));

	}

	editTargetBlock(args){
		let ray = this.raycast(args.ploc, args.vec, args.length);
		
		if(!ray.hit){
			console.warn('Raycast failed');
			return;
		}

		let voxelnormal = [0,0,0];
		voxelnormal[ray.side] = ray.step;

		if(args.mode == "break") {
			this.edit.setBlock( ray.coord, 0 );
			postMessage({
				head:{cmd:"setBlock", receiver:"socket"},
				body:{loc:ray.coord, id:0}
			});


		}
		else if (args.mode == "place") {
			this.edit.setBlock( Math.vec3.sub( ray.coord, voxelnormal ), args.id );

			postMessage({
				head:{cmd:"setBlock", receiver:"socket"},
				body:{loc:Math.vec3.sub( ray.coord, voxelnormal ), id:args.id}
			});

		}
	}

	raycast(origin, vector, length){
		length = length || 20;
		var coord = 	[ origin[0]|0,origin[1]|0,origin[2]|0 ];
		var deltaDist = [0,0,0];
		var next = 		[0,0,0];
		var step = 		[0,0,0];

		for (var i = 0; i < 3; ++i) {
			var x = (vector[0] / vector[i]);
			var y = (vector[1] / vector[i]);
			var z = (vector[2] / vector[i]);
			deltaDist[i] = Math.sqrt( x*x + y*y + z*z );

			if (vector[i] < 0) {
				step[i] = -1;
				next[i] = (origin[i] - coord[i]) * deltaDist[i];
			} else {
				step[i] = 1;
				next[i] = (coord[i] + 1 - origin[i]) * deltaDist[i];
			}
		}

		while (
			Math.vec3.dist(origin, coord) < length
		) {
			var side = 0;
			for (var j = 1; j < 3; ++j) {
				if (next[side] > next[j]) {
					side = j;
				}
			}
			next[side] += deltaDist[side];
			coord[side] += step[side];
			
			if( this.edit.id(coord) > 0 ){
				return {hit:true,
					side:side, step:step[side],
					vector:vector, coord:coord
				};
			} else if( this.edit.id(coord) == -1 ){
				return {hit:false};
			}
		}
		return {hit:false}; 
	}

	pushChunk(loc, blockArray){

		if(loc[1]<0) return -1;
		if(loc[1]>WORLD_HEIGHT) return -1;

		let _chunk = new Chunk( {loc: loc, world: this, blockArray:blockArray} );
		if (_chunk !== -1){
			this.chunkArray.push(_chunk);
			this.chunkHash.spoil();
		}
	}

}







// World location systems
//  0: WORLD                BLOCK_WORLD_XYZ
//                          /               \
//  1: CHUNK            CHUNK_XYZ       BLOCK_CHUNK_XYZ
//                          |               |
//  2: INDEX        CHUNK_INDEX         BLOCK_CHUNK_INDEX


onmessage = function(e){
	var body = e.data.body;
	var head = e.data.head;
	switch (head.cmd){
		case "setBlock":
			world.edit.setBlock(body.loc,body.id);
			break;
		case "addChunk":
			world.pushChunk(body.loc, body.blockArray);
			break;
		case "editTargetBlock":
			// console.log("setblock")
			world.editTargetBlock(body);
			// world.chunkGeometryTick();
			break;
		// case "playerloc":
		// 	world.makeChunkHash();
		// 	var loc = [
		// 		Math.floor(body.loc[0]/world.chunkroot)-1,
		// 		Math.floor(body.loc[1]/world.chunkroot)-1,
		// 		Math.floor(body.loc[2]/world.chunkroot)-1
		// 	];
		// 	for(var _x = -2; _x < 4; _x++)
		// 	for(var _y = -2; _y < 4; _y++)
		// 	for(var _z = -2; _z < 4; _z++){

		// 		if(world.chunkHash[(loc[0]+_x)+","+(loc[1]+_y)+","+(loc[2]+_z)]===undefined){
		// 			world.pushChunk( [loc[0]+_x, loc[1]+_y, loc[2]+_z] );
					
		// 		}
		// 	}
		// 	break;
		case "init":
			world = new World(body);
			break;
		}


};

