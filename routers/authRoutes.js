const express = require("express");
const authController = require("../controllers/authController");
const auths = require("../middleware/auths")
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/logout', auths.checkJWT, authController.logout);

module.exports = router