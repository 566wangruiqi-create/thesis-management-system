const express = require("express");
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware, applicationController.getApplications);
router.post("/", authMiddleware, roleMiddleware(["student"]), applicationController.createApplication);
router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  applicationController.approveApplication
);
router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  applicationController.rejectApplication
);

module.exports = router;
