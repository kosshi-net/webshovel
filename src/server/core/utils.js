'use strict';


module.exports = {};



module.exports.base64name = function(length){
	var name = '';
	while(length--)
		name += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'[ (Math.random()*64|0) ];
	return name;
};

