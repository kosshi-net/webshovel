'use strict';

class ChunkHash{
	constructor(args){
		this.hash = {};
		this.morton = new Morton();
		this.chunkArray = args.world.chunkArray;
		this.expired = true;
	}

	find(location){
		this.make();
		return this.hash[ this.morton.lut(location) ];
	}
	put(location, index){
		this.hash[ this.morton.lut(location) ] = index;
	}
	spoil(){
		this.expired = true;
	}

	make(force){ 
		if(!this.expired && !force){
			return false;
		}
		this.hash = [];
		var i = this.chunkArray.length;
		while(i--){
			this.put( this.chunkArray[i].loc, i );
		}
		this.expired = false;
		return true;
	}
}