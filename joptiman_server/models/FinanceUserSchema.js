const mongoose = require('mongoose')

const FinanceUser =new mongoose.Schema(
    {
      firstName:{
        type:String,
        required:true,
      },
      lastName:{
        type:String,
      },
      email:{
        type:String,
        required:true,
      },
      OTP:{
        type:String,
      },
      password:{
        type:String,
        required:true,
      },
      verified:{
        type:Boolean,
        default:false
      },
      isFinanceUser:{
        type:Boolean,
        default:true
      },
      code:{
        type:String,
      },
      phoneNumber:{
        type:Number,
      },
      profilePic:{
       type:String,
      }

    }
);


const Finance = mongoose.model("Finance",FinanceUser);

module.exports = Finance;