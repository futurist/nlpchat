'use strict'

var prop = function  (init) {
	var store = init
	return function (val){
		if(arguments.length) store = val;
		return store
	}
}

class thing{
	constructor(name) {
		var self = this
		this.name = name
		console.log(this.name)
	}
}

class shippment extends thing{
	constructor(name) {
		super(name)
		var self = this
	}
}

class _洗衣机 {
	constructor(){

	}
}

var b= new shippment('sdof')
b.name = 'sdaiofj'
console.log(b)


