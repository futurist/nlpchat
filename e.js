var emptyObject = {};
var emptyArray = [];
var type = emptyObject.toString;
var own =  emptyObject.hasOwnProperty;
var OBJECT = type.call(emptyObject);
var ARRAY =  type.call(emptyArray);
var STRING = type.call('');

var slot = function  (init) {
	var store = init
	return function (val){
		if(arguments.length) store = val;
		return store
	}
}

/**
 * [objPath description]
 * @param  {[object]} obj  [description]
 * @param  {[array]} path [description]
 * @param  {[any]} data [description]
 * @return {[type]}      [description]
 */
var objPath = function(obj, path, data){
	var p, a = path, b=obj
	var read = arguments.length<3
	if(read){
		if(a.length==1) return b[a.shift()];
		else while( p=a.shift() ){
			if(!(p in b)) return undefined;
			else if( typeof b[p] != 'object' || !b[p] ) return b[p];
			b=b[p]
		}
		return b
	}else{
		if(a.length==1) b=b[a.shift()] = data;
		else while( p=a.shift() ) b[p]=(b[p]||{}), a.length>1? b=b[p] : b=b[p][a.shift()]=data;
		return b
	}
}


var global = typeof window==='undefined' ? global : window;
var Answer = global.Answer = {}

var prop = function(_obj, _key, _options) {
	var options, args = [].slice.call(arguments)
	if( typeof args[args.length-1] === 'object' ) options = args.pop();
	var key = args.pop();
	if( args.length<1 ) return;
	var obj = Answer
	for(var p, i=0; i<args.length; i++){
		p = args[i]
		if(p in obj) obj = obj[p];
		else obj[p] = {}, obj = obj[p];
	}
	if(!options) return;

	if(options.v!==undefined) options.value = options.v;
	options.writable = options.w!==undefined ? !!options.w : true
	options.configurable = options.c!==undefined ? !!options.c : true
	options.enumerable = options.e!==undefined ? !!options.e : true
	delete options.v
	delete options.w
	delete options.c
	delete options.e
	Object.defineProperty(obj, key, options )
}

prop('小天鹅官方旗舰店', 'a', 'b', {v:324})
prop('小天鹅官方旗舰店2', 'a', 'b', {v:324, e:0})
prop('小天鹅官方旗舰店3', {v:324, e:0})


// 芳芳
// http://item.taobao.com/item.htm?id=40428670092
// context.sku = 40428670092
// context.q = 电机.什么

// ['亲','变频电机的呢','变频电机是电机的一种技术，变频电机的洗衣机，省电，降噪，机器稳定性好，电机寿命长。对机器的整体工作效率是较好的一种改变。']






