const {
    listDocs,
    findDoc,
    findDocById,
    updateDoc,
    updateMatchingDoc,
    deleteDoc,
    insertDoc,
    saveDoc,
} = require("../store");

exports.addNewPolicy = async (req, res) => {
    try {

        let { policySubmissionDate, policyValue, policyCarrier, policyType, policyNumber, advPaymentPercentage,
            agentCode, contractLevel, agentCarrierNumber, insuredFirstName, insuredLastName, split1_AgentFirstName, split1_AgentLastName, split1_AgentCode,
            split1_ContractLevel, split1_AgentCarrierNumber, split1_splitRatio, split2_AgentFirstName, split2_AgentLastName, split2_AgentCode, split2_ContractLevel, split2_AgentCarrierNumber,
            split2_splitRatio,

        } = req.body

        function generatePolicyRegistrationId(length) {
            const chars = '0123456789';
            let code = '';

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                code += chars[randomIndex];
            }

            return code;
        }

        if (!policySubmissionDate || !policyValue || !policyCarrier || !policyType || !policyNumber || !agentCode || !contractLevel || !agentCarrierNumber || !insuredFirstName || !insuredLastName) {
            res.status(400).send({ "message": "Please fill all fields" })
        }
        else {
            let agentFirstName = "";
            let agentLastName = "";
            let overwrittingAgentFirstName1 = "";
            let overwrittingAgentLastName1 = "";
            let overwrittingAgentCode1 = "";
            let overwrittingAgentContractLevel1 = "";
            let overwrittingAgentCarrierNumber1 = "";
            let overwrittingAgentFirstName2 = "";
            let overwrittingAgentLastName2 = "";
            let overwrittingAgentCode2 = "";
            let overwrittingAgentContractLevel2 = "";
            let overwrittingAgentCarrierNumber2 = "";
            let splitPercentage = (split1_splitRatio
                ? (
                    split2_splitRatio
                        ? (
                            1 - (parseFloat(split1_splitRatio) + parseFloat(split2_splitRatio))
                        )
                        : 1 - parseFloat(split1_splitRatio)
                )
                : 1).toFixed(2);

            const agent = await findDoc("agents", { agentCode: agentCode })


            if (agent) {
                recruitingAgentCode = agent.recruitingAgentCode;
                agentFirstName = agent.firstName;
                agentLastName = agent.lastName;

                if (recruitingAgentCode) {
                    const recruitingAgent = await findDoc("agents", { agentCode: recruitingAgentCode })
                    if (recruitingAgent !== "") {
                        overwrittingAgentFirstName1 = recruitingAgent.firstName,
                            overwrittingAgentLastName1 = recruitingAgent.lastName,
                            overwrittingAgentCode1 = recruitingAgent.agentCode,
                            overwrittingAgentContractLevel1 = recruitingAgent.level,
                            overwrittingAgentCarrierNumber1 = recruitingAgent.agentCarrierNumber
                    }

                    let recruitingAgentCode2 = recruitingAgent.recruitingAgentCode

                    if (recruitingAgentCode2) {
                        const recruitingAgent2 = await findDoc("agents", { agentCode: recruitingAgentCode2 })
                        if (recruitingAgent2 !== "") {
                            overwrittingAgentFirstName2 = recruitingAgent2.firstName,
                                overwrittingAgentLastName2 = recruitingAgent2.lastName,
                                overwrittingAgentCode2 = recruitingAgent2.agentCode,
                                overwrittingAgentContractLevel2 = recruitingAgent2.level,
                                overwrittingAgentCarrierNumber2 = recruitingAgent2.agentCarrierNumber
                        }
                    }
                }

            }

            const newPolicy = await insertDoc("policies", {
                policyRegistrationId: generatePolicyRegistrationId(8),
                isApproved: false,
                policySubmissionDate,
                policyValue,
                agentCommission: 0,
                policyCarrier,
                policyType,
                policyNumber,
                agentFirstName: agentFirstName,
                agentLastName: agentLastName,
                agentCode,
                contractLevel,
                agentCarrierNumber,
                insuredFirstName,
                insuredLastName,
                overwrittingAgentFirstName1,
                overwrittingAgentLastName1,
                overwrittingAgentCode1,
                overwrittingAgentContractLevel1,
                overwrittingAgentCarrierNumber1,

                overwrittingAgentFirstName2,
                overwrittingAgentLastName2,
                overwrittingAgentCode2,
                overwrittingAgentContractLevel2,
                overwrittingAgentCarrierNumber2,

                split1_AgentFirstName,
                split1_AgentLastName,
                split1_AgentCode,
                split1_ContractLevel,
                split1_AgentCarrierNumber,
                split1_splitRatio,

                split2_AgentFirstName,
                split2_AgentLastName,
                split2_AgentCode,
                split2_ContractLevel,
                split2_AgentCarrierNumber,
                split2_splitRatio,

                splitPercentage: splitPercentage,
            })


            const newNotification = await insertDoc("notifications", {
                source: 'Agent',
                newPolicy: true,
                agentCode: agentCode,
                message: `${agentFirstName} ${agentLastName} added new ${policyType} policy ${policyNumber} on ${policySubmissionDate}`,
                policyNumber: policyNumber,
            })


            if (newPolicy && newNotification) {
                return res.status(200).send({ "message": "New Policy Added", data: newPolicy })
            }
        }
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}

exports.getAllPolicies = async (req, res) => {
    try {
        let query = {};

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            const numRegex = new RegExp('\\d+', 'g');

            query = {
                $or: [
                    { policyCarrier: { $regex: searchRegex } },
                    { policyType: { $regex: searchRegex } },
                    { policyNumber: { $regex: searchRegex } },
                    { agentCarrierNumber: { $regex: searchRegex } },
                    { overwrittingAgentFirstName1: { $regex: searchRegex } },
                    { agentCode: { $regex: searchRegex } },
                    // { contractLevel: { $regex: numRegex } },
                    // { policyValue: { $regex: numRegex } },
                    // { advPayment: { $regex: searchRegex } },
                    // { balance: { $regex: searchRegex } },
                    // { agencyCommission: { $regex: searchRegex } },
                    // { paidAgencyCommission: { $regex: searchRegex } },
                    { insuredFirstName: { $regex: searchRegex } },
                    { insuredLastName: { $regex: searchRegex } },
                    // Add more fields here for searching
                ]
            };
        }

        let allPolicies = await listDocs("policies", query, { policySubmissionDate: -1 });

        // Convert policySubmissionDate to Date objects and sort by date in descending order
        allPolicies = allPolicies.sort((a, b) => {
            const dateA = new Date(a.policySubmissionDate);
            const dateB = new Date(b.policySubmissionDate);
            return dateB - dateA;
        });

        res.status(200).send(allPolicies);
        // }
    }
    catch (error) {
        res.status(500).send({ "message": error.message });
    }

}

exports.getPolicyByID = async (req, res) => {
    try {
        const policyID = req.params._id;

        const policy = await findDocById("policies", policyID);

        if (!policy) {
            return res.status(404).send({ "message": "Policy not found" });
        }
        else {
            res.status(200).send(policy);
        }
    } catch (error) {

        res.status(500).send({ "message": "Internal Server Error" });
    }
}

