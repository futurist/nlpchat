/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * DATA format:
	 * node -> {
	 text             {string}  displayed text for html
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
	var data = [{
	  text: 'root',
	  class: 'asdfas',
	  _static: true,
	  children: [{
	    text: 'A',
	    _close: true,
	    children: [{
	      text: 'A1',
	      font: 'red',
	      children: null
	    }, {
	      text: 'A2'
	    }]
	  }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }, { text: 'B' }]
	}];

	//
	// ========================================
	// Helper Function
	// ========================================

	// disable right click
	window.oncontextmenu = function () {
	  return false;
	};

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
	    // move or copy target node
	    var target = null;
	    // undoList array for manage undo
	    var undoList = [];
	    // Mouse guesture store array
	    var mouseGuesture = [];
	    function _clone(dest) {
	      return JSON.parse(JSON.stringify(dest));
	    }
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

	    /**
	     * Generate right class name from node attr
	     * e.g. selected if it's selected node
	      * @param {} tree node
	     * @returns {string} generated class name
	     */
	    function getClass(node) {
	      var c = ' ';
	      c += selected && selected.node === node ? 'selected ' : '';
	      c += ' ';
	      c += target && target.node === node ? target.type : '';
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
	          }
	        }, v.text);
	      } else {
	        return m('input', {
	          config: function config(el) {
	            return el.focus();
	          },
	          value: v.text,
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
	              class: getClass(v),
	              config: function config(el, old, context) {},
	              onmouseup: function onmouseup(e) {},
	              onmousedown: function onmousedown(e) {
	                e.stopPropagation();
	                selected = { node: v, idx: idx, parent: parent };

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
	                this.onmousedown(e);
	              },
	              // dbl click to edit
	              ondblclick: function ondblclick(e) {
	                e.stopPropagation();
	                v._edit = true;
	                var oldVal = v.text;
	                undoList.push(function () {
	                  setTimeout(function (_) {
	                    v.text = oldVal;
	                    v._edit = false;
	                    m.redraw();
	                  });
	                });
	              }
	            }, v),
	            children: [v.children ? m('a', v._close ? '+ ' : '- ') : [], v._edit ? getInput(v) : m(v._leaf ? 'pre' : 'span', v.text)].concat(v._close ? [] : interTree(v.children, v, path.concat(idx)))
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
	  view: function view(ctrl) {
	    return m('.tree1', ctrl.getDom());
	  }
	};

	m.mount(document.body, m.component(com, { data: data }));

	// below line will remove -webkit-user-select:none
	// which cause phantomjs input cannot be selected!!!!!
	if (window._phantom) document.body.className = 'phantom';

/***/ }
/******/ ]);