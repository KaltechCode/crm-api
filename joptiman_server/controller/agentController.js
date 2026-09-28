const Recruits = require("../models/RecruiteSchema")
const Agent = require("../models/AgentSchema")
const Notification = require('../models/NotificationSchema')
const Policy = require("../models/PoliciesSchema")
const universal = require("./universal")
var bcrypt = require("bcrypt");
const emailModule = require('./email')

exports.addNewAgent = async (req, res) => {
    try {
        const {
            residentState,
            age,
            firstName,
            lastName,
            email,
            confirmEmail,
            addressLine1,
            city,
            state,
            zipCode,
            activeLicense,
        } = req.body
        const recruitingAgentCode = req.params?.recruitingAgentCode

        // console.log("recruitingAgentCode", recruitingAgentCode);
        let recruitingAgentFirstName;
        let recruitingAgentLastName;
        let adminFirstName;
        let adminLastName;
        let adminCode;
        const recruitingAgent = await Agent.findOne({ agentCode: recruitingAgentCode })

        if (recruitingAgent) {
            recruitingAgentFirstName = recruitingAgent.firstName
            recruitingAgentLastName = recruitingAgent.lastName
        }
        else {
            adminFirstName = req.user.firstName;
            adminLastName = req.user.lastName;
            adminCode = req.user.adminCode;
        }

        let recruitmentDate = new Date();
        let formattedDate = `${recruitmentDate.getMonth() + 1}/${recruitmentDate.getDate()}/${recruitmentDate.getFullYear()}`;

        const agentExists = await Agent.find({ email: email })

        if (agentExists.length > 0) {
            return res.status(400).send({ "message": "User Already Exist" })
        }
        else {
            if (!residentState || !age || !firstName || !lastName || !confirmEmail || !addressLine1 || !city  || !zipCode || !activeLicense || !email ) {
                // console.log({
                //     "residentState": residentState,
                // })
                res.status(400).send({ "message": "Please fill all fields" })
            }
            else {

                let registerAgent = new Agent({
                    residentState: residentState,
                    age: age,
                    firstName: firstName,
                    lastName: lastName,
                    confirmEmail: confirmEmail,
                    addressLine1: addressLine1,
                    city: city,
                    state: state,
                    zipCode: zipCode,
                    activeLicense: activeLicense,
                    recruitmentDate: formattedDate,
                    email: email,
                    recruitingAgentCode: recruitingAgentCode,
                })
                registerAgent.save()

                let registerAgentId = registerAgent._id

                if (recruitingAgentCode) {
                    const result = await Agent.findOneAndUpdate({ agentCode: recruitingAgentCode },
                        {
                            $inc: { recruits: 1 }
                        },
                        {
                            new: true,
                            upsert: true,
                        }

                    )
                    const newNotification = new Notification({
                        source: "Agent",
                        newAgent: true,
                        agentCode: recruitingAgentCode,
                        newAgentId: registerAgentId,
                        message: ` ${recruitingAgentFirstName} ${recruitingAgentLastName} recruited a new Agent on ${formattedDate}. Pending review & approval.`,
                    })
                    newNotification.save()
                }
                else {
                    // const newNotification = new Notification({
                    //     // source: "Agent",
                    //     newAgent: true,
                    //     agentCode: adminCode,
                    //     message: ` ${adminFirstName} ${adminLastName} recruited a new Agent on ${formattedDate}. Pending review & approval.`,
                    // })
                    // newNotification.save()
                }

                if (registerAgent) {
                    // console.log("firstName", firstName);
                    let emailResponse = await emailModule.sendPaymentLink(email, firstName)
                    if (emailResponse) {
                        res.status(200).send({ "message": "New agent registered" })
                    }
                    else {
                        res.status(200).send({ "message": "Problem while sending Email" })
                    }
                    res.status(200).send({ "message": "New agent registered" })
                }

            }
        }

    } catch (error) {
        res.status(500).send("Internal Server Error")
    }


}

