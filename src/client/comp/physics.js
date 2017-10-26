'use strict';

class PhysicsComponent {
	constructor(){
		
	}

	get name () {
		return 'physics';
	}

	bind(entity, location, velocity){
		location = location || new Float32Array(3);
		velocity = velocity || new Float32Array(3);

		entity.components[this.name] = {
			collisionnormal: new Int8Array(3),
			jumptime: 0, 
			location: location,
			velocity: velocity
		};

	}

	unbind(entity){
		delete entity.components[this.name];
	}

	
}