exports.approvePolicy = async (req, res) => {
    try {
        const {
            policyRegistrationID,
            policyValue,
            agencyCommissionPercentage,
            policySubmissionDate,
            // agentCommissionPercentage,

            policyApprovalDate,
            policyCarrier,
            policyType,
            policyNumber,
            advPaymentPercentage,
            remainingPaymentPercentage,

            insuredFirstName,
            insuredLastName,
            policyStartDate,
            policyEndDate,

            agentFirstName,
            agentLastName,
            agentCode,
            contractLevel,
            agentCarrierNumber,

            split1_AgentFirstName,
            split1_AgentLastName,
            split1_AgentCode,
            split1_ContractLevel,
            split1_AgentCarrierNumber,
            split1_splitRatio,

            split2_AgentFirstName,
            split2_AgentLastName,
            split2_AgentCode,
            split2_ContractLevel,
            split2_AgentCarrierNumber,
            split2_splitRatio,

            overwrittingAgentFirstName1,
            overwrittingAgentLastName1,
            overwrittingAgentCode1,
            overwrittingAgentContractLevel1,
            overwrittingAgentCarrierNumber1,

            overwrittingAgentFirstName2,
            overwrittingAgentLastName2,
            overwrittingAgentCode2,
            overwrittingAgentContractLevel2,
            overwrittingAgentCarrierNumber2,
        } = req.body
        const id = req.params.id;
        if (!agencyCommissionPercentage || !advPaymentPercentage || !policyApprovalDate) {
            res.status(400).send({ "message": "Please fill required fields" })
        }
        else {
            //Split1 OW
            let split_1_OWAgent1_FirstName = "";
            let split_1_OWAgent1_LastName = "";
            let split_1_OWAgent1_AgentCode = "";
            let split_1_OWAgent1_ContractLevel = 0;
            let split_1_OWAgent1_AgentCarrierNumber = "";

            let split_1_OWAgent2_FirstName = "";
            let split_1_OWAgent2_LastName = "";
            let split_1_OWAgent2_AgentCode = "";
            let split_1_OWAgent2_ContractLevel = 0;
            let split_1_OWAgent2_AgentCarrierNumber = "";


            //Split2 OW
            let split_2_OWAgent1_FirstName = "";
            let split_2_OWAgent1_LastName = "";
            let split_2_OWAgent1_AgentCode = "";
            let split_2_OWAgent1_ContractLevel = 0;
            let split_2_OWAgent1_AgentCarrierNumber = "";

            let split_2_OWAgent2_FirstName = "";
            let split_2_OWAgent2_LastName = "";
            let split_2_OWAgent2_AgentCode = "";
            let split_2_OWAgent2_ContractLevel = 0;
            let split_2_OWAgent2_AgentCarrierNumber = "";

            let agencyCommission = (policyValue * agencyCommissionPercentage).toFixed(2);
            let advPayment = agencyCommission * advPaymentPercentage;
            let commissionableAmountPercentage = agencyCommissionPercentage > 1 ? (advPayment / agencyCommissionPercentage) : advPayment;
            let remainingPayment = agencyCommission * remainingPaymentPercentage;
            let agentAndOW1AgentDifference = contractLevel > overwrittingAgentContractLevel1 ? (contractLevel - overwrittingAgentContractLevel1) : (overwrittingAgentContractLevel1 - contractLevel)
            let OW1andOW2Difference = overwrittingAgentContractLevel1 > overwrittingAgentContractLevel2 ? (overwrittingAgentContractLevel1 - overwrittingAgentContractLevel2) : (overwrittingAgentContractLevel2 - overwrittingAgentContractLevel1)


            let splitPercentage = split1_splitRatio
                ? (
                    split2_splitRatio
                        ? (
                            1 - (parseFloat(split1_splitRatio) + parseFloat(split2_splitRatio))
                        )
                        : 1 - parseFloat(split1_splitRatio)
                )
                : 1;


            //Split1 OW finding
            if (split1_AgentCode) {
                const split1_Agent = await findDoc("agents", { agentCode: split1_AgentCode })

                if (split1_Agent) {
                    let recruitingAgentCode = split1_Agent.recruitingAgentCode

                    if (recruitingAgentCode) {
                        const recruitingAgent = await findDoc("agents", { agentCode: recruitingAgentCode })

                        if (recruitingAgent !== "") {
                            split_1_OWAgent1_FirstName = recruitingAgent.firstName,
                                split_1_OWAgent1_LastName = recruitingAgent.lastName,
                                split_1_OWAgent1_AgentCode = recruitingAgent.agentCode,
                                split_1_OWAgent1_ContractLevel = recruitingAgent.level,
                                split_1_OWAgent1_AgentCarrierNumber = recruitingAgent.agentCarrierNumber
                        }
                        let recruitingAgentCode2 = recruitingAgent.recruitingAgentCode

                        if (recruitingAgentCode2) {
                            const recruitingAgent2 = await findDoc("agents", { agentCode: recruitingAgentCode2 })


                            if (recruitingAgent2 !== "" || recruitingAgent2 !== null || recruitingAgent2 !== undefined) {
                                split_1_OWAgent2_FirstName = recruitingAgent2.firstName,
                                    split_1_OWAgent2_LastName = recruitingAgent2.lastName,
                                    split_1_OWAgent2_AgentCode = recruitingAgent2.agentCode,
                                    split_1_OWAgent2_ContractLevel = recruitingAgent2.level,
                                    split_1_OWAgent2_AgentCarrierNumber = recruitingAgent2.agentCarrierNumber
                            }
                        }
                    }
                }
            }

            //Split2  OW finding
            if (split2_AgentCode) {
                const split2_Agent = await findDoc("agents", { agentCode: split2_AgentCode })

                if (split2_Agent) {
                    recruitingAgentCode = split2_Agent.recruitingAgentCode

                    if (recruitingAgentCode) {
                        const recruitingAgent = await findDoc("agents", { agentCode: recruitingAgentCode })

                        if (recruitingAgent !== "") {
                            split_2_OWAgent1_FirstName = recruitingAgent.firstName,
                                split_2_OWAgent1_LastName = recruitingAgent.lastName,
                                split_2_OWAgent1_AgentCode = recruitingAgent.agentCode,
                                split_2_OWAgent1_ContractLevel = recruitingAgent.level,
                                split_2_OWAgent1_AgentCarrierNumber = recruitingAgent.agentCarrierNumber
                        }


                        let recruitingAgentCode2 = recruitingAgent.recruitingAgentCode

                        const recruitingAgent2 = await findDoc("agents", { agentCode: recruitingAgentCode2 })

                        if (recruitingAgent2 !== "") {
                            split_2_OWAgent2_FirstName = recruitingAgent2.firstName,
                                split_2_OWAgent2_LastName = recruitingAgent2.lastName,
                                split_2_OWAgent2_AgentCode = recruitingAgent2.agentCode,
                                split_2_OWAgent2_ContractLevel = recruitingAgent2.level,
                                split_2_OWAgent2_AgentCarrierNumber = recruitingAgent2.agentCarrierNumber
                        }

 
                    }
                }
            }

            let splitAgent1AndSplit1OW1Difference = split1_ContractLevel > split_1_OWAgent1_ContractLevel ? (split1_ContractLevel - split_1_OWAgent1_ContractLevel) : (split_1_OWAgent1_ContractLevel - split1_ContractLevel)
             console.log("splitAgent1AndSplit1OW1Difference",splitAgent1AndSplit1OW1Difference)
            let split1_OW1_And_Split1_OW2 = split_1_OWAgent1_ContractLevel > split_1_OWAgent2_ContractLevel ? (split_1_OWAgent1_ContractLevel - split_1_OWAgent2_ContractLevel) : (split_1_OWAgent2_ContractLevel - split_1_OWAgent1_ContractLevel)

            let agentAndSplitOW1Difference = split2_ContractLevel > split_2_OWAgent1_ContractLevel ? (split2_ContractLevel - split_2_OWAgent1_ContractLevel) : (split_2_OWAgent1_ContractLevel - split2_ContractLevel)

            let splitOW1AndSplitOW2 = split_2_OWAgent1_ContractLevel > split_2_OWAgent2_ContractLevel ? (split_2_OWAgent1_ContractLevel - split_2_OWAgent2_ContractLevel) : (split_2_OWAgent2_ContractLevel - split_2_OWAgent1_ContractLevel)


            let agentCommission = splitPercentage
                ? (remainingPaymentPercentage
                    ? (
                        commissionableAmountPercentage
                            ? (commissionableAmountPercentage * splitPercentage * (remainingPaymentPercentage + advPaymentPercentage) * contractLevel)
                            : (agencyCommission * splitPercentage * (remainingPaymentPercentage + advPaymentPercentage) * contractLevel)
                    )
                    : (
                        commissionableAmountPercentage
                            ? (commissionableAmountPercentage * splitPercentage * contractLevel)
                            : (agencyCommission * splitPercentage * advPaymentPercentage * contractLevel)
                    )
                )
                : (remainingPaymentPercentage
                    ? (
                        commissionableAmountPercentage
                            ? (commissionableAmountPercentage * (remainingPaymentPercentage + advPaymentPercentage) * contractLevel)
                            : (agencyCommission * (remainingPaymentPercentage + advPaymentPercentage) * contractLevel)
                    )
                    : (
                        commissionableAmountPercentage
                            ? (commissionableAmountPercentage * contractLevel)
                            : (agencyCommission * advPaymentPercentage * contractLevel)
                    )
                )

            let split1_agentCommission = split1_splitRatio
                ? (
                    remainingPaymentPercentage
                        ? (commissionableAmountPercentage
                            ? (commissionableAmountPercentage * split1_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * split1_ContractLevel)
                            : (agencyCommission * split1_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * split1_ContractLevel)
                        )
                        : (commissionableAmountPercentage
                            ? (commissionableAmountPercentage * split1_splitRatio * split1_ContractLevel)
                            : (agencyCommission * split1_splitRatio * advPaymentPercentage * split1_ContractLevel)
                        )
                )
                : 0

            let split2_agentCommission = split2_splitRatio
                ? (
                    remainingPaymentPercentage
                        ? (commissionableAmountPercentage
                            ? (commissionableAmountPercentage * split2_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * split2_ContractLevel)
                            : (agencyCommission * split2_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * split2_ContractLevel)
                        )
                        : (commissionableAmountPercentage
                            ? (commissionableAmountPercentage * split2_splitRatio * split2_ContractLevel)
                            : (agencyCommission * split2_splitRatio * advPaymentPercentage * split2_ContractLevel)
                        )
                )
                : 0

            let overwrittingAgentCommission1 = overwrittingAgentContractLevel1
                ? 
                (overwrittingAgentContractLevel1 !== contractLevel ?
                    (overwrittingAgentContractLevel1 > contractLevel
                        ?
                        (splitPercentage
                            ? (
                                remainingPaymentPercentage
                                    ? (commissionableAmountPercentage
                                        ? (commissionableAmountPercentage * splitPercentage * (remainingPaymentPercentage + advPaymentPercentage) * agentAndOW1AgentDifference)
                                        : (agencyCommission * splitPercentage * (remainingPaymentPercentage + advPaymentPercentage) * agentAndOW1AgentDifference))
                                    : (
                                        commissionableAmountPercentage
                                            ? (commissionableAmountPercentage * splitPercentage * agentAndOW1AgentDifference)
                                            : (agencyCommission * splitPercentage * advPaymentPercentage * agentAndOW1AgentDifference)
                                    )
                            )
                            : (
                                remainingPaymentPercentage
                                    ? (
                                        commissionableAmountPercentage
                                            ? (commissionableAmountPercentage * (remainingPaymentPercentage + advPaymentPercentage) * agentAndOW1AgentDifference)
                                            : (agencyCommission * (remainingPaymentPercentage + advPaymentPercentage) * agentAndOW1AgentDifference)
                                    )
                                    : (
                                        commissionableAmountPercentage
                                            ? (commissionableAmountPercentage * agentAndOW1AgentDifference)
                                            : (agencyCommission * advPaymentPercentage * agentAndOW1AgentDifference)
                                    )
                            )
                        ) : 0)
                    : 0)
                : 0;


            let overwrittingAgentCommission2 =
                overwrittingAgentContractLevel2
                    ? (overwrittingAgentContractLevel1 !== overwrittingAgentContractLevel2
                        ? (overwrittingAgentContractLevel2 > contractLevel
                            ?
                            (splitPercentage
                                ? (
                                    remainingPaymentPercentage
                                        ? (commissionableAmountPercentage
                                            ? (commissionableAmountPercentage * splitPercentage * (remainingPaymentPercentage + advPaymentPercentage) * OW1andOW2Difference)
                                            : (agencyCommission * splitPercentage * (remainingPaymentPercentage + advPaymentPercentage) * OW1andOW2Difference)
                                        )
                                        : (commissionableAmountPercentage
                                            ? (commissionableAmountPercentage * splitPercentage * OW1andOW2Difference)
                                            : (agencyCommission * splitPercentage * advPaymentPercentage * OW1andOW2Difference)
                                        )
                                )
                                : (
                                    remainingPaymentPercentage
                                        ? (commissionableAmountPercentage
                                            ? (commissionableAmountPercentage * (remainingPaymentPercentage + advPaymentPercentage) * OW1andOW2Difference)
                                            : (agencyCommission * (remainingPaymentPercentage + advPaymentPercentage) * OW1andOW2Difference)
                                        )
                                        : (commissionableAmountPercentage
                                            ? (commissionableAmountPercentage * OW1andOW2Difference)
                                            : (agencyCommission * advPaymentPercentage * OW1andOW2Difference))
                                )
                            )
                            : 0)
                        : 0
                    )
                    : 0;

            //Split1 OW1 commission        
            let split_1_OWAgent1_Commission = split_1_OWAgent1_ContractLevel
                ?
                (split_1_OWAgent1_ContractLevel !== split1_ContractLevel
                    ?
                    (
                        remainingPaymentPercentage
                            ? (commissionableAmountPercentage
                                ? (commissionableAmountPercentage * split1_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * splitAgent1AndSplit1OW1Difference)
                                : (agencyCommission * split1_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * splitAgent1AndSplit1OW1Difference)
                            )
                            : (commissionableAmountPercentage
                                ? (
                                    commissionableAmountPercentage * split1_splitRatio * splitAgent1AndSplit1OW1Difference)
                                : (agencyCommission * split1_splitRatio * advPaymentPercentage * splitAgent1AndSplit1OW1Difference)
                            )
                    )
                    : 0)
                : 0

            //Split1 OW2 commission
            let split_1_OWAgent2_Commission = split_1_OWAgent2_ContractLevel
                ?
                (split_1_OWAgent1_ContractLevel !== split_1_OWAgent2_ContractLevel
                    ? (
                        remainingPaymentPercentage
                            ? (commissionableAmountPercentage
                                ? (commissionableAmountPercentage * split1_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * split1_OW1_And_Split1_OW2)
                                : (agencyCommission * split1_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * split1_OW1_And_Split1_OW2)
                            )
                            : (commissionableAmountPercentage
                                ? (commissionableAmountPercentage * split1_splitRatio * split1_OW1_And_Split1_OW2)
                                : (agencyCommission * split1_splitRatio * advPaymentPercentage * split1_OW1_And_Split1_OW2)
                            )
                    )
                    : 0)
                : 0


            //Split2 OW1 commission
            let split_2_OWAgent1_Commission = split_2_OWAgent1_ContractLevel
                ?
                (split_2_OWAgent1_ContractLevel !== split2_ContractLevel
                    ?
                    (
                        remainingPaymentPercentage
                            ? (commissionableAmountPercentage
                                ? (commissionableAmountPercentage * split2_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * agentAndSplitOW1Difference)
                                : (agencyCommission * split2_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * agentAndSplitOW1Difference)
                            )
                            : (commissionableAmountPercentage
                                ? (commissionableAmountPercentage * split2_splitRatio * agentAndSplitOW1Difference)
                                : (agencyCommission * split2_splitRatio * advPaymentPercentage * agentAndSplitOW1Difference)
                            )
                    )
                    : 0)
                : 0


            //Split2 OW2 commission
            let split_2_OWAgent2_Commission = split_2_OWAgent2_ContractLevel
                ?
                (split_2_OWAgent1_ContractLevel !== split_2_OWAgent2_ContractLevel
                    ? (
                        remainingPaymentPercentage
                            ? (commissionableAmountPercentage
                                ? (commissionableAmountPercentage * split2_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * splitOW1AndSplitOW2)
                                : (agencyCommission * split2_splitRatio * (remainingPaymentPercentage + advPaymentPercentage) * splitOW1AndSplitOW2)
                            )
                            : (commissionableAmountPercentage
                                ? (commissionableAmountPercentage * split2_splitRatio * splitOW1AndSplitOW2)
                                : (agencyCommission * split2_splitRatio * advPaymentPercentage * splitOW1AndSplitOW2)
                            )
                    )
                    : 0)
                : 0

            const policy = await updateDoc("policies", id,
                {
                    $set: {
                        isApproved: true,
                        policyApprovalDate: policyApprovalDate,
                        policyRegistrationID: policyRegistrationID,
                        policyValue: policyValue,
                        agencyCommissionPercentage: agencyCommissionPercentage,
                        agencyCommission: agencyCommission,
                        agentCommission: agentCommission,

                        policySubmissionDate: policySubmissionDate,
                        policyCarrier: policyCarrier,
                        policyType: policyType,
                        policyNumber: policyNumber,
                        advPaymentPercentage: advPaymentPercentage,
                        advPayment: advPayment,
                        commissionableAmountPercentage: commissionableAmountPercentage,
                        remainingPaymentPercentage: remainingPaymentPercentage,
                        balance: remainingPayment ? (agencyCommission - (remainingPayment + advPayment)) : (agencyCommission - advPayment),
                        paidAgencyCommission: remainingPaymentPercentage ? ((advPaymentPercentage + remainingPaymentPercentage) * 100) : (advPaymentPercentage * 100),

                        insuredFirstName: insuredFirstName,
                        insuredLastName: insuredLastName,
                        policyStartDate: policyStartDate,
                        policyEndDate: policyEndDate,

                        agentFirstName: agentFirstName,
                        agentLastName: agentLastName,
                        agentCode: agentCode,
                        contractLevel: contractLevel,
                        agentCarrierNumber: agentCarrierNumber,

                        split1_AgentFirstName: split1_AgentFirstName,
                        split1_AgentLastName: split1_AgentLastName,
                        split1_AgentCode: split1_AgentCode,
                        split1_ContractLevel: split1_ContractLevel,
                        split1_AgentCarrierNumber: split1_AgentCarrierNumber,
                        split1_splitRatio: split1_splitRatio,
                        split1_agentCommission: split1_agentCommission,

                        split2_AgentFirstName: split2_AgentFirstName,
                        split2_AgentLastName: split2_AgentLastName,
                        split2_AgentCode: split2_AgentCode,
                        split2_ContractLevel: split2_ContractLevel,
                        split2_AgentCarrierNumber: split2_AgentCarrierNumber,
                        split2_splitRatio: split2_splitRatio,
                        split2_agentCommission: split2_agentCommission,

                        overwrittingAgentFirstName1: overwrittingAgentFirstName1,
                        overwrittingAgentLastName1: overwrittingAgentLastName1,
                        overwrittingAgentCode1: overwrittingAgentCode1,
                        overwrittingAgentContractLevel1: overwrittingAgentContractLevel1,
                        overwrittingAgentCarrierNumber1: overwrittingAgentCarrierNumber1,
                        overwrittingAgentCommission1: overwrittingAgentCommission1,


                        overwrittingAgentFirstName2: overwrittingAgentFirstName2,
                        overwrittingAgentLastName2: overwrittingAgentLastName2,
                        overwrittingAgentCode2: overwrittingAgentCode2,
                        overwrittingAgentContractLevel2: overwrittingAgentContractLevel2,
                        overwrittingAgentCarrierNumber2: overwrittingAgentCarrierNumber2,
                        overwrittingAgentCommission2: overwrittingAgentCommission2,

                        split_1_OWAgent1_FirstName: split_1_OWAgent1_FirstName,
                        split_1_OWAgent1_LastName: split_1_OWAgent1_LastName,
                        split_1_OWAgent1_AgentCode: split_1_OWAgent1_AgentCode,
                        split_1_OWAgent1_ContractLevel: split_1_OWAgent1_ContractLevel,
                        split_1_OWAgent1_AgentCarrierNumber: split_1_OWAgent1_AgentCarrierNumber,
                        split_1_OWAgent1_Commission: split_1_OWAgent1_Commission,

                        split_1_OWAgent2_FirstName: split_1_OWAgent2_FirstName,
                        split_1_OWAgent2_LastName: split_1_OWAgent2_LastName,
                        split_1_OWAgent2_AgentCode: split_1_OWAgent2_AgentCode,
                        split_1_OWAgent2_ContractLevel: split_1_OWAgent2_ContractLevel,
                        split_1_OWAgent2_AgentCarrierNumber: split_1_OWAgent2_AgentCarrierNumber,
                        split_1_OWAgent2_Commission: split_1_OWAgent2_Commission,

                        split_2_OWAgent1_FirstName: split_2_OWAgent1_FirstName,
                        split_2_OWAgent1_LastName: split_2_OWAgent1_LastName,
                        split_2_OWAgent1_AgentCode: split_2_OWAgent1_AgentCode,
                        split_2_OWAgent1_ContractLevel: split_2_OWAgent1_ContractLevel,
                        split_2_OWAgent1_AgentCarrierNumber: split_2_OWAgent1_AgentCarrierNumber,
                        split_2_OWAgent1_Commission: split_2_OWAgent1_Commission,

                        split_2_OWAgent2_FirstName: split_2_OWAgent2_FirstName,
                        split_2_OWAgent2_LastName: split_2_OWAgent2_LastName,
                        split_2_OWAgent2_AgentCode: split_2_OWAgent2_AgentCode,
                        split_2_OWAgent2_ContractLevel: split_2_OWAgent2_ContractLevel,
                        split_2_OWAgent2_AgentCarrierNumber: split_2_OWAgent2_AgentCarrierNumber,
                        split_2_OWAgent2_Commission: split_2_OWAgent2_Commission,
                    }
                },
                {
                    new: true,
                    upsert: true
                })

            const commission = await insertDoc("commissions", {
                isApproved: true,
                policySubmissionDate: policySubmissionDate,
                policyRegistrationID: policyRegistrationID,
                policyValue: policyValue,
                agencyCommissionPercentage: agencyCommissionPercentage,
                agencyCommission: agencyCommission,
                agentCommission: agentCommission,

                policyApprovalDate: policyApprovalDate,
                policyCarrier: policyCarrier,
                policyType: policyType,
                policyNumber: policyNumber,
                advPaymentPercentage: advPaymentPercentage,
                advPayment: advPayment,
                commissionableAmountPercentage: commissionableAmountPercentage,
                remainingPaymentPercentage: remainingPaymentPercentage,
                balance: remainingPayment ? (agencyCommission - (remainingPayment + advPayment)) : (agencyCommission - advPayment),
                paidAgencyCommission: remainingPaymentPercentage ? ((advPaymentPercentage + remainingPaymentPercentage) * 100) : (advPaymentPercentage * 100),

                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                policyStartDate: policyStartDate,
                policyEndDate: policyEndDate,

                agentFirstName: agentFirstName,
                agentLastName: agentLastName,
                agentCode: agentCode,
                contractLevel: contractLevel,
                agentCarrierNumber: agentCarrierNumber,

                split1_AgentFirstName: split1_AgentFirstName,
                split1_AgentLastName: split1_AgentLastName,
                split1_AgentCode: split1_AgentCode,
                split1_ContractLevel: split1_ContractLevel,
                split1_AgentCarrierNumber: split1_AgentCarrierNumber,
                split1_splitRatio: split1_splitRatio,
                split1_agentCommission: split1_agentCommission,

                split2_AgentFirstName: split2_AgentFirstName,
                split2_AgentLastName: split2_AgentLastName,
                split2_AgentCode: split2_AgentCode,
                split2_ContractLevel: split2_ContractLevel,
                split2_AgentCarrierNumber: split2_AgentCarrierNumber,
                split2_splitRatio: split2_splitRatio,
                split2_agentCommission: split2_agentCommission,

                overwrittingAgentFirstName1: overwrittingAgentFirstName1,
                overwrittingAgentLastName1: overwrittingAgentLastName1,
                overwrittingAgentCode1: overwrittingAgentCode1,
                overwrittingAgentContractLevel1: overwrittingAgentContractLevel1,
                overwrittingAgentCarrierNumber1: overwrittingAgentCarrierNumber1,
                overwrittingAgentCommission1: overwrittingAgentCommission1,

                overwrittingAgentFirstName2: overwrittingAgentFirstName2,
                overwrittingAgentLastName2: overwrittingAgentLastName2,
                overwrittingAgentCode2: overwrittingAgentCode2,
                overwrittingAgentContractLevel2: overwrittingAgentContractLevel2,
                overwrittingAgentCarrierNumber2: overwrittingAgentCarrierNumber2,
                overwrittingAgentCommission2: overwrittingAgentCommission2,

                split_1_OWAgent1_FirstName: split_1_OWAgent1_FirstName,
                split_1_OWAgent1_LastName: split_1_OWAgent1_LastName,
                split_1_OWAgent1_AgentCode: split_1_OWAgent1_AgentCode,
                split_1_OWAgent1_ContractLevel: split_1_OWAgent1_ContractLevel,
                split_1_OWAgent1_AgentCarrierNumber: split_1_OWAgent1_AgentCarrierNumber,
                split_1_OWAgent1_Commission: split_1_OWAgent1_Commission,

                split_1_OWAgent2_FirstName: split_1_OWAgent2_FirstName,
                split_1_OWAgent2_LastName: split_1_OWAgent2_LastName,
                split_1_OWAgent2_AgentCode: split_1_OWAgent2_AgentCode,
                split_1_OWAgent2_ContractLevel: split_1_OWAgent2_ContractLevel,
                split_1_OWAgent2_AgentCarrierNumber: split_1_OWAgent2_AgentCarrierNumber,
                split_1_OWAgent2_Commission: split_1_OWAgent2_Commission,

                split_2_OWAgent1_FirstName: split_2_OWAgent1_FirstName,
                split_2_OWAgent1_LastName: split_2_OWAgent1_LastName,
                split_2_OWAgent1_AgentCode: split_2_OWAgent1_AgentCode,
                split_2_OWAgent1_ContractLevel: split_2_OWAgent1_ContractLevel,
                split_2_OWAgent1_AgentCarrierNumber: split_2_OWAgent1_AgentCarrierNumber,
                split_2_OWAgent1_Commission: split_2_OWAgent1_Commission,

                split_2_OWAgent2_FirstName: split_2_OWAgent2_FirstName,
                split_2_OWAgent2_LastName: split_2_OWAgent2_LastName,
                split_2_OWAgent2_AgentCode: split_2_OWAgent2_AgentCode,
                split_2_OWAgent2_ContractLevel: split_2_OWAgent2_ContractLevel,
                split_2_OWAgent2_AgentCarrierNumber: split_2_OWAgent2_AgentCarrierNumber,
                split_2_OWAgent2_Commission: split_2_OWAgent2_Commission,

                // splitPercentage: split1_splitRatio ? split1_splitRatio : 1,
                splitPercentage: split1_splitRatio
                    ? (
                        split2_splitRatio
                            ? (
                                1 - (split1_splitRatio + split2_splitRatio)
                            )
                            : 1 - split1_splitRatio
                    )
                    : 1,
            })

            const newNotification = await insertDoc("notifications", {
                source: 'Admin',
                agentCode: agentCode,
                message: `${policyCarrier} has approved policy ${policyNumber} on ${policyApprovalDate}.`,
                policyNumber: policyNumber,
            })

            if (policy &&
                commission &&
                newNotification) {
                res.status(200).send({
                    "message": "Policy Approved SuccessFully",
                    data: commission
                })

            }
            else {
                res.status(404).send({ "message": "Policy not found" });
            }

        }
    } catch (error) {
        res.status(500).send({ "message": "Internal Server Error", error: error.message });
    }
}

