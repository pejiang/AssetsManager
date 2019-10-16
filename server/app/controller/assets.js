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
        destroy:async(id) => {
            return await model().destroy(id)
        },
        search:async(options) =>{
            return await model().find_and_count_all(options);
        }
    }
}