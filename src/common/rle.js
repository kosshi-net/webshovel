'use strict';

class RLE {
	encode(array){
		let rlearray 	= [],
			lastbyte 	= -1,
			repeats 	=  0,
			repeatcap	= 0xFF - 1,
			currentbyte = -1;

		lastbyte = array[0];

		for(let i = 1; i < array.length; i++){
			currentbyte = array[i];

			if( currentbyte == lastbyte ){
				if(repeats < repeatcap){
					repeats++;
				} else {
					rlearray.push(lastbyte, repeats+1);
					repeats = -1;
				}
			} else {
				if(repeats != -1) 
					rlearray.push(lastbyte, repeats);
				lastbyte = currentbyte;
				repeats = 0;
			}
		}
		if (repeats > -1)
			rlearray.push(lastbyte, repeats);

		return rlearray;
	}

	decode(rlearray){
		var array 		= [];

		for(var i = 0; i < rlearray.length; i+=2){
			for(var j = -1; j < rlearray[i+1]; j++){
				array.push(rlearray[i]);
			}
		}
		return array;
	}
}

if (typeof module !== 'undefined') {
	module.exports = RLE;
} 


