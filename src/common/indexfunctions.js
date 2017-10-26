"use strict"; 

class IndexHelper {
	constructor (args) {
		this.world = args.world;
	}

	WORLD_TO_CHUNK(BLOCK_WORLD_XYZ){
		let world = this.world;
		var CHUNK_XYZ = [
			Math.floor(BLOCK_WORLD_XYZ[0] / world.chunkroot),
			Math.floor(BLOCK_WORLD_XYZ[1] / world.chunkroot),
			Math.floor(BLOCK_WORLD_XYZ[2] / world.chunkroot)
		];
		var BLOCK_CHUNK_XYZ = [
			BLOCK_WORLD_XYZ[0]-CHUNK_XYZ[0]*world.chunkroot,
			BLOCK_WORLD_XYZ[1]-CHUNK_XYZ[1]*world.chunkroot,
			BLOCK_WORLD_XYZ[2]-CHUNK_XYZ[2]*world.chunkroot,
		];
		return [CHUNK_XYZ, BLOCK_CHUNK_XYZ];
	}

	CHUNK_TO_INDEX(CHUNK_XYZ, BLOCK_CHUNK_XYZ){
		let world = this.world;
		var CHUNK_INDEX = world.chunkHash.find(CHUNK_XYZ);
		if(CHUNK_INDEX === undefined) return false;
		var BLOCK_CHUNK_INDEX = (BLOCK_CHUNK_XYZ[0] + world.chunkroot * 
			(BLOCK_CHUNK_XYZ[1] + world.chunkroot * BLOCK_CHUNK_XYZ[2]));
		return [CHUNK_INDEX, BLOCK_CHUNK_INDEX];
	}

	WORLD_TO_INDEX(BLOCK_WORLD_XYZ){
		let world = this.world;
		var CHUNK_XYZ = [
			Math.floor(BLOCK_WORLD_XYZ[0] / world.chunkroot),
			Math.floor(BLOCK_WORLD_XYZ[1] / world.chunkroot),
			Math.floor(BLOCK_WORLD_XYZ[2] / world.chunkroot),
		];
		var BLOCK_CHUNK_XYZ = [
			BLOCK_WORLD_XYZ[0]-CHUNK_XYZ[0]*world.chunkroot,
			BLOCK_WORLD_XYZ[1]-CHUNK_XYZ[1]*world.chunkroot,
			BLOCK_WORLD_XYZ[2]-CHUNK_XYZ[2]*world.chunkroot,
		];
		var CHUNK_INDEX = world.chunkHash.find(CHUNK_XYZ);
		if(CHUNK_INDEX === undefined) return false;
		var BLOCK_CHUNK_INDEX = (BLOCK_CHUNK_XYZ[0] + world.chunkroot * 
			(BLOCK_CHUNK_XYZ[1] + world.chunkroot * BLOCK_CHUNK_XYZ[2]));
		return [CHUNK_INDEX, BLOCK_CHUNK_INDEX];
	}
	// ===================================================
	// ===================================================

	INDEX_TO_CHUNK(CHUNK_INDEX, BLOCK_CHUNK_INDEX){
		let world = this.world;
		if(!world.chunkArray[CHUNK_INDEX]){console.warn("Tried to access unloaded chunks");return false;}
		var CHUNK_XYZ = world.chunkArray[CHUNK_INDEX].loc;
		var BLOCK_CHUNK_XYZ = Math.i2xyz(BLOCK_CHUNK_INDEX, [world.chunkroot,world.chunkroot,world.chunkroot]);
		return [CHUNK_XYZ, BLOCK_CHUNK_XYZ];
	}

	CHUNK_TO_WORLD(CHUNK_XYZ, BLOCK_CHUNK_XYZ){
		let world = this.world;
		var BLOCK_WORLD_XYZ = [
			(CHUNK_XYZ[0]*world.chunkroot)+BLOCK_CHUNK_XYZ[0],
			(CHUNK_XYZ[1]*world.chunkroot)+BLOCK_CHUNK_XYZ[1],
			(CHUNK_XYZ[2]*world.chunkroot)+BLOCK_CHUNK_XYZ[2],
		];
		return BLOCK_WORLD_XYZ;
	}

	INDEX_TO_WORLD(CHUNK_INDEX, BLOCK_CHUNK_INDEX){
		let world = this.world;
		if(!world.chunkArray[CHUNK_INDEX]){return false;}
		var CHUNK_XYZ = world.chunkArray[CHUNK_INDEX].loc;
		var BLOCK_CHUNK_XYZ = Math.i2xyz(BLOCK_CHUNK_INDEX, [world.chunkroot,world.chunkroot,world.chunkroot]);
		var BLOCK_WORLD_XYZ = [
			(CHUNK_XYZ[0]*world.chunkroot)+BLOCK_CHUNK_XYZ[0],
			(CHUNK_XYZ[1]*world.chunkroot)+BLOCK_CHUNK_XYZ[1],
			(CHUNK_XYZ[2]*world.chunkroot)+BLOCK_CHUNK_XYZ[2],
		];
		return BLOCK_WORLD_XYZ;
	}

}

if (typeof module !== 'undefined') module.exports = IndexHelper;
 

