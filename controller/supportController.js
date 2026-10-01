const supabase = require("../db");
const { sendTechnicalSupportEmails } = require("./email");
const technicalSupportPage = require("../views/technicalSupportPage");

const LIMITS = {
  firstName: 80,
  lastName: 80,
  email: 254,
  phoneNumber: 30,
  agentCode: 32,
  subject: 200,
  description: 4000,
};

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function validate(body) {
  const data = {
    firstName: clean(body.firstName),
    lastName: clean(body.lastName),
    email: clean(body.email).toLowerCase(),
    phoneNumber: clean(body.phoneNumber),
    agentCode: clean(body.agentCode),
    subject: clean(body.subject),
    description: String(body.description ?? "").trim(),
  };
  const errors = {};

  if (clean(body.companyWebsite)) {
    errors.form = "Unable to submit this request.";
  }
  if (!data.firstName) errors.firstName = "First name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!/^[0-9+().\-\s]{7,30}$/.test(data.phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }
  if (!/^[A-Za-z0-9]{3,32}$/.test(data.agentCode)) {
    errors.agentCode = "Enter a valid agent code.";
  }
  if (!data.subject) errors.subject = "Subject is required.";
  if (!data.description) {
    errors.description = "Please describe the technical problem you are facing.";
  }

  for (const [field, max] of Object.entries(LIMITS)) {
    if (data[field] && data[field].length > max) {
      errors[field] = `Must be ${max} characters or fewer.`;
    }
  }

  return { data, errors };
}

exports.renderTechnicalSupportForm = (req, res) => {
  res.type("html").send(technicalSupportPage);
};

exports.submitTechnicalSupport = async (req, res) => {
  try {
    const { data, errors } = validate(req.body || {});
    if (errors.form) {
      return res.status(200).send({
        message: "Your request was submitted. A confirmation was sent to your email.",
      });
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).send({
        message: "Please correct the highlighted fields.",
        errors,
      });
    }

    const { data: saved, error } = await supabase
      .from("technical_support_requests")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName || null,
        email: data.email,
        phone_number: data.phoneNumber,
        agent_code: data.agentCode,
        subject: data.subject,
        description: data.description,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Support request insert failed:", error);
      const missingTable =
        error.code === "PGRST205" ||
        error.code === "42P01" ||
        /technical_support_requests/i.test(error.message || "");
      return res.status(500).send({
        message: missingTable
          ? "Support requests are not set up yet. Create the technical_support_requests table in Supabase."
          : "Unable to save your request. Please try again.",
      });
    }

    const emails = await sendTechnicalSupportEmails(data);
    const { error: updateError } = await supabase
      .from("technical_support_requests")
      .update({
        support_email_sent: emails.supportEmailSent,
        submitter_email_sent: emails.submitterEmailSent,
      })
      .eq("id", saved.id);

    if (updateError) {
      console.error("Support email status update failed:", updateError);
    }

    let message =
      "Your request was submitted. A confirmation was sent to your email, and the support team was notified.";
    if (!emails.supportEmailSent || !emails.submitterEmailSent) {
      message =
        "Your request was saved. One of the notification emails could not be sent, but the support team can still see the request.";
    }

    return res.status(201).send({
      message,
      id: saved.id,
      supportEmailSent: emails.supportEmailSent,
      confirmationEmailSent: emails.submitterEmailSent,
    });
  } catch (error) {
    console.error("Support request failed:", error);
    return res.status(500).send({ message: "Unable to submit your request. Please try again." });
  }
};
