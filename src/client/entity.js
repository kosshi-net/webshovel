'use strict';


class EntityAssembler{
	constructor(args){
		this.main = args.main;
		this.networker = this.main.networker;

		this.components = {};
		[
			new HeadComponent(),
			new AABBComponent(),
			new InventoryComponent(),
			new PhysicsComponent()
		].forEach ( item => { this.components[item.name] = item; } );

		this.networker.observer.bind('spawn_entity', (data)=>{
			console.log('Spawned entity ' + data[2]);
			this.main.entities.push( this.createRemotePlayer(data[2]) );
		});

		this.networker.observer.bind('kill_entity', (data)=>{
			console.log('Killing entity ' + data[2]);
			for (var i = 0; i < this.main.entities.length; i++) {
				if(this.main.entities[i].components.id == data[2]){
					this.main.entities.splice(i, 1);
					console.log('Killed entity ' + data[2]);
					return;
				}
			}
		});

		this.networker.observer.bind('server_entity_position', (data)=>{
			for (var i = 0; i < this.main.entities.length; i++) {
				if(this.main.entities[i].components.id == data[1]){
					
					var entity = this.main.entities[i];
					entity.components.physics.location[0] = data[2];
					entity.components.physics.location[1] = data[3];
					entity.components.physics.location[2] = data[4];
					entity.components.physics.velocity[0] = data[5];
					entity.components.physics.velocity[1] = data[6];
					entity.components.physics.velocity[2] = data[7];
					entity.components.head.yaw =	data[8];
					entity.components.head.pitch = data[9];

					return;
				}
			}
		});


		console.log(this.components);

	}

	createLocalPlayer(){
		let entity = {components:{}};

		this.components.inventory.bind(entity);

		this.components.physics.bind(entity, new Float32Array([32,64,32]));

		this.components.head.bind(entity, 
										200, 0, [0,2.5,0]);

		this.components.aabb.bind(entity,
									 	[-0.45, 0, -0.45],
										[0.45,  2.8, 0.45]);

		entity.components.controller = true;

		return entity;
	}

	createDebugCube(){
		let entity = {components:{}};


		this.components.physics.bind(entity, new Float32Array([32,64,32]));

		this.components.aabb.bind(entity,
									 	[-0.45, 0, -0.45],
										[0.45,  2.8, 0.45]);

		entity.components.appearance = true;

		return entity;
	}

	createRemotePlayer(id){
		let entity = {components:{}};


		this.components.physics.bind(entity, new Float32Array([32,64,32]));

		this.components.aabb.bind(entity,
									 	[-0.45, 0, -0.45],
										[0.45,  2.8, 0.45]);
		this.components.head.bind(entity, 
										200, 0, [0,2.5,0]);

		entity.components.appearance = true;

		entity.components.id = id;

		return entity;
	}

	export(entity){
		return JSON.stringify(entity.components);
	}

	import(json){
		if (typeof json == 'string') 
			json = JSON.parse(json);
		return {components: json};
	}

}
