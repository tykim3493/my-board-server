const express = require('express');
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.post("/login", async function (req, res, next) {
  passport.authenticate("local", async (error, user, info) => {
    // console.log(user, info);
    if (error) {
      console.error(error);
      return next(error);
    }
    if (!user) {
      return res.json(info);
    }

    return req.login(user, { session: false }, (error) => {
      if (error) {
        return next(error);
      }
      // console.log(user);
      const newJwt = jwt.sign(
        {
          id: user.email,
          name: user.name,
        },
        process.env.JWT_SECRET,
        // { expiresIn: "1h" }
      );
      return res.json({ token: newJwt });
    });
  })(req, res, next);
});

module.exports = router;
