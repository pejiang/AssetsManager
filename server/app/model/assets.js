import fs from 'fs'
import * as XLSX from 'xlsx';
import {log} from '../util'
import position from '../controller/position'
import fields_cl from '../controller/fields'
import status from '../controller/status'
import imagectl from '../controller/image'
import base  from './model-base'
import shell from 'shelljs'
// let parent = new base({
//     name : "assets",
//     fields: ["name", "mac", "stats", "position", "battery"]
// })

module.exports = function(compatible) {
    let parent = base.use('asset');
    return {
        create : async (d,user) => {
            parent.fields = fields_cl().all();
            let obj = d.fields || d;
            // obj.position = await position().find(obj.mac);
            // obj.deleted = false;
            obj.id = obj.id || Date.now();

            parent = base.use('asset');
            obj.status = [{
                why:"资产入库",
                by:user,
                time:Date.now(),
            }]
            obj.mac = obj.mac.toUpperCase();
            return new Promise((resolve, reject) => {
                parent.create(obj, 'status')
                .then((asset) => {
                    resolve(asset)
                })
                .catch((e) => {
                    let err = e.original || {};
                    resolve({
                        code: 1,
                        errno: err.errno,
                        message: err.sqlMessage
                    });
                })
            })
        },
        update: async (id, d, user) =>{
            let asset = await parent.find(id);
            let obj = d.fields || d;
            if(!asset) return {code: 1, message: `could not find an asset with id ${id}`}

            let file_dir = require('path').normalize(koa_app.uploads_path + 'image/')
            if(!fs.existsSync(file_dir)){
                shell.mkdir(file_dir);
            }
            if (d.files && d.files.file) {
                // console.log(1111111111, d.files)
                var file = d.files.file,a,
                    filename = file.name,
                    new_path = require('path').normalize(file_dir + filename);
                function rename (a, b) {
                    return new Promise((resolve,reject) => {
                        fs.rename(a,b,(e) => {
                            if(!e){
                                resolve();
                            }else{
                                reject(e)
                            }
                        });
                    })
                }
                var res = await rename(file.path, new_path);
                if (res) {
                    console.log('rename file ERROR: ' + res);
                    return await [];
                } else {
                    let image = {
                        uid: Date.now(),
                        url: new_path.substr(new_path.indexOf('public'), new_path.length)
                    }
                    let img = await imagectl().create(image);
                    asset.addImage(img)
                } 
            }

            if(obj.note == asset.note && obj.method != 'add' && user != 'system'){
                return await {
                    code: 1,
                    errno: 1,
                    message: '请在重置备注里填写重置的原因'
                }
            }else{
                if(user != 'system' && obj.method != 'add'){
                    let s = await status().create({why:obj.note,by:user,time:Date.now()});
                    asset.addStatus(s)                    
                }
            }
            parent = base.use('asset');
            obj.mac = obj.mac.toUpperCase();
            return await parent.update(obj);
        },
        all : async (options) => {
            // return await parent.all({association: 'status'});
            if(!options.include)
                options.association = 'image'
            return await parent.all(options);
        },
        find_and_count_all : async (options) => {
            return await parent.find_and_count_all(options);
        },
        find: async (id) => {
            return await parent.find(id);
        },
        count: async (options) => {
            return await parent.count(options);
        },
        find_by:async(key,val) => {
            return await parent.find_by(key,val)
        },
        import:async() => {

        },
        export:async(assets, type) => {
            let title = ['id', 'name', 'mac', 'position', 'battery', 'count', 'owner', 'type', 'dept', 'price', 'note'];
            let assets_row = [title];
            for(let asset of assets){
                asset = asset.get();
                delete asset.deleted;
                delete asset.image;
                let vars = [];
                for(let key in asset){
                    vars.push(asset[key])
                }
                assets_row.push(vars)
            }
            /* generate workbook */
            var ws = XLSX.utils.aoa_to_sheet(assets_row);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "资产");
            /* generate buffer */
            var buf = XLSX.write(wb, {type:'buffer', bookType:type || "xlsx"});

            /* send to client */
            return await buf;
        },
        destroy:async(id) => {
            let asset = await parent.find(id);
            asset.deleted = true;
            console.log('del -------->',asset)
            return await parent.update(asset);
        },
        search:async(keyword) =>{
            let assets = await parent.all()
                ,res = []
                ,pattern=/[`~!@#\$%\^\&\*\(\)_\+<>\?"\{\},\.\\\/;'\[\]]/im
                ,regEx = new RegExp(keyword,'i');
                console.log(keyword,regEx)
            for(let i in assets){
                let asset = assets[i];
                for(let k in asset){
                    if(asset[k] == null || typeof asset[k] == 'object' || typeof asset[k] == 'boolean')continue;
                    // console.log(111111111,asset[k])
                    if(!pattern.test(keyword) && asset[k] && asset[k].match(regEx)){
                        res.push(asset)
                        break;
                    }
                }
            }
            return res;
        },
        upload: async (d, user) => {
            if (d.files == undefined || d.files == '') return await [];
            let file = d.files.file,a,
                filename = file.name;

            let targetDir = filename.endsWith('xlsx') ? 'conf/' : 'images/';
            let file_dir = require('path').normalize(koa_app.uploads_path + targetDir)
            let new_path = require('path').normalize(file_dir + filename);

            console.log('upload path :',file_dir,d.files.file);
            if(!fs.existsSync(file_dir)){
                shell.mkdir('-p', file_dir);
            }
            function rename (a, b) {
                return new Promise((resolve,reject) => {
                    fs.rename(a,b,(e) => {
                        if(!e){
                            resolve();
                        }
                    });
                })
            }

            let res = await rename(file.path, new_path);
            if (res) {
                console.log('rename file ERROR: ' + res);
                return await [];
            } else {
                let file_path = new_path;
                switch(targetDir){
                    case 'conf/':
                        try {
                            var file_content = fs.readFileSync(file_path);
                            var workbook = XLSX.read(file_content, {type:'buffer'});
                            // 返回 ['sheet1', 'sheet2']
                            const sheetNames = workbook.SheetNames;
                            // 根据表名获取对应某张表
                            const worksheet = workbook.Sheets[sheetNames[0]];
                            let assetsJson = XLSX.utils.sheet_to_json(worksheet)
                            for(let asset of assetsJson){
                                asset.mac = asset.mac.toUpperCase();
                                asset.id = Date.now();
                                parent = base.use('asset');
                                let q = await parent.find_by('mac', asset.mac);
                                if(!q.length > 0){
                                    asset.status = [{
                                        why:"资产入库",
                                        by:user,
                                        time:Date.now(),
                                    }]
                                    await parent.create(asset, 'status')
                                }
                            }

                            return {
                                code: 0,
                                errno: 0,
                                message: 'import successful'
                            }
                        } catch (e) {
                            console.log('some ERROR occured', e);
                            let err = e.original || {};
                            return {
                                code: 1,
                                errno: err.errno,
                                message: err.sqlMessage
                            };
                        } 
                        break;
                    case 'images/':     
                        break;

                }

                let f = {};
                f.path = file_path;
                f.size = file.size;
                f.time = file.lastModifiedDate;
                f.filename = filename;
                return await f;
            }
        },
    };
}

