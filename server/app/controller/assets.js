import model from '../model/assets'
module.exports = function(compatible) {
    return {
        create : async (d,user) => {
            return await model().create(d,user);
        },
        update: async (id, d,user) =>{
            return await model().update(id, d,user);
        },
        all : async (options) => {
            return await model().all(options);
        },
        find_and_count_all: async (options) => {
            return await model().find_and_count_all(options);
        },
        find: async (id) => {
            return await model().find(id);
        },
        find_by:async(key,val) => {
            return await model().find_by(key,val)
        },
        import:async(body, user) => {
            var ret = await model().upload(body, user);
            if (!ret) {
                return {code: 1, msg: 'File Error'};
            }
            return ret;
        },
        export:async(ids, type, options) => {
            let assets;
            if(ids === 'all') {
                assets = await model().all(options);
            }

            if(!assets) return {err: 'no asset found'};
            return await model().export(assets, type)
        },
        destroy:async(id) => {
            return await model().destroy(id)
        },
        search:async(options) =>{
            return await model().find_and_count_all(options);
        }
    }
}