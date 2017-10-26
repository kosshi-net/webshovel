'use strict';

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
		while(byte < this.array.length){
			let packettype = this.resolvePacket( this.array[byte] );
			if(packettype === false) return false;

			let packet = new packettype();

			packet.writeBytes( this.array.slice( byte, packet.length ) );
			this.packets.push(packet);
			byte += packet.length;
		}
		this.alloc(0);
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






class Packet{
	constructor(){	
		this.array = new Uint8Array();
		this.view = {};
		this.types = [];
	}

	bytelength(type){
		let bytelength = {
			int8: 		1,
			uint8: 		1,
			int16: 		2,
			uint16: 	2,
			char: 		2,
			int32: 		4,
			uint32: 	4,
			float32: 	4,
			float64: 	8
		};
		return bytelength[type];
	}

	alloc(bytes){
		this.array = new Uint8Array(bytes);
		this.view = {
			int8: 		new Int8Array(this.array.buffer),
			uint8: 		new Uint8Array(this.array.buffer),
			int16: 		new Int16Array(this.array.buffer),
			uint16: 	new Uint16Array(this.array.buffer),
			char: 		new Int16Array(this.array.buffer),
			uint32: 	new Uint32Array(this.array.buffer),
			int32: 		new Int32Array(this.array.buffer),
			float32: 	new Float32Array(this.array.buffer),
			float64: 	new Float64Array(this.array.buffer)
		};
	}

	usetypes(types){
		this.types = types;
	}

	get length(){
		return this.array.length;
	}

	arrayInHuman(){
		let text = "";
		for (let i = 0; i < this.array.length; i++) {
			if( i % 8 === 0) text += "\n";
			text += ("0"+this.array[i].toString(16)).slice(-2) + " ";
		}
		return text;
	}
	// Returns an array of values
	read(){
		let values = [];
		let bytes = 0;

		for (let i = 0; i < this.types.length; i++) {
			let type = this.types[i].split('*');
			if(type[1] !== undefined){ 

				let indexbytes = this.bytelength( type[1] );
				let arraybytes = this.bytelength( type[0] );

				if(bytes % indexbytes !== 0) 
					bytes += indexbytes - (bytes % indexbytes);

				let ARRAYLENGTH = this.view[ type[1] ][ bytes / indexbytes ];
				bytes += indexbytes;

				if(bytes % arraybytes !== 0) 
					bytes += arraybytes - (bytes % arraybytes);

				if(type[0] == 'char'){
					values[i] = String.fromCharCode.apply(null, new Uint16Array(this.array.buffer, bytes, ARRAYLENGTH));
					bytes += ARRAYLENGTH*2;
				} else {
					values[i] = [];
					for(let j = 0; j < ARRAYLENGTH; j++){
						values[i][j] = this.view[ type[0] ][ bytes / arraybytes ] ;
						bytes += arraybytes;
					}
				}

			} else {
				let bytelength = this.bytelength(this.types[i]);
				if(bytes % bytelength !== 0) 
					bytes += bytelength - (bytes % bytelength);
				values[i] = this.view[ this.types[i] ][ bytes / bytelength ];
				bytes += bytelength;
			}
		}
		if(bytes % 8 !== 0) 
			bytes += 8 - (bytes % 8);
		return values;
	}

	// This returns the number of bytes values are going to use. Used to allocate arraybuffers.
	predictLength(values){
		let bytes = 0;
		for (let i = 0; i < this.types.length; i++) {
			let type = this.types[i].split('*');
			if(type[1] !== undefined){
				let indexbytes = this.bytelength( type[1] );
				let arraybytes = this.bytelength( type[0] );

				if(bytes % indexbytes !== 0) 
					bytes += indexbytes - (bytes % indexbytes);
				bytes += indexbytes;

				if(bytes % arraybytes !== 0) 
					bytes += arraybytes - (bytes % arraybytes);
				bytes += arraybytes*values[i].length;

			} else {
				let bytelength = this.bytelength(this.types[i]);

				if(bytes % bytelength !== 0) 
					bytes += bytelength - (bytes % bytelength);
				bytes += bytelength;
			}
		}
		if(bytes % 8 !== 0) 
			bytes += 8 - (bytes % 8);
		return bytes;
	}

	write(values){
		this.alloc(this.predictLength(values));
		let bytes = 0;

		for (let i = 0; i < this.types.length; i++) {
			let type = this.types[i].split('*');
			if(type[1] !== undefined){ 

				let indexbytes = this.bytelength( type[1] );
				let arraybytes = this.bytelength( type[0] );

				if(bytes % indexbytes !== 0) 
					bytes += indexbytes - (bytes % indexbytes);
				this.view[ type[1] ][ bytes / indexbytes ] = values[i].length;
				bytes += indexbytes;

				if(bytes % arraybytes !== 0) 
					bytes += arraybytes - (bytes % arraybytes);

				for(let j = 0; j < values[i].length; j++){
					this.view[ type[0] ][ bytes / arraybytes ] = 
						(type[0] == 'char') ? values[i].charCodeAt(j) : values[i][j];
					bytes += arraybytes;
				}

			} else {

				let bytelength = this.bytelength(this.types[i]);
				if(bytes % bytelength !== 0) 
					bytes += bytelength - (bytes % bytelength);
				this.view[ this.types[i] ][ bytes / bytelength ] = values[i];
				bytes += bytelength;
			}
		}
		if(bytes % 8 !== 0) 
			bytes += 8 - (bytes % 8);
	}

	writeBytes(array){
		this.array.set(array);
	}
}


let Packets = {};
Packets[0x10] = PlayerBlockRaycastPacket;
Packets[0x20] = SetBlockPacket;



class SetBlockPacket extends Packet{
	constructor(){
		super();
		const PACKET_ID = 0x20; 
		const types = [
			"uint8",  // Packet ID
			"uint8",  // Block ID
			"uint16", // x
			"uint16", // y
			"uint16", // z
		];

		this.usetypes(types);
		this.array[0] = PACKET_ID;
	}
}



class ChatMessagePacket extends Packet{
	constructor(){
		super();
		const PACKET_ID = 0x20; 
		const types = [
			"uint8",  // Packet ID
			"char*uint16" // Message
		];
		this.usetypes(types);
		this.array[0] = PACKET_ID;
	}
}



class ChunkPacket extends Packet{
	constructor(){
		super();
		const PACKET_ID = 0x20; 
		const types = [
			"uint8",  // Packet ID
			"uint8*uint16" // Blockdata
		];
		this.usetypes(types);
		this.array[0] = PACKET_ID;
	}
}




class TestPacket extends Packet{
	constructor(){
		super();
		const PACKET_ID = 0x20; 
		const types = [
			"uint8",  // Packet ID
			"uint8*uint16", // Blockdata
			"char*uint16",
			"float64"
		];
		this.usetypes(types);
		this.array[0] = PACKET_ID;
	}
}

