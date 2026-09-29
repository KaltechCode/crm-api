const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY_CRM);

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
