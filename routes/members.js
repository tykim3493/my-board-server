const express = require('express');
const router = express.Router();
const authJWT = require("../middlewares/jwt");
const database = require('./database');
const memberService = require("../service/memberService");

const getConnection = async () => {
    return await database.getConnection(async (conn) => conn);
};

router.post("/", async function (req, res) {
  const { email, password, name } = req.body;
  const newMember = await memberService.join(email, password, name);
  res.json(newMember);
});

router.get("/", authJWT, async function (req, res) {
  const member = await memberService.login(req);
  res.json(member);
});

module.exports = router;
