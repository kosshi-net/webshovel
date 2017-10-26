'use strict';

class AABBComponent {
	constructor(){
		
	}

	get name () {
		return 'aabb';
	}

	bind(entity, min, max){
		entity.components[this.name] = {
			min: new Float32Array(min || [0,0,0]),
			max: new Float32Array(max || [1,1,1]),
		};
	}

	unbind(entity){
		delete entity.components[this.name];
	}

	
}