'use strict';

/* globals
	Packet
*/


class PacketBuffer{
	constructor(array, protocol){
		this.array = array || new Uint8Array();
		this.packets = [];	

		this.protocol = protocol;

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

	resolvePacket(id){
		return this.protocol[id] || false;
	}

	clear(){
		this.packets = [];
		this.array = new Uint8Array();
	}

	unpack(){
		if( !this.packed ) return false;
		let byte = 0;
		let loops = 0;
		while(byte < this.array.length){
			if(loops++ > 200) {
				console.log("Current byte", byte);
				console.log(this.array);
				console.log(this.packets);
				console.log(this.packets[0].length);
				throw "Infinite loop?";
			}
			let packettype = this.resolvePacket( this.array[byte] );
			if(packettype === false) return false;

			let packet = new Packet();
			packet.usetype(packettype);

			packet.writeBytes( this.array.slice( byte ) );

			this.packets.push(packet);
			byte += packet.length;
		}
		this.alloc(0);
		return true;
	}

	arrayInHuman(){
		let text = "";
		for (let i = 0; i < this.array.length; i++) {
			if( i % 8 === 0) text += "\n";
			text += ("0"+this.array[i].toString(16)).slice(-2) + " ";
		}
		return text;
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
