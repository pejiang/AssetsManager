import fs from 'fs'

const filePath = __dirname + '/../config/fieldsConfig.js';

function __readFile(name) {
    let ret;
    try {
        ret = fs.readFileSync(name, { encoding: 'utf8' });
        return JSON.parse(ret);
    } catch (e) {
        console.error('read file ', name, e, ret)
        return {};
    }
}

function __writeFile(filePath, content){
    var self = __writeFile;
    self.writting = true;
    return new Promise(function (resolve, reject) {
        fs.writeFile(filePath, content, function (err) {
            if (err) return reject(err)
            self.writting = false;
            resolve()
        })
    })
}

module.exports = function(compatible) {
    return {
        update: async (d) =>{
            return await __writeFile(filePath,JSON.stringify(d));
        },
        all : () => {
            return __readFile(filePath);
        },
    };
}