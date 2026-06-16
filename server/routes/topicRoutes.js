const express = require("express");
const topicController = require("../controllers/topicController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware, topicController.getTopics);
router.post("/", authMiddleware, roleMiddleware(["teacher", "admin"]), topicController.createTopic);

module.exports = router;
