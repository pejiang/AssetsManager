import base  from './model-base'
// let parent = new base({
//     name : "status",
//     fields: ["id", "changelist"]
// })
export default function(compatible) {
    let parent = base.use('status')
    return {
        create : async (d) => {
            return await parent.create(d);
        },
        update: async (id, d) =>{
            return await parent.update(id, d);
        },
        all : async () => {
            return await parent.all();
        },
        find: async (id) => {
            return await parent.find(id);
        },
        find_by:async(key,val) => {
            return await parent.find_by(key,val)
        },
        destroy:async(id) => {
            return await parent.destroy(id)
        }
    }
}
