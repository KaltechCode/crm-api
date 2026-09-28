require("dotenv").config();
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importNotifications() {
  console.log("Reading notifications.json...");

  const raw = fs.readFileSync("./notifications.json", "utf8");

  const lines = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  console.log(`Found ${lines.length} JSON records.`);

  const notifications = lines.map(line => {
    const item = JSON.parse(line);

    return {
      id: item._id?.$oid,

      unread: item.unRead ?? false,
      new_policy: item.newPolicy ?? false,
      new_agent: item.newAgent ?? false,

      source: item.source ?? null,
      agent_code: item.agentCode ?? null,
      policy_number: item.policyNumber ?? null,
      message: item.message ?? null,

      status: item.status ?? 0,

      created_at: item.createdAt?.$date ?? null,
      updated_at: item.updatedAt?.$date ?? null
    };
  });

  console.log(`Successfully parsed ${notifications.length} notifications.`);

  const batchSize = 25;

  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);

    const { error } = await supabase
      .from("notifications")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(
        `Error importing records ${i + 1}-${Math.min(
          i + batchSize,
          notifications.length
        )}:`,
        error.message
      );

      process.exit(1);
    }

    console.log(
      `Imported ${Math.min(i + batchSize, notifications.length)} / ${notifications.length}`
    );
  }

  console.log("Notifications migration completed successfully.");
}

importNotifications();