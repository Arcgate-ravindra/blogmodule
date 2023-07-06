const router = require('express').Router();
const {blogCreate,blogUpdate,blogGetAll,blogget,blogdelete} = require("../controllers/blogController");
const validateBlog = require("../middlewares/blogSchema");
const{verifyToken,userAccess,logoutChk}  = require('../middlewares/userAuthMiddleware');


router.post("/create",verifyToken, logoutChk,userAccess,validateBlog,blogCreate);
router.get("/getall",verifyToken, logoutChk,userAccess,blogGetAll);
router.get("/get/:id", verifyToken, logoutChk,userAccess,blogget);
router.patch("/update/:id", verifyToken, logoutChk,userAccess,blogUpdate);
router.delete("/delete/:id",verifyToken, logoutChk,userAccess,blogdelete);


module.exports = router; 