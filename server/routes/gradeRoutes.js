const express = require("express");
const gradeController = require("../controllers/gradeController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware, gradeController.getGrades);
router.post("/", authMiddleware, roleMiddleware(["admin"]), gradeController.createGrade);

module.exports = router;
