'use strict';

class WorldEdit{
	constructor(args){
		this.world = args.world;
	}

	setBlock(loc,id){

		var indexes = this.world.index.WORLD_TO_INDEX(loc);

		if(!indexes){
			console.warn("Setting block failed");
			return false;
		}
		var bai = indexes[1];
		this.world.chunkArray[indexes[0]].blockArray[bai]  = id;
		this.world.chunkArray[indexes[0]].geometryExpired = true;
		// check blocks nearby and see if theyre in a different chunk and make geometry expired
		var nindex = [
			this.world.index.WORLD_TO_INDEX([loc[0]+1,loc[1],loc[2]]),
			this.world.index.WORLD_TO_INDEX([loc[0]-1,loc[1],loc[2]]),
			this.world.index.WORLD_TO_INDEX([loc[0],loc[1]+1,loc[2]]),
			this.world.index.WORLD_TO_INDEX([loc[0],loc[1]-1,loc[2]]),
			this.world.index.WORLD_TO_INDEX([loc[0],loc[1],loc[2]+1]),
			this.world.index.WORLD_TO_INDEX([loc[0],loc[1],loc[2]-1])
		];
		for(var i=0;i<6;i++){
			if(nindex[i] !== false && nindex[i] != indexes[0])
				this.world.chunkArray[nindex[i][0]].geometryExpired = true;
		}
	}

	id(loc){
		var indexes = this.world.index.WORLD_TO_INDEX(loc);
		// console.log(indexes)
		if(!indexes){
			console.warn("Identifying block failed");
			return -1;
		}
		// console.log( this.world.chunkArray[indexes[0]].blockArray[indexes[1]*this.world.blockArrayItemSize])
		return this.world.chunkArray[indexes[0]].blockArray[indexes[1]];
	}
}
module.exports = WorldEdit;