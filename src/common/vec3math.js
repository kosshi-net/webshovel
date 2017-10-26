/* 
	MATH VECTOR EXTENSIONS
	Contains some useful funtions used in some of my projects.
	
	MIT Licensed.

	To use in Node.JS, you need to require('vec3math.js')();
	
*/ 

'use strict';

(function(){
	function setMathfunctions(){
		Math.vec3 = {};

		Math.vec3.length = function(v){
			return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
		};

		Math.vec3.dist = function(v,w){
			return Math.sqrt((v[0]-w[0])*(v[0]-w[0]) + (v[1]-w[1])*(v[1]-w[1]) + (v[2]-w[2])*(v[2]-w[2]));
		};

		Math.vec3.norm = function(v){
			var dist = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
			if(dist === 0)
				return v;
			return [v[0]/dist,v[1]/dist,v[2]/dist];
		};


		Math.vec3.new = {
			addVec: function(v, w, typedArray) {
				return new typedArray([ v[0]+w[0], v[1]+w[1], v[2]+w[2] ]);
			},
			subVec: function(v, w, typedArray) {
				return new typedArray([ v[0]-w[0], v[1]-w[1], v[2]-w[2] ]);
			},
			mulVec: function(v, w, typedArray) {
				return new typedArray([ v[0]*w[0], v[1]*w[1], v[2]*w[2] ]);
			},
			divVec: function(v, w, typedArray) {
				return new typedArray([ v[0]/w[0], v[1]/w[1], v[2]/w[2] ]);
			},
			modVec: function(v, w, typedArray) {
				return new typedArray([ v[0]%w[0], v[1]%w[1], v[2]%w[2] ]);
			},

			addNum: function(v, n, typedArray) {
				return new typedArray([ v[0]+n, v[1]+n, v[2]+n ]);
			},
			subNum: function(v, n, typedArray) {
				return new typedArray([ v[0]-n, v[1]-n, v[2]-n ]);
			},
			mulNum: function(v, n, typedArray) {
				return new typedArray([ v[0]*n, v[1]*n, v[2]*n ]);
			},
			divNum: function(v, n, typedArray) {
				return new typedArray([ v[0]/n, v[1]/n, v[2]/n ]);
			},
			modNum: function(v, n, typedArray) {
				return new typedArray([ v[0]%n, v[1]%n, v[2]%n ]);
			}
		};

		Math.vec3.set = {
			addVec: function(v, w) {
				v[0]+=w[0]; v[1]+=w[1]; v[2]+=w[2];
			},
			subVec: function(v, w) {
				v[0]-=w[0]; v[1]-=w[1]; v[2]-=w[2];
			},
			mulVec: function(v, w) {
				v[0]*=w[0]; v[1]*=w[1]; v[2]*=w[2];
			},
			divVec: function(v, w) {
				v[0]/=w[0]; v[1]/=w[1]; v[2]/=w[2];
			},
			modVec: function(v, w) {
				v[0]%=w[0]; v[1]%=w[1]; v[2]%=w[2];
			},
			addNum: function(v, n) {
				v[0]+=n; v[1]+=n; v[2]+=n;
			},
			subNum: function(v, n) {
				v[0]-=n; v[1]-=n; v[2]-=n;
			},
			mulNum: function(v, n) {
				v[0]*=n; v[1]*=n; v[2]*=n;
			},
			divNum: function(v, n) {
				v[0]/=n; v[1]/=n; v[2]/=n;
			},
			modNum: function(v, n) {
				v[0]%=n; v[1]%=n; v[2]%=n;
			}
		};
		// let a3 = Math.vec3.new(a1, a2, uint8);



		Math.vec3.addVec = function(v, w){
			return new Float32Array([ v[0]+w[0], v[1]+w[1], v[2]+w[2] ]); };
		Math.vec3.subVec = function(v, w){
			return new Float32Array([ v[0]-w[0], v[1]-w[1], v[2]-w[2] ]); };
		Math.vec3.mulVec = function(v, w){
			return new Float32Array([ v[0]*w[0], v[1]*w[1], v[2]*w[2] ]); };
		Math.vec3.divVec = function(v, w){
			return new Float32Array([ v[0]/w[0], v[1]/w[1], v[2]/w[2] ]); };
		Math.vec3.modVec = function(v, w){
			return new Float32Array([ v[0]%w[0], v[1]%w[1], v[2]%w[2] ]); };

		Math.vec3.add = Math.vec3.addVec;
		Math.vec3.sub = Math.vec3.subVec;
		Math.vec3.mul = Math.vec3.mulVec;
		Math.vec3.div = Math.vec3.divVec;
		Math.vec3.mod = Math.vec3.modVec;

		Math.vec3.addNum = function(v, n){
			return new Float32Array([ v[0]+n, v[1]+n, v[2]+n ]); };
		Math.vec3.subNum = function(v, n){
			return new Float32Array([ v[0]-n, v[1]-n, v[2]-n ]); };
		Math.vec3.mulNum = function(v, n){
			return new Float32Array([ v[0]*n, v[1]*n, v[2]*n ]); };
		Math.vec3.divNum = function(v, n){
			return new Float32Array([ v[0]/n, v[1]/n, v[2]/n ]); };
		Math.vec3.modNum = function(v, n){
			return new Float32Array([ v[0]%n, v[1]%n, v[2]%n ]); };

		Math.vec3.dot = function(A,B){
			return (A[0]*B[0])+(A[1]*B[1])+(A[2]*B[2]);};

		Math.vec3.floor = function(v){
			return new Float32Array(
			[	Math.floor(v[0]),
						Math.floor(v[1]),
						Math.floor(v[2]),]);
		};

		Math.vec3.ceil = function(v){
			return new Float32Array(
			 [	Math.ceil(v[0]),
						Math.ceil(v[1]),
						Math.ceil(v[2])]);
		};

		Math.vec3.round = function(v){
			return new Float32Array(
			 [	Math.round(v[0]),
						Math.round(v[1]),
						Math.round(v[2])]);
		};





		Math.degToRad = function(degrees) {
			return (degrees % 360) * Math.PI / 180;
		};

		Math.radToVec = function(yaw,pitch){ 
			
			return new Float32Array( [
				Math.cos(pitch) * Math.sin(yaw),
				Math.sin(pitch),
				Math.cos(pitch) * Math.cos(yaw)
			]);
		};



		Math.degToVec = function(yaw,pitch){ 
			var dpitch = this.degToRad(pitch);
			var dyaw = this.degToRad(-yaw);
			return new Float32Array( [
				Math.cos(dpitch) * Math.sin(dyaw),
				Math.sin(dpitch),
				Math.cos(dpitch) * Math.cos(dyaw)
			]);
		};

		Math.bounds = function(val,min, max){
			return Math.max(Math.min(val,max),min);
		};


		Math.i2xyz = function(idx,m){
			var x =  idx % (m[0]);
			idx /= (m[0]);
			var y = idx % (m[1]);
			idx /= (m[1]);
			var z = idx;
			return [x|0,y|0,z|0];
		};
	}

	if (typeof module !== 'undefined') {
		module.exports = setMathfunctions;
	} else {
		setMathfunctions();
	}
})();


