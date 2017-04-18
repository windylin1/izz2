'use strict'

const koa = require('koa');    
const router = require('koa-router')(); 
const hdl_user = require('./handler-user.js');

var logger = require('../conf/log.js');

var app = new koa();
var db = require('../conf/db.js');
var ustr  = require('../lib/ustr.js');

//var test3 = require('../entity/test.js');

var dao = require('../entity/dao.js');
var entity = require('../entity/entity.js');
var ua = require('../entity/ua.js');


app.use(async function (ctx,next){
  await next();
});


app.use(async function handleErrors(ctx, next) {
    try {
          await next();
    } catch (e) {
        ctx.status = e.status || 500;
        switch (ctx.status) {
            case 401: // Unauthorised
                ctx.redirect('/login'+ctx.url);
                break;
            case 404: // Not Found
                const context404 = { msg: e.message=='Not Found'?null:e.message };
                await ctx.render('error/404', context404);
                break;
            case 403: // Forbidden
            case 409: // Conflict
                await ctx.render('error/404', e);
                break;
            default:
            case 500: // Internal Server Error
                console.error(ctx.status, e.message);

                const context500 = app.env=='prod' ? {} : { e: e };
                await ctx.render('error/500', context500);
                ctx.app.emit('error', e, ctx); // github.com/koajs/koa/wiki/Error-Handling
                break;
        }
    }
});



router.get('/index', async function (ctx){
    
    // all down test ok;
    //var ls = await db.query("select ZIAccId,bzTypeId,selConsault from ZZ_BZ_ORDER_SUB where ZIAccId =? limit 0,10",['af4f06965c234dafac566b438718ed59']);
    //var ls = await db.exec("update ZZ_BZ_ORDER_SUB set selConsault='bbbbbbb' where ZIAccId =? and orderSubId = ? ",['af4f06965c234dafac566b438718ed59','20170329155519141001']);
    
    //var ls = await db.getCell("select count(0) from ZZ_BZ_ORDER_SUB where ZIAccId =?",['af4f06965c234dafac566b438718ed59']);
    
   

    //var ls = await db.query("select ZIAccId,bzTypeId,selConsault from ZZ_BZ_ORDER_SUB  limit 0,10",null);
    
    //await test3(); --for test;async trans;

    //var ls = await db.query("select ZIAccId,bzTypeId,selConsault from ZZ_BZ_ORDER_SUB  limit 0,10",null);
    
    //console.log(ls);
    //ctx.session.user = ustr.getLongId(); //test session;
    
    logger.info('test3..............');
    
    //test dao;
    //let a = dao.getNew(entity.ZZ_COMMON_MEDIA);
    let a = dao.getNewForUpdate();
    let sa = ua.getSysSa();
    
    //await dao.insert(sa,entity.ZZ_COMMON_MEDIA,a);
    
    
    //let a = await dao.first(sa,entity.ZZ_COMMON_MEDIA);
    a.mediaId = '02c6514355264cdcae38db13e4ce272f';
    a.fExt = ".dgaegaegag";
    
    console.log(a);
    
    await dao.update(sa,entity.ZZ_COMMON_MEDIA,a);
    await ctx.render('index', {title : "我是NodeJs测试", list : []});

}); 

router.post('/file', async function (ctx){
    console.log(JSON.stringify(ctx.request.body));
}); 

app.use(router.routes());



module.exports = app;