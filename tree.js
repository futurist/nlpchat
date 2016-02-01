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
        function interTree(arr, parent){
            return !arr ? [] : {tag:'ul', attrs:{}, children:
                arr.map( (v,idx)=>{
                    v = typeof v=='string' ? {text:v} : v
                    if( {}.toString.call(v)!="[object Object]" ) return v;
                    return {
                        tag : 'li',
                        attrs : _extend({
                            class: getClass(v),
                            onclick:function(e){
                                e.stopPropagation()
                                // add node
                                if(e.ctrlKey){
                                    e.preventDefault()
                                    // add node before selected
                                    if(e.altKey) v.children=v.children||[], v._close=false, v.children.splice(0,0,{text:'', _edit:true} )
                                    // add child node as first child
                                    else arr.splice(idx,0,{text:'', _edit:true} )
                                    return
                                }
                                // remove node
                                if(e.altKey){
                                    arr.splice(idx,1)
                                    // if it's no child, remove +/- symbol in parent
                                    if(parent && !arr.length) delete parent.children, delete parent._close;
                                    return
                                }
                                if(e.target.tagName.toUpperCase()=='INPUT') return;
                                else if(v._edit) return v._edit = false;
                                // close / open node
                                if(!v._static) v._close = !v._close;
                                selected = {node:v, idx:idx, parent:parent};
                            },
                            // dbl click to edit
                            ondblclick:function(e){
                                e.stopPropagation()
                                v._edit = true;
                            },
                        }, v),
                        children : [
                            v.children? m('a', v._close?'+ ':'- ') :[],
                            v._edit ? m('input', {
                                value:v.text,
                                oninput:function(e){ v.text=this.value; }, 
                                onkeydown:e=>{ if(e.keyCode==13)return v._edit=false; },
                                config:el=>el.focus()
                            } ) : m('span', v.text)
                        ].concat( v._close ? [] : interTree(v.children, v) )
                    }
                })
            }
        }

        ctrl.getDom = _=> interTree(data)

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

        Mousetrap.bind('ctrl+v', function(e){
            if(!target||!selected||!target.parent||!selected.parent) return;
            if(selected.node===target.node) return;
            if(target.type){
                selected.parent.children.splice( selected.idx, 0, Object.assign({}, target.node) )
                if(selected.parent==target.parent){
                    if(selected.idx>target.idx) selected.idx++;
                    if(selected.idx<target.idx) target.idx++;
                }
                if(target.type=='moving'){
                    target.parent.children.splice(target.idx,1);
                    if(!target.parent.children.length) delete target.parent.children, delete target.parent._close;
                }
            }
            m.redraw()
        })

    },
    view:function(ctrl){
        return m('.tree1', ctrl.getDom() )
    }
}

m.mount( document.body, m.component(com, {data:data}) )


