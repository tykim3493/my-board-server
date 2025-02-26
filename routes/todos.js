const express = require('express');
const router = express.Router();
const database = require('./database');

const getConnection = async () => {
    return await database.getConnection(async (conn) => conn);
};

// CREATE
router.post('/', async function (req, res) {
    const content = req.body.content;
    const status = req.body.status;
    const connection = await getConnection();
    const query = "insert into todo (content, status) values(?, ?)";
    const [result] = await connection.query(query, [content, status]);
    connection.release();
    res.json({ id: result.insertId, content: content, status: status });
})

// READ
router.get('/', async function (req, res) {
    const connection = await getConnection();
    const query = "SELECT * FROM todo";
    const [result] = await connection.query(query);
    connection.release();
    res.json(result);
})

// UPDATE
router.put('/:id', async function (req, res) {
    const id = parseInt(req.params.id, 10);
    const content = req.body.content;
    const status = req.body.status;
    const connection = await getConnection();
    const query = "update todo set content = ?, status = ? where id = ?";
    const [result] = await connection.query(query, [content, status, id]);
    connection.release();
    res.json(result);
})

// DELETE
router.delete('/:id', async function (req, res) {
    const id = parseInt(req.params.id, 10);
    const connection = await getConnection();
    const query = "delete from todo where id = ?";
    const [result] = await connection.query(query, [id]);
    connection.release();
    res.json(result);
})

// id 입력값에 해당하는 객체의 내용만 상세보기
router.get('/:id', async function (req, res) {
    const id = parseInt(req.params.id, 10);
    const connection = await getConnection();
    const query = "select content from todo where id = ?";
    const [result] = await connection.query(query, [id]);
    connection.release();
    res.json(result[0]);
})

module.exports = router;