'use strict';
const Server = require('./core/main.js');
const readline = require('readline');



let server = new Server();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', (msg) => {
	let cmd = msg.split(' ');
	let arg = "";

	{
		let _arg = msg.split(' ');
		for (let i = 1; i < _arg.length; i++) 
			arg += _arg[i] + " ";
	}

	switch(cmd[0]){
		case "exit":
		case "stop":
		case "end":
			console.log("Stopping...");
			process.exit(0);
			break;
		case "eval":
			eval(arg);
			break;
		case "save":
			server.world.save('default.dat');
			break;
		default:
			console.log("Invalid command", cmd);
			break;
	}
	
});

