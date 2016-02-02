var data=[
{
    text:'root',
    class:'asdfas',
    _static:true,
    children:[
        {
            text:'A',
            _close:true,
            children:[
                {
                    text:'A1',
                    font:'red',
                    children:null
                },
                {
                    text:'A2'
                },
            ]
        },
        {
            text:'B'
        }
    ]
}]

var com={
    controller:function  (args) {
        var ctrl = this
        var data = args.data||[]
        var selected = data.length ? {node:data[0], idx:0, parent:null} : null
        var target = null
        var undoList = []
        function _clone(dest){
            return JSON.parse( JSON.stringify(dest) )
        }
        function _extend(src, dest){
            Object.keys(dest)
                .filter(k=> k[0]!=='_' && ['text','children'].indexOf(k)<0 )
                .forEach(k=>{ /class|className/.test(k) ? (src[k]=src[k]||'', src[k]+=' '+dest[k]) : src[k]=dest[k] } )
            return src
        }
        function getClass(node){
            var c=' '
            c+=selected&&selected.node===node?'selected ':''
            c+=' '
            c+=target&&target.node===node? target.type :''
            return c
        }
        function deleteNode(parent, idx ){
            if(!parent)return;
            var arr = parent.children = parent.children||[]
            var oldStack=[ arr[idx], parent.children, parent._close ]
            undoList.push(function(){
                parent._close = oldStack.pop()
                parent.children = oldStack.pop()
                parent.children.splice(idx,0, oldStack.pop() )
            })
            arr.splice(idx,1)
            // if it's no child, remove +/- symbol in parent
            if(parent && !arr.length) delete parent.children, delete parent._close;
        }
        function addNode(parent, _idx, isAfter){
            if(!parent)return;
            var arr = parent.children = parent.children||[]
            idx = isAfter? _idx+1 :_idx
            var insert = {text:'', _edit:true}
            arr.splice(idx,0, insert)
            selected = { node:arr[idx], idx:idx, parent:parent }
            undoList.push( function(){ 
                var idx = parent.children.indexOf(insert)
                parent.children.splice(idx,1)
            } )
        }
        function addChildNode(v, isLast){
            v.children=v.children||[]
            var arr = v.children
            var idx = isLast? v.children.length :0
            var insert = {text:'', _edit:true}
            v._close=false
            v.children.splice(idx, 0, insert )
            selected = { node:v.children[idx], idx:idx, parent:v }
            undoList.push( function(){
                var idx = arr.indexOf(insert)
                arr.splice(idx,1)
                if(!v.children.length) delete v.children, delete v._close;
            } )
        }
        function interTree(arr, parent){
            return !arr ? [] : {tag:'ul', attrs:{}, children:
                arr.map( (v,idx)=>{
                    v = typeof v=='string' ? {text:v} : v
                    if( {}.toString.call(v)!="[object Object]" ) return v;
                    return {
                        tag : 'li',
                        attrs : _extend({
                            class: getClass(v),
                            onmousedown:function(e){
                                e.stopPropagation()
                                e.preventDefault()
                                var isDown = e.type=='mousedown'
                                // add node
                                if(isDown&&e.ctrlKey){
                                    // add node before selected
                                    if(e.altKey) addChildNode(v);
                                    // add child node as first child
                                    else addNode(parent, idx);
                                    return
                                }
                                // remove node
                                if(isDown&&e.altKey){
                                    deleteNode(parent, idx)
                                    return
                                }
                                if(e.target.tagName.toUpperCase()=='INPUT') return;
                                else if(v._edit) return v._edit = false;
                                // close / open node
                                if(!v._static && v.children) v._close = e.type=='mousemove' ? false : !v._close;
                                selected = {node:v, idx:idx, parent:parent};
                            },
                            onmousemove:function(e){
                                if(e.which!=1)return;
                                this.onmousedown(e)
                            },
                            // dbl click to edit
                            ondblclick:function(e){
                                e.stopPropagation()
                                v._edit = true;
                                var oldVal = v.text
                                undoList.push(function(){ setTimeout(_=>{ v.text = oldVal; v._edit = false}) })
                            },
                        }, v),
                        children : [
                            v.children? m('a', v._close?'+ ':'- ') :[],
                            v._edit ? m('input', {
                                value:v.text,
                                oninput:function(e){ v.text=this.value; }, 
                                onkeydown:e=>{ 
                                    if(e.keyCode==13) return v._edit=false; 
                                    if(e.keyCode==27){
                                        var undo = undoList.pop()
                                        if(undo) undo();
                                    }
                                },
                                config:el=>el.focus()
                            } ) : m('span', v.text)
                        ].concat( v._close ? [] : interTree(v.children, v) )
                    }
                })
            }
        }

        ctrl.getDom = _=> interTree(data)
        ctrl.onunload = e=>{
            Mousetrap.unbind('ctrl+x')
            Mousetrap.unbind('ctrl+c')
            Mousetrap.unbind('ctrl+v')
            Mousetrap.unbind('ctrl+z')
            Mousetrap.unbind('del')
        }
        Mousetrap.bind('del', function(e){
            deleteNode( selected.parent, selected.idx )
            m.redraw()
        })
        Mousetrap.bind('shift+enter', function(e){
            addChildNode( selected.node, true )
            m.redraw()
        })
        Mousetrap.bind('enter', function(e){
            addNode( selected.parent, selected.idx, true )
            m.redraw()
        })
        Mousetrap.bind('ctrl+z', function(e){
            var undo = undoList.pop()
            if(undo) undo();
            m.redraw()
        })
        Mousetrap.bind('ctrl+x', function(e){
            if(!selected.parent) return;
            target = Object.assign({type:'moving'}, selected)
            m.redraw()
        })
        Mousetrap.bind('ctrl+c', function(e){
            if(!selected.parent) return;
            target = Object.assign({type:'copying'}, selected)
            m.redraw()
        })

        Mousetrap.bind('ctrl+v', doMoveCopy)
        function doMoveCopy(e){
            if(!target||!selected||!target.parent||!selected.parent) return;
            if(selected.node===target.node) return;
            var sameLevel = selected.parent==target.parent
            if(target.type=='copying'){
                selected.parent.children.splice( selected.idx, 0, _clone(target.node) )
                // fix index if target is same level
                if(sameLevel && selected.idx<target.idx) target.idx++;
                // fix index after splice
                selected.idx++
                undoList=[]
            }
            if(target.type=='moving'){
                var node = target.parent.children.splice(target.idx,1)
                if(sameLevel && selected.idx>target.idx) selected.idx--;
                selected.parent.children.splice( selected.idx, 0, node.pop() )
                selected.idx++
                // fix index if target is same level
                if(!target.parent.children.length) delete target.parent.children, delete target.parent._close;
                target = null
                undoList=[]
            }
            m.redraw()
        }

    },
    view:function(ctrl){
        return m('.tree1', ctrl.getDom() )
    }
}

m.mount( document.body, m.component(com, {data:data}) )


