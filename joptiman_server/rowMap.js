const crypto = require("crypto");
const supabase = require("./db");

function newId() {
  return crypto.randomBytes(12).toString("hex");
}

function adminToApi(row) {
  if (!row) return null;
  return {
    _id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    OTP: row.otp,
    password: row.password,
    verified: row.verified,
    isAdmin: row.is_admin,
    adminCode: row.admin_code,
    phoneNumber: row.phone_number,
    profilePic: row.profile_pic,
  };
}

function agentToApi(row) {
  if (!row) return null;
  return {
    _id: row.id,
    agentApprovalDate: row.agent_approval_date,
    active: row.active,
    isApproved: row.is_approved,
    residentState: row.resident_state,
    age: row.age,
    firstName: row.first_name,
    lastName: row.last_name,
    level: row.level,
    email: row.email,
    confirmEmail: row.confirm_email,
    OTP: row.otp,
    verified: row.verified,
    password: row.password,
    agentCode: row.agent_code,
    agentTitle: row.agent_title,
    agentRole: row.agent_role,
    recruitmentDate: row.recruitment_date,
    recruits: row.recruits,
    commissionEarned: row.commission_earned,
    isAdmin: row.is_admin,
    recruitingAgentCode: row.recruiting_agent_code,
    phoneNumber: row.phone_number,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    activeLicense: row.active_license,
    profilePic: row.profile_pic,
    agentCarrierNumber: row.agent_carrier_number,
  };
}

function financeToApi(row) {
  if (!row) return null;
  return {
    _id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    OTP: row.otp,
    password: row.password,
    verified: row.verified,
    isFinanceUser: row.is_finance_user,
    code: row.code,
    phoneNumber: row.phone_number,
    profilePic: row.profile_pic,
  };
}

const toApi = {
  admins: adminToApi,
  agents: agentToApi,
  finances: financeToApi,
};

function withoutPassword(user) {
  if (!user) return null;
  const copy = { ...user };
  delete copy.password;
  return copy;
}

function idFromToken(decode) {
  if (decode && typeof decode === "object") {
    return decode._id || decode.id || null;
  }
  return decode || null;
}

async function findByEmail(table, email) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("email", email);
  if (error) throw error;
  return (data || []).map(toApi[table]);
}

async function findOneByEmail(table, email) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("email", email)
    .limit(1);
  if (error) throw error;
  return toApi[table](data && data[0]);
}

async function findById(table, id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return toApi[table](data);
}

async function insertRow(table, row) {
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return toApi[table](data);
}

async function updateById(table, id, changes) {
  if (!id) return null;
  const { data, error } = await supabase
    .from(table)
    .update(changes)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return toApi[table](data);
}

module.exports = {
  newId,
  withoutPassword,
  idFromToken,
  findByEmail,
  findOneByEmail,
  findById,
  insertRow,
  updateById,
};
