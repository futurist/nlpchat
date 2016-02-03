var codes = {
  bold: [1, 22],
  underline: [4, 24],
  inverse: [7, 27],

  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  grey: [90, 39],
};

function logStatus(str, code){
  var _open = []
  var _close = []
  code.split(',').forEach(function( key ){
    var val = codes[key]
    _open.push( '\u001b[' + val[0] + 'm' )
    _close.unshift( '\u001b[' + val[1] + 'm' )
  })
  console.log( _open.join('') + str + _close.join('') )
}
function logError(str){ logStatus(str, 'red,bold') }
function logPass(str){ logStatus(str, 'grey') }
function logSlow(str){ logStatus(str, 'yellow') }


