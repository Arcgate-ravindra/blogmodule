const {createUser, userlogin, getALLUser, getUser, updateuser, delUser,forgetpassword, resetpassword, fileUplaod, generateToken, logout} = require('../controllers/userController');
const router = require('express').Router();
const validateRegData = require('../middlewares/regSchema');
const validateloginData = require('../middlewares/loginSchema')
const {verifyToken,adminAccess,userAccess,logoutChk} = require("../middlewares/userAuthMiddleware");

router.post("/registration", validateRegData, createUser);
router.post("/userlogin", validateloginData, userlogin)
router.get("/getall", verifyToken,logoutChk, adminAccess,getALLUser);
router.get("/:username", verifyToken, logoutChk,userAccess,getUser);
router.patch("/:username", verifyToken,logoutChk,userAccess,updateuser);
router.post("/forgotpass", forgetpassword);
router.post("/resetpass",resetpassword);
router.post("/upload", verifyToken,userAccess,fileUplaod);
router.post("/generatetoken", generateToken)
router.delete("/logout", verifyToken, userAccess, logout);
router.delete("/delete/:id", verifyToken, logoutChk, adminAccess, delUser)

module.exports = router;