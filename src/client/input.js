"use strict";



/* # Doc

Tracks and handles keyboard, mouse and lockstate.

## How to use

To get the press state of a key, use
input.getKeyState('KeyA');
returns true/false.

To bind events, use
input.observer.bind('KeyA.down', callback);
Valid states are .down and .up

## Keys
For keyboard:
KeyA, KeyB..
F1, F2..
Space, Escape, ControlLeft, ShiftRight ..
Digit1, Digit2 ..
Numpod1, Numpad2 ...
ArrowLeft, ArrowRight...
etc etc
Experiment yourself, use 
window.onkeydown = function(e){ console.log(e.code) }
in console to see what returns what

Mouse:
MousePrimary, MouseMiddle, MouseSecondary.

Wheel:
ScrollUp, ScrollDown
These can be used only with observer. Do not add states.
input.observer.bind('ScrollUp', callback);

*/


class Input{
	constructor(){
		this.mouse = {
			x:0, y:0,
			dx:0, dy:0,
			button: [false,false,false,false,false,false], 
			locked: false,
			sensitivity: 0.1
		};

		this.observer = new Observer();

		this.keys = {};
		this.events = [];
		document.addEventListener('pointerlockchange', 
			this.pointerlockchange.bind(this), false);
		document.addEventListener('mozpointerlockchange',
			this.pointerlockchange.bind(this), false);

		window.addEventListener('mousemove', e => {
			e = e || event;
			if(this.mouse.locked){
				this.mouse.x += e.movementX;
				this.mouse.y += e.movementY;
			}
		});

		window.addEventListener('mouseup', e => {
			e = e || event;
			if(this.mouse.locked){
				e.preventDefault();
				this.setKeyState(this.resolveMouseKey(e.button), false);
			}
		});

		window.addEventListener('mousedown', e => {
			e = e || event;
			if(this.mouse.locked){
				e.preventDefault();
				this.setKeyState(this.resolveMouseKey(e.button), true);
			} else {
				this.lockCursor();
			}
		});

		window.addEventListener('keyup', e => {
			e = e || event;
			this.setKeyState(e.code, false);
		});

		window.addEventListener('keydown', e => {
			e = e || event;

			if(!this.mouse.locked)
				return;

			e.preventDefault();
			this.setKeyState(e.code, true);
		});

		window.addEventListener('wheel', e => {
			e = e || event;
			if(!this.mouse.locked)
				return;
			e.preventDefault();
			if(e.deltaX===0 && e.deltaZ===0){
				this.observer.fire('Scroll'+(e.deltaY < 0 ? '.up' : '.down'));
				this.observer.fire( '*' , 'Scroll'+(e.deltaY < 0 ? '.up' : '.down') );
			}

		});
	}

	resolveMouseKey(id){
		switch(id){
			case 0: 	return 'MousePrimary';
			case 1: 	return 'MouseMiddle';
			case 2: 	return 'MouseSecondary';
			default:	return 'MouseUnknown';
		}
	}

	setKeyState(key,state){
		if ( this.keys[key] != state ){
			this.keys[key] = state;
			this.observer.fire( key + ((state) ? '.down' : '.up') );
			this.observer.fire( '*' , key + ((state) ? '.down' : '.up') );
		}
	}

	getKeyState(key){
		if ( this.keys[key] )
			return true;
		return false;
	}

	pointerlockchange(){
		if(document.pointerLockElement === null || document.mozPointerLockElement === null){
			this.mouse.locked = false;
		}else{
			this.mouse.locked = true;
		}
	}

	lockCursor(){
		document.body.requestPointerLock =
			document.body.requestPointerLock || 
			document.body.mozRequestPointerLock || 
			document.body.webkitRequestPointerLock;
		document.body.requestPointerLock();
	}

}









