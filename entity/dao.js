'use strict'

const db=require('../conf/db.js');
const _ = require('underscore')._;
const ustr = require('../lib/ustr.js');
const Err = require('../Exception/Exception.js');
var logger = require('../conf/log.js');


let m = new Map(); //entities;
let mcols = new Map();
let cols = new Map();
let mPks = new Map();

let UPDATE_FIELD = "TIMESTAMPUPDATE";
let CREATE_FIELD = "TIMESTAMPCREATE";
let INUSE_FIELD ="INUSE";

let IS_INIT = false;

var dao = {};

dao.init=async function(v=0){
       
        if(v==1){IS_INIT = false;}
        
        if(IS_INIT)  return;
        
        logger.info('begin orm init...');
        
            //get m from db; 这里不应该是异步的; 暂时先这么处理;
        let ls =await db.query('select * from BASE_ENTITY',[]);
    
        if(!ls){
            throw new Error('未定义任何实体!'); //这里应该退出程序;
        }

        for(let a of ls){
            m.set(a.EntityCode,a);
            mcols.set(a.EntityCode,null);
        }
        
        let ls2 = await db.query('select * from BASE_ENTITY_ATTR',[]);

        if(!ls2){
            throw new Error('未定义任何实体属性');
        }
    
        for(let c of ls2){
            if(c.validates){
                c.Validates = JSON.parse(c.Validates);
            }
            else{
                c.Validates = [];
            }
            
            
            if(c.fldType=='datetime'){
                c.DefVal = (c.DefVal?c.DefVal:"1900-01-01");
            }
            else if(c.fldType=='int'){
                c.DefVal = (c.DefVal?c.DefVal:0);
            }
            else if (c.fldType=="double"){
                c.DefVal = (c.DefVal?c.DefVal:0);
            }
            else{
                c.DefVal = (c.DefVal?c.DefVal:"");
            }
            
            
            cols.set(c.Fid,c);

            if(c.isPK==1) mPks.set(c.EntityCode,c);

            if(!m.has(c.EntityCode)){ continue;}

            let arr = new Set();
            if(mcols.get(c.EntityCode)){
                arr = mcols.get(c.EntityCode);
            }

            arr.add(c.Fid);
            mcols.set(c.EntityCode,arr);
        }
        logger.info('begin orm init...4');
        //递归父级对象的属性; 如果子级已经有的,以子级为准;
        
        
        let _tmp = _.pluck(_.filter(m.values(),function(a){return !ustr.isnul(a.EntityPCode)&&a.EntityPCode!='0';}),'EntityPCode');
        let _prts = new Set(_tmp);
        if(_prts){
           _prts = new Set(_.pluck(_.filter(m.values(),function(a){return _prts.has(a.EntityCode)&&ustr.isnul(a.EntityPCode);}),'EntityCode'));
        }

        let _prtsNew = new Set();
        
        console.log(_prts);        

        while(_prts){
            for(let k of m.keys()){
                
                if( _prts.has(m.get(k).EntityPCode)){

                    let arr = mcols.get(k);
                    let parr = mcols.get(m.get(k).EntityPCode);

                    let arrls = getlsByKey(arr,cols);
                    let parrls = getlsByKey(parr,cols);

                    let arrNames =new Set(_.pluck(arrls,'FldName'));

                    //pk can not be inhreited
                    let newCols =_.pluck(_.filter(parrls,function(a){return !arrNames.has(a.FldName)&&a.isPK!=1;}),'Fid');

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
        IS_INIT = true;
        
        console.log('m');
        console.log(m);
        
        console.log('mcols');
        console.log(mcols);
        
        
        console.log('cols');
        console.log(cols);
        
        console.log('mPks');
        console.log(mPks);
        
    };

dao.getNew = function (entityCode){
        
        if(!m.has(entityCode)) return null;
        
        let mPk = mPks.get(entityCode);
        
        let obj = new Object();
        
        let ls = mcols.get(entityCode);
        
        obj[mPk.FldName] = "0";
        
        for(let s of ls){
            let a = cols.get(s);
            
            if(a.fldType=='datetime'){
                obj[a.FldName] =(a.DefVal?new Date(a.DefVal):new Date("1900-01-01"));
            }
            else if(a.fldType=='int'){
                obj[a.FldName] =(a.DefVal?ustr.o2i(a.DefVal):0);
            }
            else if (a.fldType=="double"){
                obj[a.FldName] =(a.DefVal?ustr.o2f(a.DefVal):0);
            }
            else{
                obj[a.FldName] = (a.DefVal?a.DefVal:"");
            }
        }
        
        return obj;
        
        
        
    };

    //获取某实体; 注意, 不支持in参数,如果使用in,请自己把in拼接到sql中; --注意防注入的问题;使用ustr.ls2sqlWhere()
 dao.first = async function(sa,entityCode,flds="*",sqlWhere="",params=null){

        let ls = await dao.findBySql(sa,entityCode,flds,sqlWhere,params);
        if(ls){
            return ls[0];
        }
        return null;
    }

 dao.firstByKey = async function(sa,entityCode,key,flds="*"){

        if(!m.has(entityCode)) return null;
        if(!key) return null;

        let strWhere=" where "+ mPks.get(entityCode).FldName+"=?";
        let params=[key];

        return await dao.first(sa,entityCode,flds,strWhere,params);

 }

 dao.find = async function(sa,entityCode,flds="*",sqlWhere="",params=null,sqlOrder="",ispage=0,ipage=0,isize=10){
        
        if(!m.has(entityCode)) return null;

        let tmp = m.get(entityCode);

        let selsql = "select "+flds+ " from "+tmp.TblName;

        let ls = await dao.findBySql(sa,entityCode,selsql,sqlWhere,params,sqlOrder,ispage,ipage,isize);

        return ls;
    }

    //获取某些实体;手写sql;
 dao.findBySql=async function(sa,entityCode,selsql,sqlWhere="",params=null,sqlOrder="",ispage=0,ipage=0,isize=10){

        if(!(sa.isSYS||sa.isAdmin)){
            sqlWhere = _addUaCtl(sa,entityCode,sqlWhere);
        }

        let sqlPage = "";
        if(ispage!=0){
            ipage = ipage<=0?1:ipage;
            isize = isize<1?10:isize;
            sqlPage = " limit "+(ipage-1)*isize + ","+isize;
        }

        let strsql = selsql + sqlWhere + sqlOrder+sqlPage;

        let ls = await db.query(strsql,params);
        
        return ls;
    }    

 dao.countBySql= async function (sa,entityCode,sqlWhere="",params=null){

        if(!(sa.isSYS||sa.isAdmin)){
            sqlWhere = _addUaCtl(sa,entityCode,sqlWhere);
        }

        if(!m.has(entityCode)) return 0;

        let tmp = m.get(entityCode);
        
        let selsql = "select count(0) as num from "+tmp.TblName;

        let strsql = selsql + sqlWhere ;

        let num = await db.getCell(strsql,params);

        return num;
    }    

    //更新, update 只校验提供的字段,不校验未提供的字段的require与否;
  dao.update = async function(sa,entityCode,entity){
        
        if(!m.has(entityCode)) return 0;
        if(!entity) return 0;
        
        entity.UPDATE_FIELD = new Date();

        let mPk = mPks.get(entityCode);
        
        let key = mPk.FldName;
        let keyId= mPk.Fid;
        
        let tmp = m.get(entityCode);
        
        //校验权限; --数据库中获取看是否成功;--
        let obj = dao.firstByKey(sa,entityCode,entity.key);

        if(!obj) {//校验未通过;
            throw Err.getErrValidate100();
        }
        
        //获取fld列表; 如果是insert,直接使用ls即可;
        let ls = mcols.get(entityCode);
        let ls2 = new Set();
        for(let k in entity){
            
            if(k==keyId) continue;  //主键不放进去;
            
            if (ls.has(k)){
                ls2.add(k)
            }
        }
        ls = ls2;
        
        
        
        //校验实体,validate;
        _validateObjs(entityCode,[entity],ls);

        //生成sql
        let updatesql  = _getUpdateSql(ls,tmp.TblName);
        
        let params = [];
        for(let s of ls){
            params.push(entity[a.FldName]);
        }
        params.push(entity[key]);

        //使用trans执行语句;
        updatesql = db.format(updatesql,params);
        
        return await db.transExec(updatesql);
        
    }

dao.updateMany= async function(sa,entityCode,entitys){
        
        if(!m.has(entityCode)) return 0;
        if(!entitys) return 0;
        

        let mPk = mPks.get(entityCode);
        
        let key = mPk.FldName;
        let keyId= mPk.Fid;
        
        let tmp = m.get(entityCode);
        
        let ids = [];
        
        for(let et of entities){
            et.UPDATE_FIELD = new Date(); //更新字段;
            ids.push(et.key);
        }
        
        //校验权限; --数据库中获取看是否成功;--
        let etCount = dao.countBySql(sa,entityCode,ustr.ls2sqlWhere(key,ids));
        
        if(etCount!=entitys.length) {//校验未通过;
            throw Err.getErrValidate100();
        }
        
        
        //获取fld列表; 如果是insert,直接使用ls即可;
        let entity = entitys[0];
        
        let ls = mcols.get(entityCode);
        let ls2 = new Set();
        for(let k in entity){
            if(k==keyId) continue;  //主键不放进去;
            
            if (ls.has(k)){
                ls2.add(k)
            }
        }
        ls = ls2;

        //校验实体,validate;
        _validateObjs(entityCode,entitys,ls);

        //生成sql

        
        //many sql;
        let updatesql = _getUpdateSql(ls,tmp.TblName);
        let updateManySql = "";
        
        for(let et of entitys){
            let params = [];
            
            for(let s of ls){
                let a = cols.get(s);
                params.push(et[a.FldName]);
            }
            params.push(et[key]); 
            
            updateManySql+= db.format(updatesql,params)+";";
        }

        return await db.transExec(updateManySql);
}

    //增加,校验提供的字段,同时校验未提供的字段的require; 所有的校验都是并列的;有一些关联性的校验无法在此处理;需要调用方自己处理;
    //不提供insertBySql;
 dao.insert = async function(sa,entityCode,entity){
      
        if(!m.has(entityCode)) return 0;
        if(!entity) return 0;
        
        entity.UPDATE_FIELD = new Date();
        entity.CREATE_FIELD = entity.UPDATE_FIELD;
        entity.INUSE = 1;
        
        
        let mPk = mPks.get(entityCode);
        
        let key = mPk.FldName;
        let keyId= mPk.Fid;
        
        
        if(mPk.isAuto==0&&!entity.key){ //如果是自动,或者实体是手工给Code的情况;切切,手工给code;需要自己防止重复;
            entity.key = ustr.getLongId(); //如果不是auto,为其生成键;
        }
        
        let tmp = m.get(entityCode);
        
        //校验权限; --数据库中获取看是否成功;--不校验,实际可以校验一下是否在数据库中已存在;
        //let obj = firstByKey(sa,entityCode,entity.key);

        //if(!obj) {//校验未通过;
        //    throw Err.getErrValidate100();
        //}
        
        
        //获取fld列表; 如果是insert,直接使用ls即可;
        let ls = mcols.get(entityCode);
        let ls2 = new Set();
        
        for(let k in ls){
            if(k==keyId&&mPk.isAuto==1) continue;  //主键不放进去;
            ls2.add(k);
        }
        ls = ls2;
        

        
        //校验实体,validate;
        _validateObjs(entityCode,[entity],ls);

        //生成sql
        let insertsql  = _getInsertSql(ls,tmp.TblName);
        
        let params = [];
        
        params.push(entity[key]);
        for(let s of ls){
            params.push(entity[a.FldName]);
        }
        
        insertsql = db.format(insertsql,params);
        
        //使用trans执行语句;
        return await db.transExec(insertsql);
        
}

dao.insertMany = async function(sa,entityCode,entitys){
      
        if(!m.has(entityCode)) return 0;
        if(!entitys) return 0;
        if(entitys.length==0) return 0;
        
        let mPk = mPks.get(entityCode);
        
        let key = mPk.FldName;
        let keyId= mPk.Fid;
        let tmp = m.get(entityCode);
        
        for(let entity of entitys){
            entity.UPDATE_FIELD = new Date();
            entity.CREATE_FIELD = entity.UPDATE_FIELD;
            entity.INUSE = 1;
            
            if(mPk.isAuto==0&&!entity.key){ //如果是自动,或者实体是手工给Code的情况;切切,手工给code;需要自己防止重复;
                entity.key = ustr.getLongId(); //如果不是auto,为其生成键;
            }
        }

        //校验权限; --数据库中获取看是否成功;--不校验,实际可以校验一下是否在数据库中已存在;
        //let obj = firstByKey(sa,entityCode,entity.key);

        //if(!obj) {//校验未通过;
        //    throw Err.getErrValidate100();
        //}
        
        
        //获取fld列表; 如果是insert,直接使用ls即可;
        let ls = mcols.get(entityCode);
        let ls2 = new Set();
        
        for(let k in ls){
            if(k==keyId&&mPk.isAuto==1) continue;  //主键不放进去;
            ls2.add(k);
        }
        ls = ls2;
        
        //校验实体,validate;
        _validateObjs(entityCode,entitys,ls);

        //生成sql
        let insertsql  = _getInsertSql(ls,tmp.TblName);
        
        let insertManySql = "";
        
        for(let et of entitys){
            let params = [];
            
            params.push(et[key]); 
            for(let s of ls){
                let a = cols.get(s);
                params.push(et[a.FldName]);
            }
            
            insertManySql+= db.format(insertsql,params)+";";
        }
               
        //使用trans执行语句;
        return await db.transExec(insertManySql);
}
    
     //注意此时不做实体校验;只用于系统性批量操作,但依然判断权限; 不实用; 不再使用;
dao.updateBySql = async  function(sa,entityCode,strsql){
        return false;
}



    //注意此时不做实体校验;只用于系统性操作; 但依然判断权限; 不用;如果by sql,直接调用sql就好; 不再使用;
dao.insertBySql = async function(){
        return false;
}



function  _getUpdateSql(ls,tbl,entity){
        let updatesql  = "update "+tmp.TblName + " set ";

        for(let s of ls){
            let a = cols.get(s);
            updatesql+= a.FldName+"=?,"
        }
        updatesql = updatesql.substr(updatesql,updatesql.length-1);
        updatesql+= " where "+key +" = ?";
        
        return updatesql;
}

    //fld列表,entity,
 function _getInsertSql(ls,tbl){
        
        let insertsql  = "insert into  "+tbl + " ( ";
        
        for(let s of ls){
            let a = cols.get(s);
            insertsql+= a.FldName+","
        }
        insertsql = insertsql.substr(insertsql,insertsql.length-1);
        
        insertsql += " ) values (";
        for(let s of ls){
            insertsql+="?,";
        }
        insertsql = insertsql.substr(insertsql,insertsql.length-1);
        
        insertsql+" )";
        
        return insertsql;
}
    //validate
    //require/number/int/datetime/email/chs/eng/max/min/between/enum/ds ;取消require,使用isNull标记;
    //
    //当update 时,以entity的值确定;更新字段; 注意,必须确保enitiys中的字段都是一致的;否则会出错;
    //当insert时, 以cos中的确定;
    //ls -field list;
function _validateObjs(entityCode,entitys,ls){
        
        let bl = true;
        
        if(entitys.length==0) return true;
        
        
        for(let s of ls){
            
            let a= cols.get(s);
            
            let val = et[a.FldName];
            
            if(a.isValidate==1){
                //对每一个entity校验; vld.msg应该使用文本格式化;
                let vlds = a.Validates;
                for(let vld of vlds){
                    for(let et of entitys){                    
                        if (val==null||val==undefined){ //如果没填,可以通过; 是否必填在后面校验;
                            continue;
                        }
                        
                        
                        if(vld.type=='number'&&!ustr.isNumber(val) ){
                            throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为数字!" );//不为空校验未通过;
                        }
                        else if(vld.type=='int'&&!ustr.isInt(val) ){
                            throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为整数!" );//不为空校验未通过;
                        }
                        else if(vld.type=='datetime'&&!ustr.isDate(val) ){
                            throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为日期类型!" );//不为空校验未通过;
                        }
                        else if(vld.type=='email'&&!ustr.isEmail(val) ){
                            throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",邮箱格式不正确!" );//不为空校验未通过;
                        }
                        else if(vld.type=='chs'&&!ustr.isChs(val) ){
                            throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为中文字符!" );//不为空校验未通过;
                        }
                        else if(vld.type=='eng'&&!ustr.isEng(val) ){
                            throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为英文字符!" );//不为空校验未通过;
                        }
                        else if(vld.type=='max'){ //必须为数字;
                            if(!ustr.isNumber(val)) 
                                throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为数字!" );
                            let n = ustr.o2f(val);
                            let v = ustr.o2f(vld.value);
                            if(n>v)
                                throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",不能大于"+vld.value.toString() );
                        }
                        else if(vld.type=='min'){ //必须为数字;
                            if(!ustr.isNumber(val)) 
                                throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为数字!" );
                            let n = ustr.o2f(val);
                            let v = ustr.o2f(vld.value);
                            if(n<v)
                                throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",不能小于"+vld.value.toString() );
                        }
                        else if(vld.type=='between'){ //必须为数字;
                            if(!ustr.isNumber(val)) 
                                throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",必须为数字!" );
                            
                            let n = ustr.o2f(val);
                            let vs= vld.value.split('-');
                            let v1 = ustr.o2f(vs[0]);
                            let v2 = ustr.o2f(vs[1]);
                            
                            
                            if(!(n>=v1&&n<=v2)){
                                throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",不能小于"+vld.value.toString() );
                            }
                        }
                        else if(vld.type=='enum'){  

                            let vs= new set(vld.value.split(','));
                            
                            if(!vs.has(val)){
                                throw Err.getErrValidate900( vld.msg||a.FldName+","+a.FldLabel+",不能小于"+vld.value.toString() );
                            }
                        }
                        else if(vld.type=='ds'){ //暂时不处理,很难处理; 需要先获取ds的值,然后再比较;
                            
                        }
                    }
                }
            }

            //校验长度;类型等;赋默认值;
            for(let et of entitys){
                    
                if(val==null||val==undefined){  
                                        
                    if(!(a.isNull&&a.isNull==1)){
                        throw Err.getErrValidate900(a.FldName+","+a.FldLabel+",不能为空!" );//不为空校验未通过;
                    }
                        
                    if(a.fldType=='datetime'){
                        et[a.FldName] =new Date(a.DefVal);
                    }
                    else if(a.fldType=='int'){
                         et[a.FldName] =ustr.o2i(a.DefVal);
                    }
                    else if (a.fldType=="double"){
                         et[a.FldName] =ustr.o2f(a.DefVal);
                    }
                    else{
                        et[a.FldName] = a.DefVal;
                    }
                }
                else{
                    if(a.fldType=='varchar'){ //varchar,int,double,datetime,
                        if(val&&a.FldSize&&val.length>a.FldSize){
                            throw Err.getErrValidate900(a.FldName+","+a.FldLabel+",不能超过长度"+a.FldSize); //超长,或自动截断?
                        }
                    }
                    else if(a.fldType=='int'){ //varchar,int,double,datetime,
                        if(!ustr.isNumber(val)) 
                            throw Err.getErrValidate900(a.FldName+","+a.FldLabel+",必须为数字!" );
                    }
                    else if(a.fldType=='double'){ //varchar,int,double,datetime,
                        if(!ustr.isNumber(val)) 
                            throw Err.getErrValidate900(a.FldName+","+a.FldLabel+",必须为数字!" );
                    }
                    else if(a.fldType=='datetime'){ //varchar,int,double,datetime,
                        if(!ustr.isDate(val)) 
                            throw Err.getErrValidate900(a.FldName+","+a.FldLabel+",必须为日期类型!" );
                    }
                }
            }


        }
        
        return bl;

}





