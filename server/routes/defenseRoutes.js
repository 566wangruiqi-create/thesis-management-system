const express = require("express");
const defenseController = require("../controllers/defenseController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware, defenseController.getDefenses);
router.post("/", authMiddleware, roleMiddleware(["admin"]), defenseController.createDefense);

module.exports = router;
