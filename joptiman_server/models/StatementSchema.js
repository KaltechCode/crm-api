const mongoose = require('mongoose')

const statementSchema = new mongoose.Schema({
    isPaidOut:{
        type:Boolean,
    },
    status:{
        type:String,
    },
    isChargedBack: {
        type:Boolean,
        default:false
    },
    paidOutDate: {
        type: String,
    },
    policyCarrier: {
        type: String,
    },
    policyNumber: {
        type: String,
    },
    agentCarrierNumber: {
        type: String,
    },
    premium: {
        type: Number,
    },
    balance: {
        type: Number
    },
    splitPercentage: {
        type: Number,
    },
    agencyCommission: {
        type: Number,
    },
    agentCommission: {
        type: Number,
    },
    agentCode: {
        type: String,
    },
    contractLevel: {
        type: Number,
    },
    agentFirstName: {
        type: String,
    },
    agentLastName: {
        type: String,
    },
    insuredFirstName: {
        type: String
    },
    insuredLastName: {
        type: String,
    },
    commisionableAmount: {
        type: Number,
    },
    advPaymentPercentage: {
        type: Number,
    },
    overwrittingAgentContractLevel1: {
        type: Number,
    },
    overwrittingAgentCode1: {
        type: String,
    },
    overwrittingAgentCommission1: {
        type: Number,
    },
    overwrittingAgentContractLevel2: {
        type: Number,
    },
    overwrittingAgentCode2: {
        type: String,
    },
    overwrittingAgentCommission2: {
        type: Number,
    },

    //Split1
    split1_AgentCode: {
        type: String,
    },
    split1_ContractLevel: {
        type: Number,
        //required:true,
    },
    split1_agentCommission: {
        type: Number,
    },
    split1_splitRatio: {
        type: Number,
    },

    //Split1 OW1
    split_1_OWAgent1_AgentCode: {
        type: String
    },
    split_1_OWAgent1_ContractLevel: {
        type: Number,
    },
    split_1_OWAgent1_Commission: {
        type: Number
    },


    //Split1 OW2
    split_1_OWAgent2_AgentCode: {
        type: String,
    },
    split_1_OWAgent2_ContractLevel: {
        type: Number,
    },
    split_1_OWAgent2_Commission: {
        type: Number
    },


    //Split2
    split2_AgentCode: {
        type: String,
    },
    split2_ContractLevel: {
        type: Number,
        //required:true,
    },
    split2_agentCommission: {
        type: Number,
    },
    split2_splitRatio: {
        type: Number,
    },

    //Split2 OW1
    split_2_OWAgent1_AgentCode: {
        type: String
    },
    split_2_OWAgent1_ContractLevel: {
        type: Number,
    },
    split_2_OWAgent1_Commission: {
        type: Number
    },

    //Split2 OW2
    split_2_OWAgent2_AgentCode: {
        type: String,
    },
    split_2_OWAgent2_ContractLevel: {
        type: Number,
    },
    split_2_OWAgent2_Commission: {
        type: Number
    },




})

const Statement = mongoose.model("Statement", statementSchema)
module.exports = Statement;