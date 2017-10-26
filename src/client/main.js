'use strict';

/* globals
	Controller,
	PlayerController,
	Settings,
	Networker,
	Input,
	Renderer,
	EntityPhysics,
	World,
	TerrainCollider,
	EntityAssembler,

	keyconfig
*/

var game;

const CLIENT_VERSION = "0.325";
const VERSION = "0.280";
const DESC = "NET";

window.onload = ()=>{
	game = new Game();
};



class Game {
	constructor(){
		this.version = VERSION;
		this.settings = new Settings().settings;
		this.networker = new Networker({settings:this.settings,main:this});

		this.lastTime = 0;
		this.tickCount = 0;

		this.avgFPS = 60;

		this.vsync = true;
		this.showStats = 1;

		this.input = new Input();
		this.input.observer.bind('F3.down', this.toggleStats.bind(this));
		this.input.observer.bind('F1.down', ()=>{this.vsync = !this.vsync;});

		this.controller = new Controller({input:this.input});
		this.controller.bindConfig(keyconfig);

		this.playerControls = new PlayerController({main:this});

		this.renderer = new Renderer({
			canvas3d: document.getElementById('3d'),
			settings: this.settings
		});


		this.input.observer.bind('F4.down',()=>{this.renderer.precull=!this.renderer.precull;});
		this.input.observer.bind('F2.down',()=>{
			this.renderer.shader.load();
			this.renderer.textshader.load();
		});
		this.world = new World({
			settings: this.settings,
			renderer: this.renderer,
			main:this
		});

		this.terrainCollider = new TerrainCollider();
		this.entityPhysics = new EntityPhysics({main:this});

		this.entityAssembler = new EntityAssembler({main:this});
		this.localPlayer = this.entityAssembler.createLocalPlayer();

		this.entities = [];

		this.terraindownloadfinished = false;

		this.entities.push(this.localPlayer);
		this.networker.observer.bind('terraindownloadfinish', ()=>{
			this.localPlayer.components.physics.location[1] = 256;
			this.terraindownloadfinished = true;
		});

		this.tick();
	}

	toggleStats(){
		this.showStats++;
		this.showStats%=3;
	}

	get now(){
		return performance.now();
	}

	get delta(){
		var delta = this.now - this.lastTime;
		this.lastTime = this.now;

		if(delta > 5000){
			console.log(`Yuuuuge delta! Skipping ${delta|0}ms (Blurred tab or potato that can't keep up?)`);
			delta = 16;
		}

		return delta;
	}

	tick(){
		this.tickCount++;
		var delta = this.delta;

		var frametime = 0;
		var t = this.now;
		


		if(this.tickCount % 10 === 0){
			this.world.chunkUpdate({
			pos: Math.vec3.addVec(	this.localPlayer.components.physics.location, 
									this.localPlayer.components.head.offset),
			});
		}



		this.controller.refresh();

		this.entityPhysics.tick({entities:this.entities, delta:delta});
		this.playerControls.tick({entities:this.entities, controls:this.controller,delta:delta});
			
		this.networker.tick();

		this.renderer.clearScreen();
		this.renderer.renderTerrain({
			world:this.world,
			loc: Math.vec3.addVec(	this.localPlayer.components.physics.location, 
									this.localPlayer.components.head.offset),
			yaw: this.localPlayer.components.head.yaw,
			pitch: this.localPlayer.components.head.pitch,
		});
		
		this.renderer.AABBRenderer.render({
			entities:this.entities,
			loc: Math.vec3.addVec(	this.localPlayer.components.physics.location, 
									this.localPlayer.components.head.offset),
			yaw: this.localPlayer.components.head.yaw,
			pitch: this.localPlayer.components.head.pitch,
		});

		frametime = (this.now - t).toFixed(2);

		this.renderer.renderCrosshair();

		this.avgFPS = ((this.avgFPS*29 + 1000/delta) /30);

		if ( this.showStats == 1){
			this.renderer.textRenderer.render(
`Version ${CLIENT_VERSION} / ${DESC}
FPS: ${((1000/delta)|0)} ~${(this.avgFPS|0)} (${frametime}ms)
VSync: ${this.vsync}
https://kosshi.fi/experiments/webshovel
${(this.networker.connected ? "Connected to "+this.networker.socket.url : "Disconnected")}
PROTOCOL_VERSION ${VERSION}
UP: ${this.networker.uploadrate} b/s
DN: ${this.networker.downloadrate} b/s
Visible chunks: ${this.renderer.renderedChunks} / ${this.world.chunkArray.length}
Calls: ${this.renderer.renderCalls}, ${(this.renderer.renderCalls/this.renderer.renderedChunks*100|0)}%
X: ${this.localPlayer.components.physics.location[0].toFixed(6)}
Y: ${this.localPlayer.components.physics.location[1].toFixed(6)}
Z: ${this.localPlayer.components.physics.location[2].toFixed(6)}
YAW: ${this.localPlayer.components.head.yaw|0}
PITCH: ${this.localPlayer.components.head.pitch|0}
ColNorm: ${this.localPlayer.components.physics.collisionnormal.toString()}
Xv: ${this.localPlayer.components.physics.velocity[0].toFixed(6)}
Yv: ${this.localPlayer.components.physics.velocity[1].toFixed(6)}
Zv: ${this.localPlayer.components.physics.velocity[2].toFixed(6)}
${ this.terraindownloadfinished ? '' : 'Downloading terrain...' }
`
			);
		} else if (this.showStats == 2){
			this.renderer.textRenderer.render("FPS:"+(this.avgFPS|0));
		}


		if(this.vsync)
			requestAnimationFrame(this.tick.bind(this));
		else
			setTimeout(this.tick.bind(this), this.settings.chrometime);
		
		
	}
}
