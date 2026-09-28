require("dotenv").config();
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importStatements() {
  console.log("Reading statements.json...");

  const raw = fs.readFileSync("./statements.json", "utf8");

  const lines = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  console.log(`Found ${lines.length} JSON records.`);

  const statements = lines.map(line => {
    const item = JSON.parse(line);

    return {
      id: item._id?.$oid,

      paid_out_date: item.paidOutDate ?? null,

      policy_carrier: item.policyCarrier ?? null,
      policy_number: item.policyNumber ?? null,

      agent_carrier_number: item.agentCarrierNumber ?? null,
      agent_code: item.agentCode ?? null,

      premium: item.premium ?? null,
      balance: item.balance ?? null,

      split_percentage: item.splitPercentage ?? null,

      agent_commission: item.agentCommission ?? null,
      agency_commission: item.agencyCommission ?? null,

      contract_level: item.contractLevel ?? null,

      agent_first_name: item.agentFirstName ?? null,
      agent_last_name: item.agentLastName ?? null,

      insured_first_name: item.insuredFirstName ?? null,
      insured_last_name: item.insuredLastName ?? null,

      adv_payment_percentage: item.advPaymentPercentage ?? null,

      overwritting_agent_contract_level1:
        item.overwrittingAgentContractLevel1 ?? null,

      overwritting_agent_code1:
        item.overwrittingAgentCode1 ?? null,

      overwritting_agent_commission1:
        item.overwrittingAgentCommission1 ?? null
    };
  });

  console.log(`Successfully parsed ${statements.length} statements.`);

  const batchSize = 25;

  for (let i = 0; i < statements.length; i += batchSize) {
    const batch = statements.slice(i, i + batchSize);

    const { error } = await supabase
      .from("statements")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(
        `Error importing records ${i + 1}-${Math.min(
          i + batchSize,
          statements.length
        )}:`,
        error.message
      );

      process.exit(1);
    }

    console.log(
      `Imported ${Math.min(i + batchSize, statements.length)} / ${statements.length}`
    );
  }

  console.log("Statements migration completed successfully.");
}

importStatements();