const {createAddress,updateaddress} = require('../controllers/addressController');
const router = require('express').Router();
const validateAddressData = require('../middlewares/addressSchema');
const {verifyToken,adminAccess,userAccess,logoutChk} = require("../middlewares/userAuthMiddleware");

router.post("/acreate", verifyToken, logoutChk, userAccess, validateAddressData, createAddress);
router.patch("/:user_id", verifyToken, logoutChk, userAccess, updateaddress);


module.exports = router;

