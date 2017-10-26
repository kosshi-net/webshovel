'use strict';
class Settings{
	constructor(){

		if (!this.url) this.url = window.location.href;
		var args = this.url.split("?")[1];
		this.settings = {};

		let customConfig = {};
		if(args){
			args = args.split(",");
			for(var i = 0; i<args.length;i++){
				var a = args[i].split("=");
				customConfig[a[0]] = a[1];
			}
		}

		let defaultConfig = {
			// Binds WebGLDebug to the context
			debug: 
			[false, 'bool'],
			// Size of the chunks
			chunkroot: 
			[32, 'int'],
			// Plane cull speed in frames
			chunkupdaterate:
			[4, 'int'],
			// Fog end
			viewdist:
			[128, 'float'],
			// Amount of ms to idle between frames to let browser do browser things,
			// Experimental, used only when requestAnimationFrame is disabled.
			chrometime:
			[10, 'float'],
			// Where to connect first
			ip:
			['localhost:8080', 'string'],
			// Name, unused
			name:
			['Deuce', 'string'],

			timescale:
			[1, 'float'],

			pc_friction:
			[0.01, 'float'],
			pc_gravity:
			[0.00003, 'float'],
			pc_jump:
			[0.01, 'float'],
			pc_fly:
			[0.0001, 'float'],

			pc_acceleration:
			[0.000041, 'float'],
			pc_max_velocity:
			[0.004, 'float'],

			pc_sneak_acceleration:
			[0.00001, 'float'],
			pc_sneak_max_velocity:
			[0.004, 'float'],


			pc_air_acceleration:
			[0.000015, 'float'],
			pc_air_max_velocity:
			[0.004, 'float'],

			mouse_sensitivity:
			[0.1, 'float'],


			// These values are used to allocate memory for chunk mesher
			// If you want bigger chunks, put a value of 512000 to these
			meshram_vertex:
			[128000, 'int'],
			meshram_normal:
			[128000, 'int'],
			meshram_uv:
			[128000, 'int'],
			meshram_index:
			[128000, 'int'],
		};



		for(let key in defaultConfig) {
			if(customConfig[key.toString()]){
				console.log(key + ': ' + customConfig[key]);
				switch(defaultConfig[key][1]){
					case 'int':
						defaultConfig[key][0] = parseInt(customConfig[key]);
						break;
					case 'float':
						defaultConfig[key][0] = parseFloat(customConfig[key]);
						break;
					case 'bool':
						defaultConfig[key][0] = (customConfig[key]==='true')?true:false;
						break;
					case 'string':
						defaultConfig[key][0] = (customConfig[key]).toString();
						break;
				}
			}
			this.settings[key] = defaultConfig[key][0];
		}

		console.log(`Allocated ${ 
			(this.settings.meshram_vertex+
			this.settings.meshram_normal+
			this.settings.meshram_uv+
			this.settings.meshram_index)*4 * 6 / 1024
		 }KB for mesher`);

		console.log(this.settings);
	}
}