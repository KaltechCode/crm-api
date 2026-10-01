const express = require("express");
const router = express.Router();
const supportController = require("../controller/supportController");

router.post("/", supportController.submitTechnicalSupport);

module.exports = router;
