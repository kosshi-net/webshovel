'use strict';

class HeadComponent {
	constructor(){
		
	}

	get name () {
		return 'head';
	}

	bind(entity, yaw, pitch, offset){
		entity.components[this.name] = {
			yaw: yaw || 0,
			pitch: pitch || 0,
			offset: new Float32Array(offset || [0,0,0])
		};
	}

	unbind(entity){
		delete entity.components[this.name];
	}

	
}