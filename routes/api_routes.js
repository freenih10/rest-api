const express = require("express");
const apiController = require("../controllers/api_controller");

const router = express.Router();

// list all api
router.get("/", apiController.listApi);

// tiktok api
router.get("/api/tiktok", apiController.tiktokDownloader);

module.exports = router;
