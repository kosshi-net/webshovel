'use strict';

class PositionComponent {
	constructor(){
		
	}

	get name () {
		return 'position';
	}

	bind(entity, position){
		entity.components[this.name] = new Float32Array(position || [0,0,0]);
	}

	unbind(entity){
		delete entity.components[this.name];
	}

	
}