exports.approveAgent = async (req, res) => {
    const {
        residentState,
        age,
        firstName,
        lastName,
        email,
        confirmEmail,
        addressLine1,
        city,
        state,
        zipCode,
        activeLicense,
        recruitingAgentCode,
        level,
        agentTitle,
        agentRole,
    } = req.body

    const id = req.params.id;
    let agentApprovalDate = new Date();
    let formattedAgentAprovalDate = `${agentApprovalDate.getMonth() + 1}/${agentApprovalDate.getDate()}/${agentApprovalDate.getFullYear()}`;

    let password = universal.generateOTP().toString()
    // let password = '1234';
    let hashedPassword = await bcrypt.hash(password, 12)
    // console.log("hashedassword",password)

    function generateAgentCode(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            code += chars[randomIndex];
        }

        return code;
    }

    const agentCode = generateAgentCode(6);
    // console.log("agentCode",agentCode)

    const result = await Agent.findByIdAndUpdate(id,
        {
            $set: {
                agentApprovalDate: formattedAgentAprovalDate,
                isApproved: true,
                residentState: residentState,
                age: age,
                firstName: firstName,
                lastName: lastName,
                confirmEmail: confirmEmail,
                addressLine1: addressLine1,
                city: city,
                state: state,
                zipCode: zipCode,
                activeLicense: activeLicense,
                email: email,
                recruitingAgentCode: recruitingAgentCode,
                level: level,
                agentTitle: agentTitle,
                agentRole: agentRole,
                agentCode: agentCode,
                password: hashedPassword,
            }
        },
        {
            new: true,
            upsert: true,
        }

    )

    if (result) {
        let emailResponse = await emailModule.sendCredentials(email, firstName, agentCode, password)
        const newNotification = new Notification({
            source: "Admin",
            newAgent: true,
            agentCode: recruitingAgentCode,
            message: `JOptiman has Reviewed and Approved your Recruit ${firstName} ${lastName} on ${formattedAgentAprovalDate}.`,
        })
        newNotification.save()
        if ( newNotification) {
            res.status(200).send({ "message": "Agent Approved Successfully", data: result })
        }
      
    }
    else {
        res.status(404).send({ "message": "Agent not found" });
    }
}

exports.getAllAgents = async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            
            query = {
                $or: [
                    { firstName: { $regex: searchRegex } },
                    { agentCode: { $regex: searchRegex } },
                    { agentTitle: { $regex: searchRegex } },
                    { agentRole: { $regex: searchRegex } },
                ]
            };
        }
        const allAgents = await Agent.find(query);

        if (!allAgents || allAgents.length === 0) {
            // res.status(400).send({ "message": "No agents found" });
            res.send([]);
        } else {
            const agentDetails = allAgents.map((agent => ({
                img: agent.profilePic,
                _id: agent._id,
                firstName: agent.firstName,
                level: agent.level,
                agentCode: agent.agentCode,
                agentTitle: agent.agentTitle,
                agentRole: agent.agentRole,
                recruitmentDate: agent.recruitmentDate,
                recruits: agent.recruits,
                commissionEarned: agent.commissionEarned,

            })))
            res.status(200).send(agentDetails);
        }
    } catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
};

exports.getApprovedAgents = async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');

            // Define conditions for search
            query = {
                $or: [
                    { firstName: { $regex: searchRegex } },
                    { agentCode: { $regex: searchRegex } },
                    { agentTitle: { $regex: searchRegex } },
                    { agentRole: { $regex: searchRegex } },
                ]
            };
        }

        const allAgents = await Agent.find(
            {
                $and: [
                    { isApproved: true },
                    query
                ]
            }
        );

        if (!allAgents || allAgents.length === 0) {
            res.status(400).send({ "message": "No agents found" });
        } else {
            const agentDetails = allAgents.map((agent => ({
                img: agent.profilePic,
                _id: agent._id,
                firstName: agent.firstName,
                level: agent.level,
                agentCode: agent.agentCode,
                agentTitle: agent.agentTitle,
                agentRole: agent.agentRole,
                recruitmentDate: agent.recruitmentDate,
                recruits: agent.recruits,
                commissionEarned: agent.commissionEarned,

            })))
            res.status(200).send(agentDetails);
        }
    } catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
};

