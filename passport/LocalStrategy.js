const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const database = require('../routes/database');

const getConnection = async () => {
    return await database.getConnection(async (conn) => conn);
};

module.exports = () => {
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // console.log("name:", email);
          const connection = await getConnection();
          const query = "select * from member where email = ?";
          const [result] = await connection.query(query, [email]);
          connection.release();
          const findUser = result[0];
          if (findUser) {
            // console.log("password :", password);
            // console.log(findUser.password);
            const res = password === findUser.password;
            // const res = await bcrypt.compare(password, findUser.password);
            if (res) {
              done(null, findUser, { message: "info!!" });
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            done(null, false, { message: "해당 유저가 존재하지 않습니다." });
          }
        } catch (error) {
          console.log(error);
        }
      }
    )
  );
};
