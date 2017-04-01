const db=require('../conf/db.js')
const _ = require('underscore')._;
const ustr = require('../lib/ustr.js');

let m = new Map(); //entities;
let mcols = new Map();
let cols = new Map();

if(true){
   await init();
}

function async init(){
        //get m from db; 这里不应该是异步的; 暂时先这么处理;
    let ls =await db.query('select * from BASE_ENTITY',null);

    if(!ls){
        throw new Error('未定义任何实体!'); //这里应该退出程序;
    }

    for(let a of ls){
        m.set(a.EntityCode,a);
        mcols.set(a.EntityCode,null);
    }

    let ls2 = await db.query('select * from BASE_ENTITY_ATTR',null);

    if(!ls2){
        throw new Error('未定义任何实体属性');
    }

    for(let c of ls2){
        cols.set(c.Fid,c);

        if(!m.has(c.EntityCode)){ continue;}

        let arr = new Set();
        if(mcols.get(c.EntityCode)){
            arr = mcols.get(c.EntityCode);
        }

        arr.add(c.Fid);
        mcols.set(c.EntityCode,arr);
    }

    //递归父级对象的属性; 如果子级已经有的,以子级为准;
    let _tmp = _.pluck(_.filter(m.values(),function(a){return !ustr.isnul(a.EntityPCode);}),'EntityPCode');
    let _prts = new Set(_tmp);
    if(_prts){
       _prts = new Set(_.pluck(_.filter(m.values(),function(a){return _prts.has(a.EntityCode)&&ustr.isnul(a.EntityPCode);}),'EntityCode'));
    }

    let _prtsNew = new Set();

    while(_prts){
        for(let k of m.keys()){
            
            if( _prts.has(m.get(k).EntityPCode)){

                let arr = mcols.get(k);
                let parr = mcols.get(m.get(k).EntityPCode);

                let arrls = getlsByKey(arr,cols);
                let parrls = getlsByKey(parr,cols);

                let arrNames =new Set(_.pluck(arrls,'FldName'));

                let newCols =_.pluck(_.filter(parrls,function(a){return !arrNames.has(a.FldName);}),'Fid');

                for(let a of newCols){
                    arr.add(a);
                }
                mcols.set(k,arr);

                _prtsNew.add(k);
            }
        }
        _prts = _prtsNew;
    }

    //finish
}

//获取某实体;
function async first(sa,entityCode,flds="*",sqlWhere="",params=null){

    let ls = await findBySql(sa,entityCode,flds,sqlWhere,params);
    if(ls){
        return ls[0];
    }
    return null;
}

function async firstByKey(sa,entityCode,key,flds="*"){

}

function async find(sa,entityCode,flds="*",sqlWhere="",params=null,sqlOrder="",ispage=0,ipage=0,isize=10){
    
    if(!m.has(entityCode)) return null;

    let tmp = m.get(entityCode);

    let selsql = "select "+flds+ " from "+tmp.TblName;

    let ls = await findBySql(sa,entityCode,selsql,sqlWhere,params,sqlOrder,ispage,ipage,isize);

    return ls;
}

//获取某些实体;
function async findBySql(sa,entityCode,selsql,sqlWhere="",params=null,sqlOrder="",ispage=0,ipage=0,isize=10){

    if(!(sa.isSYS||sa.isAdmin)){
        sqlWhere = _addUaCtl(sa,entityCode,sqlWhere);
    }

}    

//更新
function async update(){

}

//增加
function async add(){

}


function _addUaCtl(sa,entityCode,sqlWhere){

}



function getlsByKey(keyls,m1){
    let ls = new Array();
    for(let k of keyls){
        if(m1.has(k)){
            ls1.push(m1.get(k));
        }
    }
    return ls;
}



