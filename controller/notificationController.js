const supabase = require("../db");

function toNotification(row) {
  if (!row) return null;
  return {
    _id: row.id,
    unRead: row.unread,
    newPolicy: row.new_policy,
    newAgent: row.new_agent,
    source: row.source,
    agentCode: row.agent_code,
    policyNumber: row.policy_number,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listNotifications(filters) {
  let query = supabase.from("notifications").select("*");

  for (const filter of filters) {
    query = query[filter.op](...filter.args);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  const notifications = (data || []).map(toNotification);
  return {
    notifications,
    noOfUnReadNotification: notifications.filter((item) => item.unRead).length,
  };
}

exports.getAllNotifications_AdminView = async (req, res) => {
  try {
    const result = await listNotifications([
      { op: "eq", args: ["source", "Agent"] },
      { op: "or", args: ["new_policy.eq.true,new_agent.eq.true"] },
    ]);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getAllNotifications_AgentView = async (req, res) => {
  try {
    const result = await listNotifications([
      { op: "eq", args: ["source", "Admin"] },
      { op: "eq", args: ["agent_code", req.params.agentCode] },
    ]);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getAllNotifications_FinanceView = async (req, res) => {
  try {
    const result = await listNotifications([
      { op: "eq", args: ["source", "Admin"] },
      { op: "ilike", args: ["message", "%paid a commission%"] },
    ]);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ unread: false })
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).send({ message: "Notification not found" });
    }

    res.status(200).send(toNotification(data));
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(400).send({ message: "Internal Server Error" });
  }
};
