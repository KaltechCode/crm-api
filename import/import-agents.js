require("dotenv").config();

const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function cleanString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

function convertObjectId(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && value.$oid) {
    return value.$oid;
  }

  return String(value);
}

function convertAgent(agent) {
  return {
    id: convertObjectId(agent._id),

    is_approved: Boolean(agent.isApproved),
    resident_state: cleanString(agent.residentState),
    age: cleanString(agent.age),

    first_name: cleanString(agent.firstName),
    last_name: cleanString(agent.lastName),

    email: cleanString(agent.email),
    confirm_email: cleanString(agent.confirmEmail),

    verified: Boolean(agent.verified),

    password: cleanString(agent.password),
    otp: cleanString(agent.OTP),

    recruitment_date: cleanString(agent.recruitmentDate),

    is_admin: Boolean(agent.isAdmin),

    recruiting_agent_code: cleanString(
      agent.recruitingAgentCode
    ),

    phone_number: cleanString(agent.phoneNumber),

    address_line1: cleanString(agent.addressLine1),
    address_line2: cleanString(agent.addressLine2),

    city: cleanString(agent.city),
    state: cleanString(agent.state),
    zip_code: cleanString(agent.zipCode),

    active_license: cleanString(agent.activeLicense),

    agent_approval_date: cleanString(
      agent.agentApprovalDate
    ),

    agent_code: cleanString(agent.agentCode),
    agent_title: cleanString(agent.agentTitle),

    level:
      agent.level === null ||
      agent.level === undefined ||
      agent.level === ""
        ? null
        : Number(agent.level),

    recruits: cleanString(agent.recruits),

    active: Boolean(agent.active),

    profile_pic: cleanString(agent.profilePic),

    commission_earned:
      agent.commissionEarned === null ||
      agent.commissionEarned === undefined ||
      agent.commissionEarned === ""
        ? null
        : Number(agent.commissionEarned),
  };
}

async function main() {
  console.log("Reading agents.json...");

  const raw = fs.readFileSync("./agents.json", "utf8");

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(`Found ${lines.length} JSON records.`);

  const agents = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      const agent = JSON.parse(lines[i]);
      agents.push(agent);
    } catch (error) {
      console.error(`Invalid JSON on line ${i + 1}`);
      console.error(error.message);
      process.exit(1);
    }
  }

  console.log(`Successfully parsed ${agents.length} agents.`);

  const convertedAgents = agents.map(convertAgent);

  console.log("Starting Supabase import...");

  const batchSize = 25;

  for (
    let i = 0;
    i < convertedAgents.length;
    i += batchSize
  ) {
    const batch = convertedAgents.slice(
      i,
      i + batchSize
    );

    const { error } = await supabase
      .from("agents")
      .upsert(batch, {
        onConflict: "id",
      });

    if (error) {
      console.error(
        `Error importing batch ${i + 1} to ${
          i + batch.length
        }:`
      );

      console.error(error);
      process.exit(1);
    }

    console.log(
      `Imported ${Math.min(
        i + batch.length,
        convertedAgents.length
      )} / ${convertedAgents.length}`
    );
  }

  console.log("");
  console.log("Migration completed successfully.");
}

main().catch((error) => {
  console.error("Migration failed:");
  console.error(error);
  process.exit(1);
});