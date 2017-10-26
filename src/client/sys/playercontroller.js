'use strict';
/*globals
	Observer
*/


/*
TODO:
	remove coupling with input class
	do something about block placing code
*/ 

class PlayerController {
	constructor(args){
		this.main = args.main;
		this.observer = new Observer();
	}

	get name(){
		return 'playerController';
	}

	tick(args){
		const entities = args.entities;
		const controls = args.controls;
		const input = args.controls.input;
		const cfg = this.main.settings;
		const delta = args.delta*cfg.timescale;

		for (let i = 0; i < entities.length; i++) {
			let entity = entities[i];
			if( !entity.components.head 
			 ||	!entity.components.aabb 
			 ||	!entity.components.physics
			 ||	!entity.components.controller
			 ) continue;

			let p = entity.components.physics;

			entity.components.head.yaw += (input.mouse.x)*cfg.mouse_sensitivity;
			entity.components.head.pitch += (input.mouse.y)*cfg.mouse_sensitivity;
			entity.components.head.pitch = Math.bounds(
				entity.components.head.pitch, -90, 90);
			entity.components.head.yaw %= 360;
			input.mouse.x = 0;
			input.mouse.y = 0;

			const dpitch = Math.degToRad( entity.components.head.pitch);
			const dyaw =	 Math.degToRad(-entity.components.head.yaw);

			const dir = [
				Math.cos(dpitch) * Math.sin(dyaw),
				Math.sin(0),
				Math.cos(dpitch) * Math.cos(dyaw)
			];

			const right = [
				Math.sin(dyaw - 3.14/2), 
				0,
				Math.cos(dyaw - 3.14/2)
			];
			
			let speed = cfg.pc_acceleration;
			let max_velocity = cfg.pc_max_velocity;

			if(p.collisionnormal[1] !== 1) {
				max_velocity=		cfg.pc_air_max_velocity;
				speed=				cfg.pc_air_acceleration;
			}
			if(controls.getActionState('Sneak')){
				entity.components.aabb = {
					min:[-0.45, 0, -0.45],
					max:[0.45,  1.8, 0.45]
				};
				entity.components.head.offset[1] = 1.5;
				max_velocity=	cfg.pc_sneak_max_velocity;
				speed=			cfg.pc_sneak_acceleration;
			}else{
				entity.components.aabb = {
					min:[-0.45, 0, -0.45],
					max:[0.45,  2.8, 0.45]
				};
				entity.components.head.offset[1] = 2.5;
			}

			let mvdir = new Float32Array(3);
			if(controls.getActionState('MoveForward'))
				mvdir =	Math.vec3.subVec( mvdir, dir );

			if(controls.getActionState('MoveBackward'))
				mvdir =	Math.vec3.addVec( mvdir, dir );

			if(controls.getActionState('MoveRight'))
				mvdir =	Math.vec3.subVec( mvdir, right );

			if(controls.getActionState('MoveLeft'))
				mvdir =	Math.vec3.addVec( mvdir, right );

			if(controls.getActionState('FlyUp'))
				p.velocity[1] += cfg.pc_fly*delta;
			
			if(controls.getActionState('FlyDown'))
				p.velocity[1] -= cfg.pc_fly*delta;


			mvdir = Math.vec3.norm(mvdir);
			// console.log(Math.vec3.norm(mvdir));

			let projVel = Math.vec3.dot(p.velocity, mvdir);
			let accelVel = speed * delta;
			if(projVel + accelVel > max_velocity)
				accelVel = max_velocity - projVel;
			p.velocity = Math.vec3.addVec(p.velocity,
				Math.vec3.mulNum(mvdir, accelVel)
			);

			

			

			if(p.collisionnormal[1] == 1
			&& p.jumptime > performance.now()-100
			)
				p.velocity[1] += cfg.pc_jump;

			for (let i = 0; i < controls.actionEvents.length; i++) {
				const e = controls.actionEvents[i];
				switch(e){
					case "BlockUp":
						entity.components.inventory.block++;
						break;
					case "BlockDown":
						entity.components.inventory.block--;
						break;
					case "Jump":
						entity.components.physics.jumptime = performance.now();
						break;
					case "Break":
					case "Place":
						this.observer.fire('editblock', 
						{
							head: { cmd:"editTargetBlock", receiver:"world" },
							body: {
								ploc: Math.vec3.addVec(p.location, entity.components.head.offset),
								vec: Math.degToVec( entity.components.head.yaw-180, -entity.components.head.pitch ),
								length: 20,
								mode: e.toLowerCase(),
								id: Math.abs(entity.components.inventory.block)%3+1
							}
						});
					break;
				}
			}
		}
		controls.actionEvents = [];


	}
}
