const express = require('express');
const router = express.Router()
const policiesController =require('../controller/policyController')
const {protect} = require('../middleware/authUser')


router.get('/getAllPolicies',protect,policiesController.getAllPolicies)
router.post('/addNewPolicy',protect,policiesController.addNewPolicy)
router.get('/getPolicyByID/:_id',protect,policiesController.getPolicyByID)
router.get('/getPolicyByPolicyNumber/:policyNumber',protect,policiesController.getPolicyByPolicyNumber)
router.post('/approvePolicy/:id',protect,policiesController.approvePolicy)
router.post('/rejectPolicy/:id',protect,policiesController.rejectPolicy)
router.get('/getAllCommissions',protect,policiesController.getAllCommissions)
router.get('/getCommissionById/:_id',protect,policiesController.getCommissionById)
router.delete('/deleteCommission/:_id',protect,policiesController.deleteCommission)


router.post('/isPaid/:id',protect,policiesController.isPaid)
router.post('/chargedBack/:id',protect,policiesController.chargedBack)
router.post('/statement',protect,policiesController.statement)
router.get('/getStatementByID/:_id',protect,policiesController.getStatementByID)
router.post('/updateStatement/:id',protect,policiesController.updateStatement)

router.get('/getAllCommissions_AgentView/:_id',protect,policiesController.getAllCommissions_AgentView)
router.get('/getAllPoliciesAgentView',protect,policiesController.getAllPolicies_AgentView)
router.post('/statementAgentView/:agentCode',protect,policiesController.statement_AgentView)


module.exports=router