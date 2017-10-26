'use strict';


const fs = require('fs');

const Networker = require("./network/networker.js");

const World = require("./world.js");


class WebshovelServer{
	constructor(){		
		console.log("Opening server");
		let terraincfg = JSON.parse(fs.readFileSync('./cfg/terrain.json', "utf8"));
		this.settings = {
			root: terraincfg.root
		};
		this.settings.terrain = terraincfg;
		this.version = "0.280";
		// this.world = new World();
		this.networker = new Networker({main:this});

		this.world = new World(this.settings);

		fs.access('default.dat', 4, (err)=>{
			if(err) {	
				this.world.generateWorld([0,0,0],[
					this.settings.terrain.size[0]  / this.settings.root ,
					this.settings.terrain.size[1]   / this.settings.root ,
					this.settings.terrain.size[2]  / this.settings.root 
				]);
			} else {

				if ( !this.world.load('default.dat') ) throw "File invalid";
			}
		});


	}

}


module.exports = WebshovelServer;



/*

Client connects
-> Verify
-> Send properties of world, blocks
-> Client downloads the map




SERVER EVENTS

on player connect
on player disconnect
on player terrain download request
on player cmdtick
	- subevents:
		block raycast	
		chat message

on server start
on server stop

*/ 


