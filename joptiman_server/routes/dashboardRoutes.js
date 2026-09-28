const express = require('express');
const router = express.Router()
const dasboardController =require('../controller/dashboardController')
const {protect} = require('../middleware/authUser')

router.get('/getPreviousYears',dasboardController.getPreviousYears)
router.get('/getPreviousMonths',dasboardController.getPreviousMonths)
router.get('/getMonthlyPolicyData/:month',protect,dasboardController.getMonthlyPolicyData)
router.get('/getMatrixData/:year',protect,dasboardController.getYearlyMonthlyPolicyData)
// router.get('/getHighestRecruitsAgent',dasboardController.getHighestRecruitsAgent)
router.get('/getDetailsOfHighestCommissionedAgent/:month',dasboardController.getDetailsOfHighestCommissionedAgent)
router.get('/highestRecruitsAgent/:month',dasboardController.highestRecruitsAgent)
router.get('/TotalNoOfRecruits/:month',dasboardController.TotalNoOfRecruits)

router.get('/getMonthlyPolicyDataAgentView/:month',protect,dasboardController.getMonthlyPolicyData_AgentView)
router.get('/getMatrixDataAgentView/:year',protect,dasboardController.getYearlyMonthlyPolicyData_AgentView)




module.exports=router