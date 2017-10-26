'use strict';

class InventoryComponent {
	constructor(){
		
	}

	get name () {
		return 'inventory';
	}

	bind(entity){
		entity.components[this.name] = {
			block: 0
		};
	}

	unbind(entity){
		delete entity.components[this.name];
	}

	
}