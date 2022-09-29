const express = require("express");
const router = express.Router();
const grafanaImportController = require("../controllers/grafanaImportController");

router.route('/home').get([], grafanaImportController.home);
router.route('/import').get([], grafanaImportController.importToGrafana);

module.exports = router;
