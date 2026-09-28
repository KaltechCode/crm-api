const jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const universal = require("./universal");
const emailModule = require("./email");
const {
  newId,
  findByEmail,
  findOneByEmail,
  updateById,
  insertRow,
} = require("../rowMap");

async function userExist(email) {
  let admin = await findByEmail("admins", email);
  let agent = await findByEmail("agents", email);
  let finance = await findByEmail("finances", email);
  if (admin.length == 0 && agent.length == 0 && finance.length == 0) {
    return false;
  } else {
    return true;
  }
}
async function CheckPassword(password, hash) {
  let comp = await bcrypt.compare(password, hash);
  return comp;
}

exports.register = async (req, res) => {
  let { firstName, lastName, email, password, code, isAdmin, isFinanceUser } =
    req.body;
  let verifyOTP = universal.generateOTP();
  function generateAdminCode(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    return code;
  }
  try {
    //
    let a = universal.isEmpty([firstName, lastName, email, password, code]);

    if (a.includes("is Empty")) {
      res.status(400).send({ message: "Please Fill All Fields" });
    } else if (universal.Isvalidemail(email)) {
      res.status(400).send({ message: "Please Provide a Valid Email Address" });
    } else if (password.length <= 6) {
      res
        .status(400)
        .send({ message: "Password must be of 8 Alphanumeric characters" });
    } else if (await userExist(email)) {
      res.status(400).send({ message: "User Already Exist" });
    } else if (universal.isAlphanumeric(password)) {
      res.status(400).send({ message: "Password Must be AlphaNumeric" });
    }
    // else {

    //     // let em = await emailfn.module(verifyOTP, email)
    //     if (em == "Success") {
    //         let user = new Admin({
    //             email: email,
    //             password: await bcrypt.hash(password, 12),
    //             OTP: verifyOTP,
    //             userName: username,
    //             images:["https://firebasestorage.googleapis.com/v0/b/marood-storage.appspot.com/o/users%2FColoredAvtar(2).png?alt=media&token=09b623f9-d97d-421b-adb0-5471fd7ffab2"]

    //         })
    //         user.save()

    //         res.status(200).send({ "message": "Verify OTP", data: { _id: user._id, OTP: user.OTP, email: user.email, username: user.userName } })
    //     }
    //     else {
    //         res.status(400).send({ "message": "Unable to send Mail", data: [] })
    //     }
    // }
    else {
      if (isAdmin) {
        const admin = await insertRow("admins", {
          id: newId(),
          email: email,
          password: await bcrypt.hash(password, 12),
          first_name: firstName,
          last_name: lastName,
          admin_code: code,
          verified: false,
          is_admin: true,
        });
        res.status(200).send({
          message: "Admin Registered Successfully",
          data: {
            _id: admin._id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            adminCode: admin.adminCode,
          },
        });
      } else {
        const financeUser = await insertRow("finances", {
          id: newId(),
          email: email,
          password: await bcrypt.hash(password, 12),
          first_name: firstName,
          last_name: lastName,
          code: code,
          verified: false,
          is_finance_user: true,
        });

        res.status(200).send({
          message: "Finance User Registered Successfully",
          data: {
            _id: financeUser._id,
            email: financeUser.email,
            firstName: financeUser.firstName,
            lastName: financeUser.lastName,
            code: financeUser.code,
          },
        });
      }
    }
  } catch (e) {
    res.status(400).send({
      message: "unable to add Please Check password and Email",
      data: e.message,
    });
  }
};

