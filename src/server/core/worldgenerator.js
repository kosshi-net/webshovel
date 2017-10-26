"use strict"; 
const SimplexNoise =	require('../../common/simplex.js');
						require('../../common/vec3math.js')();

class Generator{
	constructor(args){
		this.world = args.world;
		this.seeds =[
			Math.random(),
			Math.random(),
			Math.random()
		];

		this.simplex = [
			new SimplexNoise(),
			new SimplexNoise(),
			new SimplexNoise()

		];
	}



	heightmap(l){
		var F0 = this.world.settings.terrain.generator.freq[0];
		var F1 = this.world.settings.terrain.generator.freq[1];
		var A0 = this.world.settings.terrain.generator.amp[0];
		var A1 = this.world.settings.terrain.generator.amp[1];
		var height = 5 +
				((this.simplex[1].noise2D(
					l[0]*F0,  l[2]*F0
				)+1)*0.5)*A0 +

				((this.simplex[1].noise2D(
					l[0]*F1,  l[2]*F1
				)+1)*0.5)*A1
			;
		height = Math.floor(height);
		if (l[1]-height > 0)
			return 0;
		if(l[1] > 25 && 
			this.simplex[0].noise3D( l[0]*0.1, l[1]*0.1, l[2]*0.1)+1 < 
				Math.bounds( (l[1]-50)*0.5  , 1, -1))
			return 1;
		if (l[1]-height > -1)
			return 3;
		if (l[1]-height > -2)
			return 2;
		return 1;
	}
}

module.exports = Generator;