import model from '../model/fields'
module.exports = function(compatible) {
    return {
        update: async (d) =>{
            return await model().update(d);
        },
        all : () => {
            return model().all();
        },
    };
}