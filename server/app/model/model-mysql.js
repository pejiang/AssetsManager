/* eslint-disable require-yield */
import {db} from '../sqldb'

async function exec(sql, querytype, useTransaction) {
    let query = typeof querytype === 'object' ? querytype : {type: db.sequelize.QueryTypes[querytype]};
    if (useTransaction) {
        return new Promise((resolve, reject) => {
            db.sequelize.transaction(t => {
                resolve(db.sequelize.query(sql, query));
            }).catch(e => {
                reject(e);
            });
        });
    } else {
        return await db.sequelize.query(sql, query);
    }
}

var self = {
    exec: exec,
    create: async (data, association) => {
        if(association){
            // console.log(11111111, db[self.name].prototype)
            return await db[self.name].create(data, {include: [association]});
        }else{
            return await db[self.name].create(data);
        }

    },
    exist: async (id) => {

    },
    all: async (options) => {
        console.log('get all with options:', options)
        // if(options && options.association){
        //     return await db[self.name].findAll({
        //         where: options.o,
        //         include: [
        //             {
        //                 model: db[options.association],
        //                 as: 'status'
        //             }
        //         ],
        //         order: [
        //             options.sort || [['id', 'ASC']],
        //             ['status', 'uid', 'DESC']
        //         ],
        //     });
        // }else{
        //     return await db[self.name].findAll({
        //         where: options.o,
        //         order: options.sort || [['id', 'ASC']]
        //     });
        // }

        return await db[self.name].findAll(options)
    },
    find_and_count_all: async (options) => {
        console.log('get limit with options:', options)
        return await db[self.name].findAndCountAll(options);
    },
    /**
     * 获取所有数据
     *
     * @param    {string}  pk     primary key
     * @returns  [] 数据集
     *
     */
    find: async (pk) => {
        return await db[self.name].findByPk(pk);
    },
    count: async () => {
        return await db[self.name].count();
    },
    find_by: async (key, value) => {
        let table = db[self.name];
        let option = {
            replacements: [value],
            model: table, // model映射的表
            type: db.sequelize.QueryTypes.QUERY // 操作类型
        };
        return await exec(`select * FROM ${self.name}s where ${key} = ?`, option);
    },
    update: async (data) => {
        return await db[self.name].upsert(data);
    },
    destroy: async (condition) => {
        return await db[self.name].destroy({where: condition});
    }
}

self.use = function (modelName) {
    if (!db[modelName]) {
        db[modelName] = db.sequelize.import(`./../model/${modelName}_table`);
    }
    self.name = modelName;
    return self;
};

module.exports = self;


