'use strict';

class VelocityComponent {
	constructor(){
		
	}

	get name () {
		return 'velocity';
	}

	bind(entity, velocity){
		entity.components[this.name] = new Float32Array(velocity || [0,0,0]);
	}

	unbind(entity){
		delete entity.components[this.name];
	}

	
}