/*!
 * Koa on Rails
 * Copyright(c) 2016 pkuleon@gmail.com
 */

import config from '../config'
import {cli} from '../util'
import wrapper from 'co-redis'


config.auth && cli.auth(config.auth);
const redisCo = wrapper(cli);

module.exports = function (opt) {
    var table = opt.name,
        err_table = opt.err_name,
        fields = opt.fields || [];

    var default_record = function () {
            var r = {};
            for (var i in self.fields) r[self.fields[i]] = '';
            return r;
        },
        merge = function (a, b) {
            // merge 2 objects
            for (var i in b) {
                // field valid
                if (self.fields.includes(i)) {
                    a[i] = b[i];
                }
            }
            return a;
        };
    function redis_send_co () {
        var args = Array.prototype.slice.call(arguments);
        for (var i in args) typeof args[i] === 'object' && (args[i] = JSON.stringify(args[i]));
        // return new Promise((resolve,reject) => {
        //     var n = args.shift();
        //     // console.log(n,cli)
        //     // args.push(callback);
        //     cli[n].apply(cli, args);
        //     resolve('success')
        //     // cli.hgetall(table, callback);
        // })
        return function (callback) {
            var n = args.shift();
            // args.unshift(table);
            args.push(callback);
            let ret = cli[n].apply(cli, args);
            // cli.hgetall(table, callback);
        }();
    }
    var self = {
        fields:opt.fields,
        table: table,
        send: redis_send_co,
        create: async (data) => {
            var src = merge(default_record(), data || {});
            src.id = data.id || new Date().getTime();
            var res = await self.send('hset', table, src.id, src);
            return src;
            // self.exist(id, function(err, stats){
            //     if (err || !stats){
            //         self.update(id, data, function(err){
            //             fn && fn(err ? {err:2, data:err} : null)
            //         })
            //     }else{
            //         fn && fn({err:6})
            //     }
            // })
        },
        exist: function * (id) {
            return yield self.send('hexists', table, id);
        },
        all: async (o) => {
            o = o || {};
            let res = await redisCo.hgetall(table) || {},
            // var res = await self.send('hgetall', table) || {},
                data = [],
                err = 0;
            for (var i in res) {
                try {
                    var r = JSON.parse(res[i]);
                    r.id = i;
                    data.push(r);
                } catch (e) {
                    if (err > 999) {
                        break;
                    } else {
                        err++;
                        continue;
                    }
                }
            }

            // for sort
            o.sort &&
        data.sort(
            typeof o.sort.value === 'function'
                ? o.sort.value
                : {
                    alpha: function (a, b) {
                        return String(a[o.sort.value]).localeCompare(String(b[o.sort.value]));
                    },
                    numeric: function (a, b) {
                        return a[o.sort.value] && b[o.sort.value] ? a[o.sort.value] - b[o.sort.value] : 0;
                    }
                }[o.sort.type || 'alpha'] || function () {}
        );
            return data;
        },
        alllist: async (o) => {
            o = o || {};
            var data = [];
            // var llen = yield self.send('llen',table);
            // var res = yield self.send("lrange",table,0,llen-1) || {};
            var llen = await redisCo.llen(table);
            var res = await redisCo.lrange(table,0,llen -1) || {}
            return res;
        },
        allerr: async (o) => {
            o = o || {};
            // var res = yield self.send("lrange",err_table,0,-1) || {};
            var res = await redisCo.lrange(err_table,0,-1) || {};
            return res;
        },
        find: async (id) => {
            var res = await redisCo.hget(table, id);
            if (res) {
                try {
                    return JSON.parse(res.toString());
                } catch (e) {
                    return null;
                }
            }
            return null; // (res && res.toString()) || [];
            /*
            return yield (function(){
                return function(callback){
                    cli.hget(table, id, function(err, data){
                        callback(data && data.toString())
                        // fn && fn(err ? {err:3, data:err} : null, data && data.toString())
                    })
                }
            })() */
        },
        find_by: async (key, value) => {
            var data = await self.all() || [];
            for (var i = 0; i < data.length; i++) {
                if (data[i] && data[i][key] == value) return await data[i];
            }
            return [];
        },
        store: function * () {},
        update: async (id, data) => {
            var src = await self.find(id);
            if (src) {
                var res = await self.send('hset', table, id, merge(src,data));
                // var res = await redisCo.hset(table, id, merge(src, data));
                return src || [];
            } else {
                return [];
            }
            // cli.hset(table, id, data, function(err){
            //     fn && fn(err ? {err:4, data:err} : null)
            // })
        },
        destroy: async (id) => {
            if (id == '*') {
                await redisCo.del(table);
            } else if (id != null) {
                // yield self.send('hdel', table, id);
                await redisCo.hdel(table,id)
            }
            return [];
            // cli.hdel(table, id, function(err){
            //     fn && fn(err ? {err:5, data:err} : null)
            // })
        }
    };
    return self;
};
