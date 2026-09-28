const express = require('express');
const router = express.Router()
const {protect} = require('../middleware/authUser')
const userController = require('../controller/userController')


router.post("/SignUp",userController.register),
router.post("/login",userController.login),
router.post("/forgetPassword",userController.ForgetPassword)
router.post("/verifyOTP",userController.VerifyOtp)
router.post("/resetPassword",userController.ResetPassword)
router.post("/updateAdminAccount",protect,userController.updateAdminAccount)
router.get("/getAccountDetails",protect,userController.getAccountDetails)

module.exports=router