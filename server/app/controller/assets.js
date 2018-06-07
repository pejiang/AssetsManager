import model from '../model/assets'
module.exports = function(compatible) {
    return {
        create : async (d) => {
            return await model().create(d);
        },
        update: async (id, d) =>{
            return await model().update(id, d);
        },
        all : async () => {
            return await model().all();
        },
        find: async (id) => {
            return await model().find(id);
        },
        find_by:async(key,val) => {
            return await model().find_by(key,val)
        },
        destroy:async(id) => {
            return await model().destroy(id)
        },
        search:async(keyword) =>{
            return await model().search(keyword);
        }
    }
}