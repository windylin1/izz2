'use strict'

const koa = require('koa');    
const router = require('koa-router')(); 
const hdl_user = require('./handler-user.js');

var logger = require('../conf/log.js');

var app = new koa();
var db = require('../conf/db.js');

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
    var ls = await db.query("select ZIAccId,bzTypeId,selConsault from ZZ_BZ_ORDER_CART where ZIAccId =? ",['af4f06965c234dafac566b438718ed59']);
    //var ls = await db.exec("update ZZ_BZ_ORDER_CART set selConsault='bbbbbbb' where ZIAccId =? and orderSubId = ? ",['af4f06965c234dafac566b438718ed59','20170329155519141001']);
    
    //var ls = await db.getCell("select count(0) from ZZ_BZ_ORDER_CART where ZIAccId =?",['af4f06965c234dafac566b438718ed59']);
    
    //var ls = await db.exec("insert into UR_RESX values('001','res_type','resName',?)",['wokao']);
    
    console.log(ls);
    
    await ctx.render('index', {title : "我是NodeJs测试", list : ls});
}); 



app.use(router.routes());



module.exports = app;