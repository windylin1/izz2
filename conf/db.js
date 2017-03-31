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

db.execute = async function(strsql,params){
    
    //when prod  no use;
    logger.info('sql exec called');
    //logger.info(strsql);
    //logger.info(params);

    let conn = await connPool.getConnection();
    try{
        let res= await conn.execute(strsql,params); //sql使用?,params[1,2],其类型和数量要自己匹配; 返回为[rows,fields]
        await conn.release();
        return res;
    }catch(e){
        await conn.release();
        throw e;
    }
}

db.query=async function(strsql,params){

    try{
        let res = await db.execute(strsql,params);
        return res[0];
    }
    catch(e){
        throw e;
    }
}
//取单个值;
db.getCell =async function(strsql,params){
    try{
        let res = await db.execute(strsql,params);
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
db.exec =async function(strsql,params){
    try{
        let res = await db.execute(strsql,params);
        return res[0]['affectedRows'];    }
    catch(e){
        throw e;
    }
}

//执行多个
db.trans = null;

module.exports  = db;


