import fs from 'fs'
import {log} from '../util'
import position from '../controller/position'
import fields_cl from '../controller/fields'
import status from '../controller/status'

import base  from './model-base'
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
            obj.position = await position().find(obj.mac);
            // obj.deleted = false;
            obj.id = Date.now();
            let file_dir = require('path').normalize(koa_app.uploads_path + 'image/')
            // log.d('upload path :',file_dir,d.files.file);
            if(!fs.existsSync(file_dir)){
                fs.mkdir(file_dir);
            }
            if (d.files && d.files.file) {
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
                    obj.image = new_path.substr(new_path.indexOf('public'),new_path.length);
                }       
            }

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
                    let err = e.original;
                    resolve({
                        code: err.code,
                        errno: err.errno,
                        sqlMessage: err.sqlMessage
                    });
                })
            })
        },
        update: async (id, d,user) =>{
            let asset = await parent.find(id);
            let obj = d.fields || d;
            if(!asset) return `could not find an asset with id ${id}`;
            if(obj.note == asset.note){
                return await "no change";
            }else{
                let s = await status().create({why:obj.note,by:user,time:Date.now()});
                asset.addStatus(s)
            }
            parent = base.use('asset');
            obj.mac = obj.mac.toUpperCase();
            return await parent.update(obj);
        },
        all : async (options) => {
            // return await parent.all({association: 'status'});
            return await parent.all(options);
        },
        find: async (id) => {
            return await parent.find(id);
        },
        find_by:async(key,val) => {
            return await parent.find_by(key,val)
        },
        destroy:async(id) => {
            let asset = await parent.find(id);
            asset.deleted = true;
            console.log('del -------->',asset)
            return await parent.update(id,asset);
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
                    console.log(111111111,asset[k])
                    if(!pattern.test(keyword) && asset[k] && asset[k].match(regEx)){
                        res.push(asset)
                        break;
                    }
                }
            }
            return res;
        },
        upload: async (d) => {
            let file_dir = require('path').normalize(koa_app.uploads_path + 'image/')
            log.d('upload path :',file_dir,d.files.file);
            if(!fs.existsSync(file_dir)){
                fs.mkdir(file_dir);
            }
            if (d.files == undefined || d.files == '') return await [];

            var file = d.files.file,a,
                filename = file.name,
                new_path = require('path').normalize(file_dir + filename);
            function rename (a, b) {
                return new Promise((resolve,reject) => {
                    fs.rename(a,b,(e) => {
                        if(!e){
                            resolve();
                        }
                    });
                })
                // return function (callback) {
                //     fs.rename(a, b, callback);
                // }
            }
            var res = await rename(file.path, new_path);
            if (res) {
                console.log('rename file ERROR: ' + res);
                return await [];
            } else {
                try {
                    var file_path = new_path;
                    var f = {};
                    f.path = file_path;
                    f.size = file.size;
                    f.time = file.lastModifiedDate;
                    f.filename = filename;
                    return await f;
                } catch(e) {
                    console.error(e);
                }
            }
        },
    };
}

