const express = require('express');
const path = require('path');
const database = require('./database');
const router = express.Router();
const boardService = require("../service/boardService");
const categoryService = require("../service/categoryService");
const fileService = require("../service/fileService");
const commentService = require("../service/commentService");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // 파일 저장 경로
  },
  filename: function (req, file, cb) {
    // 난수 이름 생성 + 확장자 추가
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname); // 확장자 추출
    cb(null, uniqueName + ext); // 확장자 포함한 파일 이름
  },
});
const upload = multer({ storage: storage });

const getConnection = async () => {
    return await database.getConnection(async (conn) => conn);
};

// write
router.post('/', upload.single('file'), async function (req, res) { 
    try {
        const writeBoard = await boardService.write(req);
        res.json(writeBoard);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    } 
})

// list
router.get('/', async function (req, res) {
    try {
        const { articles, totalCount, page, limit } = await boardService.list(req);
        res.json({
            data: articles,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    } 
});

// search
router.get('/search', async function (req, res) {
    try {
        const { articles, totalCount, page, limit } = await boardService.search(req);
        res.json({
            data: articles,
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    } 
});

// category
router.get('/category/load', async function (req, res) {
    try {
        const result = await categoryService.load();
        res.json(result);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    } 
});
router.get('/category', async function (req, res) {
    try {
        const { articles, total, limit, page } = await categoryService.list(req);
        res.json({
            data: articles,
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    } 
});

//view
router.get('/:id', async function (req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const { article, file, comment } = await boardService.view(id);
        res.json({
            article,
            comment,
            file,
            id,
        });
    } catch (error) {
        next(error);
    } 
})

// delete
router.delete('/:id', async function (req, res) {
    try {
        const deletedBoard = await boardService.delete(req.params.id);
        res.json(deletedBoard);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    } 
})

// deleteAll
router.post('/select/delete', async function (req, res) {
    try {
        const { checkedIds } = req.body;
        const deleteAllBoard = await boardService.deleteAll(checkedIds);
        res.json(deleteAllBoard);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
})

// modify
router.put('/:id', upload.single('file'), async function (req, res) { 
    try {
        const boardResult = await boardService.modify(req);
        res.json(boardResult);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
})

// file delete
router.delete('/filedelete/:id', async function (req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await fileService.delete(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
})

// comment view
router.get('/comment/:id', async function (req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await commentService.list(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
});

// comment modify
router.put('/comment/modify/:id', async function (req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const content = req.body.content;
        const result = await commentService.modify(id, content);
        res.json(result);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
});

// comment write
router.post('/comment/write', async function (req, res) {
    try {
        const { boardId, writer, content, parent } = req.body; 
        const result = await commentService.write(boardId, writer, content, parent);
        res.json(result);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
})

// comment delete
router.delete('/comment/:id', async function (req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await commentService.delete(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
})

module.exports = router;