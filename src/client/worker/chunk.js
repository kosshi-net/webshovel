'use strict';
/* globals postMessage, world */ 

class Chunk{
	constructor(args){
		this.world = args.world;
		this.chunkroot = args.world.chunkroot;
		this.world.chunkHash.make();
		this.type = "chunk16_irgb";
		this.loc = args.loc;
		this.blockArray = args.blockArray || new Uint8Array( this.world.blockArrayLength );
		this.colors = [];
		this.geometryExpired = true;
		this.world.chunkHashExpired = true;

		postMessage({
			head:{ cmd: "addChunk", receiver:"main"},
			body:{ loc: this.loc, blockArray:this.blockArray.buffer }
		});

		this.updateNeighbors();
	}


	updateNeighbors() {
		world.chunkHash.make();


		var neighbors = [
				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 1, 0, 0 ] ) ),
				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [-1, 0, 0 ] ) ),

				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0, 1, 0 ] ) ),
				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0,-1, 0 ] ) ),

				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0, 0, 1 ] ) ),
				this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0, 0,-1 ] ) )			
		];

		for (var i = 0; i < 6; i++) {
			if(neighbors[i] === undefined)
				continue;
			this.world.chunkArray[ neighbors[i] ].geometryExpired = true;
		}
	}

	generateGeometry() {

		/*
			The following mess is a modified version of 0fps.net's culled 
			mesher. Don't try to undrestand it.

			I've later written a greedy mesher with AO that runs about 60 times faster.
		*/ 

		var _t = performance.now();

		var S = 1; // Magical Step number. Used if blockarray has more than 1 value per block in the array
		var root = this.chunkroot;

		var faces = [
			new Float32Array([0,3]),
			new Float32Array([1,4]),
			new Float32Array([2,5])
		];
		var normals = [
				new Float32Array([ 0.3, 0.3, 0.3,  0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3 ]),
				new Float32Array([ 0.3, 0.3, 0.3,  0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3 ]),
				new Float32Array([ 0.3, 0.3, 0.3,  0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3 ]),
				// new Float32Array([-1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0 ]),
				// new Float32Array([ 0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0 ]),
				// new Float32Array([ 0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1 ]),
				new Float32Array([ 1,  1,  1, 1,  1,  1,  1,  1,  1,  1,  1,  1 ]),
				new Float32Array([ 1,  1,  1, 1,  1,  1,  1,  1,  1,  1,  1,  1 ]),
				new Float32Array([ 1,  1,  1, 1,  1,  1,  1,  1,  1,  1,  1,  1 ])
			];
	// Get neighbour chunkarrays
		world.chunkHash.make();
		var nhash = [
			this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 1, 0, 0 ] ) ),
			this.world.chunkHash.find( Math.vec3.addVec( this.loc, [-1, 0, 0 ] ) ),

			this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0, 1, 0 ] ) ),
			this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0,-1, 0 ] ) ),

			this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0, 0, 1 ] ) ),
			this.world.chunkHash.find( Math.vec3.addVec( this.loc, [ 0, 0,-1 ] ) )
		];
		var nvolumes = [[false,false],[false,false],[false,false]];

		if(nhash[0]) nvolumes[0][1] = world.chunkArray[nhash[0]].blockArray;
		if(nhash[2]) nvolumes[1][1] = world.chunkArray[nhash[2]].blockArray;
		if(nhash[4]) nvolumes[2][1] = world.chunkArray[nhash[4]].blockArray;
		if(nhash[1]) nvolumes[0][0] = world.chunkArray[nhash[1]].blockArray;
		if(nhash[3]) nvolumes[1][0] = world.chunkArray[nhash[3]].blockArray;
		if(nhash[5]) nvolumes[2][0] = world.chunkArray[nhash[5]].blockArray;

	// Referenses
	 	var volume = this.blockArray;
		var block = this.world.block;

		// These keep track of indexes
		var ib = 0;
		var lnuv = 0;
		var lnnorm = 0;
		var lnvert = 0;
		var lnindex= new Uint32Array(6);

		var dir = [[[0,1,0],[0,0,1]],[[0,0,1],[1,0,0]],[[1,0,0],[0,1,0]]];

		var x = [0,0,0];
		var B = [ [false,true], [false,true], [false,true] ];
		var n = -root*root;

		var wmem = this.world.wmem;


	// THE LOOP
	// We loop every block and sligtly more and look at 3 faces and determine if theyre visible
		for(           	B[2]=[false,true], x[2]=-1;   x[2] < root;   B[2] = [true,(++x[2]< root-1)])  	
		for(n-=root,	B[1]=[false,true], x[1]=-1;   x[1] < root;   B[1] = [true,(++x[1]< root-1)])
	  	for(n -= 1,   	B[0]=[false,true], x[0]=-1;   x[0] < root;   B[0] = [true,(++x[0]< root-1)], ++n)
	  	{
			var p = 
				(B[0][0] && B[1][0] && B[2][0]) ? 		((volume[(n)*S]					) ? 1 : 0 ) : false;
			var b = [
				(B[0][1] && B[1][0] && B[2][0]) ? 		((volume[(n+1)*S]				) ? 1 : 0 ) : false,
				(B[0][0] && B[1][1] && B[2][0]) ? 		((volume[(n+root)*S]			) ? 1 : 0 ) : false,
				(B[0][0] && B[1][0] && B[2][1]) ? 		((volume[(n+root*root)*S]	) ? 1 : 0 ) : false
			];
		// Loop the 3 faces
			for(var d=0; d<3; ++d){

				if(p != b[d]) { // If true the face is visible in current chunk

					var t = [x[0],x[1],x[2]], u = dir[d][0], v = dir[d][1];
					++t[d];

					// var face = d;
					var normal = p;
					var index = n;

				// Following code checks if face is visible and looks at neighboring chunks
					var _recheck = false;
					if(normal===false) {
						normal = 0;
						_recheck = true;
					} else if ( b[d]===false ) {
						_recheck = true; 
					}


					var _loc, _nindex;
					if ( nvolumes[d][normal] !== false && _recheck ) {
						if(normal == 1){

							_loc = Math.i2xyz(index, [root,root,root]);
							_loc[d] = 0;
							_nindex = (_loc[0] + this.chunkroot * (_loc[1] + this.chunkroot * _loc[2]));
							if ( nvolumes[d][1][_nindex*S] > 0 ) 
								continue;

						} else if (normal === 0){
							var _index;
							if (d == 2)
								_index = (index+root*root);
							else if (d == 1)
								_index = (index+root);
							else if (d === 0)
								_index = (index+1);

							_loc = Math.i2xyz(_index, [root,root,root]);
							_loc[d] = this.chunkroot-1;
							_nindex = (_loc[0] + this.chunkroot * (_loc[1] + this.chunkroot * _loc[2]));
							if(nvolumes[d][0][_nindex*S] > 0)
								continue;
						}
					}

				// Push the geometry
					var _side = faces[d][normal];

					if(normal==1){
						wmem.i[_side].set([
							ib+1,ib+3,ib+2,
							ib+3,ib+1,ib
						], lnindex[_side]);
						lnindex[_side] += 6;
					}else{
						if(d == 2)
							index = (index+root*root);
						else if (d == 1)
							index = (index+root);
						else if (d === 0)
							index = (index+1);
						wmem.i[_side].set([
							ib+1,ib+2,	ib+3,
							ib+3,ib	,	ib+1
						], lnindex[_side]);
						lnindex[_side] += 6;
					}

					wmem.norm.set(normals[_side], lnnorm);
					lnnorm+=normals[_side].length;

					wmem.uv.set(block.uvlut[ volume[ index*S ] ][ _side ], lnuv);
					lnuv+=block.uvlut[ volume[ index*S ] ][ _side ].length;

					wmem.vert.set([
						t[0],           t[1],           t[2]  ,   
						t[0]+u[0],      t[1]+u[1],      t[2]+u[2],     
						t[0]+u[0]+v[0], t[1]+u[1]+v[1], t[2]+u[2]+v[2],
						t[0]     +v[0], t[1]     +v[1], t[2]     +v[2]
					], lnvert);
					lnvert += 12;

					ib += 4; // Another magic number dont touch
							 // I think it was somehow related to index coutns
				}
			}
		}

		var t_Index = [
			(wmem.i[0].slice(0, lnindex[0])).buffer,
			(wmem.i[1].slice(0, lnindex[1])).buffer,
			(wmem.i[2].slice(0, lnindex[2])).buffer,
			(wmem.i[3].slice(0, lnindex[3])).buffer,
			(wmem.i[4].slice(0, lnindex[4])).buffer,
			(wmem.i[5].slice(0, lnindex[5])).buffer
		];
		var t_UV = 		wmem.uv.slice(0, 	lnuv).buffer;
		var t_Normal = 	wmem.norm.slice(0, 	lnnorm).buffer;
		var t_Vertex = 	wmem.vert.slice(0, 	lnvert).buffer;
		postMessage({
			head:{cmd:"setChunkGeometry", receiver:"main"},
			body:{
				loc:this.loc,
				// block:this.blockArray,
				vertex:t_Vertex,
				normal:t_Normal,
				uv:t_UV,
				index:[
					t_Index[0],
					t_Index[1],
					t_Index[2],
					t_Index[3],
					t_Index[4],
					t_Index[5]
				]
			}
		}
		,[
			t_Vertex,
			t_UV,
			t_Normal,
			t_Index[0],
			t_Index[1],
			t_Index[2],
			t_Index[3],
			t_Index[4],
			t_Index[5],
		]
		);
		milliseconds+=(performance.now() - _t);
	}
}

var milliseconds = 0;

setTimeout(()=>{
	console.log(milliseconds);
}, 10000);