function _addUaCtl(sa,entityCode,sqlWhere){
        if(sa.isAdmin||sa.isSYS){
            return sqlWhere;
        }

        let ls = mcols.get(entityCode);
        
        ls = _.filter(ls,function(a){ return (a.isPK==1&&m.get(a.EntityCode).isRes==1)||m.get(a.FKEntityCode).isRes==1;}) //从这里看来是否控制权限并不取决于这里的设置,主要是Entitycoe/FKEntityCode isRes决定的;
        
        if(!ls) return sqlWhere;

        if(sqlWhere) sqlWhere+=" where 1=1 and ";
        
        //get the roles;
        
        let rolestr = ustr.ls2sqlStr(sa.roles);

        for(let i of ls){
            a = cols.get(i);

            if(a.isPK==1){
                sqlWhere += " and "+a.FldName+" in (select resId from UserAccess where roleId in ("+rolestr+") and ZIAccId in('0','"+sa.uid+"') and resType='"+a.EntityCode+"')";   
            }
            else{
                sqlWhere += " and "+a.FldName+" in (select resId from UserAccess where roleId in ("+rolestr+") and ZIAccId in('0','"+sa.uid+"') and resType='"+a.FKEntityCode+"')";      
            }
            
        }

        return sqlWhere;
       
}



function  getlsByKey(keyls,m1){
        let ls = new Array();
        for(let k of keyls){
            if(m1.has(k)){
                ls1.push(m1.get(k));
            }
        }
        return ls;
}

dao.init();
module.exports = dao;

