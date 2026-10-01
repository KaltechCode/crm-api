const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY_CRM);

const SUPPORT_INBOX = "support@joptiman.com";
const MAIL_FROM = "admin@joptimanconsultancy.com";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function supportRequestText(request) {
  return [
    `Name: ${request.firstName} ${request.lastName}`.trim(),
    `Email: ${request.email}`,
    `Phone: ${request.phoneNumber}`,
    `Agent code: ${request.agentCode}`,
    `Subject: ${request.subject}`,
    "",
    request.description,
  ].join("\n");
}

async function sendMail(msg) {
  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Support email failed:", error.message || error);
    return false;
  }
}

exports.sendTechnicalSupportEmails = async (request) => {
  const name = [request.firstName, request.lastName].filter(Boolean).join(" ");
  const details = supportRequestText(request);
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(request.email),
    phone: escapeHtml(request.phoneNumber),
    agentCode: escapeHtml(request.agentCode),
    subject: escapeHtml(request.subject),
    description: escapeHtml(request.description).replace(/\n/g, "<br />"),
  };
  const subject = String(request.subject || "Technical support request").replace(/[\r\n]+/g, " ");

  const supportHtml = `
    <p>A new technical support request was submitted.</p>
    <p><strong>Name:</strong> ${safe.name}<br />
    <strong>Email:</strong> ${safe.email}<br />
    <strong>Phone:</strong> ${safe.phone}<br />
    <strong>Agent code:</strong> ${safe.agentCode}<br />
    <strong>Subject:</strong> ${safe.subject}</p>
    <p><strong>Problem</strong><br />${safe.description}</p>
    <p>Reply to this email to respond directly to ${safe.email}.</p>
  `;

  const confirmationHtml = `
    <p>Hello ${safe.name || "there"},</p>
    <p>We received your technical support request and sent it to the Joptiman support team. Reply to this email if you need to add more detail.</p>
    <p><strong>Subject:</strong> ${safe.subject}<br />
    <strong>Agent code:</strong> ${safe.agentCode}<br />
    <strong>Phone:</strong> ${safe.phone}</p>
    <p><strong>Problem</strong><br />${safe.description}</p>
    <p>Support: ${SUPPORT_INBOX}</p>
  `;

  const [supportEmailSent, submitterEmailSent] = await Promise.all([
    sendMail({
      to: SUPPORT_INBOX,
      from: MAIL_FROM,
      replyTo: request.email,
      subject: `Technical Support: ${subject}`,
      text: details,
      html: supportHtml,
    }),
    sendMail({
      to: request.email,
      from: MAIL_FROM,
      replyTo: SUPPORT_INBOX,
      subject: "We received your technical support request",
      text: `Hello ${name},\n\nWe received your technical support request.\n\n${details}\n\nYou can reply to this email to reach ${SUPPORT_INBOX}.`,
      html: confirmationHtml,
    }),
  ]);

  return { supportEmailSent, submitterEmailSent };
};

exports.sendOTP = async (otp, email, firstName) => {
  const msg = {
    to: email,
    from: "admin@joptimanconsultancy.com",
    subject: "OTP For Recovering Account",
    templateId: "d-112d69ee1f324af6b3c556d93652c186",
    dynamicTemplateData: {
      firstName: firstName,
      otp: otp,
    },
  };
  return await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
      return "Success";
    })
    .catch((error) => {
      console.error(error);
      return "Failure";
    });
};

exports.sendPaymentLink = async (email, firstName) => {
  console.log(email, "sendgrid");
  const msg = {
    to: email,
    from: "admin@joptimanconsultancy.com",
    templateId: "d-bbbd343d0b15424dab51246f18c287ef",
    subject: "Payment Link",
    dynamicTemplateData: {
      firstName: firstName,
      paymentLink: "https://buy.stripe.com/aEUdRe0B06aZ2o83cc",
    },
  };
  return await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
      return "Success";
    })
    .catch((error) => {
      console.error(error.message);
      return "Failure";
    });
};

exports.sendCredentials = async (
  email,
  agentFirstName,
  agentCode,
  password
) => {
  // console.log(email, "sendgrdi")
  const msg = {
    to: email,
    from: "admin@joptimanconsultancy.com",
    templateId: "d-7d65395557e34d2782c24334fde72012",
    dynamicTemplateData: {
      agentFirstName: agentFirstName,
      agentCode: agentCode,
      password: password,
    },
  };
  return await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
      return "Success";
    })
    .catch((error) => {
      console.error(error);
      return "Failure";
    });
};