exports.rejectPolicy = async (req, res) => {
    try {
        const id = req.params.id;

        const policy = await deleteDoc("policies", id)

        if (policy) {
            res.status(200).send({ message: "Policy Rejected Successfully" })
        }
        else {
            res.status(400).send({ message: "Policy Not found" })
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" })
    }
}

exports.getAllCommissions = async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            const numRegex = new RegExp('\\d+', 'g');

            // Define conditions for search
            query = {
                $or: [
                    { policyCarrier: { $regex: searchRegex } },
                    { policyNumber: { $regex: searchRegex } },
                    { agentCarrierNumber: { $regex: searchRegex } },
                    { overwrittingAgentFirstName1: { $regex: searchRegex } },
                    { agentCode: { $regex: searchRegex } },
                    { insuredFirstName: { $regex: searchRegex } },
                    { insuredLastName: { $regex: searchRegex } },
                ]
            };
        }

        let allCommissions = await listDocs("commissions", query);

        allCommissions = allCommissions.sort((a, b) => {
            const dateA = new Date(a.policyApprovalDate);
            const dateB = new Date(b.policyApprovalDate);
            return dateB - dateA;
        });

        if (!allCommissions || allCommissions.length === 0) {
            // res.status(400).send({ "message": "No Records found" });
            res.send([])
        } else {
            const commissionDetails = allCommissions.map(policy => {
                return {
                    isChargedBack: policy.isChargedBack,
                    _id: policy._id,
                    policyApprovalDate: policy.policyApprovalDate,
                    policyValue: policy.policyValue,
                    agencyCommission: policy.agencyCommission,
                    agencyCommissionPercentage: policy.agencyCommissionPercentage,
                    commissionableAmountPercentage: policy.commissionableAmountPercentage,
                    paidAgencyCommission: policy.paidAgencyCommission,

                    policySubmissionDate: policy.policySubmissionDate,
                    policyCarrier: policy.policyCarrier,
                    policyType: policy.policyType,
                    policyNumber: policy.policyNumber,
                    advPaymentPercentage: policy.advPaymentPercentage,
                    advPayment: policy.advPayment,
                    balance: policy.balance,

                    insuredFirstName: policy.insuredFirstName,
                    insuredLastName: policy.insuredLastName,
                    policyStartDate: policy.policyStartDate,
                    policyEndDate: policy.policyEndDate,

                    agentFirstName: policy.agentFirstName,
                    agentLastName: policy.agentLastName,
                    agentCode: policy.agentCode,
                    contractLevel: policy.contractLevel,
                    agentCarrierNumber: policy.agentCarrierNumber,
                    agentCommissionPercentage: policy.agentCommissionPercentage,
                    agentCommission: policy.agentCommission,

                    split1_AgentFirstName: policy.split1_AgentFirstName,
                    split1_AgentLastName: policy.split1_AgentLastName,
                    split1_AgentCode: policy.split1_AgentCode,
                    split1_ContractLevel: policy.split1_ContractLevel,
                    split1_AgentCarrierNumber: policy.split1_AgentCarrierNumber,
                    split1_splitRatio: policy.split1_splitRatio,
                    split1_agentCommission: policy.split1_agentCommission,

                    split2_AgentFirstName: policy.split2_AgentFirstName,
                    split2_AgentLastName: policy.split2_AgentLastName,
                    split2_AgentCode: policy.split2_AgentCode,
                    split2_ContractLevel: policy.split2_ContractLevel,
                    split2_AgentCarrierNumber: policy.split2_AgentCarrierNumber,
                    split2_splitRatio: policy.split2_splitRatio,
                    split2_agentCommission: policy.split2_agentCommission,

                    splitPercentage: policy.splitPercentage,

                    overwrittingAgentFirstName1: policy.overwrittingAgentFirstName1,
                    overwrittingAgentLastName1: policy.overwrittingAgentLastName1,
                    overwrittingAgentCode1: policy.overwrittingAgentCode1,
                    overwrittingAgentContractLevel1: policy.overwrittingAgentContractLevel1,
                    overwrittingAgentCarrierNumber1: policy.overwrittingAgentCarrierNumber1,
                    overwrittingAgentCommission1: policy.overwrittingAgentCommission1,

                    overwrittingAgentFirstName2: policy.overwrittingAgentFirstName2,
                    overwrittingAgentLastName2: policy.overwrittingAgentLastName2,
                    overwrittingAgentCode2: policy.overwrittingAgentCode2,
                    overwrittingAgentContractLevel2: policy.overwrittingAgentContractLevel2,
                    overwrittingAgentCarrierNumber2: policy.overwrittingAgentCarrierNumber2,
                    overwrittingAgentCommission2: policy.overwrittingAgentCommission2,

                    cancellationDate: policy.cancellationDate,
                    cancellationAmount: policy.cancellationAmount,
                    chargebackAmount: policy.chargebackAmount,
                    chargeBackDate: policy.chargeBackDate,

                    cancellationAgentFirstName: policy.cancellationAgentFirstName,
                    cancellationAgentLastName: policy.cancellationAgentLastName,
                    cancellationAgentCode: policy.cancellationAgentCode,
                    cancellationAgentContractLevel: policy.cancellationAgentContractLevel,
                    cancellationAgentCarrierNumber: policy.cancellationAgentCarrierNumber,

                    split_1_OWAgent1_Commission: policy.split_1_OWAgent1_Commission,
                    split_1_OWAgent2_Commission: policy.split_1_OWAgent2_Commission,

                    split_2_OWAgent1_Commission: policy.split_2_OWAgent1_Commission,
                    split_2_OWAgent2_Commission: policy.split_2_OWAgent2_Commission,

                };
            }).filter(Boolean); // Filter out null values

            res.status(200).send(commissionDetails);
        }
    } catch (error) {
        res.status(500).send({ "message": "Internal Server Error" });
    }
}

