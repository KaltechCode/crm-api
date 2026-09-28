const express = require('express');
const router = express.Router()
const recruitsController =require('../controller/recruitsController')

router.get('/getAllAgents',recruitsController.getAllAgents)
router.post('/addNewRecruits',recruitsController.addNewAgent)
router.get('/getRecruitByID/:id',recruitsController.getRecruitByID)

module.exports=router