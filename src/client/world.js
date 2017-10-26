'use strict';

/* globals
	ChunkHash,
	IndexHelper,
	WorldEdit,
	RLE,
	ChunkGeometry
*/

class World{
	constructor(args){
		this.worker = new Worker( "./src/client/worker/worldthread.js" );

		this.worker.onmessage = function(e){
			
			var head = e.data.head;
			var body = e.data.body;

			if( head.receiver == "main" ){
				switch (head.cmd){
					case "setChunkGeometry":
						
						this.chunkArray[ this.chunkHash.find(body.loc) ].setGeometry(body);
						break;
					case "addChunk":
						this.addChunk(body);
						break;
					default:
						console.warn('Protocol error', e.data);
				}

			} else if( head.receiver == "socket"){
				this.main.networker.worldevent( e.data );
			}
		}.bind(this);

		this.threads = {
			message:function(e){
				console.warn("This function shouldnt be used");
				this.worker.postMessage(e);
			}.bind(this)
		};

		this.chunkroot = args.settings.chunkroot || 32;
		this.blockbyte = args.settings.blockbyte || 8;
		console.log(this.chunkroot);

		this.worker.postMessage({
			head:{ cmd:"init", receiver:"world" },
			body:{ root:this.chunkroot, byte:this.blockbyte, settings:args.settings }}
		);

		this.main = args.main;
		this.renderer = args.renderer;
		this.chunkArray = [];
		this.chunkBoundingSphere = Math.vec3.length([
			this.chunkroot*0.5,
			this.chunkroot*0.5,
			this.chunkroot*0.5,
		]);

		this.FLAG = {
			pX_VISIBLE: 	1 << 0,
			pY_VISIBLE: 	1 << 1,
			pZ_VISIBLE: 	1 << 2,
			nX_VISIBLE: 	1 << 3,
			nY_VISIBLE: 	1 << 4,
			nZ_VISIBLE: 	1 << 5,

			DRAW: 			1 << 6
		};


		this.chunkHash = new ChunkHash({world:this});
		this.indexHelper = new IndexHelper({world:this});
		this.edit = new WorldEdit({world:this});



		this.main.networker.observer.bind('setblock', (data)=>{
			let msg = {
				head: { cmd: "setBlock", receiver: "world" },
				body: { loc: [ data[2],data[3],data[4] ], id: data[1] }
			};
			this.main.world.edit.setBlock([ data[2],data[3],data[4] ], data[1]);
			
			this.worker.postMessage(msg);
		});

		this.main.networker.observer.bind('chunkdatarle', (data)=>{
			let arr = new RLE().decode(data[4]);
			if(arr.length != Math.pow(this.main.settings.chunkroot, 3)){
				console.log('Chunk failed to decode correctly ),:', arr.length, data[4]);
			}
			this.worker.postMessage({
				head:{ cmd: "addChunk", receiver:"world"},
				body:{ loc: [data[1],data[2],data[3]], blockArray: new Uint8Array(arr) }
			});
		});

		this.main.playerControls.observer.bind('editblock', (e)=>{
			this.worker.postMessage(e);
		});

	}

	addChunk(args){
		args.renderer = this.renderer;
		args.world = this;
		this.chunkArray.push(new ChunkGeometry(args));
		this.chunkHash.spoil();
	}



	chunkUpdate(args){
		var cam = args.pos;
		var j = this.chunkArray.length;
		while(j--){
			var draw = false;
			var chunk = this.chunkArray[j];
			var geom = this.chunkArray[j].geometry;
			// var fullindex = [];
			let FLAGS = this.FLAG.DRAW;
			

			for (var i = 0; i < 6; i++) {
				if(i > 2){
					var face = i-3;
					if(cam[face] < chunk.loc[face]*this.chunkroot) continue;
				}else{
					if(cam[i] > chunk.loc[i]*this.chunkroot + this.chunkroot) continue;
				}
				if(!geom.vertex.numItems) continue;
				if(!geom.index[i].numItems) continue;


				FLAGS = FLAGS | (1 << i);
				draw = true;
			}
			if(draw && (FLAGS != chunk.FLAGS)){
				chunk.FLAGS = FLAGS | this.FLAG.DRAW;
			}
		}
	}
}


