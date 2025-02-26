
const ErrorMessage = require("../common/errorMessage");
const AppError = require("../config/appError");
const db = require("../models");
const { Op } = require("sequelize");

module.exports = {
    delete: async function (id) {
        try {

            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) {
                throw Error("잘못된 게시글입니다.");
            }

            const findBoard = await db.board.findOne({
                where: { id: parsedId }
            });
            if (!findBoard) {
                throw Error("게시글이 존재하지 않습니다.");
            }

            findBoard.destroy();
            return findBoard;
            
        } catch (error) {
            throw Error(error.message);
        }
    },

    deleteAll: async function (checkedIds) {
        try {

            if (!Array.isArray(checkedIds) || !checkedIds.every(id => typeof id === 'number')) {
                throw Error("잘못된 게시글입니다.");
            }

            const findBoards = await db.board.findAll({
                where: { id: { [Op.in]: checkedIds } }
            });
            if (findBoards.length === 0) {
                throw Error("게시글이 존재하지 않습니다.");
            }

            const deletedCount = await db.board.destroy({
                where: { id: { [Op.in]: checkedIds } }
            });
            return deletedCount;
            
        } catch (error) {
            throw Error(error.message);
        }
    },

    write: async function (req) {
        try {

            const { writer, title, description, categoryId, isNotice, memberId } = req.body;
            const file = req.file;
            if (!writer || !title || !description || !categoryId || !memberId) {
                throw Error("필수 입력값이 누락되었습니다.");
            };

            const newArticle = await db.board.create({
                writer, title, description, categoryId, isNotice, memberId
            });
        
            const fileId = newArticle.id;
            let fileUrl = null;
            if (file) {
                try {
                    const fileUrl = `/uploads/${file.filename}`
                    await db.file.create({ fileId, fileUrl })
                } catch (error) {
                    throw Error("파일 업로드 오류");
                };
            };

            return { newArticle, file: fileUrl };

        } catch (error) {
            throw Error(error.message);
        }
    },

    list: async function (req) {
        try {

            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const offset = (page - 1) * limit;
            
            const articles = await db.board.findAll({
                attributes: [
                    "id", "writer", "title", "createdAt", "updatedAt", "isNotice", "categoryId",
                    [db.Sequelize.col("category.category"), "categoryName"],
                    [db.Sequelize.literal("(SELECT COUNT(*) FROM comment WHERE comment.boardId = board.id AND comment.parent IS NULL)"), "commentCount"],
                    [db.Sequelize.literal("(SELECT COUNT(*) FROM file WHERE file.fileId = board.id)"), "fileCount"],
                ],
                include: [
                    {
                        model: db.category,
                    },
                    {
                        model: db.comment,
                        where: { parent: null },
                        required: false, // LEFT JOIN
                        attributes: [], // 개수만 세기 위해 임시로 기입
                    },
                    {
                        model: db.file,
                        required: false,
                        attributes: [],
                    },
                ],
                group: [
                    "board.id",
                    "board.writer",
                    "board.title",
                    "board.createdAt",
                    "board.updatedAt",
                    "board.isNotice",
                    "board.categoryId",
                    "category.category",
                ],
                order: [["isNotice", "DESC"], ["id", "DESC"]],
                limit,
                offset,
                subQuery: false,
            });

            const totalCount = await db.board.count(); // 게시물 전체 수 계산

            return { articles, totalCount, page, limit };

        } catch (error) {
            throw Error(error.message);
        }
    },

    search: async function (req) {
        try {

            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const offset = (page - 1) * limit; // 시작 위치
            const searchText = req.query.query;
            
            const total = await db.board.count({
                    include: [
                        {
                            model: db.category,
                            required: true, // INNER JOIN
                        }
                    ],
                    where: {
                        [Op.or]: [
                            { title: { [Op.like]: `%${searchText}%` } },
                            { writer: { [Op.like]: `%${searchText}%` } }
                        ]
                    }
            });
            const articles = await db.board.findAll({
                attributes: [
                    "id", "writer", "title", "createdAt", "updatedAt", "isNotice", "categoryId",
                    [db.Sequelize.col("category.category"), "categoryName"]
                ],
                include: [
                    {
                        model: db.category,
                        required: true,
                    }
                ],
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${searchText}%` } },
                        { writer: { [Op.like]: `%${searchText}%` } }
                    ]
                },
                order: [["isNotice", "DESC"], ["id", "DESC"]],
                limit: limit,
                offset: offset,
                subQuery: false,
            });

            return { articles, total, page, limit };
            
        } catch (error) {
            throw Error(error.message);
        }
    },   
    
    view: async function (id) {
            if (!id) {
                throw new AppError("해당 게시물이 없습니다.", 404);
            }
        
            const article = await db.board.findOne({
                attributes: [
                    "id", "memberId", "writer", "title", "description", "createdAt", "updatedAt", "isNotice", "categoryId", "fileUrl",
                    [db.Sequelize.col("category.category"), "categoryName"]
                ],
                include: [
                    {
                        model: db.category,
                    }
                ],
                where: { id }
            });
            const file = await db.file.findOne({
                attributes: ["fileUrl"],
                where: { fileId: id },
                order: [["id", "DESC"]]
            });
            const comment = await db.comment.findAll({
                where: {
                    boardId: id,
                    parent: null // 대댓글 제외
                },
                order: [["id", "ASC"]]
            });

            return { article, file, comment };
            
        
    },  

    modify: async function (req) {
        try {
            if (!req.paramsid) {
                throw new AppError(ErrorMessage.NOT_FOUND_BOARD, 404);
            }
            const id = parseInt(req.params.id, 10);
            const writer = req.body.formWriter;
            const title = req.body.formTitle;
            const description = req.body.formDescription;
            const category = req.body.formCategory;
            const updatedAt = req.body.formupdateDate;
            const file = req.file;
            const isNotice = req.body.isNotice;
            
            // 게시글 업데이트
            const boardResult = await db.board.update(
                {
                    writer: writer,
                    title: title,
                    description: description,
                    updatedAt: updatedAt,
                    categoryId: category,
                    isNotice: isNotice
                },
                {
                    where: { id }
                }
            );        
            // 파일 업데이트
            if (file) {
                // 기존 파일 삭제
                await db.file.destroy({
                    where: {
                        fileId: id
                    }
                });
                // 새 파일 업로드
                const fileUrl = `/uploads/${file.filename}`;
                await db.file.create({
                    fileId: id,
                    fileUrl: fileUrl
                });
            }

            return boardResult;
            
        } catch (error) {
            throw Error(error.message);
        }
    },  

}