exports.getCommissionById = async (req, res) => {
    try {
        const id = req.params._id

        const commission = await findDocById("commissions", { _id: id })

        if (commission) {
            res.status(200).send(commission)
        }
    } catch (error) {
        res.status(500).send(error.message)
    }

}

exports.deleteCommission = async (req, res) => {
    try {
        const commissionId = req.params._id.split(',');

        for (const _id of commissionId) {
            const deletedCommission = await deleteDoc("commissions", _id);

            if (!deletedCommission) {
                return res.status(404).json({ message: `Commission with ID ${_id} not found` });
            }
        }
        res.status(200).json({ message: 'Commission deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.isPaid = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            paidOutDate,
            policyCarrier,
            policyNumber,
            policyType,
            agentCarrierNumber,
            policyValue,
            balance,
            agencyCommission,
            contractLevel,
            commisionableAmount,
            advPaymentPercentage,
            agentCode,
            agentFirstName,
            agentLastName,
            insuredFirstName,
            insuredLastName,
            agentCommission,
            splitPercentage,
            split1_AgentCode,
            split1_agentCommission,
            split1_ContractLevel,
            split1_splitRatio,

            split2_AgentCode,
            split2_agentCommission,
            split2_ContractLevel,
            split2_splitRatio,

            overwrittingAgentCode1,
            overwrittingAgentCommission1,
            overwrittingAgentContractLevel1,


            overwrittingAgentCode2,
            overwrittingAgentCommission2,
            overwrittingAgentContractLevel2,


            split_1_OWAgent1_AgentCode,
            split_1_OWAgent1_Commission,
            split_1_OWAgent1_ContractLevel,

            split_1_OWAgent2_AgentCode,
            split_1_OWAgent2_Commission,
            split_1_OWAgent2_ContractLevel,

            split_2_OWAgent1_AgentCode,
            split_2_OWAgent1_Commission,
            split_2_OWAgent1_ContractLevel,

            split_2_OWAgent2_AgentCode,
            split_2_OWAgent2_Commission,
            split_2_OWAgent2_ContractLevel
        } = req.body;

        let date = new Date();
        let formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

        // const policy = await updateDoc("policies", id,
        //     {
        //         $set: {
        //             isPaid: true,
        //             paidOutDate:formattedDate
        //         }
        //     },
        //     {
        //         new: true,
        //     }
        // )

        const commission = await updateDoc("commissions", id,
            {
                $set: {
                    isPaid: true,
                }
            },
            {
                new: true,

            }
        )
        const policy = await findDoc("policies", { policyNumber: policyNumber })

        if (policy) {
            policy.isPaid = true
            // policy.paidOutDate = formattedDate
            policy.paidOutDate = paidOutDate

            await saveDoc(policy)
        }

        if (agentCommission !== 0) {
            const agent = await updateMatchingDoc("agents", 
                { agentCode: agentCode },
                { $inc: { commissionEarned: agentCommission } },
                {
                    new: true,

                }
            );


            const agentStatement = await insertDoc("statements", {
                // paidOutDate: formattedDate,
                isPaidOut: true,
                paidOutDate: paidOutDate,
                policyCarrier: policyCarrier,
                policyNumber: policyNumber,
                premium: policyValue,
                contractLevel: contractLevel,
                advPaymentPercentage: advPaymentPercentage,
                agentCarrierNumber: agentCarrierNumber,
                agentCommission: agentCommission,
                agentCode: agentCode,
                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                splitPercentage: splitPercentage,

            })


        }

        if (split1_agentCommission !== 0) {
            const split1_agent = await updateMatchingDoc("agents", 
                { agentCode: split1_AgentCode },
                { $inc: { commissionEarned: split1_agentCommission } },
                {
                    new: true,

                }
            )

            const split1_agent_Statement = await insertDoc("statements", {
                isPaidOut: true,
                paidOutDate: paidOutDate,
                policyCarrier: policyCarrier,
                policyNumber: policyNumber,
                premium: policyValue,
                contractLevel: contractLevel,
                advPaymentPercentage: advPaymentPercentage,
                // agentCarrierNumber: agentCarrierNumber,
                // agentCommission: agentCommission,
                // agentCode: agentCode,
                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                splitPercentage: splitPercentage,
                split1_AgentCode: split1_AgentCode,
                split1_ContractLevel: split1_ContractLevel,
                split1_splitRatio: split1_splitRatio,
                split1_agentCommission: split1_agentCommission,
                splitPercentage: splitPercentage,

            })
        }

        if (split2_agentCommission !== 0) {
            const split2_agent = await updateMatchingDoc("agents", 
                { agentCode: split2_AgentCode },
                { $inc: { commissionEarned: split2_agentCommission } },
                {
                    new: true,

                }
            )

            const split2_agent_Statement = await insertDoc("statements", {
                isPaidOut: true,
                paidOutDate: paidOutDate,
                policyCarrier: policyCarrier,
                policyNumber: policyNumber,
                premium: policyValue,
                contractLevel: contractLevel,
                advPaymentPercentage: advPaymentPercentage,
                // agentCarrierNumber: agentCarrierNumber,
                // agentCommission: agentCommission,
                // agentCode: agentCode,
                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                splitPercentage: splitPercentage,
                split2_AgentCode: split2_AgentCode,
                split2_ContractLevel: split2_ContractLevel,
                split2_splitRatio: split2_splitRatio,
                split2_agentCommission: split2_agentCommission,
                splitPercentage: splitPercentage,
            })

        }

        if (overwrittingAgentCommission1 !== 0) {
            const OW_agent1 = await updateMatchingDoc("agents", 
                { agentCode: overwrittingAgentCode1 },
                { $inc: { commissionEarned: overwrittingAgentCommission1 } },
                {
                    new: true,

                }
            )

            const OW_Agent1_Statement = await insertDoc("statements", {
                isPaidOut: true,
                paidOutDate: paidOutDate,
                policyCarrier: policyCarrier,
                policyNumber: policyNumber,
                premium: policyValue,
                balance: balance,
                agencyCommission: agencyCommission,
                contractLevel: contractLevel,
                commisionableAmount: commisionableAmount,
                advPaymentPercentage: advPaymentPercentage,
                agentFirstName: agentFirstName,
                agentLastName: agentLastName,
                agentCarrierNumber: agentCarrierNumber,
                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                overwrittingAgentCode1: overwrittingAgentCode1,
                overwrittingAgentContractLevel1: overwrittingAgentContractLevel1,
                overwrittingAgentCommission1: overwrittingAgentCommission1,
                splitPercentage: splitPercentage,
            })

        }

        if (overwrittingAgentCommission2 !== 0) {
            const OW_agent2 = await updateMatchingDoc("agents", 
                { agentCode: overwrittingAgentCode2 },
                { $inc: { commissionEarned: overwrittingAgentCommission2 } },
                {
                    new: true,

                }
            )
            const OW_Agent2_Statement = await insertDoc("statements", {
                isPaidOut: true,
                paidOutDate: paidOutDate,
                policyCarrier: policyCarrier,
                policyNumber: policyNumber,
                premium: policyValue,
                contractLevel: contractLevel,
                advPaymentPercentage: advPaymentPercentage,
                agentFirstName: agentFirstName,
                agentLastName: agentLastName,
                agentCarrierNumber: agentCarrierNumber,
                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                overwrittingAgentCode2: overwrittingAgentCode2,
                overwrittingAgentContractLevel2: overwrittingAgentContractLevel2,
                overwrittingAgentCommission2: overwrittingAgentCommission2,
                splitPercentage: splitPercentage,
            })


        }

        if (split_1_OWAgent1_Commission !== 0) {
            const split_1_OWAgent1 = await updateMatchingDoc("agents", 
                { agentCode: split_1_OWAgent1_AgentCode },
                { $inc: { commissionEarned: split_1_OWAgent1_Commission } },
                {
                    new: true,

                }
            )

            const split1_OW_Agent1_Statement = await insertDoc("statements", {
                isPaidOut: true,
                paidOutDate: paidOutDate,
                policyCarrier: policyCarrier,
                policyNumber: policyNumber,
                premium: policyValue,
                contractLevel: contractLevel,
                advPaymentPercentage: advPaymentPercentage,
                agentFirstName: agentFirstName,
                agentLastName: agentLastName,
                agentCarrierNumber: agentCarrierNumber,
                // agentCommission: agentCommission,
                // agentCode: agentCode,
                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                split_1_OWAgent1_AgentCode: split_1_OWAgent1_AgentCode,
                split_1_OWAgent1_ContractLevel: split_1_OWAgent1_ContractLevel,
                split_1_OWAgent1_Commission: split_1_OWAgent1_Commission,
                splitPercentage: splitPercentage,
            })

        }


        if (split_1_OWAgent2_Commission !== 0) {
            const split_1_OWAgent2 = await updateMatchingDoc("agents", 
                { agentCode: split_1_OWAgent2_AgentCode },
                { $inc: { commissionEarned: split_1_OWAgent2_Commission } },
                {
                    new: true,

                }
            )

            const split1_OW_Agent2_Statement = await insertDoc("statements", {
                isPaidOut: true,
                paidOutDate: paidOutDate,
                policyCarrier: policyCarrier,
                policyNumber: policyNumber,
                premium: policyValue,
                contractLevel: contractLevel,
                advPaymentPercentage: advPaymentPercentage,
                agentFirstName: agentFirstName,
                agentLastName: agentLastName,
                agentCarrierNumber: agentCarrierNumber,
                // agentCommission: agentCommission,
                // agentCode: agentCode,
                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                split_1_OWAgent2_AgentCode: split_1_OWAgent2_AgentCode,
                split_1_OWAgent2_ContractLevel: split_1_OWAgent2_ContractLevel,
                split_1_OWAgent2_Commission: split_1_OWAgent2_Commission,
                splitPercentage: splitPercentage,
            })

        }

        if (split_2_OWAgent1_Commission !== 0) {
            const split_2_OWAgent1 = await updateMatchingDoc("agents", 
                { agentCode: split_2_OWAgent1_AgentCode },
                { $inc: { commissionEarned: split_2_OWAgent1_Commission } },
                {
                    new: true,

                }
            )

            const split2_OW_Agent1_Statement = await insertDoc("statements", {
                isPaidOut: true,
                paidOutDate: paidOutDate,
                policyCarrier: policyCarrier,
                policyNumber: policyNumber,
                premium: policyValue,
                contractLevel: contractLevel,
                advPaymentPercentage: advPaymentPercentage,
                agentFirstName: agentFirstName,
                agentLastName: agentLastName,
                agentCarrierNumber: agentCarrierNumber,
                // agentCommission: agentCommission,
                // agentCode: agentCode,
                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                split_2_OWAgent1_AgentCode: split_2_OWAgent1_AgentCode,
                split_2_OWAgent1_ContractLevel: split_2_OWAgent1_ContractLevel,
                split_2_OWAgent1_Commission: split_2_OWAgent1_Commission,
                splitPercentage: splitPercentage,
            })
        }



        if (split_2_OWAgent2_Commission !== 0) {
            const split_2_OWAgent2 = await updateMatchingDoc("agents", 
                { agentCode: split_2_OWAgent2_AgentCode },
                { $inc: { commissionEarned: split_2_OWAgent2_Commission } },
                {
                    new: true,

                }
            )

            const split2_OW_Agent2_Statement = await insertDoc("statements", {
                isPaidOut: true,
                paidOutDate: paidOutDate,
                policyCarrier: policyCarrier,
                policyNumber: policyNumber,
                premium: policyValue,
                contractLevel: contractLevel,
                advPaymentPercentage: advPaymentPercentage,
                agentFirstName: agentFirstName,
                agentLastName: agentLastName,
                agentCarrierNumber: agentCarrierNumber,
                insuredFirstName: insuredFirstName,
                insuredLastName: insuredLastName,
                split_2_OWAgent2_AgentCode: split_2_OWAgent2_AgentCode,
                split_2_OWAgent2_ContractLevel: split_2_OWAgent2_ContractLevel,
                split_2_OWAgent2_Commission: split_2_OWAgent2_Commission,
                splitPercentage: splitPercentage,
            })

        }




        const newNotification = await insertDoc("notifications", {
            source: 'Admin',
            agentCode: agentCode,
            // message: `${policyCarrier} has paid a commission percentage for ${policyType} policy ${policyNumber} on ${formattedDate}.`,
            message: `${policyCarrier} has paid a commission percentage for ${policyType} policy ${policyNumber} on ${paidOutDate}.`,
            policyNumber: policyNumber,
        })


        if (policy && commission && newNotification) {
            res.status(200).send({ "message": "Paid out", data: policy })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
};

exports.statement = async (req, res) => {
    try {
        const {
            startDate,
            endDate
        } = req.body;

        let query = {};
        const searchRegex = new RegExp(req.query.search, 'i');

        if (req.query.search) {
            const numRegex = new RegExp('\\d+', 'g');


            query = {
                $or: [
                    { policyCarrier: { $regex: searchRegex } },
                    { policyType: { $regex: searchRegex } },
                    { policyNumber: { $regex: searchRegex } },
                    { agentCarrierNumber: { $regex: searchRegex } },
                    { overwrittingAgentFirstName1: { $regex: searchRegex } },
                    { agentCode: { $regex: searchRegex } },
                    { insuredFirstName: { $regex: searchRegex } },
                    { insuredLastName: { $regex: searchRegex } },
                ]
            };
        }
        // else {
            if (startDate !== '' || endDate !== '') {
                if (req.query.search) {
                    let statements=[];
                    const startDate = startDate ; // Year included, time set to 00:00 UTC
                    const endDate = endDate;
                    const start = new Date(startDate)
                    const end = new Date(endDate)
                    const startYear = start.getFullYear()
                    const endYear = end.getFullYear()

                    let allStatements = await listDocs("statements", {
                        $and: [
                            query,
                            {
                                paidOutDate: { $gte: startDate }
                            },
                            {
                                paidOutDate: { $lte: endDate }
                            },
                        ]

                    })

                    allStatements.forEach(statement => {
                        paidOutDate = statement.paidOutDate
                        paidOutDateObject = new Date(paidOutDate)
                        paidOutDateYear = paidOutDateObject.getFullYear()
                        
                        if(paidOutDateYear == startYear || paidOutDateYear == endYear){
                            statements.push(statement)
                        }
                    })

                    allStatements = statements.sort((a, b) => {
                        const dateA = new Date(a.paidOutDate);
                        const dateB = new Date(b.paidOutDate);
                        return dateB - dateA;
                    });

                    // const sumOfAgencyCommission = allStatements.reduce((sum, policy) => sum + policy.agencyCommission, 0);
                    // const sumOfAgentCommission = allStatements.reduce((sum, policy) => sum + policy.agentCommission, 0);

                    if (allStatements) {
                        res.status(200).send({
                            statements: allStatements,
                        });
                    }
                    else {
                        res.send("No records found")
                    }
                }
                else {
                    const start = new Date(startDate); // Year included, time set to 00:00 UTC
                    const end = new Date(endDate);
                    const startYear = start.getFullYear()
                    const endYear = end.getFullYear()

                    let statements=[];

                    let allStatements = await listDocs("statements", {
                        $and: [
                            { paidOutDate: { $gte: startDate} },
                            { paidOutDate: { $lte: endDate } },
                        ]
                    });

                    allStatements.forEach(statement => {
                        paidOutDate = statement.paidOutDate
                        paidOutDateObject = new Date(paidOutDate)
                        paidOutDateYear = paidOutDateObject.getFullYear()
    
                        
                        if(paidOutDateYear == startYear || paidOutDateYear == endYear){
                              statements.push(statement)
                        }
                    })

                    const sortedStatements = statements.sort((a, b) => {
                        const dateA = new Date(a.paidOutDate);
                        const dateB = new Date(b.paidOutDate);
                        return dateB - dateA;
                    });
                    if (sortedStatements) {
                        res.status(200).send({
                            statements: sortedStatements,
                        });
                    }
                    else {
                        res.send("No records found")
                    }
                }
            }
            else {
                if (req.query.search) {
                    let allStatements = await listDocs("statements", query)

                    allStatements = allStatements.sort((a, b) => {
                        const dateA = new Date(a.paidOutDate);
                        const dateB = new Date(b.paidOutDate);
                        return dateB - dateA;
                    });
                    if (allStatements) {
                        res.status(200).json({ statements: allStatements })
                    }
                    else {
                        res.send("No records found")
                    }
                }
                else {
                    let allStatements = await listDocs("statements")

                    allStatements = allStatements.sort((a, b) => {
                        const dateA = new Date(a.paidOutDate);
                        const dateB = new Date(b.paidOutDate);
                        return dateB - dateA;
                    });
                    if (allStatements) {
                        res.status(200).json({ statements: allStatements })
                    }
                    else {
                        res.send("No records found")
                    }
                }
            }
        // }

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }


};

exports.getStatementByID = async (req, res) => {
    try {
        const statementID = req.params._id;

        const statement = await findDocById("statements", statementID);

        if (!statement) {
            return res.status(404).send({ "message": "Statement not found" });
        }
        else {
            res.status(200).send(statement)
        }

    } catch (error) {
        res.status(500).send({ "message": "Internal Server Error" });
    }
}

exports.updateStatement = async (req, res) => {
    try {
        const id = req.params.id
        const { status } = req.body

        const statement = await updateDoc("statements", id,
            {
                $set: {
                    status: status
                }
            },
            {
                new: true,
                upsert: true,
            }
        )

        if (statement) {
            res.status(200).send({ message: "Status updated successfully" })
        }
        else {
            res.status(400).send({ message: "Statement Not Found" })
        }

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" })
    }
}

exports.chargedBack = async (req, res) => {
    try {
        const {
            policyCarrier,
            policyNumber,
            policyType,
            agentCode,
            agentCommission,
            split1_AgentCode,
            split1_agentCommission,
            split2_AgentCode,
            split2_agentCommission,
            overwrittingAgentCode1,
            overwrittingAgentCommission1,
            overwrittingAgentCode2,
            overwrittingAgentCommission2,
            split_1_OWAgent1_AgentCode,
            split_1_OWAgent1_Commission,
            split_1_OWAgent2_AgentCode,
            split_1_OWAgent2_Commission,
            split_2_OWAgent1_AgentCode,
            split_2_OWAgent1_Commission,
            split_2_OWAgent2_AgentCode,
            split_2_OWAgent2_Commission
        } = req.body;

        const id = req.params.id;

        let chargedBackDate = new Date();
        let formattedChargedBackDate = `${chargedBackDate.getDate()}/${chargedBackDate.getMonth() + 1}/${chargedBackDate.getFullYear()}`;


        const commission = await updateDoc("commissions", id,
            {
                $set: {
                    isChargedBack: true,
                }
            },
            {
                new: true,

            }
        )

        if (agentCommission !== 0) {
            const agent = await updateMatchingDoc("agents", 
                { agentCode: agentCode },
                { $inc: { commissionEarned: -agentCommission } },
                {
                    new: true,

                }
            )

            const policy = await updateMatchingDoc("policies", 
                { policyNumber: policyNumber },
                { $inc: { agentCommission: -agentCommission } },
                {
                    new: true,
                }
            )
        }

        if (split1_agentCommission !== 0) {
            const split1_agent = await updateMatchingDoc("agents", 
                { agentCode: split1_AgentCode },
                { $inc: { commissionEarned: -split1_agentCommission } },
                {
                    new: true,

                }
            )

            const policy = await updateMatchingDoc("policies", 
                { policyNumber: policyNumber },
                { $inc: { split2_agentCommission: -split1_agentCommission } },
                {
                    new: true,
                }
            )
        }

        if (split2_agentCommission !== 0) {
            const split2_agent = await updateMatchingDoc("agents", 
                { agentCode: split2_AgentCode },
                { $inc: { commissionEarned: -split2_agentCommission } },
                {
                    new: true,

                }
            )

            const policy = await updateMatchingDoc("policies", 
                { policyNumber: policyNumber },
                { $inc: { split2_agentCommission: -split2_agentCommission } },
                {
                    new: true,
                }
            )
        }

        if (overwrittingAgentCommission1 !== 0) {
            const OW_agent1 = await updateMatchingDoc("agents", 
                { agentCode: overwrittingAgentCode1 },
                { $inc: { commissionEarned: -overwrittingAgentCommission1 } },
                {
                    new: true,

                }
            )

            const policy = await updateMatchingDoc("policies", 
                { policyNumber: policyNumber },
                { $inc: { overwrittingAgentCommission1: -overwrittingAgentCommission1 } },
                {
                    new: true,
                }
            )
        }

        if (overwrittingAgentCommission2 !== 0) {
            const OW_agent2 = await updateMatchingDoc("agents", 
                { agentCode: overwrittingAgentCode2 },
                { $inc: { commissionEarned: -overwrittingAgentCommission2 } },
                {
                    new: true,

                }
            )

            const policy = await updateMatchingDoc("policies", 
                { policyNumber: policyNumber },
                { $inc: { overwrittingAgentCommission2: -overwrittingAgentCommission2 } },
                {
                    new: true,
                }
            )
        }

        if (split_1_OWAgent1_Commission !== 0) {
            const split_1_OWAgent1 = await updateMatchingDoc("agents", 
                { agentCode: split_1_OWAgent1_AgentCode },
                { $inc: { commissionEarned: -split_1_OWAgent1_Commission } },
                {
                    new: true,

                }
            )

            const policy = await updateMatchingDoc("policies", 
                { policyNumber: policyNumber },
                { $inc: { split_1_OWAgent1_Commission: -split_1_OWAgent1_Commission } },
                {
                    new: true,
                }
            )
        }

        if (split_1_OWAgent2_Commission !== 0) {
            const split_1_OWAgent2 = await updateMatchingDoc("agents", 
                { agentCode: split_1_OWAgent2_AgentCode },
                { $inc: { commissionEarned: -split_1_OWAgent2_Commission } },
                {
                    new: true,

                }
            )

            const policy = await updateMatchingDoc("policies", 
                { policyNumber: policyNumber },
                { $inc: { split_1_OWAgent2_Commission: -split_1_OWAgent2_Commission } },
                {
                    new: true,
                }
            )
        }

        if (split_2_OWAgent1_Commission !== 0) {
            const split_2_OWAgent1 = await updateMatchingDoc("agents", 
                { agentCode: split_2_OWAgent1_AgentCode },
                { $inc: { commissionEarned: -split_2_OWAgent1_Commission } },
                {
                    new: true,

                }
            )

            const policy = await updateMatchingDoc("policies", 
                { policyNumber: policyNumber },
                { $inc: { split_2_OWAgent1_Commission: -split_2_OWAgent1_Commission } },
                {
                    new: true,
                }
            )
        }

        if (split_2_OWAgent2_Commission !== 0) {
            const split_2_OWAgent2 = await updateMatchingDoc("agents", 
                { agentCode: split_2_OWAgent2_AgentCode },
                { $inc: { commissionEarned: -split_2_OWAgent2_Commission } },
                {
                    new: true,

                }
            )

            const policy = await updateMatchingDoc("policies", 
                { policyNumber: policyNumber },
                { $inc: { split_2_OWAgent2_Commission: -split_2_OWAgent2_Commission } },
                {
                    new: true,
                }
            )
        }

        const newNotification = await insertDoc("notifications", {
            source: 'Admin',
            agentCode: agentCode,
            message: `${policyCarrier} has posted a commission charge back for ${policyType} policy ${policyNumber} on ${formattedChargedBackDate}.`,
            policyNumber: policyNumber,
        })

        if (commission && newNotification) {
            res.status(200).send({ "message": "Commission Charged Back Successfully", data: commission })
        }

    } catch (error) {
        res.status(500).send({ "message": error.message })
    }
}

exports.getPolicyByPolicyNumber = async (req, res) => {
    try {
        const policyNumber = req.params.policyNumber

        const policy = await findDoc("policies", { policyNumber: policyNumber })

        if (policy) {
            res.status(200).send(policy)
        }
        else {
            res.status(400).send({ message: "Policy doesnot exist" })
        }
    } catch (error) {
        res.status(500).send("Internal Server error")
    }
}



//Agents View
exports.getAllCommissions_AgentView = async (req, res) => {
    try {
        const userId = req.params._id
        let query = {};
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            const numRegex = new RegExp('\\d+', 'g');

            // Define conditions for search
            query = {
                $or: [
                    { policyCarrier: { $regex: searchRegex } },
                    { policyNumber: { $regex: searchRegex } },
                    { agentCarrierNumber: { $regex: searchRegex } },
                    { overwrittingAgentFirstName1: { $regex: searchRegex } },
                    { agentCode: { $regex: searchRegex } },
                    { insuredFirstName: { $regex: searchRegex } },
                    { insuredLastName: { $regex: searchRegex } },
                ]
            };
        }

        if (req.query.search) {
            let allCommissions = await listDocs("commissions", {
                $and: [
                    {
                        $or: [
                            { agentCode: userId },
                            { overwrittingAgentCode1: userId },
                            { overwrittingAgentCode2: userId },
                            { split1_AgentCode: userId },
                            { split_1_OWAgent1_AgentCode: userId },
                            { split_1_OWAgent2_AgentCode: userId },
                            { split2_AgentCode: userId },
                            { split_2_OWAgent1_AgentCode: userId },
                            { split_2_OWAgent2_AgentCode: userId }
                        ]
                    },
                    query
                ],
            });

            allCommissions = allCommissions.sort((a, b) => {
                const dateA = new Date(a.policyApprovalDate);
                const dateB = new Date(b.policyApprovalDate);
                return dateB - dateA;
            });

            if (!allCommissions || allCommissions.length === 0) {
                // res.status(400).send({ "message": "No Records found" });
                res.send([]);
            } else {
                const commissionDetails = allCommissions.map(policy => {
                    return {
                        _id: policy._id,
                        policyApprovalDate: policy.policyApprovalDate,
                        policyValue: policy.policyValue,
                        agencyCommission: policy.agencyCommission,
                        agencyCommissionPercentage: policy.agencyCommissionPercentage,
                        commissionableAmountPercentage: policy.commissionableAmountPercentage,
                        paidAgencyCommission: policy.paidAgencyCommission,

                        policySubmissionDate: policy.policySubmissionDate,
                        policyCarrier: policy.policyCarrier,
                        policyType: policy.policyType,
                        policyNumber: policy.policyNumber,
                        advPaymentPercentage: policy.advPaymentPercentage,
                        advPayment: policy.advPayment,
                        balance: policy.balance,

                        insuredFirstName: policy.insuredFirstName,
                        insuredLastName: policy.insuredLastName,
                        policyStartDate: policy.policyStartDate,
                        policyEndDate: policy.policyEndDate,

                        agentFirstName: policy.agentFirstName,
                        agentLastName: policy.agentLastName,
                        agentCode: policy.agentCode,
                        contractLevel: policy.contractLevel,
                        agentCarrierNumber: policy.agentCarrierNumber,
                        agentCommissionPercentage: policy.agentCommissionPercentage,
                        agentCommission: policy.agentCommission,

                        split1_AgentFirstName: policy.split1_AgentFirstName,
                        split1_AgentLastName: policy.split1_AgentLastName,
                        split1_AgentCode: policy.split1_AgentCode,
                        split1_ContractLevel: policy.split1_ContractLevel,
                        split1_AgentCarrierNumber: policy.split1_AgentCarrierNumber,
                        split1_splitRatio: policy.split1_splitRatio,

                        split2_AgentFirstName: policy.split2_AgentFirstName,
                        split2_AgentLastName: policy.split2_AgentLastName,
                        split2_AgentCode: policy.split2_AgentCode,
                        split2_ContractLevel: policy.split2_ContractLevel,
                        split2_AgentCarrierNumber: policy.split2_AgentCarrierNumber,
                        split2_splitRatio: policy.split2_splitRatio,

                        splitPercentage: policy.splitPercentage,


                        overwrittingAgentFirstName1: policy.overwrittingAgentFirstName1,
                        overwrittingAgentLastName1: policy.overwrittingAgentLastName1,
                        overwrittingAgentCode1: policy.overwrittingAgentCode1,
                        overwrittingAgentContractLevel1: policy.overwrittingAgentContractLevel1,
                        overwrittingAgentCarrierNumber1: policy.overwrittingAgentCarrierNumber1,
                        overwrittingAgentCommission1: policy.overwrittingAgentCommission1,

                        overwrittingAgentFirstName2: policy.overwrittingAgentFirstName2,
                        overwrittingAgentLastName2: policy.overwrittingAgentLastName2,
                        overwrittingAgentCode2: policy.overwrittingAgentCode2,
                        overwrittingAgentContractLevel2: policy.overwrittingAgentContractLevel2,
                        overwrittingAgentCarrierNumber2: policy.overwrittingAgentCarrierNumber2,
                        overwrittingAgentCommission2: policy.overwrittingAgentCommission2,

                        cancellationDate: policy.cancellationDate,
                        cancellationAmount: policy.cancellationAmount,
                        chargebackAmount: policy.chargebackAmount,
                        chargeBackDate: policy.chargeBackDate,

                        cancellationAgentFirstName: policy.cancellationAgentFirstName,
                        cancellationAgentLastName: policy.cancellationAgentLastName,
                        cancellationAgentCode: policy.cancellationAgentCode,
                        cancellationAgentContractLevel: policy.cancellationAgentContractLevel,
                        cancellationAgentCarrierNumber: policy.cancellationAgentCarrierNumber,

                        split_2_OWAgent1_Commission: policy.split_2_OWAgent1_Commission,
                        split_2_OWAgent2_Commission: policy.split_2_OWAgent2_Commission,

                    };
                }).filter(Boolean); // Filter out null values

                res.status(200).send(commissionDetails);
            }
        }
        else {
            let allCommissions = await listDocs("commissions", {
                $or: [
                    { agentCode: userId },
                    { overwrittingAgentCode1: userId },
                    { overwrittingAgentCode2: userId },
                    { split1_AgentCode: userId },
                    { split_1_OWAgent1_AgentCode: userId },
                    { split_1_OWAgent2_AgentCode: userId },
                    { split2_AgentCode: userId },
                    { split_2_OWAgent1_AgentCode: userId },
                    { split_2_OWAgent2_AgentCode: userId }
                ],
            }, { policyApprovalDate: -1 });

            allCommissions = allCommissions.sort((a, b) => {
                const dateA = new Date(a.policyApprovalDate);
                const dateB = new Date(b.policyApprovalDate);
                return dateB - dateA;
            });

            if (!allCommissions || allCommissions.length === 0) {
                // res.status(400).send({ "message": "No Records found" });
                res.send([]);
            } else {
                const commissionDetails = allCommissions.map(policy => {
                    return {
                        _id: policy._id,
                        policyApprovalDate: policy.policyApprovalDate,
                        policyValue: policy.policyValue,
                        agencyCommission: policy.agencyCommission,
                        agencyCommissionPercentage: policy.agencyCommissionPercentage,
                        commissionableAmountPercentage: policy.commissionableAmountPercentage,
                        paidAgencyCommission: policy.paidAgencyCommission,

                        policySubmissionDate: policy.policySubmissionDate,
                        policyCarrier: policy.policyCarrier,
                        policyType: policy.policyType,
                        policyNumber: policy.policyNumber,
                        advPaymentPercentage: policy.advPaymentPercentage,
                        advPayment: policy.advPayment,
                        balance: policy.balance,

                        insuredFirstName: policy.insuredFirstName,
                        insuredLastName: policy.insuredLastName,
                        policyStartDate: policy.policyStartDate,
                        policyEndDate: policy.policyEndDate,

                        agentFirstName: policy.agentFirstName,
                        agentLastName: policy.agentLastName,
                        agentCode: policy.agentCode,
                        contractLevel: policy.contractLevel,
                        agentCarrierNumber: policy.agentCarrierNumber,
                        agentCommissionPercentage: policy.agentCommissionPercentage,
                        agentCommission: policy.agentCommission,

                        split1_AgentFirstName: policy.split1_AgentFirstName,
                        split1_AgentLastName: policy.split1_AgentLastName,
                        split1_AgentCode: policy.split1_AgentCode,
                        split1_ContractLevel: policy.split1_ContractLevel,
                        split1_AgentCarrierNumber: policy.split1_AgentCarrierNumber,
                        split1_splitRatio: policy.split1_splitRatio,

                        split2_AgentFirstName: policy.split2_AgentFirstName,
                        split2_AgentLastName: policy.split2_AgentLastName,
                        split2_AgentCode: policy.split2_AgentCode,
                        split2_ContractLevel: policy.split2_ContractLevel,
                        split2_AgentCarrierNumber: policy.split2_AgentCarrierNumber,
                        split2_splitRatio: policy.split2_splitRatio,

                        splitPercentage: policy.splitPercentage,


                        overwrittingAgentFirstName1: policy.overwrittingAgentFirstName1,
                        overwrittingAgentLastName1: policy.overwrittingAgentLastName1,
                        overwrittingAgentCode1: policy.overwrittingAgentCode1,
                        overwrittingAgentContractLevel1: policy.overwrittingAgentContractLevel1,
                        overwrittingAgentCarrierNumber1: policy.overwrittingAgentCarrierNumber1,
                        overwrittingAgentCommission1: policy.overwrittingAgentCommission1,

                        overwrittingAgentFirstName2: policy.overwrittingAgentFirstName2,
                        overwrittingAgentLastName2: policy.overwrittingAgentLastName2,
                        overwrittingAgentCode2: policy.overwrittingAgentCode2,
                        overwrittingAgentContractLevel2: policy.overwrittingAgentContractLevel2,
                        overwrittingAgentCarrierNumber2: policy.overwrittingAgentCarrierNumber2,
                        overwrittingAgentCommission2: policy.overwrittingAgentCommission2,

                        cancellationDate: policy.cancellationDate,
                        cancellationAmount: policy.cancellationAmount,
                        chargebackAmount: policy.chargebackAmount,
                        chargeBackDate: policy.chargeBackDate,

                        cancellationAgentFirstName: policy.cancellationAgentFirstName,
                        cancellationAgentLastName: policy.cancellationAgentLastName,
                        cancellationAgentCode: policy.cancellationAgentCode,
                        cancellationAgentContractLevel: policy.cancellationAgentContractLevel,
                        cancellationAgentCarrierNumber: policy.cancellationAgentCarrierNumber,

                        split_2_OWAgent1_Commission: policy.split_2_OWAgent1_Commission,
                        split_2_OWAgent2_Commission: policy.split_2_OWAgent2_Commission,

                    };
                }).filter(Boolean); // Filter out null values

                res.status(200).send(commissionDetails);
            }
        }
    } catch (error) {
        res.status(500).send({ "message": "Internal Server Error" });
    }
}

exports.getAllPolicies_AgentView = async (req, res) => {
    try {
        const agentCode = req.user.agentCode;
        let query = {};
        const searchRegex = new RegExp(req.query.search, 'i');

        if (req.query.search) {
            query = {
                $or: [
                    { policyCarrier: { $regex: searchRegex } },
                    { policyType: { $regex: searchRegex } },
                    { policyNumber: { $regex: searchRegex } },
                    { agentCarrierNumber: { $regex: searchRegex } },
                    { overwrittingAgentFirstName1: { $regex: searchRegex } },
                    { agentCode: { $regex: searchRegex } },
                    { insuredFirstName: { $regex: searchRegex } },
                    { insuredLastName: { $regex: searchRegex } },
                ]
            };
        }

        if (req.query.search) {
            let allPolicies = await listDocs("policies", {
                $and: [
                    query,
                    {
                        $or: [
                            { agentCode: agentCode },
                            { overwrittingAgentCode1: agentCode },
                            { overwrittingAgentCode2: agentCode },
                            { split1_AgentCode: agentCode },
                            { split_1_OWAgent1_AgentCode: agentCode },
                            { split_1_OWAgent2_AgentCode: agentCode },
                            { split2_AgentCode: agentCode },
                            { split_2_OWAgent1_AgentCode: agentCode },
                            { split_2_OWAgent2_AgentCode: agentCode }
                        ]
                    }
                ]
            });

            allPolicies = allPolicies.sort((a, b) => {
                const dateA = new Date(a.policySubmissionDate);
                const dateB = new Date(b.policySubmissionDate);
                return dateB - dateA;
            });

            if (!allPolicies || allPolicies.length === 0) {
                // res.status(400).send({ "message": "No Policies found" });
                res.send([]);
            } else {
                const policyDetails = allPolicies.map((policy => ({
                    _id: policy._id,
                    isApproved: policy.isApproved,
                    isChargedBack: policy.isChargedBack,
                    date: policy.date,
                    policyValue: policy.policyValue,
                    agencyCommission: policy.agencyCommission,
                    agencyCommissionPercentage: policy.agencyCommissionPercentage,

                    policySubmissionDate: policy.policySubmissionDate,
                    policyCarrier: policy.policyCarrier,
                    policyType: policy.policyType,
                    policyNumber: policy.policyNumber,
                    advPaymentPercentage: policy.advPaymentPercentage,
                    advPayment: policy.advPayment,
                    balance: policy.balance,

                    insuredFirstName: policy.insuredFirstName,
                    insuredLastName: policy.insuredLastName,
                    policyStartDate: policy.policyStartDate,
                    policyEndDate: policy.policyEndDate,

                    agentFirstName: policy.agentFirstName,
                    agentLastName: policy.agentLastName,
                    agentCode: policy.agentCode,
                    contractLevel: policy.contractLevel,
                    agentCarrierNumber: policy.agentCarrierNumber,
                    agentCommissionPercentage: policy.agentCommissionPercentage,
                    agentCommission: policy.agentCommission,

                    split1_AgentFirstName: policy.split1_AgentFirstName,
                    split1_AgentLastName: policy.split1_AgentLastName,
                    split1_AgentCode: policy.split1_AgentCode,
                    split1_ContractLevel: policy.split1_ContractLevel,
                    split1_AgentCarrierNumber: policy.split1_AgentCarrierNumber,
                    split1_splitRatio: policy.split1_splitRatio,

                    split2_AgentFirstName: policy.split2_AgentFirstName,
                    split2_AgentLastName: policy.split2_AgentLastName,
                    split2_AgentCode: policy.split2_AgentCode,
                    split2_ContractLevel: policy.split2_ContractLevel,
                    split2_AgentCarrierNumber: policy.split2_AgentCarrierNumber,
                    split2_splitRatio: policy.split2_splitRatio,
                    split2_agentCommission: policy.split2_agentCommission,

                    splitPercentage: policy.splitPercentage,

                    overwrittingAgentFirstName1: policy.overwrittingAgentFirstName1,
                    overwrittingAgentLastName1: policy.overwrittingAgentLastName1,
                    overwrittingAgentCode1: policy.overwrittingAgentCode1,
                    overwrittingAgentContractLevel1: policy.overwrittingAgentContractLevel1,
                    overwrittingAgentCarrierNumber1: policy.overwrittingAgentCarrierNumber1,
                    overwrittingAgentCommission1: policy.overwrittingAgentCommission1,

                    overwrittingAgentFirstName2: policy.overwrittingAgentFirstName2,
                    overwrittingAgentLastName2: policy.overwrittingAgentLastName2,
                    overwrittingAgentCode2: policy.overwrittingAgentCode2,
                    overwrittingAgentContractLevel2: policy.overwrittingAgentContractLevel2,
                    overwrittingAgentCarrierNumber2: policy.overwrittingAgentCarrierNumber2,
                    overwrittingAgentCommission2: policy.overwrittingAgentCommission2,

                    cancellationDate: policy.cancellationDate,
                    cancellationAmount: policy.cancellationAmount,
                    chargebackAmount: policy.chargebackAmount,
                    chargeBackDate: policy.chargeBackDate,

                    cancellationAgentFirstName: policy.cancellationAgentFirstName,
                    cancellationAgentLastName: policy.cancellationAgentLastName,
                    cancellationAgentCode: policy.cancellationAgentCode,
                    cancellationAgentContractLevel: policy.cancellationAgentContractLevel,
                    cancellationAgentCarrierNumber: policy.cancellationAgentCarrierNumber,

                    split_2_OWAgent1_Commission: policy.split_2_OWAgent1_Commission,
                    split_2_OWAgent2_Commission: policy.split_2_OWAgent2_Commission,

                })))
                res.status(200).send(policyDetails);
            }
        }
        else {
            let allPolicies = await listDocs("policies", {
                $or: [
                    { agentCode: agentCode },
                    { overwrittingAgentCode1: agentCode },
                    { overwrittingAgentCode2: agentCode },
                    { split1_AgentCode: agentCode },
                    { split_1_OWAgent1_AgentCode: agentCode },
                    { split_1_OWAgent2_AgentCode: agentCode },
                    { split2_AgentCode: agentCode },
                    { split_2_OWAgent1_AgentCode: agentCode },
                    { split_2_OWAgent2_AgentCode: agentCode }
                ]
            });

            allPolicies = allPolicies.sort((a, b) => {
                const dateA = new Date(a.policySubmissionDate);
                const dateB = new Date(b.policySubmissionDate);
                return dateB - dateA;
            });

            if (!allPolicies || allPolicies.length === 0) {
                // res.status(400).send({ "message": "No Policies found" });
                res.send([])
            } else {
                const policyDetails = allPolicies.map((policy => ({
                    _id: policy._id,
                    isApproved: policy.isApproved,
                    isChargedBack: policy.isChargedBack,
                    date: policy.date,
                    policyValue: policy.policyValue,
                    agencyCommission: policy.agencyCommission,
                    agencyCommissionPercentage: policy.agencyCommissionPercentage,

                    policySubmissionDate: policy.policySubmissionDate,
                    policyCarrier: policy.policyCarrier,
                    policyType: policy.policyType,
                    policyNumber: policy.policyNumber,
                    advPaymentPercentage: policy.advPaymentPercentage,
                    advPayment: policy.advPayment,
                    balance: policy.balance,

                    insuredFirstName: policy.insuredFirstName,
                    insuredLastName: policy.insuredLastName,
                    policyStartDate: policy.policyStartDate,
                    policyEndDate: policy.policyEndDate,

                    agentFirstName: policy.agentFirstName,
                    agentLastName: policy.agentLastName,
                    agentCode: policy.agentCode,
                    contractLevel: policy.contractLevel,
                    agentCarrierNumber: policy.agentCarrierNumber,
                    agentCommissionPercentage: policy.agentCommissionPercentage,
                    agentCommission: policy.agentCommission,

                    split1_AgentFirstName: policy.split1_AgentFirstName,
                    split1_AgentLastName: policy.split1_AgentLastName,
                    split1_AgentCode: policy.split1_AgentCode,
                    split1_ContractLevel: policy.split1_ContractLevel,
                    split1_AgentCarrierNumber: policy.split1_AgentCarrierNumber,
                    split1_splitRatio: policy.split1_splitRatio,

                    split2_AgentFirstName: policy.split2_AgentFirstName,
                    split2_AgentLastName: policy.split2_AgentLastName,
                    split2_AgentCode: policy.split2_AgentCode,
                    split2_ContractLevel: policy.split2_ContractLevel,
                    split2_AgentCarrierNumber: policy.split2_AgentCarrierNumber,
                    split2_splitRatio: policy.split2_splitRatio,
                    split2_agentCommission: policy.split2_agentCommission,

                    splitPercentage: policy.splitPercentage,

                    overwrittingAgentFirstName1: policy.overwrittingAgentFirstName1,
                    overwrittingAgentLastName1: policy.overwrittingAgentLastName1,
                    overwrittingAgentCode1: policy.overwrittingAgentCode1,
                    overwrittingAgentContractLevel1: policy.overwrittingAgentContractLevel1,
                    overwrittingAgentCarrierNumber1: policy.overwrittingAgentCarrierNumber1,
                    overwrittingAgentCommission1: policy.overwrittingAgentCommission1,

                    overwrittingAgentFirstName2: policy.overwrittingAgentFirstName2,
                    overwrittingAgentLastName2: policy.overwrittingAgentLastName2,
                    overwrittingAgentCode2: policy.overwrittingAgentCode2,
                    overwrittingAgentContractLevel2: policy.overwrittingAgentContractLevel2,
                    overwrittingAgentCarrierNumber2: policy.overwrittingAgentCarrierNumber2,
                    overwrittingAgentCommission2: policy.overwrittingAgentCommission2,

                    cancellationDate: policy.cancellationDate,
                    cancellationAmount: policy.cancellationAmount,
                    chargebackAmount: policy.chargebackAmount,
                    chargeBackDate: policy.chargeBackDate,

                    cancellationAgentFirstName: policy.cancellationAgentFirstName,
                    cancellationAgentLastName: policy.cancellationAgentLastName,
                    cancellationAgentCode: policy.cancellationAgentCode,
                    cancellationAgentContractLevel: policy.cancellationAgentContractLevel,
                    cancellationAgentCarrierNumber: policy.cancellationAgentCarrierNumber,

                    split_2_OWAgent1_Commission: policy.split_2_OWAgent1_Commission,
                    split_2_OWAgent2_Commission: policy.split_2_OWAgent2_Commission,

                })))
                res.status(200).send(policyDetails);
            }
        }
    } catch (error) {
        res.status(400).send({ "message": "Inertnal Server Error" });
    }

}

exports.statement_AgentView = async (req, res) => {
    try {
        // const agentCode = req.user.agentCode;
        const agentCode = req.params.agentCode
        const { startDate, endDate } = req.body;
        const searchRegex = new RegExp(req.query.search, 'i');
    
        let query = {
            $or: [
                { policyCarrier: { $regex: searchRegex } },
                { policyNumber: { $regex: searchRegex } },
                { agentCarrierNumber: { $regex: searchRegex } },
                { overwrittingAgentFirstName1: { $regex: searchRegex } },
                { agentCode: { $regex: searchRegex } },
                { insuredFirstName: { $regex: searchRegex } },
                { insuredLastName: { $regex: searchRegex } },
            ]
        }


        if (startDate, endDate) {
            if (req.query.search) {
                let allStatements = await listDocs("statements", {
                    $and: [
                        {
                            $or: [
                                { agentCode: agentCode },
                                { overwrittingAgentCode1: agentCode },
                                { overwrittingAgentCode2: agentCode },
                                { split1_AgentCode: agentCode },
                                { split_1_OWAgent1_AgentCode: agentCode },
                                { split_1_OWAgent2_AgentCode: agentCode },
                                { split2_AgentCode: agentCode },
                                { split_2_OWAgent1_AgentCode: agentCode },
                                { split_2_OWAgent2_AgentCode: agentCode }
                            ]
                        },
                        query
                    ],
                    paidOutDate: { $gte: startDate },
                    paidOutDate: { $lte: endDate },
                });

                allStatements = allStatements.sort((a, b) => {
                    const dateA = new Date(a.paidOutDate);
                    const dateB = new Date(b.paidOutDate);
                    return dateB - dateA;
                });

                res.status(200).json({
                    statements: allStatements,
                });
            }
            else {
                let allStatements = await listDocs("statements", {
                    $or: [
                        { agentCode: agentCode },
                        { overwrittingAgentCode1: agentCode },
                        { overwrittingAgentCode2: agentCode },
                        { split1_AgentCode: agentCode },
                        { split_1_OWAgent1_AgentCode: agentCode },
                        { split_1_OWAgent2_AgentCode: agentCode },
                        { split2_AgentCode: agentCode },
                        { split_2_OWAgent1_AgentCode: agentCode },
                        { split_2_OWAgent2_AgentCode: agentCode }
                    ],
                    paidOutDate: { $gte: startDate },
                    paidOutDate: { $lte: endDate },
                });

                allStatements = allStatements.sort((a, b) => {
                    const dateA = new Date(a.paidOutDate);
                    const dateB = new Date(b.paidOutDate);
                    return dateB - dateA;
                });

                res.status(200).json({
                    statements: allStatements,
                });
            }
        }
        else {
            if (req.query.search) {
                let allStatements = await listDocs("statements", {
                    $and: [
                        {
                            $or: [
                                { agentCode: agentCode },
                                { overwrittingAgentCode1: agentCode },
                                { overwrittingAgentCode2: agentCode },
                                { split1_AgentCode: agentCode },
                                { split_1_OWAgent1_AgentCode: agentCode },
                                { split_1_OWAgent2_AgentCode: agentCode },
                                { split2_AgentCode: agentCode },
                                { split_2_OWAgent1_AgentCode: agentCode },
                                { split_2_OWAgent2_AgentCode: agentCode }
                            ]
                        },
                        query
                    ],
                });

                allStatements = allStatements.sort((a, b) => {
                    const dateA = new Date(a.paidOutDate);
                    const dateB = new Date(b.paidOutDate);
                    return dateB - dateA;
                });

                res.status(200).json({
                    statements: allStatements,
                });
            }
            else {
                let allStatements = await listDocs("statements", 
                    {
                        $or: [
                            { agentCode: agentCode },
                            { overwrittingAgentCode1: agentCode },
                            { overwrittingAgentCode2: agentCode },
                            { split1_AgentCode: agentCode },
                            { split_1_OWAgent1_AgentCode: agentCode },
                            { split_1_OWAgent2_AgentCode: agentCode },
                            { split2_AgentCode: agentCode },
                            { split_2_OWAgent1_AgentCode: agentCode },
                            { split_2_OWAgent2_AgentCode: agentCode }
                        ],
                    }
                );

                allStatements = allStatements.sort((a, b) => {
                    const dateA = new Date(a.paidOutDate);
                    const dateB = new Date(b.paidOutDate);
                    return dateB - dateA;
                });

                if (allStatements) {
                    res.status(200).json({ statements: allStatements })
                }
                else {
                    res.status(400).send("No records found")
                }
            }
        }
    }

    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


