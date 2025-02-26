const db = require("../models");

module.exports = {
    load: async function (id) {
        try {

            const result = await db.category.findAll({
            attributes: [
                "id",
                [db.Sequelize.col("category.category"), "categoryName"]
            ]
            });
            
            return result;
            
        } catch (error) {
            throw Error(error.message);
        }
    },
    list: async function (category, limit, offset) {
        try {

            const category = req.query.query; // categoryId 받기
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const offset = (page - 1) * limit;
            
            //categoryId가 일치하는 게시글 뽑기
            const articles = await db.board.findAll({
                attributes: [
                    "id", "writer", "title", "createdAt", "updatedAt", "isNotice", "categoryId",
                    [db.Sequelize.col("category.category"), "categoryName"]
                ],
                include: [
                    {
                        model: db.category,
                    },
                ],
                where: { categoryId: category },
                order: [["isNotice", "DESC"], ["id", "DESC"]],
                limit,
                offset
            });
            // categoryId가 일치하는 게시글 수 계산하여 total에 저장
            const total = await db.board.count({
                where: { categoryId: category }
            });
            
            return { articles, total, limit, page };
            
        } catch (error) {
            throw Error(error.message);
        }
    },

}