const mongoose = require('mongoose')

const CommissionSchema = new mongoose.Schema(
    {
        policyApprovalDate:{
            type:String,
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        isPaid:{
            type:Boolean,
            default:false,
        },
        isChargedBack:{
            type:Boolean,
            default:false
        },
        paidAgencyCommission:{
            type:Number,
            default:0,
        },
        date: {
            type: String,
        },
        policyRegistrationId: {
            type: String,
        },
        policyValue: {
            type: Number,
            //required:true,
        },
        agencyCommission: {
            type: Number,
            //required:true,
        },
        agencyCommissionPercentage: {
            type: Number,
        },
        agentCommission: {
            type: Number,
        },

        //Policy
        policySubmissionDate: {
            type: String,
            //required:true,
        },
        policyCarrier: {
            type: String,
            //required:true,
        },
        policyType: {
            type: String,
            //required:true,
        },
        policyNumber: {
            type: String,
            //required:true,
        },
        advPaymentPercentage: {
            type: Number,
        },
        advPayment: {
            type: Number
        },
        balance: {
            type: Number,
        },
        remainingPaymentPercentage: {
            type: Number,
        },
        commissionableAmountPercentage:{
            type: Number,
        },
        //Insured Details
        insuredFirstName: {
            type: String,
        },
        insuredLastName: {
            type: String,
        },
        policyStartDate: {
            type: String,
        },
        policyEndDate: {
            type: String,
        },

        //Agent
        agentFirstName: {
            type: String,
        },
        agentLastName: {
            type: String,
        },
        agentCode: {
            type: String,
            //required:true,
        },
        contractLevel: {
            type: Number,
            //required:true,
        },
        agentCarrierNumber: {
            type: String,
            //required:true,
        },

        //Split1
        split1_AgentFirstName: {
            type: String
        },
        split1_AgentLastName: {
            type: String
        },
        split1_AgentCode: {
            type: String,
            //required:true,
        },
        split1_ContractLevel: {
            type: Number,
            //required:true,
        },
        split1_AgentCarrierNumber: {
            type: String,
            //required:true,
        },
        split1_splitRatio: {
            type: Number,
        },
        split1_agentCommission: {
            type: Number,
        },

        //Split 2 
        split2_AgentFirstName: {
            type: String
        },
        split2_AgentLastName: {
            type: String
        },
        split2_AgentCode: {
            type: String,
            //required:true,
        },
        split2_ContractLevel: {
            type: Number,
            //required:true,
        },
        split2_AgentCarrierNumber: {
            type: String,
            //required:true,
        },
        split2_agentCommission:{
            type:Number,
        },
        split2_splitRatio: {
            type: Number,
        },

        splitPercentage : {
            type:Number,
            default:1,
        },

        //OverwritingAgent
        overwrittingAgentFirstName1: {
            type: String,
        },
        overwrittingAgentLastName1: {
            type: String,
        },
        overwrittingAgentCode1: {
            type: String,
        },
        overwrittingAgentContractLevel1: {
            type: Number,
        },
        overwrittingAgentCarrierNumber1: {
            type: String,
        },
        overwrittingAgentCommission1: {
            type: Number
        },
        overwrittingAgentFirstName2: {
            type: String,
        },
        overwrittingAgentLastName2: {
            type: String,
        },
        overwrittingAgentCode2: {
            type: String,
        },
        overwrittingAgentContractLevel2: {
            type: Number,
        },
        overwrittingAgentCarrierNumber2: {
            type: String,
        },
        overwrittingAgentCommission2: {
            type: Number
        },

        //Split1 OW1
        split_1_OWAgent1_FirstName: {
            type: String,
        },
        split_1_OWAgent1_LastName: {
            type: String,
        },
        split_1_OWAgent1_AgentCode: {
            type: String,
        },
        split_1_OWAgent1_ContractLevel: {
            type: Number,
        },
        split_1_OWAgent1_AgentCarrierNumber: {
            type: String,
        },
        split_1_OWAgent1_Commission: {
            type: Number
        },


        //Split1 OW2
        split_1_OWAgent2_FirstName: {
            type: String,
        },
        split_1_OWAgent2_LastName: {
            type: String,
        },
        split_1_OWAgent2_AgentCode: {
            type: String,
        },
        split_1_OWAgent2_ContractLevel: {
            type: Number,
        },
        split_1_OWAgent2_AgentCarrierNumber: {
            type: String,
        },
        split_1_OWAgent2_Commission: {
            type: Number
        },

        //Split2 OW
        split_2_OWAgent1_FirstName: {
            type: String,
        },
        split_2_OWAgent1_LastName: {
            type: String,
        },
        split_2_OWAgent1_AgentCode: {
            type: String,
        },
        split_2_OWAgent1_ContractLevel: {
            type: Number,
        },
        split_2_OWAgent1_AgentCarrierNumber: {
            type: String,
        },
        split_2_OWAgent1_Commission: {
            type: Number
        },
        split_2_OWAgent2_FirstName: {
            type: String,
        },
        split_2_OWAgent2_LastName: {
            type: String,
        },
        split_2_OWAgent2_AgentCode: {
            type: String,
        },
        split_2_OWAgent2_ContractLevel: {
            type: Number,
        },
        split_2_OWAgent2_AgentCarrierNumber: {
            type: String,
        },
        split_2_OWAgent2_Commission: {
            type: Number
        },

        //Policy Cancellation Details
        cancellationDate: {
            type: String,
        },
        cancellationAmount: {
            type: Number,
        },
        chargebackAmount: {
            type: Number,
        },
        chargeBackDate: {
            type: String,
        },

        //Cancellation Agent details
        cancellationAgentFirstName: {
            type: String,
        },
        cancellationAgentLastName: {
            type: String,
        },
        cancellationAgentCode: {
            type: String,
            //required:true,
        },
        cancellationAgentContractLevel: {
            type: Number,
            //required:true,
        },
        cancellationAgentCarrierNumber: {
            type: String,
            //required:true,
        },

    }
)

const Commission = mongoose.model("Commission",CommissionSchema);
module.exports = Commission;