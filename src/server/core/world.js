"use strict";

const WorldEdit = require('./worldedit.js');
const Chunk = require('./chunk.js');
const BlockHelper = require('./block.js');
const IndexHelper = require('../../common/indexfunctions.js');
const Generator = require('./worldgenerator.js');
const ChunkHash = require('./chunkhash.js');
require('../../common/vec3math.js')();
let RLE = new (require('../../common/rle.js'))();

const fs = require('fs');



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
		this.index = new IndexHelper({world:this});
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

	pushChunk(loc, file){

		var _chunk = new Chunk( {loc: loc, world: this, blockArray:file} );
		if (_chunk !== -1){
			this.chunkArray.push(_chunk);
			this.hashExpired = true;
		}
	}


	generateWorld(oloc, loc){
		console.log('Generating terrain...');
		for ( let x = oloc[0]; x < loc[0]; x++ ){
			console.log(Math.round(x/loc[0]*100)+"%...");
			for ( let y = oloc[1]; y < loc[1]; y++ )
			for ( let z = oloc[2]; z < loc[2]; z++ ){
				this.pushChunk([x,y,z]);

			}
		}
		console.log('Terrain ready.');
	}

	load(filename){
		var view8 = new Uint8Array(fs.readFileSync(filename));
		var view16 = new Uint16Array(view8.buffer);
		var fileversion = 2;
		var row = 8;
		var byte = 0;
		// READ HEADER
		// check validity

		if( !(
				view8[0]===0x73 && 
				view8[1]===0x68 && 
				view8[2]===0x6f && 
				view8[3]===0x76 && 
				view8[4]===0x65 && 
				view8[5]===0x6c && 
				view8[6]===0x00
			) ) {
			console.log('File header not valid');
			return false;
		}
		if( view8[7] != fileversion){
			console.log('File version not valid');
			return false;
		}
		byte += row;
		// var chunkroot = view16[ byte/2 + 0 ];
		var chunks = view16[ byte/2 + 1 ];
		var commentrows = view8[ byte + 4 ];
		var flags = view8[ byte + 5 ];
		// var chunkbyte = view8[ byte + 7 ];
		byte += row;
		byte += row*commentrows;

		for (var i = 0; i < chunks; i++) {
			if( !(
				view8[byte++]===0xC0 && 
				view8[byte++]===0xFF && 
				view8[byte++]===0xEE && 
				view8[byte++]===0x00 && 
				view8[byte++]===0x15 && 
				view8[byte++]===0x00 && 
				view8[byte++]===0xBE && 
				view8[byte++]===0x57 
			) ) {
				console.log('File corrupt at '+byte +' (invalid chunk header, '+view8[byte-1]+')');
				return false;
			}
			var x = view16[byte/2];
			var y = view16[byte/2 + 1];
			var z = view16[byte/2 + 2];
			var length = view16[byte/2 + 3];
			byte += row;

			var blockArray = view8.slice( byte, byte+length );
			if(flags & 1 ) blockArray = RLE.decode(blockArray);

			byte += length;

			while(byte%row){
				if( view8[byte]!=0xDE && view8[byte]!=0xAD){
					console.log('File corrupt at '+byte + ' (invalid chunk padding)');
					return false;
				}
				byte++;
			}

			this.pushChunk([x,y,z], blockArray);

		}
		console.log('World read from disc.');
		return true;
	}
	save(filename){
		let view8 = new Uint8Array(this.chunkArray.length*this.blockArrayLength*2);
		let view16 = new Uint16Array(view8.buffer);
		// write header
		var fileversion = 2;
		var byte = 0;
		var row = 8;

		view8.set( [0x73, 0x68, 0x6f, 0x76, 0x65, 0x6c, 0x00, fileversion], byte );
		byte += row;

		view16.set( [this.chunkroot, this.chunkArray.length], byte/2 );
		byte += row/2;

		var flags = 1;
		var commentrows = 0;
		view8.set( [commentrows, flags, 0x00, this.chunkbyte], byte);
		byte += row/2;
		for (let i = 0; i < commentrows; i++) {
			view8.set([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], byte);
			row+=byte;
		}

		for (let i = 0; i < this.chunkArray.length; i++) {
			var chunk = this.chunkArray[i];

			view8.set( [0xC0, 0xFF, 0xEE, 0x00, 0x15, 0x00, 0xBE, 0x57], byte );
			byte+=row;
			let compressed = new Uint8Array(RLE.encode(chunk.blockArray));
			view16.set( [chunk.loc[0],chunk.loc[1],chunk.loc[2], compressed.length], byte/2);
			byte+=row;

			view8.set( compressed, byte );
			byte += compressed.length;
			while(byte%row){
				if(byte%2)
					view8.set([0xAD], byte);
				else
					view8.set([0xDE], byte);
				byte++;
			}
		}

		fs.writeFile( filename, new Buffer(view8.slice(0, byte)), (err)=>{
			if(err) console.log('Error!');
			else console.log('World Saved!');
		} );
	}


}

module.exports = World;



// WebShovel Terrain Format
// Header:
// 73 68  6f 76  65 6c  00 XX
// root   count  CC FF  chunkbyte
// where x is version number
// 		 root is chunkroot
//       count is number of chunks
// 		 CC tells how many rows of zeroes to write
// 			These rows are anything you want and must
// 			carried around
// 		 FF are flags desribsed stuff like compression
// 		 chunkbyte, how many bytes per block. Default 1 ( = 8 bits)
// FLAG
// 0000000000000000
// where
// flags >> 0 & 1
// 		File compressed with RLE


// Then starts the chunks
// abcdef
// C0 FF EE 00  15 00 BE 57
// XX XX, YY YY, ZZ ZZ, lenght
// where lenght is number of bytes
// bytes for chunk..
// If the lenght doesnt line up, rest must be filled with DE AD
// repeat $count times


/* Sample header
73 68 6f 76 65 6c 00 01  00 20 01 00 02 01 00 01
00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00

C0 FF EE 00 15 00 BE 57  
*/ 



// World location systems
//  0: WORLD                BLOCK_WORLD_XYZ
//                          /               \
//  1: CHUNK            CHUNK_XYZ       BLOCK_CHUNK_XYZ
//                          |               |
//  2: INDEX        CHUNK_INDEX         BLOCK_CHUNK_INDEX

