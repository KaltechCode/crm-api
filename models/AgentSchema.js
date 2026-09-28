const mongoose = require('mongoose')

const agentModel = new mongoose.Schema(
  {
    agentApprovalDate:{
      type:String
    },
    active:{
      type:Boolean,
      default:true,
    },
    isApproved:{
      type:Boolean,
      default:false
    },
    residentState: {
      type: String,
    },
    age: {
      type: String
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    level: {
      type: Number,
    },
    email: {
      type: String,
      // required: true,
    },
    confirmEmail: {
      type: String,
      // required: true,
    },
    OTP: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      // required:true,
    },
    agentCode: {
      type: String,
      // required: true,
    },
    agentTitle: {
      type: String,
    },
    agentRole: {
      type: String,
    },
    agentCarrierNumber: {
      type: String,
    },
    recruitmentDate: {
      type: String,
    },
    recruits: {
      type: Number,
    },
    commissionEarned: {
      type: Number,
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    recruitingAgentCode: {
      type: String,
      default: ""
    },
    phoneNumber: {
      type: Number,
      default: 0,
    },

    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: Number
    },
    activeLicense: {
      type: String
    },
    profilePic:{
      type:String,
    }

  }
);
const Agent = mongoose.model("Agent", agentModel);
module.exports = Agent; 