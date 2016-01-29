
var slot = function  (init) {
	var store = init
	return function (val){
		if(arguments.length) store = val;
		return store
	}
}

var prop = function(obj, key, options) {
	if(options.v!==undefined) options.value = options.v
	if(options.w!==undefined) options.writable = !!options.w
	if(options.c!==undefined) options.configurable = !!options.c
	if(options.e!==undefined) options.enumerable = !!options.e
	delete options.v
	delete options.w
	delete options.c
	delete options.e
	console.log(options)
	Object.defineProperty(obj, key, options )
}

var goods  = {}
prop(goods, 'asdf', { v:'234', w:1 } )
prop(goods, 'name',  { e:1, get (){return 2222}, set (val){ this.asdf=val } } )

goods.name = 666

console.log(goods)


