'use strict';

class Observer {
	constructor() {
		this.listeners = [];
	}

	bind(event, callback) {
		this.listeners.push( {event:event, callback:callback} );
	}

	unbind(callback) {
		for (var i = this.listeners.length - 1; i >= 0; i--) 
			if (this.listeners[i].callback === callback) 
				this.listeners.splice(i, 1);
	}

	fire(event, data) {
		for(let i = 0; i < this.listeners.length; i++)
		if (this.listeners[i].event == event)
			this.listeners[i].callback(data);
	}
}

if (typeof module !== 'undefined') module.exports = Observer;
