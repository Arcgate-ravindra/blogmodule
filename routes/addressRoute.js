const {createAddress,updateaddress} = require('../controllers/addressController');
const router = require('express').Router();
const validateAddressData = require('../middlewares/addressSchema');

router.post("/acreate", validateAddressData, createAddress);
// router.patch("/:user_id", updateaddress);


module.exports = router;

