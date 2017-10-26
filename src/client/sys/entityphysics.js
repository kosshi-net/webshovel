'use strict';

class EntityPhysics {
	constructor(args){
		this.main = args.main;
		this.phys = args.main.terrainCollider;
	}

	get name(){
		return 'entityPhysics';
	}

	tick(args){
		const entities = args.entities;
		const cfg = this.main.settings;
		const delta = args.delta*cfg.timescale;

		for (let i = 0; i < entities.length; i++) {
			var entity=entities[i];
			if( !entity.components.aabb 
			 ||	!entity.components.physics
			 ) continue;

			var p = entity.components.physics;
			var simulationleft = delta*2;


			p.collisionnormal[0] = 0;
			p.collisionnormal[1] = 0;
			p.collisionnormal[2] = 0;

			while(simulationleft > 0){
			
				var result = this.phys.sweptrun(
					entity,
					this.main.world, simulationleft);

				p.location = Math.vec3.addVec(
					p.location,
				 	Math.vec3.mulNum(p.velocity, result.time*0.9)
				 );

				if(result.time < 1)
				for (let i = 0; i < 3; i++) {
					if(result.data[i] == result.time){
						p.collisionnormal[i] = 
							(p.velocity[i] < 0) ? 1 : -1;
						p.velocity[i] = 0;
					}
				}
				simulationleft = simulationleft - result.time; 
				// Unsupported var compound assigment
			}

			// vel[1] -= (0+vel[1]*0.2)*(delta);
			p.velocity[1] -= cfg.pc_gravity*delta;

			var speed = Math.vec3.length(p.velocity);
			var drop = speed * cfg.pc_friction * delta;

			if(p.collisionnormal[1] !== 0){
				p.velocity[0] *= Math.max(speed-drop, 0) /speed;
				p.velocity[2] *= Math.max(speed-drop, 0) /speed;
			}

			// if(Math.abs(vel[0])<0.0001) vel[0] = 0;
			// if(Math.abs(vel[1])<0.0001) vel[1] = 0;
			// if(Math.abs(vel[2])<0.0001) vel[2] = 0;
			
			if(p.location[1]<0) p.location[1] = 60;

		}
	}
}
