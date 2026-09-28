const express = require('express');
const router = express.Router()
const agentsController =require('../controller/agentController')
const {protect} =require('../middleware/authUser')

router.get('/getApprovedAgents',protect,agentsController.getApprovedAgents)
router.get('/getAllAgents',protect,agentsController.getAllAgents)
router.post('/addNewAgent',protect,agentsController.addNewAgent)
router.post('/addNewAgent/:recruitingAgentCode',protect,agentsController.addNewAgent)
router.post('/approveAgent/:id',protect,agentsController.approveAgent)
router.get('/getAgentByID/:id',protect,agentsController.getAgentByID)
router.delete('/deleteAgent/:id',protect,agentsController.deleteAgent)
router.post('/deactivateAgent/:id',protect,agentsController.deactivateAgent)
router.post('/activateAgent/:id',protect,agentsController.activateAgent)

router.post('/updateMyAccount',protect,agentsController.updateMyAccount)
router.post('/editAgent/:id',protect,agentsController.editAgent)

//Agent View
router.get('/getAllAgentsAgentView',protect,agentsController.getAllAgents_AgentView)



module.exports=router