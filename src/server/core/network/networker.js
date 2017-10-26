'use strict';

const WebSocketServer = require('websocket').server;
const http = require('http');
const PacketBuffer = require('../../../common/packetbuffer_node.js');
const Packet = require('../../../common/packet.js');
const CommentStripper = require('../../../common/commentstripper.js');
const fs = require('fs');
const Observer = require('../../../common/observer.js');
const RLE = new (require('../../../common/rle.js'))();
class Networker{
	constructor(args){
		this.totalReceivedBytes = 0;

		this.main = args.main;

		this.observer = new Observer();

		var f = fs.readFileSync('./../../res/protocol.json', 'utf-8');

		this.protocol = JSON.parse( new CommentStripper().strip(f) );
		for (var i = 0; i < this.protocol.length; i++) {
			this.protocol[i].id = i;
			this.protocol[this.protocol[i].name] = this.protocol[i];
		}

		this.http = http.createServer(function(request, response) {
			console.log('Received request for ' + request.url);
			response.writeHead(404);
			response.end();
		});

		this.http.listen(8080, function() {
			console.log('Server is listening on port 8080');
		});

		this.ws = new WebSocketServer({
			httpServer: this.http,
			autoAcceptConnections: false
		});

		this.peers = {};





		this.observer.bind('setblock', (e)=>{
			var data = e.packet;
			var peer = e.peer;
			console.log('BLOCK PLACE '+[data[2],data[3],data[4]], data[1]);
			peer.networker.main.world.edit.setBlock( [data[2],data[3],data[4]], data[1] );
			let packet = new Packet();
			packet.usetype(this.protocol.setblock);
			packet.write(data);
			for( let key in peer.networker.peers){
				console.log(key);
				peer.networker.peers[key].send(packet);
			}
		});

		this.observer.bind('terraindownloadreguest', (e)=>{
			var peer = e.peer;

			var world = peer.networker.main.world;
			var packet = new Packet();
			packet.usetype(this.protocol[6]);
			for (let i = 0; i < world.chunkArray.length; i++) {
				let chunk = world.chunkArray[i];

				packet.write([
					packet.id,
					chunk.loc[0], chunk.loc[1], chunk.loc[2],
					RLE.encode(chunk.blockArray)
				]);
				peer.send(packet);

			}

			packet.usetype(this.protocol.terraindownloadfinish);
			packet.write([packet.id]);
			peer.send(packet);
		});

		this.observer.bind('connect', (e)=>{
			var peer = e.peer;

			var packet = new Packet();
			packet.usetype(this.protocol.spawn_entity);
			packet.write([packet.id, 1, peer.id]);

			var packet2 = new Packet();
			packet2.usetype(this.protocol.spawn_entity);

			for( let key in peer.networker.peers){
				var remote = peer.networker.peers[key];
				if(peer.id == remote.id) continue;

				packet2.write([packet.id, 1, remote.id]);

				peer.send(packet2);
				remote.send(packet);
			}

		});
		this.observer.bind('disconnect', (e)=>{
			var peer = e.peer;

			var packet = new Packet();
			packet.usetype(this.protocol.kill_entity);
			packet.write([packet.id, 0, peer.id]);

			for( let key in peer.networker.peers){
				var remote = peer.networker.peers[key];
				if(peer.id == remote.id) continue;

				remote.send(packet);
			}
		});

		this.observer.bind('client_entity_position', (e)=>{
			var data = e.packet;
			var peer = e.peer;

			let packet = new Packet();
			packet.usetype(this.protocol.server_entity_position);
			packet.write([ packet.id, peer.id, 
				data[1],data[2],data[3],
				data[4],data[5],data[6], 
				data[7], data[8],
			]);

			for( let key in peer.networker.peers){
				var remote = peer.networker.peers[key];
				if(peer.id == remote.id) continue;

				remote.send(packet);
			}
		});






		this.ws.on('request', function(request) {

			let wantedprotocol = "webshovel-"+this.main.version;

			if ( request.requestedProtocols[0] != wantedprotocol ) { 
				request.reject();
				console.log('Connection from origin ' + request.origin + ' rejected.');
				return;
			}		

			let id = Math.round(0xFFFFFFFF*Math.random());
			// Generates an random Uint32-value. 
			// We use that instead of a string 
			// because a number is easy to handle
			// and send around. 


			this.peers[id] = new Peer({
				socket:request.accept(wantedprotocol, request.origin),
				id:id,
				networker:this
			});
			this.observer.fire('connect', {peer:this.peers[id]});
			
			console.log('Connection from origin ' + request.origin + ' accepted.');


		}.bind(this));
	}



}

class Peer{
	constructor(args){
		this.networker = args.networker;
		this.id = args.id;
		this.socket = args.socket;

		this.updaterate = 30;
		this.lasttick = 0;
		this.tickbuffer = new PacketBuffer();

		this.protocol = this.networker.protocol;


		this.socket.on('message', this.handlePacket.bind(this));
		this.socket.on('close', this.handleClose.bind(this));

		console.log("Socket " + this.id + "created");
	}


	handlePacket(message){
		if (message.type === 'utf8') {
			console.log("What why?", message);
		}

		else if (message.type === 'binary') {
			let buffer = new PacketBuffer(message.binaryData, this.protocol);
			this.networker.totalReceivedBytes += buffer.array.length;
			if( !buffer.unpack() ) throw "Packetbuffer unpack failed";
			
			for (let i = 0; i < buffer.packets.length; i++) {
				let data = buffer.packets[i].read();

				this.networker.observer.fire(this.protocol[data[0]].name, {packet:data, peer:this});
			}
		}
	}

	handleClose(reasonCode, description) {
		console.log(' Peer ' + this.socket.remoteAddress + ' disconnected.');
		console.log(reasonCode, description);
		this.networker.observer.fire('disconnect', {peer:this});
		delete this.networker.peers[this.id];
	}

	send(pbuf){

		this.networker.totalSentBytes += pbuf.array.length;
		if(pbuf.array.length > 0){
			// console.log(pbuf.arrayInHuman());
			this.socket.send( new Buffer(pbuf.array) );
		}
	}

	queue(packet){
		this.tickbuffer.push(packet);
	}

	tick(){
		if(performance.now() > this.lasttick+1000/this.cmdrate 
		&& this.connected){


			this.lasttick = performance.now();
			this.tickbuffer.pack();
			this.send(this.tickbuffer);
			this.tickbuffer.clear();
		}
	}
}




module.exports = Networker;















