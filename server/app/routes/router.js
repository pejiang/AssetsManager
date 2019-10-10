import Router from 'koa-router'
import assets from '../controller/assets'
import fields from '../controller/fields'
import position from '../controller/position'
import status from '../controller/status'
import service from '../service/serviceImpl'
import {log} from '../util'

const router = new Router({
    prefix:'/assets'
});

// const fields = new Router();
// router.use('/:fid/fields', fields.routes(), fields.allowedMethods());

router
  // .param('id', async (id, ctx, next) => {
  //   ctx.assets = await model().findby('name');
  //   if (!ctx.assets) return ctx.status = 404;
  //   return next();
  // })
  .get('/',  async (ctx,next) => {
    ctx.body = await assets().all();
  })
  .get('/device', async (ctx,next) => {
    var a = ['E1:10:87:7F:16:68'];
    ctx.body = JSON.stringify(a);
  })
  .get('/search/:keyword',async (ctx,next) => {
    let keyword = ctx.params.keyword;
    if(!keyword){
        return ctx.body = 'keyword is required!';
    }
    ctx.body = await assets().search(keyword);
  })
  .post('/position',async (ctx,next) => {
    let positionData = ctx.request.body;
    await service().position(positionData);
    ctx.body = {};
  })
  .post('/battery',async (ctx ,next) => {
    let batteryData = ctx.request.body;
    await service().battery(batteryData);
    ctx.body = {};
  })
  .post('/collect',async (ctx,next) => {
    let data = ctx.request.body;
    console.log(111111111111,data)
    ctx.body = {}
  })
  .post('/sleep',async (ctx,next) => {
    let data = ctx.request.body;
    console.log(111111111111,data)
    ctx.body = {}
  })
  .post('/', async (ctx, next) => {
    let body = ctx.request.body;
    let user = getcookie(ctx,'name') || 'admin';
    ctx.body = await assets().create(body,user)
  })
  .put('/:id', async (ctx, next) => {
    let id = ctx.params.id
    let body = ctx.request.body;
    let user = getcookie(ctx,'name') || 'admin';
    ctx.body = await assets().update(id,body,user)
  })
  .del('/:id', async (ctx, next) => {
    let id = ctx.params.id
    ctx.body = await assets().destroy(id);
  })
  .get('/:id', async (ctx, next) => {
    let id = ctx.params.id
    ctx.body = await assets().find(id);
  })

function getcookie(ctx,objname) {
  let cookie = ctx.header['cookie'];
  if(!cookie) return;
  var arrstr = cookie.split("; ");
    for (var i = 0; i < arrstr.length; i++) {
      var temp = arrstr[i].split("=");
      if (temp[0] == objname) return unescape(temp[1]);
    }
}

let fieldsRouter = new Router(), positionRouter = new Router(),statusRouter = new Router(),imageRouter = new Router();
 
fieldsRouter.get('/', (ctx, next) => {
    ctx.body = fields().all();
});
fieldsRouter.put('/', async (ctx, next) => {
    log.d(222222,ctx.request.body)
    ctx.body = await fields().update(ctx.request.body)
});

positionRouter.get('/',async (ctx,next) => {
    let id = ctx.params.id
    log.d('Get position ID:',id)
    let ret = await assets().find(id);
    ctx.body = ret.position;
})

positionRouter.get('/history/:offset/:limit',async (ctx,next) => {
    let id = ctx.params.id
    let parmOffset = ctx.params.offset
    let parmLimit = ctx.params.limit
    log.d('Get position history ID:',id)
    let asset = await assets().find(id);
    console.log(asset)
    ctx.body = await position().all({where: {asset_mac: asset.mac}, offset: parseInt(parmOffset), limit: parseInt(parmLimit)});
})


statusRouter.get('/',async (ctx,next) => {
    let id = ctx.params.id
    ctx.body = await status().find(id);
})

imageRouter.post('/',async (ctx,next) => {
  log.d('upload image file:')
  ctx.body = await assets().upload(ctx.request.body)
})

router.use('/:id/fields', fieldsRouter.routes(), fieldsRouter.allowedMethods());
router.use('/:id/position', positionRouter.routes(), positionRouter.allowedMethods());
router.use('/:id/status', statusRouter.routes(), statusRouter.allowedMethods());
router.use('/:id/image', imageRouter.routes(), imageRouter.allowedMethods());
 

export default router
