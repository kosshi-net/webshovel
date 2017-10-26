'use strict';

class ChunkHash{
	constructor(args){
		this.hash = {};
		this.world = args.world;
		this.expired = true;
	}

	find(location){
		return this.hash[ location.toString() ];
	}
	put(location, index){
		this.hash[ location.toString() ] = index;
	}

	make(force){ 
		if(!this.expired && !force){
			return false;
		}
		this.hash = [];
		var i = this.world.chunkArray.length;
		while(i--){
			this.put( this.world.chunkArray[i].loc, i );
		}
		this.expired = false;
		return true;
	}
}

module.exports = ChunkHash;