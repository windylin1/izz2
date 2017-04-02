var conns = {
    zz: {
        host: '114.215.31.128', 
        user: 'root',
        password: 'zhenipRootZAQ!',
        database:'ZZ.TEST',
        port: 3306
    }
};

var mysql= require('mysql2/promise'); // fast mysql driver


var connPool = mysql.createPool(conns.zz); // put in global to pass to sub-apps
var logger = require('./log.js');

var db = new Object();

db.getConn = async function(){
    return await connPool.getConnection();
}


db.execute = async function(strsql,params,conn=null){
    
    //when prod  no use;
    logger.info('sql exec called');
    //logger.info(strsql);
    //logger.info(params);
    
    let isInnerConn =false;

    if(!conn){
        conn = await db.getConn();
    }

    try{
        let res= await conn.execute(strsql,params); //sql使用?,params[1,2],其类型和数量要自己匹配; 返回为[rows,fields]
        return res;
    }catch(e){
    
        throw e;
    }
    finally{
        if(isInnerConn){
            await conn.release();
        }
    }
}

db.query=async function(strsql,params,conn=null){

    try{
        let res = await db.execute(strsql,params,conn);
        return res[0];
    }
    catch(e){
        throw e;
    }
}
//取单个值;
db.getCell =async function(strsql,params,conn=null){
    try{
        let res = await db.execute(strsql,params,conn);
        let dic= res[0][0];

        for(let k in dic){
            return dic[k];
        }
    }
    catch(e){
        throw e;
    }
}

//执行;返回影响行数;
db.exec =async function(strsql,params,conn=null){
    try{
        let res = await db.execute(strsql,params,conn);
        return res[0]['affectedRows'];   
    }
    catch(e){
        throw e;
    }
}

//必须是sync 方法;必须第一个是this, 可以为null, 第二个是方法, 第三个是conn, 剩下的为其他参数;
//
db.transFunc = async function(obj,func){

    let conn =await db.getConn();

    if(arguments.length<2){
        throw new Error("the transFunc lenth must large than 2");
    }

    obj = arguments[0];
    func = arguments[1];
    
    let args = [conn];

    for(var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    await conn.query("START TRANSACTION;");

    try{
        let res = await func.apply(obj,args);

        await conn.query("COMMIT;",conn);
        return res;
    }
    catch(ex){
        await conn.query("ROLLBACK;",conn);
        throw ex;
    }
    finally{
        await conn.release();
    } 
};

//use for many sql; infact it's not only for exec ;

db.transExec= async function(sql){

     let conn =await db.getConn();

     await conn.query("START TRANSACTION;");

     try{
        let res= await db.exec(sql,null,conn);
        await conn.query("COMMIT;",conn);
        return res;
     }
     catch(ex){
        await conn.query("ROLLBACK;",conn);
        throw ex;
     }
     finally{
        await conn.release();
     } 
}


//
/*
    trans test; use sql;

    var conn =await db.getConn();

    var ls = await db.query("select ZIAccId,bzTypeId,selConsault from ZZ_BZ_ORDER_SUB where ZIAccId =? limit 0,10",['af4f06965c234dafac566b438718ed59'],conn);

    await conn.query("START TRANSACTION;");

    try{

        await db.exec("insert into UR_RESX values('001','res_type','resName',?)",['wokao'],conn);

        await db.exec("insert into UR_RESX values('002','res_type','resName',?)",['wokao2'],conn);

        ls = await db.exec("insert into UR_RESX values('003','res_type','resName',?)",['wokao3'],conn);  

        await conn.query("COMMIT;",conn);
        
    }
    catch(ex){
        await conn.query("ROLLBACK;",conn);
        throw ex;
    }
    finally{
        await conn.release();
    }

 */

module.exports  = db;


