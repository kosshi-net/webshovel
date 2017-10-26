'use strict';

class Component {
	constructor(){

	}

	bind(entity, data){
		entity.components[this.name] = data || {};
	}

	unbind(entity){
		delete entity.components[this.name];
	}
}