exports.login = async (req, res) => {
  let { email, password } = req.body;

  try {
    let a = universal.isEmpty([email, password]);

    if (a.includes("is Empty")) {
      res.status(400).send({ message: "Please Fill All Fields" });
    }
    // else if (universal.Isvalidemail(email)) {
    //     res.status(400).send({ "message": "Please Provide a Valid Email Address" })
    // }
    // else if (password.length <= 6) {
    // res.status(400).send({ "message": "Password must be of 8 Alphanumeric characters" })

    // }
    else if (!(await userExist(email))) {
      res.status(400).send({ message: "User Doesnot Exist" });
    } else {
      let admin = await findByEmail("admins", email);
      let agent = await findByEmail("agents", email);
      let finance = await findByEmail("finances", email);

      if (admin.length > 0) {
        if (await CheckPassword(password, admin[0].password)) {
          const token = jwt.sign(
            {
              _id: admin[0]._id,
              email: admin[0].email,
              username: admin[0].userName,
            },
            "INSURANCE_CRM",
          );

          console.log("isAdmin", admin[0].isAdmin);
          res.status(200).send({
            message: "Logged In Successfully",
            token: token,
            isAdmin: admin[0].isAdmin,
            userId: admin[0]._id,
            firstName: admin[0].firstName,
            lastName: admin[0].lastName,
            adminCode: admin[0].adminCode,
            profilePic: admin[0].profilePic,
          });
        } else {
          res.status(400).send({ message: "Incorrect Password", data: [] });
        }
      } else if (agent.length > 0) {
        if (agent[0].active) {
          if (await CheckPassword(password, agent[0].password)) {
            const token = jwt.sign(
              {
                _id: agent[0]._id,
                email: agent[0].email,
                username: agent[0].userName,
              },
              "INSURANCE_CRM",
            );

            res.status(200).send({
              message: "Logged In Successfully",
              token: token,
              isAdmin: agent[0].isAdmin,
              userId: agent[0]._id,
              firstName: agent[0].firstName,
              agentTitle: agent[0].agentTitle,
              agentCode: agent[0].agentCode,
              recruitingAgentCode: agent[0].recruitingAgentCode,
              recruits: agent[0].recruits,
              recruitmentDate: agent[0].recruitmentDate,
              agentCarrierNumber: agent[0].agentCarrierNumber,
              contractLevel: agent[0].level,
              profilePic: agent[0].profilePic,
            });
          } else {
            res.status(400).send({ message: "Incorrect Password", data: [] });
          }
        } else {
          res
            .status(400)
            .send({ message: "Your account has been deactivated" });
        }
      } else {
        console.log("finance[0]", finance[0]);
        if (await CheckPassword(password, finance[0].password)) {
          const token = jwt.sign(
            {
              _id: finance[0]._id,
              email: finance[0].email,
              username: finance[0].userName,
            },
            "INSURANCE_CRM",
          );

          res.status(200).send({
            message: "Logged In Successfully",
            token: token,
            userId: finance[0]._id,
            isFinanceUser: finance[0].isFinanceUser,
            firstName: finance[0].firstName,
            lastName: finance[0].lastName,
            code: finance[0].code,
            profilePic: finance[0].profilePic,
          });
        } else {
          res.status(400).send({ message: "Incorrect Password", data: [] });
        }
      }
    }
  } catch (e) {
    res.status(500).send({ message: "unable to Login User", data: e.message });
  }
};

exports.ForgetPassword = async (req, res, next) => {
  // try {
  //     let otp = universal.generateOTP()
  //     var email = req.body.email;

  //     if (!await userExist(email)) {
  //         return res.status(400).send({ "message": "User Does Not Exist" });
  //     }
  //     else {
  //         let admin = await Admin.find({ email: email })
  //         let agent = await Agent.find({ email: email })
  //         let finance = await Finance.find({ email: email })

  //         if (admin.length > 0) {
  //             let em = await emailModule.sendOTP(otp, email, admin[0].firstName)
  //             if (em == "Success") {
  //                 const admin = await Admin.findOneAndUpdate(
  //                     { email: email },
  //                     {
  //                         $set: {
  //                             OTP: otp
  //                         }

  //                     },
  //                     { new: true }
  //                 )
  //                 if (admin) {
  //                     res.status(200).send({ "message": "User Found an OTP has been send" });
  //                 }
  //                 else {
  //                     return res.status(200).send({ "message": "User not found" })
  //                 }

  //             }
  //             else {
  //                 return res.status(400).send({ "message": "Unable to send Email" });
  //             }

  //         }
  //         else if (finance.length > 0) {
  //             let em = await emailModule.sendOTP(otp, email, finance[0].firstName)
  //             if (em == "Success") {
  //                 const finance = await Finance.findOneAndUpdate(
  //                     { email: email },
  //                     {
  //                         $set: {
  //                             OTP: otp
  //                         }

  //                     },
  //                     { new: true }
  //                 )
  //                 if (finance) {
  //                     res.status(200).send({ "message": "User Found an OTP has been send" });
  //                 }
  //                 else {
  //                     return res.status(200).send({ "message": "User not found" })
  //                 }

  //             }
  //             else {
  //                 return res.status(400).send({ "message": "Unable to send Email" });
  //             }

  //         }
  //         else {
  //             let em = await emailModule.sendOTP(otp, email, agent[0].firstName)
  //             if (em == "Success") {
  //                 const agent = await Agent.findOneAndUpdate(
  //                     { email: email },
  //                     {
  //                         $set: {
  //                             OTP: otp
  //                         }
  //                     },
  //                     { new: true }
  //                 )

  //                 if (agent) {
  //                     res.status(200).send({ "message": "User Found an OTP has been send" });
  //                 }
  //                 else {
  //                     return res.status(200).send({ "message": "User not found" })
  //                 }
  //             }
  //             else {
  //                 return res.status(400).send({ "message": "Unable to send Email" });
  //             }
  //         }

  //     }
  // }
  // catch (error) {
  //     return res.status(500).send({ "message": "Error Ocurred", data: error.message });
  // }

  try {
    let otp = universal.generateOTP();
    var email = req.body.email;
    const [admin, finance, agent] = await Promise.all([
      findOneByEmail("admins", email),
      findOneByEmail("finances", email),
      findOneByEmail("agents", email),
    ]);

    const user = admin || finance || agent;
    if (!user) return res.status(400).send({ message: "User Does Not Exist" });

    const em = await emailModule.sendOTP(otp, email, user.firstName);
    if (em !== "Success")
      return res.status(400).send({ message: "Unable to send Email" });

    const table = admin ? "admins" : finance ? "finances" : "agents";
    await updateById(table, user._id, { otp: String(otp) });
    return res
      .status(200)
      .send({ message: "User Found, OTP has been sent successfully" });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error Ocurred", data: error.message });
  }
};

