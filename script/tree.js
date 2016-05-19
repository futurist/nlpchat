/**
 * DATA format:
 * node -> {
 text             {string}  displayed text for html
 class            {string}  className for node
 // font          {string}  the font color
 _static          {boolean} whether folder expand on mousemove
 _close           {boolean} true : folder close, false : folder open
 _edit            {boolean} true  : node text edit status, false : node text display status
 _leaf [auto]     {boolean} true  : Leaf node, false : Folder node
 _path [readOnly] {string}  object path from root
 _idx  [readOnly] {number}  index in parent node
 children         {array}   node type of children; null denotes _leaf node
 }
 */
var data = [{
  text: 'root',
  class: 'asdfas',
  _static: true,
  children: [
    {
      text: 'A',
      _close: true,
      children: [{
        text: 'A1',
        font: 'red',
        children: null
      }, {
        text: 'A2'
      }]
    },
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
    {text: 'B'},
  ]
}]


//========================================
// Helper Function
//========================================
var isInputActive = function(){
      return ['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName)>-1
    }


var com = {
  // controller
  controller: function (args) {
    var ctrl = this
    var data = args.data || []
    /**
     * selected =>{
          node {object} selected node object
          idx {number} index at parent node
          parent {object} parent object, or null if it's root
       }
     */
    var selected = data.length ? {node: data[0], idx: 0, parent: null} : null
    // move or copy target node
    var target = null
    // undoList array for manage undo
    var undoList = []
    function _clone (dest) {
      return JSON.parse(JSON.stringify(dest))
    }
    /**
     * Extend tree object, ignore _, text, children attr
     * If there's already has className in src, merge className by SPC

     * @param {} dest - new node to merged to, from src
     * @param {} src - tree object
     * @returns {} dest
     */
    function _extend (dest, src) {
      Object.keys(src)
        .filter(k => k[0] !== '_' && ['text', 'children'].indexOf(k) < 0)
        .forEach(k => {
            /class|className/.test(k) ? (dest[k] = dest[k] || '', dest[k] += ' ' + src[k]) : dest[k] = src[k]})
      return dest
    }

    /**
     * Generate right class name from node attr
     * e.g. selected if it's selected node

     * @param {} tree node
     * @returns {string} generated class name
     */
    function getClass (node) {
      var c = ' '
      c += selected && selected.node === node ? 'selected ' : ''
      c += ' '
      c += target && target.node === node ? target.type : ''
      return c
    }



    /**
     * get common path from 2 nodes
     * @param {} tree node1
     * @param {} tree node2
     * @returns {string} path of the common part
     */
    function getCommonPath (node1, node2) {
      var path1 = node1._path, path2 = node2._path, r = []
      for (var i = 0, n = path1.length; i < n; i++) {
        if (path1[i] === path2[i]) r.push(path1[i])
      }
      return r
    }



    /**
     * delete node of parent in idx
     * @param {} parent node
     * @param {} idx
     */
    function deleteNode (parent, idx) {
      if (!parent)return
      var arr = parent.children = parent.children || []
      var oldStack = [ arr[idx], parent.children, parent._close ]
      undoList.push(function () {
        parent._close = oldStack.pop()
        parent.children = oldStack.pop()
        parent.children.splice(idx, 0, oldStack.pop())
      })
      arr.splice(idx, 1)
      // if it's no child, remove +/- symbol in parent
      if (parent && !arr.length) delete parent.children, delete parent._close
    }
    function insertNode (node, parent, _idx, isAfter) {
      return addNode(parent, _idx, isAfter, node)
    }
    function insertChildNode (node, v, isLast) {
      return addChildNode(v, isLast, v._leaf, node)
    }
    function addNode (parent, _idx, isAfter, existsNode) {
      if (!parent)return
      var arr = parent.children = parent.children || []
      var idx = isAfter ? _idx + 1 : _idx
      var insert = existsNode || {text: '', _edit: true}
      arr.splice(idx, 0, insert)
      selected = { node: arr[idx], idx: idx, parent: parent }
      undoList.push(function () {
        // cannot rely on stored index, coze it maybe changed, recalc again
        var idx = parent.children.indexOf(insert)
        parent.children.splice(idx, 1)
      })
      return selected
    }
    function addChildNode (v, isLast, isLeaf, existsNode) {
      if (v._leaf) return
      v.children = v.children || []
      var arr = v.children
      var idx = isLast ? v.children.length : 0
      var insert = existsNode || {text: '', _edit: true}
      v._close = false
      if (isLeaf) insert._leaf = true
      v.children.splice(idx, 0, insert)
      selected = { node: v.children[idx], idx: idx, parent: v }
      undoList.push(function () {
        // cannot rely on stored index, coze it maybe changed, recalc again
        var idx = arr.indexOf(insert)
        arr.splice(idx, 1)
        if (!v.children.length) delete v.children, delete v._close
      })
      return selected
    }
    function getInput (v) {
      if (v._leaf) {
        return m('textarea', {
          config: el => el.focus(),
          oninput: function (e) { v.text = this.value; },
          onkeydown: e => {
            if (e.keyCode == 13 && e.ctrlKey) return v._edit = false
          }
        }, v.text)
      } else {
        return m('input', {
          config: el => el.focus(),
          value: v.text,
          oninput: function (e) { v.text = this.value; },
          onkeydown: e => {
            if (e.keyCode == 13) return v._edit = false
            if (e.keyCode == 27) {
              var undo = undoList.pop()
              if (undo) undo()
              v._edit = false
              m.redraw()
            }
          },
        })
      }
    }
    /**
     * interTree interate tree node for children
     * @param {array} arr - children node array, usually from data.children
     * @param {object} parent - parent node
     * @param {array} path - object path array
     * @returns {object} mithril dom object, it's ul tag object
     */
    function interTree (arr, parent, path) {
      path = path || []
      return !arr ? [] : {tag: 'ul', attrs: {}, children: arr.map((v, idx) => {
        v._path = path.concat(idx)
        v = typeof v == 'string' ? {text: v} : v
        if ({}.toString.call(v) != '[object Object]') return v
        return {
          tag: 'li',
          attrs: _extend({
            class: getClass(v),
            config: (el, old, context) => {
            },
            onmousedown: function (e) {
              e.stopPropagation()
              if (/input|textarea/i.test(e.target.tagName)) return
              e.preventDefault()
              var isDown = e.type == 'mousedown'
              // add node
              if (isDown && e.ctrlKey) {
                // add node before selected
                if (e.altKey) addChildNode(v)
                // add child node as first child
                else addNode(parent, idx)
                return
              }
              // remove node
              if (isDown && e.altKey) {
                deleteNode(parent, idx)
                return
              }
              // else if(v._edit) return v._edit = false
              // close / open node
              if (!v._static && v.children) v._close = e.type == 'mousemove' ? false : !v._close
              selected = {node: v, idx: idx, parent: parent}
            },
            onmousemove: function (e) {
              if (e.which != 1)return
              this.onmousedown(e)
            },
            // dbl click to edit
            ondblclick: function (e) {
              e.stopPropagation()
              v._edit = true
              var oldVal = v.text
              undoList.push(function () {
                setTimeout(_ => {
                  v.text = oldVal
                  v._edit = false
                  m.redraw()
                })
              })
            },
          }, v),
          children: [
            v.children ? m('a', v._close ? '+ ' : '- ') : [],
            v._edit
              ? getInput(v)
              : m(v._leaf ? 'pre' : 'span', v.text)
          ].concat(v._close ? [] : interTree(v.children, v, path.concat(idx)))
        }
      })
                         }
    }

    ctrl.getDom = _ => {
      return interTree(data)
    }
    ctrl.onunload = e => {
      Mousetrap.unbind('ctrl+x')
      Mousetrap.unbind('ctrl+c')
      Mousetrap.unbind('ctrl+v')
      Mousetrap.unbind('ctrl+z')
      Mousetrap.unbind('del')
    }

    // Mousetrap definition
    Mousetrap.bind('del', function (e) {
      deleteNode(selected.parent, selected.idx)
      m.redraw()
    })
    Mousetrap.bind('ctrl+enter', function (e) {
      addChildNode(selected.node, true, true)
      m.redraw()
    })
    Mousetrap.bind('shift+enter', function (e) {
      addChildNode(selected.node, true)
      m.redraw()
    })
    Mousetrap.bind('enter', function (e) {
      addNode(selected.parent, selected.idx, true)
      m.redraw()
    })
    Mousetrap.bind('ctrl+z', function (e) {
      if(isInputActive()) return
      var undo = undoList.pop()
      if (undo) undo()
      m.redraw(true)
    })
    Mousetrap.bind('ctrl+x', function (e) {
      if (!selected.parent) return
      target = Object.assign({type: 'moving'}, selected)
      m.redraw()
    })
    Mousetrap.bind('ctrl+c', function (e) {
      if (!selected.parent) return
      target = Object.assign({type: 'copying'}, selected)
      m.redraw()
    })

    Mousetrap.bind(['ctrl+v', 'ctrl+shift+v'], doMoveCopy)
    function doMoveCopy (e) {
      var isChild = !e.shiftKey
      if (!target || !selected || !target.parent || !selected.parent) return
      if (selected.node === target.node) return
      if (target.type) {
        var insert = _clone(target.node)
        if (isChild) {
          selected = insertChildNode(insert, selected.node) // insert as first child
        } else {
          selected = insertNode(insert, selected.parent, selected.idx)
        }
        var sameLevel = selected.parent == target.parent
        // fix index if target is same level
        if (sameLevel && selected.idx < target.idx) target.idx++

        if (target.type == 'moving') {
          deleteNode(target.parent, target.idx)
          target = null
          undoList.push(function () {
            undoList.pop()()
            undoList.pop()()
          })
        }
      }
      m.redraw()
    }
  },

  // view
  view: function (ctrl) {
    return m('.tree1', ctrl.getDom())
  }
}

m.mount(document.body, m.component(com, {data: data}))

// below line will remove -webkit-user-select:none
// which cause phantomjs input cannot be selected!!!!!
if (window._phantom) document.body.className = 'phantom'
