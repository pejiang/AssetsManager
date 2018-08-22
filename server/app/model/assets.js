import fs from 'fs'
import {log} from '../util'
import position from '../controller/position'
import fields_cl from '../controller/fields'
import status from '../controller/status'

// var parent = require('./model-base')({
//     name : "assets",
//     fields: ["name", "mac", "stats", "position", "battery"]
// });

import base  from './model-base'
let parent = new base({
    name : "assets",
    fields: ["name", "mac", "stats", "position", "battery"]
})


module.exports = function(compatible) {
    return Object.assign({}, parent, {
        create : async (d,user) => {
            parent.fields = fields_cl().all();
            let obj = d.fields || d;
            obj.position = await position().find(obj.mac);
            obj.deleted = false;
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

            status().create({
                id:obj.id,
                changelist:[{
                    why:"资产入库",
                    by:user,
                    time:Date.now()
                }]
            })
            return await parent.create(obj);
        },
        update: async (id, d,user) =>{
            let asset = await parent.find(id);
            let obj = d.fields || d;
            console.log(obj,asset);
            if(obj.note == asset.note){
                return await "no change";
            }else{
                let ret = await status().find(id);
                console.log(1111111,ret)
                ret.changelist.push({why:obj.note,by:user,time:Date.now()});
                status().update(id,ret);
            }
            return await parent.update(id, obj);
        },
        all : async () => {
            let ret =  await parent.all();
            ret = ret.sort((a,b) => {
                return a.id - b.id;
            })

            return ret;
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
    });
}

