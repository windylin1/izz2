var koa = require('koa');

const render = require('koa-ejs');
const path = require('path');

const body     = require('koa-body');       // body parser
const compose  = require('koa-compose');    // middleware composer
const compress = require('koa-compress');   // HTTP compression
const session  = require("koa-session2");    // session for flash messages

const serve = require('koa-static');  
const ustr  = require('./lib/ustr.js');


const log4js = require('koa-log4');

var logger = require('./conf/log.js');


const dao = require('./entity/dao.js');




logger.info('--------step into koa-------------')
logger.info('__dirname:'+__dirname);


var app = new koa();

app.use(serve('./static', { maxage: 1000*60*60 }));

render(app,{
  root: path.join(__dirname, './view'),
  layout: '',
  viewExt: 'html',
  cache: false,
  debug: true
});

app.use(log4js.koaLogger(log4js.getLogger("http"), { level: 'auto' }))

app.use(async function (ctx,next){
  var start = new Date;
  await next();
  var ms = new Date - start;
  logger.info('%s %s - %s ms', ctx.method, ctx.url, ms);
});

//compress if need;
//app.use(compress({}));


// parse request body into ctx.request.body
app.use(body({
    multipart: true,
    formLimit: 20,
    formidable: {
      uploadDir: __dirname + '/upload'
    }
}))

// session for flash messages (uses signed session cookies, with no server storage)
app.use(session({
    key: "xxxxxxxxxxx",   //default "koa:sess"
}));



app.use(async function (ctx,next){
  await next();
});

//非常重要,初始化dao模块; 引用时已初始;
/*
app.use(async function(ctx,next){
    dao.init();
    await next();
});
*/

// response

app.use(async function composeSubapp(ctx){
    
    await compose(require('./koa-www/app.js').middleware)(ctx);
    //console.log("session user:"+ctx.session.user)
});


app.on('error',function(err){
    logger.error("Server error:",err);
    //throw err;
});

app.listen(3000);

module.exports = app;