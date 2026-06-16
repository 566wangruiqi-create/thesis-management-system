const express = require("express");
const archiveController = require("../controllers/archiveController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware, archiveController.getArchives);
router.post("/", authMiddleware, roleMiddleware(["admin"]), archiveController.createArchive);

module.exports = router;