exports.VerifyOtp = async (req, res, next) => {
  const { otp, email, password } = req.body;

  try {
    const exists = await userExist(email);
    if (!exists) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const admin = await findOneByEmail("admins", email);
    if (admin) {
      return await handleOtpVerification("admins", admin, otp, password, res);
    }

    const agent = await findOneByEmail("agents", email);
    if (agent) {
      return await handleOtpVerification("agents", agent, otp, password, res);
    }

    const finance = await findOneByEmail("finances", email);
    if (finance) {
      return await handleOtpVerification("finances", finance, otp, password, res);
    }

    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

async function handleOtpVerification(table, user, otp, password, res) {
  if (user.OTP !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const updated = await updateById(table, user._id, {
    otp: "",
    verified: true,
    password: await bcrypt.hash(password, 12),
  });

  const token = jwt.sign(
    { _id: updated._id, email: updated.email, username: updated.userName },
    process.env.JWT_SECRET || "INSURANCE_CRM",
    { expiresIn: "7d" },
  );

  return res.status(200).json({ message: "OTP verified", data: token });
}

exports.ResetPassword = async (req, res, next) => {
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 12);
    var email = req.body.email;

    const userExist = await userExist(email);

    if (!userExist) {
      res.status(400).send({ message: "User Doesnot Exist" });
    }

    let admin = await findByEmail("admins", email);
    let agent = await findByEmail("agents", email);

    if (admin) {
      await updateById("admins", admin._id, {
        password: hashPassword,
      });

      return res
        .status(200)
        .send({ message: "Success", data: "Password reset successfully" });
    }

    if (agent) {
      await updateById("agents", agent._id, {
        password: hashPassword,
      });

      return res
        .status(200)
        .send({ message: "Success", data: "Password reset successfully" });
    }
  } catch (ex) {
    return res.status(500).send(ex);
  }
};

exports.updateAdminAccount = async (req, res) => {
  try {
    const { email, password, profilePic, phoneNumber } = req.body;

    if (!email || !password || !phoneNumber) {
      res.status(400).send("Please fill all fields");
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      const changes = {
        email: email,
        password: hashedPassword,
        profile_pic: profilePic ?? null,
        phone_number: phoneNumber == null ? null : String(phoneNumber),
      };

      const existing = await findOneByEmail("admins", email);
      const admin = existing
        ? await updateById("admins", existing._id, changes)
        : await insertRow("admins", {
            id: newId(),
            ...changes,
            verified: false,
            is_admin: true,
          });

      if (admin) {
        res.status(200).send({ message: "Account updated Successfully" });
      } else {
        res.status(400).send({ message: "Account Not found" });
      }
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getAccountDetails = async (req, res) => {
  const email = req.user.email;
  try {
    const admin = await findOneByEmail("admins", email);

    if (admin) {
      res.status(200).send({
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        adminCode: admin.adminCode,
        phoneNumber: admin.phoneNumber,
        profilePic: admin.profilePic,
      });
    } else {
      res.status(400).send({ message: "Account Not found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
