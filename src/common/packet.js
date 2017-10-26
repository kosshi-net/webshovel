'use strict';

class Packet{
	constructor(){	
		this.array = new Uint8Array();
		this.view = {};
		this.type = {};
	}

	get id(){
		return this.type.id;
	}

	bytelength(type){
		var bytelength = {
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
		this.view = this.getviews(this.array);
	}

	getviews(array){
		return {
			int8: 		new Int8Array(array.buffer),
			uint8: 		new Uint8Array(array.buffer),
			int16: 		new Int16Array(array.buffer),
			uint16: 	new Uint16Array(array.buffer),
			char: 		new Int16Array(array.buffer),
			uint32: 	new Uint32Array(array.buffer),
			int32: 		new Int32Array(array.buffer),
			float32: 	new Float32Array(array.buffer),
			float64: 	new Float64Array(array.buffer)
		};
	}

	usetype(type){
		this.type = type;
	}

	get length(){
		return this.array.length;
	}

	arrayInHuman(){
		var text = "";
		for (var i = 0; i < this.array.length; i++) {
			if( i % 8 === 0) text += "\n";
			text += ("0"+this.array[i].toString(16)).slice(-2) + " ";
		}
		return text;
	}
	// Returns an array of values
	read(){
		var values = [];
		var bytes = 0;

		for (var i = 0; i < this.type.structure.length; i++) {
			var type = this.type.structure[i].split('*');
			if(type[1] !== undefined){ 

				var indexbytes = this.bytelength( type[1] );
				var arraybytes = this.bytelength( type[0] );

				if(bytes % indexbytes !== 0) 
					bytes += indexbytes - (bytes % indexbytes);

				var ARRAYLENGTH = this.view[ type[1] ][ bytes / indexbytes ];
				bytes += indexbytes;

				if(bytes % arraybytes !== 0) 
					bytes += arraybytes - (bytes % arraybytes);

				if(type[0] == 'char'){
					values[i] = String.fromCharCode.apply(null, new Uint16Array(this.array.buffer, bytes, ARRAYLENGTH));
					bytes += ARRAYLENGTH*2;
				} else {
					values[i] = [];
					for(var j = 0; j < ARRAYLENGTH; j++){
						values[i][j] = this.view[ type[0] ][ bytes / arraybytes ] ;
						bytes += arraybytes;
					}
				}

			} else {
				var bytelength = this.bytelength(this.type.structure[i]);
				if(bytes % bytelength !== 0) 
					bytes += bytelength - (bytes % bytelength);
				values[i] = this.view[ this.type.structure[i] ][ bytes / bytelength ];
				bytes += bytelength;
			}
		}
		if(bytes % 8 !== 0) 
			bytes += 8 - (bytes % 8);
		return values;
	}

	// This returns the number of bytes values are going to use. Used to allocate arraybuffers.
	predictLength(values){
		var bytes = 0;
		for (var i = 0; i < this.type.structure.length; i++) {
			var type = this.type.structure[i].split('*');
			if(type[1] !== undefined){
				var indexbytes = this.bytelength( type[1] );
				var arraybytes = this.bytelength( type[0] );

				if(bytes % indexbytes !== 0) 
					bytes += indexbytes - (bytes % indexbytes);
				bytes += indexbytes;

				if(bytes % arraybytes !== 0) 
					bytes += arraybytes - (bytes % arraybytes);
				bytes += arraybytes*values[i].length;

			} else {
				var bytelength = this.bytelength(this.type.structure[i]);

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
		var bytes = 0;

		for (var i = 0; i < this.type.structure.length; i++) {
			var type = this.type.structure[i].split('*');
			if(type[1] !== undefined){ 

				var indexbytes = this.bytelength( type[1] );
				var arraybytes = this.bytelength( type[0] );

				if(bytes % indexbytes !== 0) 
					bytes += indexbytes - (bytes % indexbytes);
				this.view[ type[1] ][ bytes / indexbytes ] = values[i].length;
				bytes += indexbytes;

				if(bytes % arraybytes !== 0) 
					bytes += arraybytes - (bytes % arraybytes);

				for(var j = 0; j < values[i].length; j++){
					this.view[ type[0] ][ bytes / arraybytes ] = 
						(type[0] == 'char') ? values[i].charCodeAt(j) : values[i][j];
					bytes += arraybytes;
				}

			} else {

				var bytelength = this.bytelength(this.type.structure[i]);
				if(bytes % bytelength !== 0) 
					bytes += bytelength - (bytes % bytelength);
				this.view[ this.type.structure[i] ][ bytes / bytelength ] = values[i];
				bytes += bytelength;
			}
		}
		if(bytes % 8 !== 0) 
			bytes += 8 - (bytes % 8);
	}

	writeBytes(array){
		var bytes = 0;
		var view = this.getviews(array);
		for (var i = 0; i < this.type.structure.length; i++) {
			var type = this.type.structure[i].split('*');
			if(type[1] !== undefined){ 

				var indexbytes = this.bytelength( type[1] );
				var arraybytes = this.bytelength( type[0] );

				if(bytes % indexbytes !== 0) 
					bytes += indexbytes - (bytes % indexbytes);

				var ARRAYLENGTH = view[ type[1] ][ bytes / indexbytes ];
				bytes += indexbytes;

				if(bytes % arraybytes !== 0) 
					bytes += arraybytes - (bytes % arraybytes);

				if(type[0] == 'char'){
					bytes += ARRAYLENGTH*2;
				} else {
					bytes += ARRAYLENGTH*arraybytes;
				}

			} else {
				var bytelength = this.bytelength(this.type.structure[i]);
				if(bytes % bytelength !== 0) 
					bytes += bytelength - (bytes % bytelength);
				bytes += bytelength;
			}
		}
		if(bytes % 8 !== 0) 
			bytes += 8 - (bytes % 8);
		
		this.alloc(bytes);
		this.array.set(array.slice(0, bytes));
	}
}


if (typeof module !== 'undefined') module.exports = Packet;
 