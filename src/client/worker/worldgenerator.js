"use strict"; 
/* globals SimplexNoise*/ 
class Generator{
	constructor(){

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
		this.amp = [	
				1,
				20,
				10,
			];
		this.freq = [
			0.005,
			0.01,
			0.1,
			0.05
			];
	}



	heightmap(l){
		var freq = this.freq;
		var amp = this.amp;

		var F0 = 0.01;
		var F1 = 0.1;

		var A0 = 80;
		var A1 = 10;

		var height = 10 +
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

		if(l[1] > 45 && 
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
