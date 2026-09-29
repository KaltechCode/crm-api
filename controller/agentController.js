const universal = require("./universal")
var bcrypt = require("bcrypt");
const emailModule = require('./email')
const supabase = require("../db")
const { fieldNameFromColumn } = require("../store")
const {
    findAgents,
    findByEmail,
    findOneByEmail,
    findOneByAgentCode,
    findById,
    insertRow,
    updateById,
    deleteById,
    newId,
} = require("../rowMap")

function toPolicy(row) {
    const policy = {}
    for (const [column, value] of Object.entries(row || {})) {
        policy[fieldNameFromColumn(column)] = value
    }
    return policy
}

async function insertNotification(row) {
    const { error } = await supabase.from("notifications").insert({
        id: newId(),
        unread: true,
        new_policy: false,
        new_agent: false,
        status: 0,
        ...row,
    })
    if (error) throw error
}

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
        const recruitingAgent = await findOneByAgentCode(recruitingAgentCode)

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

        const agentExists = await findByEmail("agents", email)

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

                const registerAgent = await insertRow("agents", {
                    id: newId(),
                    resident_state: residentState,
                    age: age,
                    first_name: firstName,
                    last_name: lastName,
                    confirm_email: confirmEmail,
                    address_line1: addressLine1,
                    city: city,
                    state: state,
                    zip_code: zipCode,
                    active_license: activeLicense,
                    recruitment_date: formattedDate,
                    email: email,
                    recruiting_agent_code: recruitingAgentCode || null,
                    is_approved: false,
                    active: true,
                    verified: false,
                    is_admin: false,
                })

                if (recruitingAgent) {
                    await updateById("agents", recruitingAgent._id, {
                        recruits: (Number(recruitingAgent.recruits) || 0) + 1,
                    })
                    await insertNotification({
                        source: "Agent",
                        new_agent: true,
                        agent_code: recruitingAgentCode,
                        message: ` ${recruitingAgentFirstName} ${recruitingAgentLastName} recruited a new Agent on ${formattedDate}. Pending review & approval.`,
                    })
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

    const result = await updateById("agents", id, {
        agent_approval_date: formattedAgentAprovalDate,
        is_approved: true,
        resident_state: residentState,
        age: age,
        first_name: firstName,
        last_name: lastName,
        confirm_email: confirmEmail,
        address_line1: addressLine1,
        city: city,
        state: state,
        zip_code: zipCode,
        active_license: activeLicense,
        email: email,
        recruiting_agent_code: recruitingAgentCode,
        level: level,
        agent_title: agentTitle,
        agent_code: agentCode,
        password: hashedPassword,
    })

    if (result) {
        let emailResponse = await emailModule.sendCredentials(email, firstName, agentCode, password)
        await insertNotification({
            source: "Admin",
            new_agent: true,
            agent_code: recruitingAgentCode,
            message: `JOptiman has Reviewed and Approved your Recruit ${firstName} ${lastName} on ${formattedAgentAprovalDate}.`,
        })
        if (result) {
            res.status(200).send({ "message": "Agent Approved Successfully", data: result })
        }
      
    }
    else {
        res.status(404).send({ "message": "Agent not found" });
    }
}

exports.getAllAgents = async (req, res) => {
    try {
        const allAgents = await findAgents({ search: req.query.search });

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
        const allAgents = await findAgents({
            approved: true,
            search: req.query.search,
        });

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

        const agent = await findById("agents", agentID);

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

        const { data: policyRows, error: policyError } = await supabase
            .from("policies")
            .select("*")
            .eq("agent_code", agent.agentCode)
        if (policyError) throw policyError
        let policyDetails = (policyRows || []).map(toPolicy)

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
            const deletedAgent = await deleteById("agents", id);

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
            const deletedAgent = await updateById("agents", id, { active: false });

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
            const deletedAgent = await updateById("agents", id, { active: true });
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


        const existing = await findOneByEmail("agents", email)
        let agent = null
        if (existing) {
            const changes = {
                email: email,
                profile_pic: profilePic,
                phone_number: phoneNumber,
            }
            if (password) {
                changes.password = await bcrypt.hash(password, 12)
            }
            agent = await updateById("agents", existing._id, changes)
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

        const agent = await updateById("agents", id, {
            first_name: firstName,
            last_name: lastName,
            level: level,
            agent_title: agentTitle,
            recruitment_date: recruitmentDate,
            recruits: recruits,
            commission_earned: commissionEarned,
            email: email,
        })

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
        const allAgents = await findAgents({ recruitingAgentCode: agentCode });

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

