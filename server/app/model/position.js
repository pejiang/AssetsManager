import base from './model-base'
// let parent = new base({
//     name : "position",
//     fields: ["id", "history"]
// })
export default (compatible) => {
    let parent = base.use('position')
    return {
        create : async (d) => {
            return await parent.create(d);
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
        destroy:async(id) => {
            return await parent.destroy(id)
        }
    }
}
