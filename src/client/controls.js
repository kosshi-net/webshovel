'use strict';

let keyconfig = `
	// Default keyconfig for WebShovel engine

	+KeyW = +MoveForward;
	-KeyW = -MoveForward;
	+KeyA = +MoveLeft;
	-KeyA = -MoveLeft;
	+KeyS = +MoveBackward;
	-KeyS = -MoveBackward;
	+KeyD = +MoveRight;
	-KeyD = -MoveRight;

	+Space = Jump.trigger;

	+ShiftLeft = +Sneak;
	-ShiftLeft = -Sneak;

	+KeyF = +FlyDown;
	-KeyF = -FlyDown;
	+KeyR = +FlyUp;
	-KeyR = -FlyUp;

	MousePrimary.down = Break.trigger;
	MouseSecondary.down = Place.trigger;

	Scroll.down = BlockUp.trigger;
	Scroll.up   = BlockDown.trigger;

	// Scroll.down = Jump.trigger;
	// Scroll.up   = Jump.trigger;

`;

class Controller {
	constructor(args){
		this.input = args.input;
		this.actions = [];
		this.actionEvents = [];
		this.inputEventQueue = [];

		this.binds = [];

		this.commentStripper = new CommentStripper();

		this.input.observer.bind('*', this.handleInputEvent.bind(this));
	}


	handleInputEvent(key){
		this.inputEventQueue.push(key.split('.'));
	}

	refresh(){

		for (let i = 0; i < this.binds.length; i++) {
			
			switch (this.binds[i][3]){
				case 'trigger':
					for (let j = 0; j < this.inputEventQueue.length; j++) {
						if(	this.inputEventQueue[j][0]==this.binds[i][0]
						&&  (this.inputEventQueue[j][1]=='down') == (this.binds[i][1]=='down')
						){
							this.actionEvents.push(this.binds[i][2]);
						}
					}
					break;
				case 'toggle':
					break;
				case 'start':
					if(	this.input.getKeyState( this.binds[i][0] ) == (this.binds[i][1] == 'down'))
						this.setActionState( this.binds[i][2], true );
					break;
				case 'stop':
					if(	this.input.getKeyState( this.binds[i][0] ) != (this.binds[i][1] == 'up'))
						this.setActionState( this.binds[i][2], false );
					break;
			}
		}

		this.inputEventQueue = [];
	}

	getActionState(action){
		// why like this? This also checks for undefined.
		if(this.actions[action])
			return true;
		return false;
	}

	setActionState(action, state){
		this.actions[action] = state;
	}

	bindConfig(cfg){
		this.binds = this.compile(cfg);
	}

	error(src, index, code, errorsrc){
		let colons = 0;
		let line = 1;
		for (var i = 0; i < src.length; i++) {
			if(src.charCodeAt(i) == 10)
				line++;
			else if(src[i] == ';') 
				colons++;
			if(colons >= index)
				break;
		}

		console.warn('Input config errorcode '+code+' on line '+line+':\n"'+errorsrc+'"');
		return [];
	}

	compile(src){
		let cfg = this.commentStripper.strip(src);
		let config = [];

		cfg = cfg.split(';');

		for (var i = 0; i < cfg.length; i++) {
			cfg[i] = cfg[i].trim();
			if(!cfg[i]) continue;
			let cmd = cfg[i].split('=');

			if(cmd.length != 2) return this.error(src, i, 0, cfg[i]);
			let reg = [];

			let key = cmd[0].trim().split('.');
			if(key.length == 1){

				if(key[0][0] == '+'){
					reg[1] = 'down';
					reg[0] = key[0].slice(1);
				}
				else if (key[0][0] == '-'){	
					reg[1] = 'up';
					reg[0] = key[0].slice(1);
				}
				else { 
					reg[1] = 'auto';
					reg[0] = key[0];
				}

			} else if (key.length == 2){
				reg[0] = key[0];
				reg[1] = key[1];
			}
			else return this.error(src, i, 1, cfg[i]);

			let act = cmd[1].trim().split('.');

			if(act.length == 1){

				if(act[0][0] == '+') {
					reg[3] = 'start';
					reg[2] = act[0].slice(1);
				}

				else if (act[0][0] == '-'){	
					reg[3] = 'stop';
					reg[2] = act[0].slice(1);
				}
				else if (act[0][0] == '!'){
					reg[3] = 'toggle';	
					reg[2] = act[0].slice(1);
				}
				else {
					reg[3] = 'auto';
					reg[2] = act[0];
				}


			} else if (act.length == 2){
				reg[2] = act[0];
				reg[3] = act[1];
			}
			else return this.error(src, i, 3, cfg[i]);

			if(
				reg[1] != 'auto' &&
				reg[1] != 'down' &&
				reg[1] != 'up'   ){
				return this.error(src, i, 4, cfg[i]);
			}

			if(
				reg[3] != 'auto' &&
				reg[3] != 'start'&&
				reg[3] != 'stop' &&
				reg[3] != 'toggle' &&
				reg[3] != 'trigger'){
				return this.error(src, i, 5, cfg[i]);
			}

			// Ready, now resolve auto

			if( reg[1] == 'auto' && 
				reg[3] == 'auto'){

				config.push([reg[0],'down', reg[2],'start']);
				config.push([reg[0],'up', 	reg[2],'stop']);
				config.push([reg[0],'down', reg[2],'trigger']);

			}else if(	reg[1] == 'auto' && 
						reg[3] != 'auto'){
				reg[1] = 'down';
				config.push(reg);

			}else if(	reg[1] != 'auto' && 
						reg[3] == 'auto'){
				reg[1] = 'trigger';
				config.push(reg);

			} else {
				config.push(reg);
			}
		}
		return config;
	}

}

