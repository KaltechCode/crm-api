const express = require('express')
const router = express.Router()
const notificationController = require('../controller/notificationController')
const {protect} = require('../middleware/authUser')


router.get('/getAllNotifications_AdminView',notificationController.getAllNotifications_AdminView)
router.get('/getAllNotifications_AgentView/:agentCode',notificationController.getAllNotifications_AgentView)
router.get('/getAllNotifications_FinanceView',notificationController.getAllNotifications_FinanceView)
router.post('/updateNotification/:id',notificationController.updateNotification)

module.exports=router