'use strict';

class Chunk{
	constructor(args){
		this.world = args.world;
		this.chunkroot = args.world.chunkroot;
		this.world.chunkHash.make();
		this.type = "chunk16_irgb";
		this.loc = args.loc;
		this.blockArray = new Uint8Array( this.world.blockArrayLength );
		this.colors = [];
		this.geometryExpired = true;
		this.world.chunkHash.expired = true;

		if( !args.blockArray )
			this.generate();
		else
			this.blockArray.set(args.blockArray);

		this.updateNeighbors();
	}

	// clear(id,r,g,b) {
	// 	var i = this.world.blockArrayLength;
	// 	id = id || 0;
	// 	r = r || 0;
	// 	g = g || 0;
	// 	b = b || 0;
	// 	while(i){
	// 		this.blockArray[--i] = b;
	// 		this.blockArray[--i] = g;
	// 		this.blockArray[--i] = r;
	// 		this.blockArray[--i] = id;
	// 	}
	// }

	generate(id) {
		id = 0;
		if(this.loc[1] < 0){id=1;}
		for (var i = 0; i < this.blockArray.length; i++) {

			var woc = this.world.index.CHUNK_TO_WORLD(
				this.loc, Math.i2xyz(i, [this.chunkroot,this.chunkroot,this.chunkroot])
			);

			var value = this.world.generator.heightmap(woc);

			this.blockArray[i] = value;
		}
	}

	updateNeighbors() {
		this.world.chunkHash.make(true);


		var neighbors = [
			
				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 1, 0, 0 ] ) ),
				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [-1, 0, 0 ] ) ),

				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0, 1, 0 ] ) ),
				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0,-1, 0 ] ) ),

				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0, 0, 1 ] ) ),
				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0, 0,-1 ] ) )	
			
		];

		for (var i = 0; i < 6; i++) {
			if(neighbors[i] === undefined)
				continue;
			this.world.chunkArray[ neighbors[i] ].geometryExpired = true;
		}
	}


}

module.exports = Chunk;