exports.promoteAgent = async (email, firstName, contractLevel) => {
  // console.log(email, "sendgrdi")
  const msg = {
    to: email,
    from: "admin@joptimanconsultancy.com",
    templateId: "d-fb5795833fd842b28cfc66fa9eacbbfe",
    dynamicTemplateData: {
      firstName: firstName,
      contractLevel: contractLevel,
    },
  };
  return await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
      return "Success";
    })
    .catch((error) => {
      console.error(error);
      return "Failure";
    });
};

exports.ActivateAgent = async (emails, firstName) => {
  if (emails.length > 0) {
    const sendEmail = async (email) => {
      const msg = {
        to: email,
        from: "admin@joptimanconsultancy.com",
        templateId: "d-139b0c5296794785a3dba16e6d9faad4",
        dynamicTemplateData: {
          firstName: firstName,
        },
      };

      try {
        await sgMail.send(msg);
        console.log(`Email sent to ${email}`);
        return "Success";
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return "Failure";
      }
    };

    const results = await Promise.all(emails.map(sendEmail));
    return results;
  } else {
    const msg = {
      to: emails,
      from: "admin@joptimanconsultancy.com",
      templateId: "d-319bc2355d874757925cd899cef7bbde",
      dynamicTemplateData: {
        firstName: firstName,
      },
    };
    return await sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
        return "Success";
      })
      .catch((error) => {
        console.error(error);
        return "Failure";
      });
  }
};

exports.DeActivateAgent = async (emails, firstNames) => {
  if (emails.length > 0 && firstNames.length > 0) {
    const sendEmail = async (email, firstName) => {
      const msg = {
        to: email,
        from: "admin@joptimanconsultancy.com",
        templateId: "d-319bc2355d874757925cd899cef7bbde",
        dynamicTemplateData: {
          firstName: firstName,
        },
      };

      try {
        await sgMail.send(msg);
        console.log(`Email sent to ${email}`);
        return "Success";
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return "Failure";
      }
    };

    const results = await Promise.all(
      emails.map((email, index) => sendEmail(email, firstNames[index]))
    );
    return results;
  } else {
    const msg = {
      to: emails,
      from: "admin@joptimanconsultancy.com",
      templateId: "d-319bc2355d874757925cd899cef7bbde",
      dynamicTemplateData: {
        firstName: firstName,
      },
    };
    return await sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
        return "Success";
      })
      .catch((error) => {
        console.error(error);
        return "Failure";
      });
  }
};

exports.permanantlyDeActivateAgent = async (emails, firstNames) => {
  // console.log(email, "sendgrdi")
  // const msg = {
  //   to: email,
  //   from: 'admin@joptimanconsultancy.com',
  //   templateId: "d-0aa5f102d5aa457993d27f2d255a728b",
  //   dynamicTemplateData: {
  //     firstName: firstName,
  //   }
  // }
  // return await sgMail
  //   .send(msg)
  //   .then(() => {
  //     console.log('Email sent')
  //     return "Success"
  //   })
  //   .catch((error) => {
  //     console.error(error)
  //     return "Failure"
  //   })

  if (emails.length > 0 && firstNames.length > 0) {
    const sendEmail = async (email, firstName) => {
      const msg = {
        to: email,
        from: "admin@joptimanconsultancy.com",
        templateId: "d-0aa5f102d5aa457993d27f2d255a728b",
        dynamicTemplateData: {
          firstName: firstName,
        },
      };

      try {
        await sgMail.send(msg);
        console.log(`Email sent to ${email}`);
        return "Success";
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return "Failure";
      }
    };

    const results = await Promise.all(
      emails.map((email, index) => sendEmail(email, firstNames[index]))
    );
    return results;
  } else {
    const msg = {
      to: emails,
      from: "admin@joptimanconsultancy.com",
      templateId: "d-319bc2355d874757925cd899cef7bbde",
      dynamicTemplateData: {
        firstName: firstName,
      },
    };
    return await sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
        return "Success";
      })
      .catch((error) => {
        console.error(error);
        return "Failure";
      });
  }
};
