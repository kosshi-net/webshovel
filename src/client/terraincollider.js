'use strict';

class TerrainCollider{
	constructor(args){

	}
	sweptrun(ent, wrd, delta){
		
		var min = Array(3);
		var max = Array(3);

		var p = ent.components.physics; // Unsupported phi use of const or var variable
		for(var i = 0; i < 3; i++){
			min[i] = Math.min(
				Math.floor(
					p.location[i]+
					ent.components.aabb.min[i]
				),
				Math.floor(
					p.location[i]+
					ent.components.aabb.min[i]+
					p.velocity[i]
				)
			);
			max[i] = Math.max(
				Math.ceil(
					p.location[i]+
					ent.components.aabb.max[i]
				),
				Math.ceil(
					p.location[i]+
					ent.components.aabb.max[i]+
					p.velocity[i]
				)
			);
		}
		
		var colTime = 1.0;
		var timingData = [1,1,1];
		for(var x = min[0]; x < max[0]; x++)
		for(var y = min[1]; y < max[1]; y++)
		for(var z = min[2]; z < max[2]; z++){
			if( wrd.edit.id( [x,y,z] ) < 1 ) continue;

			var a = { 
				min: Math.vec3.addVec(p.location, ent.components.aabb.min),
				max: Math.vec3.addVec(p.location, ent.components.aabb.max),
				vel: p.velocity
			},	b = {
				min:[x,y,z],
				max:[x+1,y+1,z+1]
			};

			var _result = this.sAABBsd3D(a, b, delta);

			if( _result[0] < colTime) {
				colTime = _result[0];
				timingData = _result[1];
			}
		}
		return {time:colTime, data:timingData};
	}

	collisionrun(ent, wrd){
		var min = Array(3);
		var max = Array(3);


		var a = { 
			min: Math.vec3.addNum(ent.loc, 0),
			max: Math.vec3.addVec(ent.loc, ent.aabb),
			vel: ent.vel
		},  b = {};

		for(var i = 0; i < 3; i++){
			min[i] = Math.round(ent.loc[i]);
			max[i] = Math.round(ent.loc[i]+ent.aabb[i]);
		}
		
		var touchdata = [
			false, false,
			false, false,
			false, false
		];

		for(var x = min[0]; x < max[0]; x++)
		for(var y = min[1]; y < max[1]; y++)
		for(var z = min[2]; z < max[2]; z++){
			b = { min:[x,y,z], max:[x+1,y+1,z+1] };
			if( wrd.edit.id( [x,y,z] ) < 1 ) continue;
			if(!this.AABB(a, b)) continue;
			// check touch
			if(this.AABB_touch(a,b)){
				touchdata[0] = touchdata[0] || a.max[0] == b.min[0];
				touchdata[1] = touchdata[1] || a.max[1] == b.min[1];
				touchdata[2] = touchdata[2] || a.max[2] == b.min[2];

				touchdata[3] = touchdata[3] || b.max[0] == a.min[0];
				touchdata[4] = touchdata[4] || b.max[1] == a.min[1];
				touchdata[5] = touchdata[5] || b.max[2] == a.min[2];
				
			}
		}
		return touchdata;
	}

	AABB ( a, b ) {
		return !(
			a.max[0] < b.min[0] ||
			a.min[0] > b.max[0] ||
			a.max[1] < b.min[1] ||
			a.min[1] > b.max[1] ||
			a.max[2] < b.min[2] ||
			a.min[2] > b.max[2] );
	}

	AABB_touch ( a, b ) {
		return (
			a.max[0] == b.min[0] ||
			a.max[1] == b.min[1] ||
			a.max[2] == b.min[2] ||
			b.max[0] == a.min[0] ||
			b.max[1] == a.min[1] ||
			b.max[2] == a.min[2]
			);
	}

	sAABBsd3D (a, b, d) {
		// unstoppable force vs immovable object t. gee
		var invEntry=Array(3), 
			invExit=Array(3),
			entry=Array(3),
			exit=Array(3);

		for(var i = 0; i < 3; i++){
			if (a.vel[i] > 0){
				invEntry[i] = b.min[i] - a.max[i];
				invExit[i] =  b.max[i] - a.min[i];
			}else{
				invEntry[i] = b.max[i] - a.min[i];
				invExit[i] =  b.min[i] - a.max[i];
			}
			if (a.vel[i] === 0){
				if (a.max[i] <= b.min[i] || a.min[i] >= b.max[i]) return [1];
				entry[i] = Number.NEGATIVE_INFINITY;
				exit[i] = Number.POSITIVE_INFINITY;
			}else{
				entry[i] = invEntry[i] 	/ (a.vel[i]*d);
				exit[i]  = invExit[i] 	/ (a.vel[i]*d);
			}
		}

		var entryTime = Math.max.apply(null, entry);
		var exitTime = Math.min.apply(null, exit);
		if(exitTime < entryTime || entryTime > 1 || entryTime < 0) return [1];
		return [entryTime, entry];
	}



	fixintersection(a,b) {
		var dists = [
			a.max[0]+0.001 - b.min[0],
			a.max[1]+0.001 - b.min[1],
			a.max[2]+0.001 - b.min[2],
			b.max[0]+0.001 - a.min[0],
			b.max[1]+0.001 - a.min[1],
			b.max[2]+0.001 - a.min[2]
		];
		var face = 0;
		for(var i=0;i<dists.length;i++){
			if (dists[i]<dists[face]){
				face = i;
			}
		}
		var pos = [0,0,0];
		switch(face){
			case 0: // right
				pos[0] -= dists[face];
				break;
			case 1: // down
				pos[1] -= dists[face];
				break;
			case 2:
				pos[2] -= dists[face];
				break;
			case 3: // left
				pos[0] += dists[face];
				break;
			case 4: // up
				pos[1] += dists[face];
				break;
			case 5:
				pos[2] += dists[face];
				break;
		}
		return [pos, face%2];
	}

}