exports.getAgentByID = async (req, res) => {
    try {
        const agentID = req.params.id;

        const agent = await Agent.findById(agentID); // Assuming you have an Agents model

        const sales = {
            Life: {
                sales: 0
            },
            Health:
            {
                sales: 0
            },
            Annuities: {
                sales: 0
            },
            totalPoliciesvalue: 0,
        }

        if (!agent) {
            return res.status(404).send({ "message": "Agent not found" });
        }

        const agentDetails = {
            id: agent._id,
            firstName: agent.firstName,
            lastName: agent.lastName,
            level: agent.level,
            agentCode: agent.agentCode,
            agentTitle: agent.agentTitle,
            agentRole: agent.agentRole,
            recruitingAgentCode: agent.recruitingAgentCode,
            recruitmentDate: agent.recruitmentDate,
            recruits: agent.recruits,
            commissionEarned: agent.commissionEarned,
            email: agent.email,
            phoneNumber: agent.phoneNumber,
            addressLine1: agent.addressLine1,
            city: agent.city,
            state: agent.state,
            zipCode: agent.zipCode,
            activeLicense: agent.activeLicense,
            residentState: agent.residentState,
            profilePic: agent.profilePic,
            age: agent.age,
            active: agent.active
        };

        let policyDetails = await Policy.find({ agentCode: agent.agentCode })

        policyDetails = policyDetails.sort((a, b) => {
            const dateA = new Date(a.policySubmissionDate);
            const dateB = new Date(b.policySubmissionDate);
            return dateB - dateA;
        });

        const policyDetailsArray = policyDetails.map(policy => ({
            policySubmissionDate: policy.policySubmissionDate,
            policyType: policy.policyType,
            policyCarrier: policy.policyCarrier,
            policyNumber: policy.policyNumber,
            overwrittingAgentFirstName1: policy.overwrittingAgentFirstName1,
            overwrittingAgentLastName1: policy.overwrittingAgentLastName1,
            overwrittingAgentFirstName2: policy.overwrittingAgentFirstName2,
            overwrittingAgentLastName2: policy.overwrittingAgentLastName1,
            agentCarrierNumber: policy.agentCarrierNumber,
            agentCode: policy.agentCode,
            contractLevel: policy.contractLevel,
            policyValue: policy.policyValue,
        }));


        policyDetails.forEach(policy => {
            const policyType = policy.policyType;
            const policyValue = policy.policyValue;

            sales[policyType].sales += policyValue;
            sales.totalPoliciesvalue += policyValue;
        });

        if (agentDetails && sales && policyDetailsArray) {
            res.status(200).json({
                agentDetails,
                sales,
                policyDetailsArray
            })
        }

    } catch (error) {
        console.error("Error fetching agent by ID:", error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
}

exports.deleteAgent = async (req, res) => {
    try {
        const agentID = req.params.id.split(',');
        let agentEmails = []
        let agentFirstNames = []

        if (!agentID) {
            return res.status(400).send({ "message": "Invalid agent ID" });
        }

        for (const id of agentID) {
            const deletedAgent = await Agent.findByIdAndDelete(id);

            agentEmails.push(deletedAgent.email)
            agentFirstNames.push(deletedAgent.firstName)

            if (!deletedAgent) {
                return res.status(404).send({ "message": `Agent with ID ${id} not found` });
            }
        }

        let emailResponse = await emailModule.permanantlyDeActivateAgent(agentEmails, agentFirstNames)

        if (emailResponse) {
            res.status(200).send({ "message": "Agent deleted successfully" });
        }
        else {
            res.status(400).send({ message: "Error while sending email" })
        }

    } catch (error) {
        console.error("Error deleting agent:", error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
}

exports.deactivateAgent = async (req, res) => {
    try {
        const agentID = req.params.id.split(',');
        let agentEmails = []
        let agentFirstNames = []
        if (!agentID) {
            return res.status(400).send({ "message": "Invalid agent ID" });
        }

        for (const id of agentID) {
            const deletedAgent = await Agent.findByIdAndUpdate(id,
                {
                    $set: {
                        active: false,
                    }
                },
                {
                    new: true
                }
            );

            agentEmails.push(deletedAgent.email)
            agentFirstNames.push(deletedAgent.firstName)

            if (!deletedAgent) {
                return res.status(404).send({ "message": `Agent with ID ${id} not found` });
            }
        }
        let emailResponse = await emailModule.DeActivateAgent(agentEmails, agentFirstNames)
        if (emailResponse) {
            res.status(200).send({ "message": "Agent DeActivated Successfully" });
        }

    } catch (error) {
        console.error("Error deleting agent:", error);
        res.status(500).send({ "message": error.message });
    }
}

exports.activateAgent = async (req, res) => {
    try {
        const agentID = req.params.id.split(',');
        let agentEmails = [];
        let agentFirstName = [];

        if (!agentID) {
            return res.status(400).send({ "message": "Invalid agent ID" });
        }

        for (const id of agentID) {
            const deletedAgent = await Agent.findByIdAndUpdate(id,
                {
                    $set: {
                        active: true,
                    }
                },
                {
                    new: true
                }
            );
            agentEmails.push(deletedAgent.email);
            agentFirstName.push(deletedAgent.firstName);

            if (!deletedAgent) {
                return res.status(404).send({ "message": `Agent with ID ${id} not found` });
            }
        }
        let emailResponse = await emailModule.ActivateAgent(agentEmails, agentFirstName)
        if (emailResponse) {
            res.status(200).send({ "message": "Agent Activated Successfully" });
        }

    } catch (error) {
        console.error("Error deleting agent:", error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
}

exports.updateMyAccount = async (req, res) => {
    try {
        const {
            email,
            password,
            profilePic,
            phoneNumber,
        } = req.body;


        if (password) {
            var hashedPassword = await bcrypt.hash(password, 12)
            var agent = await Agent.findOneAndUpdate(
                { email: email },
                {
                    $set: {
                        email: email,
                        password: hashedPassword,
                        profilePic: profilePic,
                        phoneNumber: phoneNumber,
                    }
                },
                {
                    new: true,
                    upsert: true,
                }
            )
        }
        else {
            var agent = await Agent.findOneAndUpdate(
                { email: email },
                {
                    $set: {
                        email: email,
                        profilePic: profilePic,
                        phoneNumber: phoneNumber,
                    }
                },
                {
                    new: true,
                    upsert: true,
                }
            )
        }




        if (agent) {
            res.status(200).send({ message: "Account updated Successfully" })
        }
        else {
            res.status(400).send({ message: "Account Not found" })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }

}

exports.editAgent = async (req, res) => {
    try {
        const id = req.params.id

        const { firstName, lastName, level, agentTitle, agentRole, recruitmentDate, commissionEarned, recruits, email } = req.body

        const agent = await Agent.findByIdAndUpdate(id,
            {
                $set: {
                    firstName: firstName,
                    lastName: lastName,
                    level: level,
                    agentTitle: agentTitle,
                    agentRole: agentRole,
                    recruitmentDate: recruitmentDate,
                    recruits: recruits,
                    commissionEarned: commissionEarned,
                    email: email,
                }
            },
            { upsert: true })

        let emailResponse = await emailModule.promoteAgent(email, firstName, level)
        if (emailResponse) {
            res.status(200).send("Agent Promoted Successfully")
        }
        else {
            res.status(400).send("Agent Does not exist")
        }
    } catch (error) {
        res.status(500).send(error.message)
    }

}


//Agent View
exports.getAllAgents_AgentView = async (req, res) => {
    try {
        const agentCode = req.user.agentCode
        const allAgents = await Agent.find({ recruitingAgentCode: agentCode });

        if (!allAgents || allAgents.length === 0) {
            // res.status(400).send({ "message": "No agents found" });
            res.send([])
        } else {
            const agentDetails = allAgents.map((agent => ({
                img: agent.profilePic,
                _id: agent._id,
                firstName: agent.firstName,
                level: agent.level,
                agentCode: agent.agentCode,
                agentTitle: agent.agentTitle,
                agentRole: agent.agentRole,
                recruitmentDate: agent.recruitmentDate,
                recruits: agent.recruits,
                commissionEarned: agent.commissionEarned
            })))
            res.status(200).send(agentDetails);
        }
    } catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
};

