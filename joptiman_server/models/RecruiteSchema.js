const mongoose = require('mongoose')

const RecruitsSchema = mongoose.Schema(
    {
      name:{
        type:String,
        required:true,
      },  
      level:{
        type:Number,
        required:true,
      },  
      recruitingAgentCode:{
        type:String,
        required:true,
      },  
      agentTitle:{
        type:String,
        required:true,
      },
      agentRole:{
        type:String,
        required:true,
      },
      recruitmentDate:{
        type:String,
      },
      recruits:{
        type:Number,
        required:true,
      },
      commissionEarned:{
        type:String,
        required:true,
      },
      licensed:{
        type:String,
        required:true,
      },
      residenceState:{
        type:String,
        required:true,
      },
      address:{
        type:String,
        required:true,
      },
      email:{
        type:String,
        required:true,
      },
      img:{
        type:String
      }

    }
)

const Recruits = mongoose.model("Recruits",RecruitsSchema)
module.exports = Recruits