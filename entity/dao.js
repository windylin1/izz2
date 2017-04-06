const db=require('../conf/db.js')
const _ = require('underscore')._;
const ustr = require('../lib/ustr.js');
const Err = require('../Exception/Exception.js');


let m = new Map(); //entities;
let mcols = new Map();
let cols = new Map();
let mPks = new Map();


if(true){
   await init();
}

//Found IsFK,urctl没用;
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
        
        c.Validates = JSON.Parse(c.Validates);
        cols.set(c.Fid,c);

        if(c.IsPK==1) mPks.add(c.EntityCode,c);

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

                //pk can not be inhreited
                let newCols =_.pluck(_.filter(parrls,function(a){return !arrNames.has(a.FldName)&&a.IsPK!=1;}),'Fid');

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

//获取某实体; 注意, 不支持in参数,如果使用in,请自己把in拼接到sql中; --注意防注入的问题;使用ustr.ls2sqlWhere()
function async first(sa,entityCode,flds="*",sqlWhere="",params=null){

    let ls = await findBySql(sa,entityCode,flds,sqlWhere,params);
    if(ls){
        return ls[0];
    }
    return null;
}

function async firstByKey(sa,entityCode,key,flds="*"){

    if(!m.has(entityCode)) return null;
    if(!key) return null;

    let strWhere=" where " mPks.get(entityCode).FldName+"=?";
    let params=[key];

    await obj = first(sa,entityCode,flds,strWhere,params);

}

function async find(sa,entityCode,flds="*",sqlWhere="",params=null,sqlOrder="",ispage=0,ipage=0,isize=10){
    
    if(!m.has(entityCode)) return null;

    let tmp = m.get(entityCode);

    let selsql = "select "+flds+ " from "+tmp.TblName;

    let ls = await findBySql(sa,entityCode,selsql,sqlWhere,params,sqlOrder,ispage,ipage,isize);

    return ls;
}

//获取某些实体;手写sql;
function async findBySql(sa,entityCode,selsql,sqlWhere="",params=null,sqlOrder="",ispage=0,ipage=0,isize=10){

    if(!(sa.isSYS||sa.isAdmin)){
        sqlWhere = _addUaCtl(sa,entityCode,sqlWhere);
    }

    let sqlPage = "";
    if(ispage!=0){
        ipage = ipage<=0?1:ipage;
        isize = isize<1?:10:isize;
        sqlPage = " limit "+(ipage-1)*isize + ","+isize;
    }

    let strsql = selsql + sqlWhere + sqlOrder+sqlPage;

    await ls = db.query(strsql,params);
    return ls;
}    

function async countBySql(sa,entityCode,sqlWhere="",params=null){

    if(!(sa.isSYS||sa.isAdmin)){
        sqlWhere = _addUaCtl(sa,entityCode,sqlWhere);
    }

    if(!m.has(entityCode)) return 0;

    let tmp = m.get(entityCode);
    
    let selsql = "select count(0) as num from "+tmp.TblName;

    let strsql = selsql + sqlWhere ;

    await num = db.getCell(strsql,params);

    return num;
}    

//更新, update 只校验提供的字段,不校验未提供的字段的require与否;
function async update(sa,entityCode,entity){
    
    if(!m.has(entityCode)) return 0;

    let key = mPks.get(entityCode).FldName;

    //校验权限; --数据库中获取看是否成功;--
    let obj = firstByKey(sa,entityCode,entity.key);

    if(!obj) return  0; //校验未通过;
    
    //校验实体,validate;
    


    //生成sql
    //使用trans执行语句;
}


//validate
//require/number/int/datetime/email/chs/eng/max/min/between/enum
//
//
function _validateObj(entityCode,entitys){
    let ls = mcols.get(entityCode);
    let bl = true;

    for(let a of ls){
        if(a.IsValidate==1){
            //对每一个entity校验; vld.msg应该使用文本格式化;
            let vlds = a.Validates;
            for(let vld of vlds){
                for(let et of entitys){
                    if(vld.type=='require'&&!et[a.FldName]){
                        throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",不能为空!" );//不为空校验未通过;
                    }
                    else if(vld.type=='number'&&!ustr.isNumber(et[a.FldName]) ){
                        throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为数字!" );//不为空校验未通过;
                    }
                    else if(vld.type=='int'&&!ustr.isInt(et[a.FldName]) ){
                        throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为整数!" );//不为空校验未通过;
                    }
                    else if(vld.type=='datetime'&&!ustr.isDate(et[a.FldName]) ){
                        throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为日期类型!" );//不为空校验未通过;
                    }
                    else if(vld.type=='email'&&!ustr.isEmail(et[a.FldName]) ){
                        throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",邮箱格式不正确!" );//不为空校验未通过;
                    }


                }
            }
        }

        //校验长度;类型等;赋默认值;
        for(let et of entitys){
            if(fldType=='varchar'){ //varchar,int,double,datetime,
                if(et[a.FldName]&&a.FldSize&&et[a.FldName].length>FldSize){
                    throw Err.getErrValidate900(""); //超长;
                }

                if(!et[a.FldName]) et[a.FldName] = a.DefVal;
            }
            
            //赋值,默认值;
            if(fldType=='int'){

            }
        }


    }

}


function async updateMany(sa,entityCode,entitys){

}

//注意此时不做实体校验;只用于系统性批量操作,但依然判断权限; 不实用;
function async updateBySql(sa,entityCode,strsql){
    return false;
}

//增加,校验提供的字段,同时校验未提供的字段的require; 所有的校验都是并列的;有一些关联性的校验无法在此处理;需要调用方自己处理;
//不提供insertBySql;
function async insert(){

}

function async insertMany(){

}

//注意此时不做实体校验;只用于系统性操作; 但依然判断权限; 不用;如果by sql,直接调用sql就好;
function async insertBySql(){
    return false;
}


function _addUaCtl(sa,entityCode,sqlWhere){
    if(sa.isAdmin||sa.isSYS){
        return sqlWhere;
    }

    let ls = mcols.get(entityCode);
    
    ls = _.filter(ls,function(a){ return (a.IsPK==1&&m.get(a.EntityCode).IsRes==1)||m.get(a.FKEntityCode).IsRes==1;}) //从这里看来是否控制权限并不取决于这里的设置,主要是Entitycoe/FKEntityCode isRes决定的;
    
    if(!ls) return sqlWhere;

    if(sqlWhere) sqlWhere+=" where 1=1 and ";
    
    //get the roles;
    
    let rolestr = ustr.ls2sqlStr(sa.roles);

    for(let i of ls){
        a = cols.get(i);

        if(a.IsPK==1){
            sqlWhere += " and "+a.FldName+" in (select resId from UserAccess where roleId in ("+rolestr+") and ZIAccId in('0','"+sa.uid+"') and resType='"+a.EntityCode+"')";   
        }
        else{
            sqlWhere += " and "+a.FldName+" in (select resId from UserAccess where roleId in ("+rolestr+") and ZIAccId in('0','"+sa.uid+"') and resType='"+a.FKEntityCode+"')";      
        }
        
    }

    return sqlWhere;
   
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



