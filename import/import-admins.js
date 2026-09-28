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

function convertAdmin(admin) {
  return {
    id: convertObjectId(admin._id),

    first_name: cleanString(admin.firstName),
    last_name: cleanString(admin.lastName),

    email: cleanString(admin.email),

    password: cleanString(admin.password),

    verified: Boolean(admin.verified),
    is_admin: Boolean(admin.isAdmin),

    admin_code: cleanString(admin.adminCode),

    phone_number: cleanString(admin.phoneNumber),

    profile_pic: cleanString(admin.profilePic),

    otp: cleanString(admin.OTP),
  };
}

async function main() {
  console.log("Reading admins.json...");

  const raw = fs.readFileSync("./admins.json", "utf8");

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(`Found ${lines.length} JSON records.`);

  const admins = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      admins.push(JSON.parse(lines[i]));
    } catch (error) {
      console.error(`Invalid JSON on line ${i + 1}`);
      console.error(error.message);
      process.exit(1);
    }
  }

  console.log(`Successfully parsed ${admins.length} admins.`);

  const convertedAdmins = admins.map(convertAdmin);

  console.log("Starting Supabase import...");

  const { error } = await supabase
    .from("admins")
    .upsert(convertedAdmins, {
      onConflict: "id",
    });

  if (error) {
    console.error("Error importing admins:");
    console.error(error);
    process.exit(1);
  }

  console.log(
    `Successfully imported ${convertedAdmins.length} admins.`
  );
}

main().catch((error) => {
  console.error("Migration failed:");
  console.error(error);
  process.exit(1);
});