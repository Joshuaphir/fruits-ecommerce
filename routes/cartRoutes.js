const express = require("express");
const cartController = require("./../controllers/cartController")
const authController = require("./../controllers/AuthController")

const router = express.Router();

router.route('/')
.post(authController.protect ,cartController.addToCart)
.get(authController.protect, cartController.getCart)
.delete(authController.protect, cartController.removeFromCart);

module.exports = router;