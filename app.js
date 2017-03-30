var koa = require('koa');

const render = require('koa-ejs');
const path = require('path');

const body     = require('koa-body');       // body parser
const compose  = require('koa-compose');    // middleware composer
const compress = require('koa-compress');   // HTTP compression
const session  = require('koa-session');    // session for flash messages

const serve = require('koa-static');  



const log4js = require('koa-log4');

var logger = require('./conf/log.js');

logger.info('--------step into koa-------------')


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
  logger.error('%s %s - %s ms', ctx.method, ctx.url, ms);
});

//compress if need;
app.use(compress({}));


// parse request body into ctx.request.body
app.use(body());

// session for flash messages (uses signed session cookies, with no server storage)
app.use(session(app)); // note koa-session@3.4.0 is v1 middleware which generates deprecation notice


// set signed cookie keys for JWT cookie & session cookie
app.keys = ['koa-sample-app-xxx'];


app.use(async function (ctx,next){
  await next();
});



// response

app.use(async function composeSubapp(ctx){
    await compose(require('./koa-www/app.js').middleware)(ctx);
});


app.on('error',function(err){
    logger.error("Server error:",err);
});

app.listen(3000);

module.exports = app;