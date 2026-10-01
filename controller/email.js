const fs = require("fs");
const path = require("path");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY_CRM);

const SUPPORT_INBOX = "support@joptiman.com";
const MAIL_FROM = "admin@joptimanconsultancy.com";
const NAVY = "#0b1744";
const TEAL = "#1aa6c4";
const ORANGE = "#f47b20";
const TEXT = "#3a4354";
const MUTED = "#6b7280";
const logoBase64 = fs
  .readFileSync(path.join(__dirname, "../views/JOptimanlogo.png"))
  .toString("base64");

function logoAttachment() {
  return {
    content: logoBase64,
    filename: "JOptimanlogo.png",
    type: "image/png",
    disposition: "inline",
    content_id: "joptiman-logo",
  };
}

function renderBrandedEmail({ title, subtitle, bodyHtml, boxTitle, boxHtml, footerNote }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#eef1f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:${NAVY};height:8px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background:${ORANGE};height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td align="center" style="background:#ffffff;padding:28px 32px 4px;">
              <img src="cid:joptiman-logo" width="220" alt="JOptiman Consultancy" style="display:block;width:220px;max-width:80%;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:32px 40px 0;font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0;color:${NAVY};font-size:26px;line-height:1.3;font-weight:700;">${title}</h1>
              <p style="margin:10px 0 0;color:${MUTED};font-size:15px;line-height:1.5;">${subtitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 8px;font-family:Arial,Helvetica,sans-serif;color:${TEXT};font-size:15px;line-height:1.65;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;color:${TEXT};font-size:14px;line-height:1.6;">
                    <p style="margin:0 0 6px;color:${NAVY};font-size:15px;font-weight:700;">${boxTitle}</p>
                    ${boxHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #e6e8ee;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 40px 8px;font-family:Arial,Helvetica,sans-serif;color:${TEXT};font-size:15px;line-height:1.6;">
              <p style="margin:0 0 8px;color:${NAVY};font-size:18px;font-weight:700;">Need help?</p>
              <p style="margin:0 0 16px;">Our customer support team is here for you:</p>
              <p style="margin:0 0 14px;">
                <span style="display:block;color:${TEAL};font-size:12px;font-weight:700;letter-spacing:0.06em;">EMAIL</span>
                <a href="mailto:${SUPPORT_INBOX}" style="color:${TEAL};text-decoration:underline;">${SUPPORT_INBOX}</a>
              </p>
              <p style="margin:0 0 14px;">
                <span style="display:block;color:${TEAL};font-size:12px;font-weight:700;letter-spacing:0.06em;">PHONE</span>
                <a href="tel:+18884917757" style="color:${TEXT};text-decoration:none;">+1 (888) 491-7757</a>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 40px 28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 12px;">
                <a href="https://www.joptimanconsultancy.com" style="color:${TEAL};font-size:14px;font-weight:700;text-decoration:underline;">www.joptimanconsultancy.com</a>
              </p>
              <p style="margin:0 0 6px;color:${MUTED};font-size:12px;line-height:1.5;">© 2026 JOptiman Consultancy. All rights reserved.</p>
              <p style="margin:0;color:${TEAL};font-size:12px;line-height:1.5;">675 Town Square Blvd. Suite 200, Garland, TX 75040</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;max-width:600px;font-family:Arial,Helvetica,sans-serif;color:#9aa3b2;font-size:12px;line-height:1.5;">${footerNote}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
  const detailRows = [
    ["Name", safe.name],
    ["Email", safe.email],
    ["Phone", safe.phone],
    ["Agent code", safe.agentCode],
    ["Subject", safe.subject],
  ]
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 8px;"><span style="color:${TEAL};font-size:12px;font-weight:700;letter-spacing:0.04em;">${label.toUpperCase()}</span><br />${value}</p>`
    )
    .join("");

  const supportHtml = renderBrandedEmail({
    title: "New support request",
    subtitle: "A technical issue needs your attention",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hello Support,</p>
      <p style="margin:0 0 14px;">${safe.name || "An agent"} submitted a technical support request. Reply to this email to respond directly to ${safe.email}.</p>
      <p style="margin:0;"><strong>Problem</strong><br />${safe.description}</p>
    `,
    boxTitle: "Request details",
    boxHtml: detailRows,
    footerNote: "You are receiving this because a technical support request was submitted to JOptiman Consultancy.",
  });

  const confirmationHtml = renderBrandedEmail({
    title: "We received your request",
    subtitle: "The JOptiman support team has been notified",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hello ${safe.name || "there"},</p>
      <p style="margin:0 0 14px;">We're glad you reached out. Your technical support request is with our team. Reply to this email if you need to add more detail.</p>
      <p style="margin:0 0 14px;"><strong>Subject:</strong> ${safe.subject}</p>
      <p style="margin:0;"><strong>Problem</strong><br />${safe.description}</p>
    `,
    boxTitle: "Not you?",
    boxHtml: `<p style="margin:0;color:${MUTED};">If you did not submit this request, you can safely ignore this email — nothing further will happen.</p>`,
    footerNote: "You are receiving this because you submitted a technical support request to JOptiman Consultancy.",
  });

  const [supportEmailSent, submitterEmailSent] = await Promise.all([
    sendMail({
      to: SUPPORT_INBOX,
      from: MAIL_FROM,
      replyTo: request.email,
      subject: `Technical Support: ${subject}`,
      text: details,
      html: supportHtml,
      attachments: [logoAttachment()],
    }),
    sendMail({
      to: request.email,
      from: MAIL_FROM,
      replyTo: SUPPORT_INBOX,
      subject: "We received your technical support request",
      text: `Hello ${name},\n\nWe received your technical support request.\n\n${details}\n\nYou can reply to this email to reach ${SUPPORT_INBOX}.`,
      html: confirmationHtml,
      attachments: [logoAttachment()],
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
