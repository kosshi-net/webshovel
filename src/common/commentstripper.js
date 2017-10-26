'use strict';

// Fuck regex
// at least this is far faster than it ¯\_(ツ)_/¯

class CommentStripper {
	constructor(delete_enters){
		this.cfg = {};
		this.cfg.delete_enters = delete_enters;

		this.state = 0;
		this.stateStack = [];
		this.mem = '';

		var _e = 0;
		this.INITIAL 		 	= _e++;
		this.COMMENT_START  	= _e++;
		this.COMMENT_MULTI  	= _e++;
		this.COMMENT_END 	 	= _e++;
		this.COMMENT_SINGLE 	= _e++;

		this.IGNORE_FOLLOWING 	= _e++;
		this.STRING		 		= _e++;

		this.SLASH = '/'.charCodeAt(0);
		this.BACKSLASH = '\\'.charCodeAt(0);

		this.STR0 = '\''.charCodeAt(0);
		this.STR1 = '"'.charCodeAt(0);
		this.STR2 = '`'.charCodeAt(0);

		this.STAR = '*'.charCodeAt(0);
		this.ENTER = 10;
	}

	pushState(state){
		this.state = state;
		this.stateStack.push(state);
	}

	popState(){
		this.stateStack.pop();
		this.state = this.stateStack[this.stateStack.length-1];
	}

	setState(state){
		this.state = state;
	}

	strip(source, delete_enters){

		this.pushState(this.INITIAL);

		var text = '';
		
		for (let i = 0; i < source.length; i++) {
		
			var char = source[i];

			switch (this.state){
				case this.INITIAL:
					switch (char.charCodeAt(0)) {
						case this.ENTER:
							if(delete_enters) text+=char;
							continue;

						case this.SLASH:
							this.pushState(this.COMMENT_START);
							continue;

						case this.STR0:
						case this.STR1:
						case this.STR2:
							this.pushState(this.STRING);
							this.mem = char.charCodeAt(0);
							text+=char;
							continue;

						default:
							text+=char;
							continue;
					} 
					break;

				case this.STRING:
					switch (char.charCodeAt(0)) {
						case this.mem:
							this.popState(this.STRING);
							text+=char;
							continue;
						default:
							text+=char;
							continue;
					} 
					break;
				case this.COMMENT_START:
					switch (char.charCodeAt(0)) {
						case this.SLASH:
							this.setState(this.COMMENT_SINGLE);
							continue;
						case this.STAR:
							this.setState(this.COMMENT_MULTI);
							continue;
						default:
							text += '/'+char;
							this.popState();
							continue;
					}
					break;
				case this.COMMENT_SINGLE:
					switch (char.charCodeAt(0)) {
						case this.ENTER:
							this.popState();
							text += char;
							continue;
						default:
							continue;
					}
					break;
				case this.COMMENT_MULTI:
					switch (char.charCodeAt(0)) {
						case 42:
							this.setState(this.COMMENT_END);
							continue;
						default:
							continue;
					}
					break;
				case this.COMMENT_END:
					switch (char.charCodeAt(0)) {
						case 47:
							this.popState();
							continue;
						default:
							this.setState(this.COMMENT_MULTI);
							continue;
					}
				}
		}
		if(this.state == this.COMMENT_START) text += '/';
		this.stateStack = [];
		return text;
	}
}

if (typeof module !== 'undefined') module.exports = CommentStripper;