'use strict';
class WorldEdit{
	constructor(args){
		this.world = args.world;
	}

	setBlock(loc,id){
		let iHelp = this.world.indexHelper;

		var indexes = iHelp.WORLD_TO_INDEX(loc);

		if(!indexes){
			console.warn("Setting block failed");
			return false;
		}
		var bai = indexes[1];
		this.world.chunkArray[indexes[0]].blockArray[bai]  = id;
		this.world.chunkArray[indexes[0]].geometryExpired = true;
		// check blocks nearby and see if theyre in a different chunk and make geometry expired
		var nindex = [
			iHelp.WORLD_TO_INDEX([loc[0]+1,loc[1],loc[2]]),
			iHelp.WORLD_TO_INDEX([loc[0]-1,loc[1],loc[2]]),
			iHelp.WORLD_TO_INDEX([loc[0],loc[1]+1,loc[2]]),
			iHelp.WORLD_TO_INDEX([loc[0],loc[1]-1,loc[2]]),
			iHelp.WORLD_TO_INDEX([loc[0],loc[1],loc[2]+1]),
			iHelp.WORLD_TO_INDEX([loc[0],loc[1],loc[2]-1])
		];
		for(let i = 0; i < 6; i++ ){
			if( nindex[i] !== false && nindex[i] != indexes[0])
				this.world.chunkArray[nindex[i][0]].geometryExpired = true;
		}
	}

	id(loc){
		let iHelp = this.world.indexHelper;
		var indexes = iHelp.WORLD_TO_INDEX(loc);

		if(!indexes){
			// console.warn("Identifying block failed");
			return -1;
		}
		let id = this.world.chunkArray[indexes[0]].blockArray[indexes[1]];
		if( id === undefined ) return -1;
		return id;
	}
}
