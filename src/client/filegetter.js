'use strict';

class FileGetter{
	constructor(){

	}

	load(file, callback){
		let http = new XMLHttpRequest();

		http.onreadystatechange = function(){
			if (http.readyState == 4 && http.status == 200){
				callback( http.responseText );
			}
		}.bind(this);

		http.open("GET", file, true);

		http.send();
	}
}