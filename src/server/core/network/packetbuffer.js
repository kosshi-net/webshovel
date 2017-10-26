'use strict';
const Packets = require("./packets.js");




class PacketBuffer{
	constructor(array){
		this.array = array || new Uint8Array();
		this.packets = [];

	}

	get packed(){
		return (this.array.length > 0);
	}

	push(packet){
		if( this.packed ) return false;
		this.packets.push(packet);
	}


	alloc(bytes){
		this.array = new Uint8Array(bytes);
	}


	unpack(){
		if( !this.packed ) return false;
		let byte = 0;
		let loops = 0;
		while(byte < this.array.length){
			let packettype = this.resolvePacket( this.array[byte] );
			if(packettype === false) return false;

			let packet = new packettype();

			packet.writeBytes( this.array.slice( byte ) );
			this.packets.push(packet);
			byte += packet.length;
		}
		this.alloc(0);
		return true;
	}

	resolvePacket(id){
		return Packets[id] || false;
	}

	pack(){
		if( this.packed ) return false;
		// Count how much memory to allocate, and allocate it
		let bytes = 0;
		for (let i = 0; i < this.packets.length; i++) {
			bytes += this.packets[i].array.length;
		}
		this.alloc(bytes);
		// Now write to the array
		bytes = 0;
		for (let i = 0; i < this.packets.length; i++) {
			this.array.set( this.packets[i].array, bytes);
			bytes += this.packets[i].array.length;
		}
		this.packets = [];
	}
}

module.exports = PacketBuffer;