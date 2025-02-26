const db = require("../models");

module.exports = {
    delete: async function (id) {
        try {

            const result = await db.file.destroy({
                where: { fileId: id }
            });

            return result;
            
        } catch (error) {
            throw Error(error.message);
        }
    },

}