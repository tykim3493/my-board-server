const db = require("../models");
const { Op } = require("sequelize");

module.exports = {
    list: async function (id) {
        try {
            
            const result = await db.comment.findAll({
                where: { boardId: id }
            });
            if (!result.length === 0) {
                throw Error("댓글이 존재하지 않습니다.");
            }

            return result;
            
        } catch (error) {
            throw Error(error.message);
        }
    },

    modify: async function (id, content) {
        try {

            const result = await db.comment.update(
                { content: content },
                { where: { id } }
            );

            return result;
            
        } catch (error) {
            throw Error(error.message);
        }
    },

    write: async function (boardId, writer, content, parent) {
        try {

            const result = await db.comment.create({
                boardId: boardId,
                writer: writer,
                content: content,
                parent: parent
            });
            const { id, createdAt } = result;
            const newComment = {
                boardId,
                writer,
                content,
                parent,
                createdAt,
                id,
            }

            return newComment;
            
        } catch (error) {
            throw Error(error.message);
        }
    },
        
    delete: async function (id) {
        try {

            const result = await db.comment.destroy({
                where: {
                    [Op.or]: [
                        { id: id },
                        { parent: id }
                    ]
                }
            });

            return result;
            
        } catch (error) {
            throw Error(error.message);
        }
    },

}