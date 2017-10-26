'use strict';

class System {
	constructor(){

	}

	tick(args){
		const entities = args.entities;
		for (var i = 0; i < entities.length; i++) {
			let entity = entities[i];

			// do things
		}
	}

	get name(){
		return 'unspecified';
	}
}