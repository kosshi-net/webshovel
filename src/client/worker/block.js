'use strict';



class Blockhelper{
	constructor(){
		// How many "individual texutres" is there in the 
		// texutre atlas in one dimension?
		this.atlasRoot = 8; 
		// Actual UV step value
		this.texRoot = 1/this.atlasRoot;

		this.data = [
			{	"name": "air",
				"transparent": true,
				"geometry":{
					"type":"blockuv/simple",
					"texture":{ "x":0, "y":0 }
				}
			},
			{	"name": "stone",
				"transparent": false,
				"geometry":{
					"type":"blockuv/advanced",
					"texture":[
						{ "x":1, "y":0, "r":[0,1,2,3] },
						{ "x":1, "y":0, "r":[1,2,3,0] },
						{ "x":1, "y":0, "r":[3,0,1,2] },
						{ "x":1, "y":0, "r":[3,2,1,0] },
						{ "x":1, "y":0, "r":[0,3,2,1] },
						{ "x":1, "y":0, "r":[0,3,2,1] },
					]
				}
			},
			{	"name": "dirt",
				"transparent": false,
				"geometry":{
					"type":"blockuv/advanced",
					"texture":[
						{ "x":0, "y":1, "r":[0,1,2,3] },
						{ "x":0, "y":1, "r":[1,2,3,0] },
						{ "x":0, "y":1, "r":[3,0,1,2] },
						{ "x":0, "y":1, "r":[3,2,1,0] },
						{ "x":0, "y":1, "r":[0,3,2,1] },
						{ "x":0, "y":1, "r":[0,3,2,1] },
					]
				}
			},
			{	"name": "grass",
				"transparent": false,
				"geometry":{
					"type":"blockuv/advanced",
					"texture":[
						{ "x":1, "y":1, "r":[0,1,2,3] },
						{ "x":0, "y":1, "r":[1,2,3,0] },
						{ "x":1, "y":1, "r":[3,0,1,2] },
						{ "x":1, "y":1, "r":[3,2,1,0] },
						{ "x":0, "y":2, "r":[0,3,2,1] },
						{ "x":1, "y":1, "r":[0,3,2,1] },
					]
				}
			},
			{	"name": "DEBUG",
				"transparent": false,
				"geometry":{
					"type":"blockuv/advanced",
					"texture":[
						{ "x":2, "y":0, "r":[0,1,2,3] },
						{ "x":3, "y":0, "r":[1,2,3,0] },
						{ "x":4, "y":0, "r":[3,0,1,2] },
						{ "x":2, "y":1, "r":[3,2,1,0] },
						{ "x":3, "y":1, "r":[0,3,2,1] },
						{ "x":4, "y":1, "r":[0,3,2,1] },
					]
				}
			},
		];

		this.uvlut = [];

		for (var id = 0; id < this.data.length; id++) {
			this.uvlut[id] = [];
			for (var face = 0; face < 6; face++){
				this.uvlut[id][face] = this.parseGeometry(id, face);
			}
		}

		console.log(this.uvlut);


	}

	transparent( id ){
		return this.data[id].transparent;
	}


	parseGeometry( id, face ){
		var geom = this.data[id].geometry;

		var tr = this.texRoot;
		
		var p = 0.0001;

		var tex;

		switch(geom.type){

			// Simplest type of uv maps
			case "blockuv/simple":
				tex = [
					[ geom.texture.x * tr +p , geom.texture.x * tr + tr -p], 
					[ geom.texture.y * tr +p , geom.texture.y * tr + tr -p]
				];
				return new Float32Array([
					tex[0][0], tex[1][1],
					tex[0][0], tex[1][0],
					tex[0][1], tex[1][0],
					tex[0][1], tex[1][1],
				]);

			// Lets you pick different texutres and uv rotations for each face
			case "blockuv/advanced":
				tex = [
					[ (geom.texture[face].x)*tr +p, (geom.texture[face].x + 0.5)*tr -p], 
					[ (geom.texture[face].y)*tr +p, (geom.texture[face].y + 0.5)*tr -p]
				];


				var r = geom.texture[face].r;

				var arr = [];
				var protoarr = [
					tex[0][0], tex[1][1],
					tex[0][0], tex[1][0],
					tex[0][1], tex[1][0],
					tex[0][1], tex[1][1],
				];
				
				// i + r % 4 * 2
				// index + rotation % max_rotations * coord_item_size
				for (var i = 0; i < 4; i++) {
					var j = r[i]*2;
					arr.push( protoarr[j], protoarr[j+1] );
				}
				return new Float32Array(arr);

		}
	}
}