"use strict";

const WorldEdit = require('./worldedit.js');
const Chunk = require('./chunk.js');
const BlockHelper = require('./block.js');
const IndexHelper = require('./indexfunctions.js');
const Generator = require('./worldgenerator.js');
const ChunkHash = require('./chunkhash.js');
require('../../lib/vec3math.js')();
let RLE = new (require('../../lib/rle.js'))();

const fs = require('fs');


var WORLD_HEIGHT = 8; // in chunks

class World{
	constructor(args){
		console.log('World initialized, args:');
		console.log(args);
		this.bottom = -1; // This value is optional. In chunk coordinates
		this.chunktype = "chunk16_irgb";
		this.chunkroot = args.root;
		this.settings = args;
		this.chunkbyte = args.byte;
		this.blockArrayItemSize = 1;
		this.blockArrayItemCount= ( this.chunkroot * this.chunkroot * this.chunkroot);
		this.blockArrayLength = ( this.blockArrayItemCount * this.blockArrayItemSize );
		console.log("blockArrayLength: "+this.blockArrayLength);
		this.chunkArray = [];
		this.chunkHash = new ChunkHash({world:this});

		this.block = new BlockHelper();
		this.index = new IndexHelper(this);
		this.edit = new WorldEdit({world:this});
		this.generator = new Generator({world:this});

	}

	editTargetBlock(args){
		var ray = this.raycast(args.ploc, args.vec, args.length);
		
		if(!ray.hit){
			console.warn('Raycast failed');
			return;
		}

		var voxelnormal = [0,0,0];
		voxelnormal[ray.side] = ray.step;

		if(args.mode == "break") 
			this.edit.setBlock( ray.coord, 0 );
		else if (args.mode == "place") 
			this.edit.setBlock( Math.vec3.sub( ray.coord, voxelnormal ), 1 );
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
			
			if( this.edit.id(coord) ){
				return {hit:true,
					side:side, step:step[side],
					vector:vector, coord:coord
				};
			}
		}
		return {hit:false}; 
	}

	pushChunk(loc){

		if(loc[1]<0) return -1;
		if(loc[1]>WORLD_HEIGHT) return -1;

		var _chunk = new Chunk( {loc: loc, world: this} );
		if (_chunk !== -1){
			this.chunkArray.push(_chunk);
			this.hashExpired = true;
		}
	}

	generateChunks(oloc, loc){
		console.log('Generating terrain...');
		for ( let x = oloc[0]; x < loc[0]; x++ ){
			console.log(Math.round(x/loc[0]*100)+"%...");
			for ( let y = oloc[1]; y < loc[1]; y++ )
			for ( let z = oloc[2]; z < loc[2]; z++ )
				this.pushChunk([x,y,z]);
		}
		console.log('Terrain ready.');
	}

	loadWorld(filename){

	}
	saveWord(filename){

	}


}

module.exports = World;






// World location systems
//  0: WORLD                BLOCK_WORLD_XYZ
//                          /               \
//  1: CHUNK            CHUNK_XYZ       BLOCK_CHUNK_XYZ
//                          |               |
//  2: INDEX        CHUNK_INDEX         BLOCK_CHUNK_INDEX

