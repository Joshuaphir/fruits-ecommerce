const express = require("express");
const FruitsControllers = require("./../controllers/FruitsController")
const authController = require("./../controllers/AuthController")

const router = express.Router();

router.route('/')
.post(authController.protect ,FruitsControllers.createFruit)
.get(FruitsControllers.getAllFruit)
 
router.route('/:id')
.get(FruitsControllers.getSingleFruit)
.patch(authController.protect ,FruitsControllers.updateFruit)
.delete(authController.protect, 
    authController.roleDefiner("admin","seller"), 
    FruitsControllers.deleteFruit);

module.exports = router;