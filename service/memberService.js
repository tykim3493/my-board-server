const db = require("../models");
const { Op } = require("sequelize");

module.exports = {
    join: async function (email, password, name) {
        try {

            const newMember = await db.member.create({ email, password, name });
            return newMember;
            
        } catch (error) {
            throw Error(error.message);
        }
    },

    login: async function (req) {
        try {

            const member = await db.member.findOne({
                where: { email: req.emailTest },
                include: [
                { model: db.board },
                ]
            });
            return member;
            
        } catch (error) {
            throw Error(error.message);
        }
    },

}