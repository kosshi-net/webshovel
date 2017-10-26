"use strict"; 


class IndexHelper{
	constructor(world){
		this.world = world;
	}

	WORLD_TO_CHUNK(BLOCK_WORLD_XYZ){
		var CHUNK_XYZ = [
			Math.floor(BLOCK_WORLD_XYZ[0] / this.world.chunkroot),
			Math.floor(BLOCK_WORLD_XYZ[1] / this.world.chunkroot),
			Math.floor(BLOCK_WORLD_XYZ[2] / this.world.chunkroot)
		];
		var BLOCK_CHUNK_XYZ = [
			BLOCK_WORLD_XYZ[0]-CHUNK_XYZ[0]*this.world.chunkroot,
			BLOCK_WORLD_XYZ[1]-CHUNK_XYZ[1]*this.world.chunkroot,
			BLOCK_WORLD_XYZ[2]-CHUNK_XYZ[2]*this.world.chunkroot,
		];
		return [CHUNK_XYZ, BLOCK_CHUNK_XYZ];
	}
	CHUNK_TO_INDEX(CHUNK_XYZ, BLOCK_CHUNK_XYZ){
		this.world.chunkHash.make();
		var CHUNK_INDEX = this.world.chunkHash.find(CHUNK_XYZ);
		if(CHUNK_INDEX === undefined) return false;
		var BLOCK_CHUNK_INDEX = (BLOCK_CHUNK_XYZ[0] + this.world.chunkroot * 
			(BLOCK_CHUNK_XYZ[1] + this.world.chunkroot * BLOCK_CHUNK_XYZ[2]));
		return [CHUNK_INDEX, BLOCK_CHUNK_INDEX];
	}
	WORLD_TO_INDEX(BLOCK_WORLD_XYZ){
		this.world.chunkHash.make();
		var CHUNK_XYZ = [
			Math.floor(BLOCK_WORLD_XYZ[0] / this.world.chunkroot),
			Math.floor(BLOCK_WORLD_XYZ[1] / this.world.chunkroot),
			Math.floor(BLOCK_WORLD_XYZ[2] / this.world.chunkroot),
		];
		var BLOCK_CHUNK_XYZ = [
			BLOCK_WORLD_XYZ[0]-CHUNK_XYZ[0]*this.world.chunkroot,
			BLOCK_WORLD_XYZ[1]-CHUNK_XYZ[1]*this.world.chunkroot,
			BLOCK_WORLD_XYZ[2]-CHUNK_XYZ[2]*this.world.chunkroot,
		];
		var CHUNK_INDEX =  this.world.chunkHash.find(CHUNK_XYZ);
		if(CHUNK_INDEX === undefined) return false;
		var BLOCK_CHUNK_INDEX = (BLOCK_CHUNK_XYZ[0] + this.world.chunkroot * 
			(BLOCK_CHUNK_XYZ[1] + this.world.chunkroot * BLOCK_CHUNK_XYZ[2]));
		return [CHUNK_INDEX, BLOCK_CHUNK_INDEX];
	}
	// ===================================================
	// ===================================================
	INDEX_TO_CHUNK(CHUNK_INDEX, BLOCK_CHUNK_INDEX){
		if(!this.world.chunkArray[CHUNK_INDEX]){console.warn("Tried to access unloaded chunks");return false;}
		var CHUNK_XYZ = this.world.chunkArray[CHUNK_INDEX].loc;
		var BLOCK_CHUNK_XYZ = Math.i2xyz(BLOCK_CHUNK_INDEX, [this.world.chunkroot,this.world.chunkroot,this.world.chunkroot]);
		return [CHUNK_XYZ, BLOCK_CHUNK_XYZ];
	}

	CHUNK_TO_WORLD(CHUNK_XYZ, BLOCK_CHUNK_XYZ){
		var BLOCK_WORLD_XYZ = [
			(CHUNK_XYZ[0]*this.world.chunkroot)+BLOCK_CHUNK_XYZ[0],
			(CHUNK_XYZ[1]*this.world.chunkroot)+BLOCK_CHUNK_XYZ[1],
			(CHUNK_XYZ[2]*this.world.chunkroot)+BLOCK_CHUNK_XYZ[2],
		];
		return BLOCK_WORLD_XYZ;
	}
	INDEX_TO_WORLD(CHUNK_INDEX, BLOCK_CHUNK_INDEX){
		if(!this.world.chunkArray[CHUNK_INDEX]){return false;}
		var CHUNK_XYZ = this.world.chunkArray[CHUNK_INDEX].loc;
		var BLOCK_CHUNK_XYZ = Math.i2xyz(BLOCK_CHUNK_INDEX, [this.world.chunkroot,this.world.chunkroot,this.world.chunkroot]);
		var BLOCK_WORLD_XYZ = [
			(CHUNK_XYZ[0]*this.world.chunkroot)+BLOCK_CHUNK_XYZ[0],
			(CHUNK_XYZ[1]*this.world.chunkroot)+BLOCK_CHUNK_XYZ[1],
			(CHUNK_XYZ[2]*this.world.chunkroot)+BLOCK_CHUNK_XYZ[2],
		];
		return BLOCK_WORLD_XYZ;
	}
}

module.exports = IndexHelper;

