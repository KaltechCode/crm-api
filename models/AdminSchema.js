const mongoose = require('mongoose')

const adminSchema =new mongoose.Schema(
    {
      firstName:{
        type:String,
        required:true,
      },
      lastName:{
        type:String,
        required:true,
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
      isAdmin:{
        type:Boolean,
        default:true,
      },
      adminCode:{
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


const Admin = mongoose.model("Admin",adminSchema);

module.exports = Admin;