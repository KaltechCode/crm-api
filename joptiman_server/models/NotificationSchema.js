const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    unRead:{
        type:Boolean,
        default:true
    },
    newPolicy:{
        type:Boolean,
        default:false,
    },
    newAgent:{
        type:Boolean,
        default:false,
    },
    source:{
        type:String,
    },
    agentCode:{
        type:String,
    },
    newAgentId:{
        type:String,
    },
    policyNumber:{
        type:String,
    },
    message:{
        type:String,
    },
    status:{
        type:Number,
        default:0,
    }
})

const Notification = mongoose.model("Notification",notificationSchema)
module.exports = Notification