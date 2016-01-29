
var slot = function  (init) {
	var store = init
	return function (val){
		if(arguments.length) store = val;
		return store
	}
}

var prop = function(obj, key, options) {
	if(!options) return obj[key]=null;
	if(options.v!==undefined) options.value = options.v
	options.writable = options.w!==undefined ? !!options.w : true
	options.configurable = options.c!==undefined ? !!options.c : true
	options.enumerable = options.e!==undefined ? !!options.e : true
	delete options.v
	delete options.w
	delete options.c
	delete options.e
	console.log(options)
	Object.defineProperty(obj, key, options )
}

var 洗衣机  = {}
prop(洗衣机, 'sku' )
prop(洗衣机, '电机' )
prop(洗衣机, '电机', {v:{}} )
prop(洗衣机.电机, 'sdfsdf', {v:1234, e:0} )
洗衣机

