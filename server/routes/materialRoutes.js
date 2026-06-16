const express = require("express");
const materialController = require("../controllers/materialController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware, materialController.getMaterials);
router.post("/", authMiddleware, roleMiddleware(["student"]), materialController.submitMaterial);
router.put(
  "/:id/review",
  authMiddleware,
  roleMiddleware(["teacher"]),
  materialController.reviewMaterial
);

module.exports = router;
