require("dotenv").config();
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importPolicies() {
  console.log("Reading policies.json...");

  const raw = fs.readFileSync("./policies.json", "utf8");

  const lines = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  console.log(`Found ${lines.length} JSON records.`);

  const policies = lines.map(line => {
    const item = JSON.parse(line);

    return {
      id: item._id?.$oid,

      is_approved: item.isApproved ?? false,
      is_paid: item.isPaid ?? false,
      is_charged_back: item.isChargedBack ?? false,

      paid_agency_commission: item.paidAgencyCommission ?? null,
      policy_registration_id: item.policyRegistrationId ?? null,
      policy_value: item.policyValue ?? null,
      agent_commission: item.agentCommission ?? null,

      policy_submission_date: item.policySubmissionDate ?? null,
      policy_carrier: item.policyCarrier ?? null,
      policy_type: item.policyType ?? null,
      policy_number: item.policyNumber ?? null,

      insured_first_name: item.insuredFirstName ?? null,
      insured_last_name: item.insuredLastName ?? null,

      agent_first_name: item.agentFirstName ?? null,
      agent_last_name: item.agentLastName ?? null,
      agent_code: item.agentCode ?? null,
      contract_level: item.contractLevel ?? null,
      agent_carrier_number: item.agentCarrierNumber ?? null,

      split1_agent_first_name: item.split1_AgentFirstName ?? null,
      split1_agent_last_name: item.split1_AgentLastName ?? null,
      split1_agent_code: item.split1_AgentCode ?? null,
      split1_contract_level: item.split1_ContractLevel ?? null,
      split1_agent_carrier_number: item.split1_AgentCarrierNumber ?? null,
      split1_split_ratio: item.split1_splitRatio ?? null,

      split2_agent_first_name: item.split2_AgentFirstName ?? null,
      split2_agent_last_name: item.split2_AgentLastName ?? null,
      split2_agent_code: item.split2_AgentCode ?? null,
      split2_contract_level: item.split2_ContractLevel ?? null,
      split2_agent_carrier_number: item.split2_AgentCarrierNumber ?? null,
      split2_split_ratio: item.split2_splitRatio ?? null,

      split_percentage: item.splitPercentage ?? null,

      overwritting_agent_first_name1:
        item.overwrittingAgentFirstName1 ?? null,
      overwritting_agent_last_name1:
        item.overwrittingAgentLastName1 ?? null,
      overwritting_agent_code1:
        item.overwrittingAgentCode1 ?? null,
      overwritting_agent_contract_level1:
        item.overwrittingAgentContractLevel1 ?? null,

      overwritting_agent_first_name2:
        item.overwrittingAgentFirstName2 ?? null,
      overwritting_agent_last_name2:
        item.overwrittingAgentLastName2 ?? null,
      overwritting_agent_code2:
        item.overwrittingAgentCode2 ?? null,
      overwritting_agent_contract_level2:
        item.overwrittingAgentContractLevel2 ?? null,
      overwritting_agent_carrier_number2:
        item.overwrittingAgentCarrierNumber2 ?? null,

      adv_payment: item.advPayment ?? null,
      adv_payment_percentage: item.advPaymentPercentage ?? null,
      agency_commission: item.agencyCommission ?? null,
      agency_commission_percentage:
        item.agencyCommissionPercentage ?? null,
      balance: item.balance ?? null,
      commissionable_amount_percentage:
        item.commissionableAmountPercentage ?? null,

      overwritting_agent_commission1:
        item.overwrittingAgentCommission1 ?? null,
      overwritting_agent_commission2:
        item.overwrittingAgentCommission2 ?? null,

      policy_approval_date: item.policyApprovalDate ?? null,

      split1_agent_commission: item.split1_agentCommission ?? null,
      split2_agent_commission: item.split2_agentCommission ?? null,

      split_1_owagent1_agent_carrier_number:
        item.split_1_OWAgent1_AgentCarrierNumber ?? null,
      split_1_owagent1_agent_code:
        item.split_1_OWAgent1_AgentCode ?? null,
      split_1_owagent1_commission:
        item.split_1_OWAgent1_Commission ?? null,
      split_1_owagent1_contract_level:
        item.split_1_OWAgent1_ContractLevel ?? null,
      split_1_owagent1_first_name:
        item.split_1_OWAgent1_FirstName ?? null,
      split_1_owagent1_last_name:
        item.split_1_OWAgent1_LastName ?? null,

      split_1_owagent2_agent_carrier_number:
        item.split_1_OWAgent2_AgentCarrierNumber ?? null,
      split_1_owagent2_agent_code:
        item.split_1_OWAgent2_AgentCode ?? null,
      split_1_owagent2_commission:
        item.split_1_OWAgent2_Commission ?? null,
      split_1_owagent2_contract_level:
        item.split_1_OWAgent2_ContractLevel ?? null,
      split_1_owagent2_first_name:
        item.split_1_OWAgent2_FirstName ?? null,
      split_1_owagent2_last_name:
        item.split_1_OWAgent2_LastName ?? null,

      split_2_owagent1_agent_carrier_number:
        item.split_2_OWAgent1_AgentCarrierNumber ?? null,
      split_2_owagent1_agent_code:
        item.split_2_OWAgent1_AgentCode ?? null,
      split_2_owagent1_commission:
        item.split_2_OWAgent1_Commission ?? null,
      split_2_owagent1_contract_level:
        item.split_2_OWAgent1_ContractLevel ?? null,
      split_2_owagent1_first_name:
        item.split_2_OWAgent1_FirstName ?? null,
      split_2_owagent1_last_name:
        item.split_2_OWAgent1_LastName ?? null,

      split_2_owagent2_agent_carrier_number:
        item.split_2_OWAgent2_AgentCarrierNumber ?? null,
      split_2_owagent2_agent_code:
        item.split_2_OWAgent2_AgentCode ?? null,
      split_2_owagent2_commission:
        item.split_2_OWAgent2_Commission ?? null,
      split_2_owagent2_contract_level:
        item.split_2_OWAgent2_ContractLevel ?? null,
      split_2_owagent2_first_name:
        item.split_2_OWAgent2_FirstName ?? null,
      split_2_owagent2_last_name:
        item.split_2_OWAgent2_LastName ?? null,

      paid_out_date: item.paidOutDate ?? null
    };
  });

  console.log(`Successfully parsed ${policies.length} policies.`);

  const batchSize = 25;

  for (let i = 0; i < policies.length; i += batchSize) {
    const batch = policies.slice(i, i + batchSize);

    const { error } = await supabase
      .from("policies")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(
        `Error importing records ${i + 1}-${Math.min(
          i + batchSize,
          policies.length
        )}:`,
        error.message
      );

      process.exit(1);
    }

    console.log(
      `Imported ${Math.min(i + batchSize, policies.length)} / ${policies.length}`
    );
  }

  console.log("Policies migration completed successfully.");
}

importPolicies();