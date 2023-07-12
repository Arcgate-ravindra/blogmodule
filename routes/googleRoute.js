const router = require("express").Router();
const passport = require("../config/googleAuth.config");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Use the Google authentication strategy
router.use(passport.initialize());
// Use express-session middleware
router.use(passport.session());

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/callback/success",
    failureRedirect: "/auth/callback/failure",
  })
);

// Success
router.get("/callback/success", (req, res) => {
  if (!req.user) {
    res.redirect("/callback/failure");
  }
  const userId = req.user;
  const accessToken = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_KEY, {
    expiresIn: "1y",
  });
  res.status(200).send({
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
});

// failure
router.get("/callback/failure", (req, res) => {
  res.send("Error");
});


module.exports = router;
