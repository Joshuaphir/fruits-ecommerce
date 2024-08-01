
const express = require("express");
const usersControllers = require("./../controllers/userController");
const authController = require("./../controllers/AuthController")

const router = express.Router();
//other user routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetpassword', authController.forgetPass);
router.patch('/resetpassword/:token', authController.resetPass)

//routes for users
router.route('/')
.get(usersControllers.getAllUsers)
.post(usersControllers.createUser);

router.route('/:id')
.get(usersControllers.getUser)
.patch(usersControllers.updateUser)
.delete(usersControllers.deleteUser);

module.exports = router;