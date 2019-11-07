import base from './model-base'
export default (compatible) => {
    let parent = base.use('image')
    return {
        create : async (d) => {
            return await parent.create(d);
        },
        bulk_create: async (d) => {
            return await parent.bulk_create(d);
        },
        update: async (id, d) =>{
            return await parent.update(id, d);
        },
        all : async (options) => {
            return await parent.all(options);
        },
        find: async (id) => {
            return await parent.find(id);
        },
        find_by:async(key,val) => {
            return await parent.find_by(key, val)
        },
        find_and_count_all : async (options) => {
            return await parent.find_and_count_all(options);
        },
        destroy:async(id) => {
            return await parent.destroy(id)
        }
    }
}
