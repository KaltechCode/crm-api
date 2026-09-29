const { findAll, findByEmail, findById, insertRow, newId } = require("../rowMap");

function displayName(agent) {
  return [agent.firstName, agent.lastName].filter(Boolean).join(" ");
}

exports.addNewAgent = async (req, res) => {
  const {
    name,
    level,
    recruitingAgentCode,
    agentTitle,
    recruitmentDate,
    commissionEarned,
    licensed,
    residenceState,
    address,
    email,
    recruits,
  } = req.body;

  if (
    !name ||
    !level ||
    !recruitingAgentCode ||
    !agentTitle ||
    !recruitmentDate ||
    !commissionEarned ||
    !recruits
  ) {
    return res.status(400).send("Please Fill All Fields");
  }

  try {
    const agentExists = await findByEmail("agents", email);

    if (agentExists.length > 0) {
      return res.status(400).send({ message: "User Already Exist" });
    }

    const [firstName, ...rest] = String(name).trim().split(/\s+/);
    const agent = await insertRow("agents", {
      id: newId(),
      first_name: firstName,
      last_name: rest.join(" ") || null,
      level: Number(level),
      recruiting_agent_code: recruitingAgentCode,
      agent_title: agentTitle,
      recruitment_date: recruitmentDate,
      commission_earned: Number(commissionEarned),
      active_license: licensed || null,
      resident_state: residenceState || null,
      address_line1: address || null,
      email: email,
      recruits: String(recruits),
      is_approved: false,
      active: true,
      verified: false,
      is_admin: false,
    });

    return res.status(200).send({
      message: "New agent recruited",
      data: { _id: agent._id },
    });
  } catch (error) {
    console.error("Error adding recruit:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    const allAgents = await findAll("agents");

    if (!allAgents || allAgents.length === 0) {
      return res.send([]);
    }

    const agentDetails = allAgents.map((agent) => ({
      img: agent.profilePic,
      name: displayName(agent),
      level: agent.level,
      agentCode: agent.agentCode || agent.recruitingAgentCode,
      agentTitle: agent.agentTitle,
      agentRole: agent.agentRole || null,
      recruitmentDate: agent.recruitmentDate,
      recruits: agent.recruits,
      commissionEarned: agent.commissionEarned,
    }));

    return res.status(200).send(agentDetails);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getRecruitByID = async (req, res) => {
  try {
    const recruit = await findById("agents", req.params.id);

    if (!recruit) {
      return res.status(404).send({ message: "Recruits not found" });
    }

    return res.status(200).send({
      id: recruit._id,
      firstName: displayName(recruit),
      level: recruit.level,
      recruitingAgentCode: recruit.recruitingAgentCode,
      agentTitle: recruit.agentTitle,
      agentRole: recruit.agentRole || null,
      recruitmentDate: recruit.recruitmentDate,
      recruits: recruit.recruits,
      commissionEarned: recruit.commissionEarned,
      email: recruit.email,
    });
  } catch (error) {
    console.error("Error fetching agent by ID:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
