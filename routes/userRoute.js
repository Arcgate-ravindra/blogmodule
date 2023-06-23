const {createUser, userlogin, getALLUser, getUser, updateuser, forgetpassword, resetpassword} = require('../controllers/userController');
const router = require('express').Router();
const validateRegData = require('../middlewares/regSchema');
const validateloginData = require('../middlewares/loginSchema')
const authorization = require("../middlewares/userAuthMiddleware");

router.post("/registration", validateRegData, createUser);
router.post("/userlogin", validateloginData, userlogin)
router.get("/getall", authorization,getALLUser);
router.get("/:username",authorization, getUser);
router.patch("/:username", updateuser);
router.post("/forgotpass", forgetpassword)
router.post("/resetpass", resetpassword)


module.exports = router;