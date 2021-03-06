/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaultData = [{
  text: 'root',
  'class': 'asdfas',
  _static: true,
  children: [{
    text: 'A',
    _close: true,
    children: [{
      name: 'A1',
      font: 'red',
      children: null
    }, {
      text: 'A2'
    }]
  }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }]
}];

// Initialize Firebase
var config = {
  apiKey: 'AIzaSyDMj1X8SQ4_gvy28yNGYbypnezoqjr9dfw',
  // authDomain: '',
  databaseURL: 'https://treeformat.firebaseio.com',
  storageBucket: 'gs://treeformat.appspot.com'
};
firebase.initializeApp(config);
console.log(firebase.database().ref('/data').once('value', function (e) {
  return console.log(e);
}));

var _working;

function working() {
  return _working;
}

function saveData(data) {
  _working = true;
  return firebase.database().ref('/data').set(data).then(function (data) {
    _working = false;
    return data;
  }, function (err) {
    _working = false;
    // console.log(err)
    return new Error(err);
  });
}

function loadData() {
  _working = true;
  return firebase.database().ref('/data').once('value').then(function (data) {
    // console.log(data.val())
    _working = false;
    return data.val();
  }, function (err) {
    _working = false;
    // console.log(err)
    return new Error(err);
  });
}

module.exports = {
  saveData: saveData,
  loadData: loadData,
  working: working
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _data2 = __webpack_require__(0);

var _data3 = _interopRequireDefault(_data2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * DATA format:
 * node -> {
 text             {string}  displayed text for html
 name             {string}  name for node, if no text, used as text
 class            {string}  className for node
 // font          {string}  the font color
 _static          {boolean} whether folder expand on mousemove
 _close           {boolean} true : folder close, false : folder open
 _edit            {boolean} true  : node text edit status, false : node text display status
 _leaf [auto]     {boolean} true  : Leaf node, false : Trunk node
 _path [readOnly] {string}  object path from root
 _idx  [readOnly] {number}  index in parent node
 children         {array}   node type of children; null denotes _leaf node
 }
 */
// var data = require('./data.js')
// window.data = data

// using webpack inline style, but not for lib
// var css = require('../css/mtree.stylus')
var css = {};

//
// ========================================
// Helper Function
// ========================================

// better type check
var type = {}.toString;
var OBJECT = '[object Object]';
var ARRAY = '[object Array]';

/**
 * convert simple Object into tree data
 *
 format:
 {"a":{"b":{"c":{"name":"test 1"}}},"e":"test 2", f:null}
 *        v.name||v.text is a leaf node.
 *        If each value is null,
 *        or not of type {string|object|array},
 *        then it's empty leaf.
 *
 * @param {object} d - simple object data
 * @returns {object} tree data object
 */
function convertSimpleData(d) {
  if (typeof d === 'string') {
    return { text: d };
  }
  if (type.call(d) === ARRAY) {
    return d.map(function (v) {
      return convertSimpleData(v);
    });
  }
  if (type.call(d) === OBJECT) {
    if ('name' in d || 'text' in d) {
      d._leaf = true;
      return [d];
    }
    return Object.keys(d).map(function (v) {
      return !v ? [] : { text: v, children: convertSimpleData(d[v]) };
    });
  }
  return [];
}

function cleanData(data, store) {
  store = store || [];
  data.forEach(function (v, i) {
    if (v && (typeof v === 'undefined' ? 'undefined' : _typeof(v)) == 'object') {
      var d = {};
      store.push(d);
      Object.keys(v).forEach(function (k) {
        if (['_leaf'].indexOf(k) > -1 || k[0] !== '_' && k !== 'children') d[k] = v[k];
      });
      if (v.children && Array.isArray(v.children)) {
        d.children = [];
        cleanData(v.children, d.children);
      }
    }
  });
  return store;
}

// disable right click
window.oncontextmenu = function () {
  return false;
};

/**
 * Array get last element
 */
if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
}

/**
 * getArraypath - get object using path array, from data object
 * @param {object} arr - root data object
 *									     if array, get index as target
 *                       if object, get index of object.children as target
 * @param {array} path - path to obtain using index array [0,1,0]
 * @returns {object} target object at path
 */
function getArrayPath(arr, path) {
  var obj = arr;
  for (var i = 0; i < path.length; i++) {
    obj = type.call(obj) === ARRAY ? obj[path[i]] : obj && obj.children && obj.children[path[i]];
  }
  return obj;
}

/**
 * isInputactive - check whether user is editing
 * @returns {boolean}
 */
function isInputActive(el) {
  return (/input|textarea/i.test((el || document.activeElement).tagName)
  );
}

/**
 * detectleftbutton - detect if the left and only the left mouse button is pressed
 * @param {} evt - event object to check, e.g. onmousemove
 * @returns {boolean}
 */
function detectLeftButton(evt) {
  evt = evt || window.event;
  if ('buttons' in evt) {
    return evt.buttons == 1;
  }
  var button = evt.which || evt.button;
  return button == 1;
}

function detectRightButton(e) {
  var rightclick;
  if (!e) var e = window.event;
  if (e.which) rightclick = e.which == 3;else if (e.button) rightclick = e.button == 2;
  return rightclick;
}

function _clone(dest) {
  return JSON.parse(JSON.stringify(dest));
}

var com = {
  //
  // controller
  controller: function controller(args) {
    var ctrl = this;
    var data = args.data || [];
    /**
     * selected =>{
     node {object} selected node object
     idx {number} index at parent node
     parent {object} parent object, or null if it's root
     }
     */
    var selected = data.length ? { node: data[0], idx: 0, parent: null } : null;

    if (args.url) {
      m.request({ method: "GET", url: args.url }).then(function (result) {
        data = convertSimpleData(result.ptest_data);
        console.log(data);
        m.redraw();
      });
    }
    ctrl.saveData = function () {
      if (!args.saveData || args.working()) return;
      var theData = { tree: data };
      if (selected) {
        theData._selectedPath = selected.node._path;
      }
      args.saveData(theData).then(function (result) {
        // console.log(result)
        alert('tree saved');
      });
    };
    function getSelFromPath(_path) {
      var node = getArrayPath(data, _path);
      var idx = _path.pop();
      var parent = getArrayPath(data, _path);
      return { node: node, idx: idx, parent: parent };
    }
    ctrl.loadData = function () {
      if (!args.loadData || args.working()) return;
      args.loadData().then(function (_data) {
        data = _data.tree;
        window.data = data;
        if (_data._selectedPath) {
          selected = getSelFromPath(_data._selectedPath);
        }
        m.redraw();
      });
    };
    ctrl.loadData();

    // move or copy target node
    var target = null;
    // undoList array for manage undo
    var undoList = [];
    // Mouse guesture store array
    var mouseGuesture = [];

    /**
     * Extend tree object, ignore _, text, children attr
     * If there's already has className in src, merge className by SPC
     * @param {} dest - new node to merged to, from src
     * @param {} src - tree object
     * @returns {} dest
     */
    function _extend(dest, src) {
      Object.keys(src).filter(function (k) {
        return k[0] !== '_' && ['text', 'children'].indexOf(k) < 0;
      }).forEach(function (k) {
        /class|className/.test(k) ? (dest[k] = dest[k] || '', dest[k] += ' ' + src[k]) : dest[k] = src[k];
      });
      return dest;
    }

    function getText(v) {
      return 'text' in v ? v.text : v.name || '';
    }

    /**
     * Generate right class name from node attr
     * e.g. selected if it's selected node
      * @param {} tree node
     * @returns {string} generated class name
     */
    function getClass(node) {
      var c = ' ';
      c += selected && selected.node === node ? (css.selected || 'selected') + ' ' : '';
      c += ' ';
      c += target && target.node === node ? css[target.type] || target.type : '';
      return c;
    }

    /**
     * get common path from 2 nodes
     * @param {} tree node1
     * @param {} tree node2
     * @returns {string} path of the common part
     */
    function getCommonPath(node1, node2) {
      var path1 = node1._path,
          path2 = node2._path,
          r = [];
      for (var i = 0, n = path1.length; i < n; i++) {
        if (path1[i] === path2[i]) r.push(path1[i]);
      }
      return r;
    }

    /**
     * delete node of parent in idx
     * @param {} parent node
     * @param {} idx
     */
    function deleteNode(parent, idx) {
      if (!parent) return;
      var arr = parent.children = parent.children || [];
      var oldStack = [arr[idx], parent.children, parent._close];
      undoList.push(function () {
        parent._close = oldStack.pop();
        parent.children = oldStack.pop();
        parent.children.splice(idx, 0, oldStack.pop());
      });
      arr.splice(idx, 1);
      // if it's no child, remove +/- symbol in parent
      if (parent && !arr.length) delete parent.children, delete parent._close;
    }
    function insertNode(node, parent, _idx, isAfter) {
      return addNode(parent, _idx, isAfter, node);
    }
    function insertChildNode(node, v, isLast) {
      return addChildNode(v, isLast, v._leaf, node);
    }
    function addNode(parent, _idx, isAfter, existsNode) {
      if (!parent) return;
      var arr = parent.children = parent.children || [];
      var idx = isAfter ? _idx + 1 : _idx;
      var insert = existsNode || { text: '', _edit: true };
      arr.splice(idx, 0, insert);
      selected = { node: arr[idx], idx: idx, parent: parent };
      undoList.push(function () {
        // cannot rely on stored index, coze it maybe changed, recalc again
        var idx = parent.children.indexOf(insert);
        parent.children.splice(idx, 1);
      });
      return selected;
    }
    function addChildNode(v, isLast, isLeaf, existsNode) {
      if (v._leaf) return;
      v.children = v.children || [];
      var arr = v.children;
      var idx = isLast ? v.children.length : 0;
      var insert = existsNode || { text: '', _edit: true };
      v._close = false;
      if (isLeaf) insert._leaf = true;
      v.children.splice(idx, 0, insert);
      selected = { node: v.children[idx], idx: idx, parent: v };
      undoList.push(function () {
        // cannot rely on stored index, coze it maybe changed, recalc again
        var idx = arr.indexOf(insert);
        arr.splice(idx, 1);
        if (!v.children.length) delete v.children, delete v._close;
      });
      return selected;
    }
    function getInput(v) {
      if (v._leaf) {
        return m('textarea', {
          config: function config(el) {
            return el.focus();
          },
          oninput: function oninput(e) {
            v.text = this.value;
          },
          onkeydown: function onkeydown(e) {
            if (e.keyCode == 13 && e.ctrlKey) return v._edit = false;
            if (e.keyCode == 27) {
              var undo = undoList.pop();
              if (undo) undo();
              v._edit = false;
              m.redraw();
            }
          }
        }, getText(v));
      } else {
        return m('input', {
          config: function config(el) {
            el.focus();
          },
          value: getText(v),
          oninput: function oninput(e) {
            v.text = this.value;
          },
          onkeydown: function onkeydown(e) {
            if (e.keyCode == 13) return v._edit = false;
            if (e.keyCode == 27) {
              var undo = undoList.pop();
              if (undo) undo();
              v._edit = false;
              m.redraw();
            }
          }
        });
      }
    }
    /**
     * interTree interate tree node for children
     * @param {array} arr - children node array, usually from data.children
     * @param {object} parent - parent node
     * @param {array} path - object path array
     * @returns {object} mithril dom object, it's ul tag object
     */
    function interTree(arr, parent, path) {
      path = path || [];
      return !arr ? [] : {
        tag: 'ul', attrs: {}, children: arr.map(function (v, idx) {
          v._path = path.concat(idx);
          v = typeof v == 'string' ? { text: v } : v;
          if ({}.toString.call(v) != '[object Object]') return v;
          return {
            tag: 'li',
            attrs: _extend({
              'class': getClass(v),
              config: function config(el, old, context) {},
              onmouseup: function onmouseup(e) {},
              onmousedown: function onmousedown(e) {
                if (!e) e = window.event;
                e.stopPropagation();
                selected = { node: v, idx: idx, parent: parent };
                console.log(selected);
                // save parent _pos when select node
                if (parent) parent._pos = idx;

                if (isInputActive(e.target)) return;else if (v._edit) {
                  v._edit = false;
                  return;
                }

                // Right then Right, do move/copy action
                if (detectRightButton(e)) addGuesture('right');
                if (mouseGuesture.join(',') === 'right,right') {
                  clearGuesture(e);
                  doMoveCopy(e);
                }

                // buttons=Left+Right, button=Right, Left and Right
                if (e.buttons == 3 && e.button == 2) {
                  clearGuesture(e);
                  doCopy(e);
                }

                // buttons=Left+Right, button=Left, Right and Left
                if (e.buttons == 3 && e.button == 0) {
                  clearGuesture(e);
                  doMove(e);
                }

                e.preventDefault();
                var isDown = e.type == 'mousedown';
                // add node
                if (isDown && e.ctrlKey) {
                  // add node before selected
                  if (e.altKey) addChildNode(v);
                  // add child node as first child
                  else addNode(parent, idx);
                  return;
                }
                // remove node
                if (isDown && e.altKey) {
                  deleteNode(parent, idx);
                  return;
                }
                // else if(v._edit) return v._edit = false
                // close / open node
                if (!v._static && v.children) v._close = e.type == 'mousemove' ? false : !v._close;
              },
              onmousemove: function onmousemove(e) {
                if (!detectLeftButton(e)) return;
                // this.onmousedown(e)
              },
              // dbl click to edit
              ondblclick: function ondblclick(e) {
                e.stopPropagation();
                v._edit = true;
                var oldVal = getText(v);
                undoList.push(function () {
                  setTimeout(function (_) {
                    v.text = oldVal;
                    v._edit = false;
                    m.redraw();
                  });
                });
              }
            }, v),
            children: [v.children ? m('a', v._close ? '+ ' : '- ') : [], v._edit ? getInput(v) : m(v._leaf ? 'pre' : 'span', getText(v))].concat(v._close ? [] : interTree(v.children, v, path.concat(idx)))
          };
        })
      };
    }

    ctrl.getDom = function (_) {
      return interTree(data);
    };
    ctrl.onunload = function (e) {
      for (var k in keyMap) {
        Mousetrap.unbind(k);
      }
    };

    //
    // Mousetrap definition
    function toggleNodeOpen(e, key) {
      var sel = selected;
      e.preventDefault();
      if (sel && sel.node.children) {
        sel.node._close = !sel.node._close;
        m.redraw();
      }
    }
    function keyMoveLevel(e, key) {
      var child,
          sel = selected,
          newIdx,
          newParent,
          oldNode;
      if (sel) {
        e.preventDefault();
        newParent = sel.parent;
        child = sel.node.children;
        if (/left/.test(key) && newParent) {
          newParent._pos = sel.idx;
          sel.node = newParent;
          sel.idx = newParent._path.last();
          // _path is data[0][2]... if there's only data[0], then it's first root, parent is null
          sel.parent = newParent._path.length > 1 ? getArrayPath(data, newParent._path.slice(0, -1)) : null;
          m.redraw();
        }
        if (/right/.test(key) && child && child.length) {
          // save sel.node ref first to as parent
          var _oldNode = sel.node;
          var pos = _oldNode._pos || 0;
          sel.node = child[pos];
          sel.node._path = _oldNode._path.concat(pos);
          sel.idx = pos;
          sel.parent = _oldNode;
          if (_oldNode._close) _oldNode._close = false;
          m.redraw();
        }
      }
    }
    function keyMoveSibling(e, key) {
      var child,
          sel = selected,
          newIdx;

      var moveSibling = function moveSibling(isMove) {
        if (isMove) {
          ;
          var _ref = [child[sel.idx], child[newIdx]];
          child[newIdx] = _ref[0];
          child[sel.idx] = _ref[1];
        }sel.node = child[newIdx];
        sel.idx = newIdx;
        m.redraw();
      };

      if (sel) {
        e.preventDefault();
        if (!sel.parent) child = data;else child = sel.parent.children;
        if (child.length) {
          if (/down$/.test(key)) {
            if (sel.idx + 1 < child.length) {
              newIdx = sel.idx + 1;
            } else {
              newIdx = 0;
            }
            moveSibling(/ctrl/.test(key));
          }
          if (/up$/.test(key)) {
            if (sel.idx - 1 >= 0) {
              newIdx = sel.idx - 1;
            } else {
              newIdx = child.length - 1;
            }
            moveSibling(/ctrl/.test(key));
          }
        }
      }
    }
    function doDelete(e) {
      deleteNode(selected.parent, selected.idx);
      m.redraw();
    }
    function doAddChildLeaf(e) {
      addChildNode(selected.node, true, true);
      m.redraw();
    }
    function doAddChildTrunk(e) {
      addChildNode(selected.node, true);
      m.redraw();
    }
    function doAddNode(e) {
      addNode(selected.parent, selected.idx, true);
      m.redraw();
    }
    function doUndo(e) {
      if (isInputActive()) return;
      var undo = undoList.pop();
      if (undo) undo();
      m.redraw(true);
    }
    function doMove(e) {
      if (!selected.parent) return;
      target = Object.assign({ type: 'moving' }, selected);
      m.redraw();
    }

    function doCopy(e) {
      if (!selected.parent) return;
      target = Object.assign({ type: 'copying' }, selected);
      m.redraw();
    }
    function doMoveCopy(e) {
      var isChild = !e.shiftKey;
      if (!target || !selected || !target.parent || !selected.parent) return;
      if (selected.node === target.node) return;
      if (target.type) {
        var insert = _clone(target.node);
        if (isChild) {
          selected = insertChildNode(insert, selected.node); // insert as first child
        } else {
          selected = insertNode(insert, selected.parent, selected.idx);
        }
        var sameLevel = selected.parent == target.parent;
        // fix index if target is same level
        if (sameLevel && selected.idx < target.idx) target.idx++;

        if (target.type == 'moving') {
          deleteNode(target.parent, target.idx);
          target = null;
          undoList.push(function () {
            undoList.pop()();
            undoList.pop()();
          });
        }
      }
      m.redraw();
    }

    function addGuesture(action) {
      mouseGuesture.push(action);
      setTimeout(function () {
        clearGuesture();
      }, 800);
    }

    function clearGuesture(e) {
      mouseGuesture = [];
    }

    var keyMap = {
      'space': toggleNodeOpen,
      'left': keyMoveLevel,
      'right': keyMoveLevel,
      'up': keyMoveSibling,
      'down': keyMoveSibling,
      'ctrl+up': keyMoveSibling,
      'ctrl+down': keyMoveSibling,
      'esc': clearGuesture,
      'del': doDelete,
      'ctrl+enter': doAddChildLeaf,
      'shift+enter': doAddChildTrunk,
      'enter': doAddNode,
      'ctrl+z': doUndo,
      'ctrl+c': doCopy,
      'ctrl+x': doMove,
      'ctrl+shift+v': doMoveCopy,
      'ctrl+v': doMoveCopy
    };

    for (var k in keyMap) {
      Mousetrap.bind(k, keyMap[k]);
    }
  },

  //
  // view
  view: function view(ctrl, args) {
    return m('.' + (css.mtree || 'mtree'), [m('button', {
      onclick: ctrl.loadData,
      style: { opacity: args.working() ? 0.5 : 1 }
    }, 'Load'), m('button', {
      onclick: ctrl.saveData,
      style: { opacity: args.working() ? 0.5 : 1 }
    }, 'Save'), ctrl.getDom()]);
  }
};

exports['default'] = com;


var testRoot = document.querySelector('#mtree');
if (testRoot) m.mount(testRoot, m.component(com, _data3['default']));

// below line will remove -webkit-user-select:none
// which cause phantomjs input cannot be selected!!!!!
if (window._phantom) document.body.className = 'phantom';

/***/ })
/******/ ]);