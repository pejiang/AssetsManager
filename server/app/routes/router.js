import Router from 'koa-router'
import assets from '../controller/assets'
import fields from '../controller/fields'
import position from '../controller/position'
import status from '../controller/status'
import service from '../service/serviceImpl'
import {log} from '../util'
import moment from 'moment'
import { Sequelize } from "sequelize";// 引入orm
const Op = Sequelize.Op;

const router = new Router({
    prefix:'/assets'
});

// const fields = new Router();
// router.use('/:fid/fields', fields.routes(), fields.allowedMethods());

router
  .get('/export/:ids/:type', async(ctx, next) => {
    let ids = ctx.params.ids;
    let type = ctx.params.type;
    let or = [];
    if(ids != 'all'){
      for(let id of ids){
        or.push({'id': id})
      }
    }
    let options = {
       where: {
         deleted: {
           [Op.not]: true
         }
       },
      // attributes: ['id']
    }
    if(or.length > 0)options[Op.or] = or;
    var res = await assets().export(ids, type, options);

    var date = moment().format('YYYY-MM-DD');
    ctx.set('Content-disposition','attachment;filename='+'assets@'+ date + '.xlsx'); 
    ctx.body = res;
  })
  .get('/', async(ctx, next) => {
      let all = await assets().all({
        where: {
          deleted: {
            [Op.not]: true
          }
        },
        order: [['id', 'DESC']]
      });
      ctx.body = {
        total: all.length,
        data: all
      }
  })
  .get('/:offset/:limit',  async (ctx,next) => {
    let offset = ctx.params.offset
    let limit = ctx.params.limit
    let res =  await assets().find_and_count_all({
       where: {
         deleted: {
           [Op.not]: true
         }
       },
       order: [['id', 'DESC']],
       offset: parseInt(offset), limit: parseInt(limit)
     });

    ctx.body = {
      total: res.count,
      data: res.rows
    }
  })
  .get('/device', async (ctx,next) => {
    var a = ['E1:10:87:7F:16:68'];
    ctx.body = JSON.stringify(a);
  })
  .get('/search/:keyword/:offset/:limit',async (ctx,next) => {
    let keyword = ctx.params.keyword;
    let offset = ctx.params.offset;
    let limit = ctx.params.limit;
    if(!keyword){
        return ctx.body = 'keyword is required!';
    }
    let like = {
      [Op.like]: '%' + keyword + '%'
    }
    let res = await assets().search({
      order: [['id', 'DESC']],
      where: {
         deleted: {
           [Op.not]: true
         },
         [Op.or]: [
          {id: like},
          {name: like},
          {mac: like},
          {position: like},
          {owner: like},
          {count: like},
          {type: like},
          {dept: like},
          {price: like},
          {note: like},
         ] 
      }
    });

    ctx.body = {
      total: res.count,
      data: res.rows
    }
  })
  .post('/import', async(ctx, next) => {
    let user = getcookie(ctx,'name') || 'admin';
    ctx.body = await assets().import(ctx.request.body, user);
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
    let res = await position().find_and_count_all({where: {asset_mac: asset.mac}, offset: parseInt(parmOffset), limit: parseInt(parmLimit), order: [['time', 'DESC']]});
    ctx.body = {
      total: res.count,
      data: res.rows
    }
})


statusRouter.get('/:offset/:limit',async (ctx,next) => {
    let id = ctx.params.id
    let parmOffset = ctx.params.offset
    let parmLimit = ctx.params.limit
    log.d('Get position history ID:',id)
    let res = await status().find_and_count_all({where: {asset_id: id}, offset: parseInt(parmOffset), limit: parseInt(parmLimit), order: [['time', 'DESC']]});
    ctx.body = {
      total: res.count,
      data: res.rows
    }
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
