const router = require('express').Router();
const {blogCreate,blogUpdate,blogGetAll,blogget,blogdelete} = require("../controllers/blogController");
const validateBlog = require("../middlewares/blogSchema");
const authorization = require('../middlewares/userAuthMiddleware');


router.post("/create", authorization,validateBlog,blogCreate);
router.get("/getall",authorization, blogGetAll);
router.get("/get/:id",authorization, blogget);
router.patch("/update/:id", authorization,blogUpdate);
router.patch("/delete/:id", authorization,blogdelete);


module.exports = router; 