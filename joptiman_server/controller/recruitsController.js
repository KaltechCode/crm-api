const Recruits = require("../models/RecruiteSchema")
const Agent = require("../models/AgentSchema")


exports.addNewAgent = async(req,res)=>{
    const {name,level,recruitingAgentCode,agentTitle,agentRole,recruitmentDate,commissionEarned,licensed,residenceState,address,email,recruits} = req.body
    if(!name || !level || !recruitingAgentCode || !agentTitle || !agentRole || !recruitmentDate || !commissionEarned || !recruits){
        return res.status(400).send("Please Fill All Fields")
    }

    const agentExists =await Agent.find({email:email})

    if(agentExists.length > 0){
        return res.status(400).send({"message": "User Already Exist"})
    }
    else{
        let newRecruit = new Recruits({
            name:name,
            level:level,
            recruitingAgentCode:recruitingAgentCode,
            agentTitle:agentTitle,
            agentRole:agentRole,
            recruitmentDate:recruitmentDate,
            commissionEarned:commissionEarned,
            licensed:licensed,
            residenceState:residenceState,
            address:address,
            email:email,
            recruits:recruits
        })
        newRecruit.save()

        let registerAgent = new Agent({
            firstName:name,
            level:level,
            recruitingAgentCode:recruitingAgentCode,
            agentTitle:agentTitle,
            agentRole:agentRole,
            recruitmentDate:recruitmentDate,
            commissionEarned:commissionEarned,
            recruits:recruits,
            email:email,
            password:newRecruit._id
        })
        registerAgent.save()

        if(newRecruit && registerAgent){
            return res.status(200).send({"message":"New agent recruited"})
        }

        if(newRecruit ){
            return res.status(200).send({"message":"New agent recruited"})
        }
    }


}

exports.getAllAgents = async (req, res) => {
    try {
        const allAgents = await Recruits.find();

        if (!allAgents || allAgents.length === 0) {
            res.send([]);
        } else {
            const agentDetails = allAgents.map((agent=>({
                // img:"https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1985&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                img:agent.profilePic,
                name:agent.name,
                level:agent.level,
                agentCode:agent.recruitingAgentCode,
                agentTitle:agent.agentTitle,
                agentRole:agent.agentRole,
                recruitmentDate:agent.recruitmentDate,
                recruits:agent.recruits,
                commissionEarned:agent.commissionEarned
            })))
            res.status(200).send(agentDetails);
        }
    } catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
};

exports.getRecruitByID = async (req, res) => {
    try {
        const recruitsID = req.params.id;

        const recruit = await Agent.findById(recruitsID); // Assuming you have an Agents model

        if (!recruit) {
            return res.status(404).send({ "message": "Recruits not found" });
        }

        const agentDetails = {
            id: recruit._id,
            firstName:recruit.name,
            level:recruit.level,
            recruitingAgentCode:recruit.recruitingAgentCode,
            agentTitle:recruit.agentTitle,
            agentRole:recruit.agentRole,
            recruitmentDate:recruit.recruitmentDate,
            recruits:recruit.recruits,
            commissionEarned:recruit.commissionEarned,
            email:recruit.email,
        };

        res.status(200).send(agentDetails);
    } catch (error) {
        console.error("Error fetching agent by ID:", error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
}

