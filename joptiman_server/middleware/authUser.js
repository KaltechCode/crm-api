const JWT = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
// const User = require('../models/userModel')
const { findById, withoutPassword, idFromToken } = require('../rowMap')

const protect = asyncHandler(async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(" ")[1]
            // console.log("token",token);
            const decode = JWT.verify(token, "INSURANCE_CRM")
            // console.log(decode)
            const userId = idFromToken(decode)

            const admin = withoutPassword(await findById("admins", userId))
            const agent = withoutPassword(await findById("agents", userId))
            const finance = withoutPassword(await findById("finances", userId))
            if (admin) {
                req.user = admin
            }
            else if (agent) {
                req.user = agent
            }
            else if (finance){
                req.user = finance
            }
            else {
                res.status(400).send('User not found')
            }

            next();
        } catch (error) {
            res.status(400)
            res.send(error.message)
        }
    }
})

module.exports = { protect }
