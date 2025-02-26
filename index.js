const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
// const fileUpload = require('express-fileupload'); // multer와 충돌 있음
const todos = require('./routes/todos')
const boards = require('./routes/boards')
const members = require('./routes/members')
const auth = require('./routes/auth')
// const videos = require('./routes/videos')
const path = require('path');
const app = express()
const db = require('./models')

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // 쿼리 사용
app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.json());
// app.use(fileUpload());
db.sequelize.sync({ force: false }) // ORM이 테이블을 생성할 수 없도록
    .then(() => {
        console.log("DB연결 성공")
    })
    .catch(() => {
        console.log("DB연결 실패")
    })

app.use('/todos', todos)
app.use('/board', boards)
app.use('/members', members)
app.use('/auth', auth)
// app.use('/videos', videos)
app.use(express.static(path.join(__dirname, '/'))); // 정적 파일 제공

// 패스포트,세션 관련
const passport = require("passport");
const session = require("express-session");
require("./passport/LocalStrategy")();
require('dotenv').config();
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((error, req, res, next) => {
  console.log("error :", error);
  const { message, statusCode = 500 } = error;
  res.status(statusCode).json({
    message,
    statusCode,
  });
});
app.listen(3000)