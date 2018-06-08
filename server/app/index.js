  // 引入模块
import Koa from 'koa'
import serve from 'koa-static'
import bodyParser from 'koa-bodyparser'
import router from './routes/router'
import config from './config'
import koaBody from 'koa-body'
import path from 'path'

const app = new Koa()
global.koa_app = app;

// 使用 bodyParser 和 KoaStatic 中间件
// app.use(bodyParser());

//console.log('path :',static_path)
//app.use(serve(static_path));


app.use(
    koaBody({
        formidable: { uploadDir: __dirname + '/../static/assets/uploads/' },
        multipart: true,
        urlencoded: true
    })
);

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});
// logger

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

var static_path = path.normalize(path.join(__dirname, '/../static/'));
app.static_path = static_path;

app.use(
    serve(static_path, {
        maxage: 1000 * 60 * 60 * 24
    })
);
// Proxy for ./usr folder
app.use(
    serve(__dirname + '/../usr/static/', {
        maxage: 1000 * 60 * 60 * 24
    })
);

app.use(async (ctx,next) => {
    // for cross-domain access
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization,Origin, X-Requested-With');
    ctx.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    ctx.set('Access-Control-Allow-Credentials', true);
    if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
        ctx.body = '';
        return;
    }
    await next();
});

// server-path
app.server_path = path.normalize(path.join(__dirname, '/../'));
app.uploads_path = path.normalize(path.join(__dirname, '/../usr/static/public/uploads/'));


app
  .use(router.routes())
  .use(router.allowedMethods());

app.port = 8888;
app.listen(app.port);
console.log('server listen on:' + config.use, app.port)