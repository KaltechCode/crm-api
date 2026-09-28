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

function cleanNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function cleanBoolean(value) {
  if (value === true || value === false) {
    return value;
  }

  return Boolean(value);
}

function convertObjectId(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value === "object" &&
    value.$oid
  ) {
    return value.$oid;
  }

  return String(value);
}

function convertCommission(item) {
  return {
    id: convertObjectId(item._id),

    policy_approval_date:
      cleanString(item.policyApprovalDate),

    is_approved:
      cleanBoolean(item.isApproved),

    is_paid:
      cleanBoolean(item.isPaid),

    is_charged_back:
      cleanBoolean(item.isChargedBack),

    paid_agency_commission:
      cleanNumber(item.paidAgencyCommission),

    policy_value:
      cleanNumber(item.policyValue),

    agency_commission:
      cleanNumber(item.agencyCommission),

    agency_commission_percentage:
      cleanNumber(item.agencyCommissionPercentage),

    agent_commission:
      cleanNumber(item.agentCommission),

    policy_submission_date:
      cleanString(item.policySubmissionDate),

    policy_carrier:
      cleanString(item.policyCarrier),

    policy_type:
      cleanString(item.policyType),

    policy_number:
      cleanString(item.policyNumber),

    adv_payment_percentage:
      cleanNumber(item.advPaymentPercentage),

    adv_payment:
      cleanNumber(item.advPayment),

    balance:
      cleanNumber(item.balance),

    commissionable_amount_percentage:
      cleanNumber(item.commissionableAmountPercentage),

    insured_first_name:
      cleanString(item.insuredFirstName),

    insured_last_name:
      cleanString(item.insuredLastName),

    agent_first_name:
      cleanString(item.agentFirstName),

    agent_last_name:
      cleanString(item.agentLastName),

    agent_code:
      cleanString(item.agentCode),

    contract_level:
      cleanNumber(item.contractLevel),

    agent_carrier_number:
      cleanString(item.agentCarrierNumber),

    split1_agent_first_name:
      cleanString(item.split1_AgentFirstName),

    split1_agent_last_name:
      cleanString(item.split1_AgentLastName),

    split1_agent_code:
      cleanString(item.split1_AgentCode),

    split1_contract_level:
      cleanNumber(item.split1_ContractLevel),

    split1_agent_carrier_number:
      cleanString(item.split1_AgentCarrierNumber),

    split1_split_ratio:
      cleanNumber(item.split1_splitRatio),

    split1_agent_commission:
      cleanNumber(item.split1_agentCommission),

    split2_agent_first_name:
      cleanString(item.split2_AgentFirstName),

    split2_agent_last_name:
      cleanString(item.split2_AgentLastName),

    split2_agent_code:
      cleanString(item.split2_AgentCode),

    split2_contract_level:
      cleanNumber(item.split2_ContractLevel),

    split2_agent_carrier_number:
      cleanString(item.split2_AgentCarrierNumber),

    split2_split_ratio:
      cleanNumber(item.split2_splitRatio),

    split2_agent_commission:
      cleanNumber(item.split2_agentCommission),

    split_percentage:
      cleanNumber(item.splitPercentage),

    overwritting_agent_first_name1:
      cleanString(item.overwrittingAgentFirstName1),

    overwritting_agent_last_name1:
      cleanString(item.overwrittingAgentLastName1),

    overwritting_agent_code1:
      cleanString(item.overwrittingAgentCode1),

    overwritting_agent_contract_level1:
      cleanNumber(item.overwrittingAgentContractLevel1),

    overwritting_agent_commission1:
      cleanNumber(item.overwrittingAgentCommission1),

    overwritting_agent_first_name2:
      cleanString(item.overwrittingAgentFirstName2),

    overwritting_agent_last_name2:
      cleanString(item.overwrittingAgentLastName2),

    overwritting_agent_code2:
      cleanString(item.overwrittingAgentCode2),

    overwritting_agent_contract_level2:
      cleanNumber(item.overwrittingAgentContractLevel2),

    overwritting_agent_carrier_number2:
      cleanString(item.overwrittingAgentCarrierNumber2),

    overwritting_agent_commission2:
      cleanNumber(item.overwrittingAgentCommission2),

    split_1_ow_agent1_first_name:
      cleanString(item.split_1_OWAgent1_FirstName),

    split_1_ow_agent1_last_name:
      cleanString(item.split_1_OWAgent1_LastName),

    split_1_ow_agent1_agent_code:
      cleanString(item.split_1_OWAgent1_AgentCode),

    split_1_ow_agent1_contract_level:
      cleanNumber(item.split_1_OWAgent1_ContractLevel),

    split_1_ow_agent1_agent_carrier_number:
      cleanString(
        item.split_1_OWAgent1_AgentCarrierNumber
      ),

    split_1_ow_agent1_commission:
      cleanNumber(item.split_1_OWAgent1_Commission),

    split_1_ow_agent2_first_name:
      cleanString(item.split_1_OWAgent2_FirstName),

    split_1_ow_agent2_last_name:
      cleanString(item.split_1_OWAgent2_LastName),

    split_1_ow_agent2_agent_code:
      cleanString(item.split_1_OWAgent2_AgentCode),

    split_1_ow_agent2_contract_level:
      cleanNumber(item.split_1_OWAgent2_ContractLevel),

    split_1_ow_agent2_agent_carrier_number:
      cleanString(
        item.split_1_OWAgent2_AgentCarrierNumber
      ),

    split_1_ow_agent2_commission:
      cleanNumber(item.split_1_OWAgent2_Commission),

    split_2_ow_agent1_first_name:
      cleanString(item.split_2_OWAgent1_FirstName),

    split_2_ow_agent1_last_name:
      cleanString(item.split_2_OWAgent1_LastName),

    split_2_ow_agent1_agent_code:
      cleanString(item.split_2_OWAgent1_AgentCode),

    split_2_ow_agent1_contract_level:
      cleanNumber(item.split_2_OWAgent1_ContractLevel),

    split_2_ow_agent1_agent_carrier_number:
      cleanString(
        item.split_2_OWAgent1_AgentCarrierNumber
      ),

    split_2_ow_agent1_commission:
      cleanNumber(item.split_2_OWAgent1_Commission),

    split_2_ow_agent2_first_name:
      cleanString(item.split_2_OWAgent2_FirstName),

    split_2_ow_agent2_last_name:
      cleanString(item.split_2_OWAgent2_LastName),

    split_2_ow_agent2_agent_code:
      cleanString(item.split_2_OWAgent2_AgentCode),

    split_2_ow_agent2_contract_level:
      cleanNumber(item.split_2_OWAgent2_ContractLevel),

    split_2_ow_agent2_agent_carrier_number:
      cleanString(
        item.split_2_OWAgent2_AgentCarrierNumber
      ),

    split_2_ow_agent2_commission:
      cleanNumber(item.split_2_OWAgent2_Commission),
  };
}

async function main() {
  console.log("Reading commissions.json...");

  const raw = fs.readFileSync(
    "./commissions.json",
    "utf8"
  );

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(`Found ${lines.length} JSON records.`);

  const commissions = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      commissions.push(JSON.parse(lines[i]));
    } catch (error) {
      console.error(
        `Invalid JSON on line ${i + 1}`
      );

      console.error(error.message);

      process.exit(1);
    }
  }

  console.log(
    `Successfully parsed ${commissions.length} commission records.`
  );

  const convertedCommissions =
    commissions.map(convertCommission);

  console.log("Starting Supabase import...");

  const batchSize = 25;

  for (
    let i = 0;
    i < convertedCommissions.length;
    i += batchSize
  ) {
    const batch = convertedCommissions.slice(
      i,
      i + batchSize
    );

    const { error } = await supabase
      .from("commissions")
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
        convertedCommissions.length
      )} / ${convertedCommissions.length}`
    );
  }

  console.log("");
  console.log(
    "Commissions migration completed successfully."
  );
}

main().catch((error) => {
  console.error("Migration failed:");
  console.error(error);
  process.exit(1);
});