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

  if (
    typeof value === "object" &&
    value.$oid
  ) {
    return value.$oid;
  }

  return String(value);
}

function convertFinanceUser(user) {
  return {
    id: convertObjectId(user._id),

    first_name: cleanString(user.firstName),
    last_name: cleanString(user.lastName),

    email: cleanString(user.email),

    password: cleanString(user.password),

    verified: Boolean(user.verified),

    is_finance_user: Boolean(user.isFinanceUser),
  };
}

async function main() {
  console.log("Reading finances.json...");

  const raw = fs.readFileSync(
    "./finances.json",
    "utf8"
  );

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(`Found ${lines.length} JSON records.`);

  const financeUsers = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      financeUsers.push(JSON.parse(lines[i]));
    } catch (error) {
      console.error(
        `Invalid JSON on line ${i + 1}`
      );

      console.error(error.message);

      process.exit(1);
    }
  }

  console.log(
    `Successfully parsed ${financeUsers.length} finance users.`
  );

  const convertedUsers =
    financeUsers.map(convertFinanceUser);

  console.log("Starting Supabase import...");

  const { error } = await supabase
    .from("finances")
    .upsert(convertedUsers, {
      onConflict: "id",
    });

  if (error) {
    console.error(
      "Error importing finance users:"
    );

    console.error(error);

    process.exit(1);
  }

  console.log(
    `Successfully imported ${convertedUsers.length} finance users.`
  );
}

main().catch((error) => {
  console.error("Migration failed:");
  console.error(error);

  process.exit(1);
});