const passport = require("passport");
const jwt = require("jsonwebtoken");

const verify = (token) => {
  try {
    // console.log(process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded :", decoded);
    return {
      ok: true,
      id: decoded.id,
      name: decoded.name,
      // role: decoded.role,
    };
  } catch (err) {
    // console.log(err);
    return {
      ok: false,
      message: err.message,
    };
  }
};
const authJWT = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split("Bearer ")[1]; // header에서 access token을 가져옵니다.

    const result = verify(token); // token을 검증합니다.
    if (result.ok) {
      // token이 검증되었으면 req에 값을 세팅하고, 다음 콜백함수로 갑니다.
      req.emailTest = result.id;
      req.nameTest = result.name;
      // req.role = result.role;
      next();
    } else {
      // 검증에 실패하거나 토큰이 만료되었다면 클라이언트에게 메세지를 담아서 응답합니다.
      res.status(401).send({
        ok: false,
        message: result.message, // jwt가 만료되었다면 메세지는 'jwt expired'입니다.
      });
    }
  }
};

module.exports = authJWT;

