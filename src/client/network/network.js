'use strict';

/* globals
	Packet,
	Observer,
	FileGetter,
	CommentStripper,
	PacketBuffer
*/


class Networker{
	constructor(args){
		this.totalReceivedBytes = 0;
		this.totalSentBytes = 0;


		
		this.uploadrate = 0;
		this.downloadrate = 0;
		
		this.uploadratecounter = 0;
		this.downloadratecounter = 0;

		this.lastcounterupdate = 0;

		this.main = args.main;

		this.cmdrate = 30;
		this.lasttick = 0;
		this.tickbuffer = new PacketBuffer();

		this.connected = false;

		this.observer = new Observer();


		new FileGetter().load('./res/protocol.json', f => {
			this.protocol = JSON.parse( new CommentStripper().strip(f) );
			for (var i = 0; i < this.protocol.length; i++) {
				this.protocol[i].id = i;
				this.protocol[this.protocol[i].name] = this.protocol[i];
			}
			this.connect(args.settings.ip);}
		);
	}

	stats(up, dn){
		this.uploadratecounter += up;
		this.downloadratecounter += dn;
		this.totalReceivedBytes += dn;
		this.totalSentBytes += up;

		if( performance.now()-1000 > this.lastcounterupdate ) {
			var delta = performance.now() - this.lastcounterupdate;
			this.lastcounterupdate = performance.now();
			delta/=1000;
			this.uploadrate = (this.uploadratecounter*delta*8)|0;
			this.downloadrate = (this.downloadratecounter*delta*8)|0;

			this.uploadratecounter = 0;
			this.downloadratecounter = 0;
		}
	}



	connect(ip){
		this.socket = new WebSocket("ws://"+ip,"webshovel-"+this.main.version);
		this.socket.binaryType = "arraybuffer";

		this.socket.onopen = function(e) {
			console.log("[WEBSOCKET] Open");
			console.log(e);
			this.observer.fire('connected');
			let packet = new Packet();
			packet.usetype(this.protocol[5]);
			packet.write([packet.id]);
			this.send(packet);

			this.connected = true;
		}.bind(this);
		this.socket.onerror = function(e) {
			console.log("[WEBSOCKET] Error" );
			console.log(e);
			this.observer.fire('disconnected');
			this.observer.fire('error');
			this.connected = false;
		}.bind(this);
		this.socket.onclose = function(e) {
			console.log("[WEBSOCKET] Close" );
			console.log(e);
			this.observer.fire('disconnected');
			this.connected = false;
		}.bind(this);
		this.socket.onmessage = this.handlePacket.bind(this);


	}

	queue(packet){
		this.tickbuffer.push(packet);
	}

	tick(){
		if(performance.now() > this.lasttick+1000/this.cmdrate 
		&& this.connected){

			var packet = new Packet();
			var p = this.main.localPlayer.components;

			packet.usetype(this.protocol.client_entity_position);
			packet.write([packet.id, 
				p.physics.location[0],
				p.physics.location[1],
				p.physics.location[2],
				p.physics.velocity[0],
				p.physics.velocity[1],
				p.physics.velocity[2],
				p.head.yaw,
				p.head.pitch
			]);
			this.queue(packet);


			this.lasttick = performance.now();
			this.tickbuffer.pack();
			this.send(this.tickbuffer);
			this.tickbuffer.clear();
		}
	}

	send(pbuf){
		this.stats(pbuf.array.length, 0);
		if(pbuf.array.length > 0){
			// console.log(pbuf.arrayInHuman());
			this.socket.send(pbuf.array.buffer);
		}
	}

	worldevent(data){
		// console.log(data);
		switch(data.head.cmd){

			case "setBlock":{
				this.main.world.edit.setBlock(data.body.loc, data.body.id);
				let packet = new Packet();
				packet.usetype(this.protocol[2]);
				packet.write([
					packet.id, data.body.id, 
					data.body.loc[0], data.body.loc[1], data.body.loc[2] 
				]);
				this.queue(packet);
			} break;


		}
	}

	handlePacket(message) {
		// console.log("packet");
		if ( message.data instanceof ArrayBuffer) {
			let buffer = new PacketBuffer(new Uint8Array(message.data), this.protocol);
			this.stats(0, buffer.array.length);
			if( !buffer.unpack() ) throw "Error parsing PacketBuffer";

			for(let i = 0; i < buffer.packets.length; i++){
				// buffer.packets[i].handle(this);
				let data = buffer.packets[i].read();

				this.observer.fire(this.protocol[data[0]].name, data);
			}

		} else {
			console.log("What are you doing??");
			console.log(message.data);


		}

	}

}

if (typeof module !== 'undefined') {
	module.exports = Networker;
} 
