'use strict'

var prop = function  (init) {
	var store = init
	return function (val){
		if(arguments.length) store = val;
		return store
	}
}

class a{
	constructor(val) {
		var self = this
		self.val = val
	}
	x(){
		return 20
	}
}

a.prototype.y = function(){
	return 100
}

var aa = new a(1)
console.log( Object.keys(aa), aa.y(),  aa.x() )

a.prototype.yy = function(){
	return this.val
}
a.prototype.zz = 33
var bb = new a(2)
console.log( aa.y(), aa.zz, aa.yy(), bb.y(),  bb.yy() )


