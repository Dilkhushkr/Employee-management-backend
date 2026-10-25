import { Router } from "express";
import { protect, requireRole } from "../middleware/auth";
import { createLeavePolicy, getLeavePolicies, updateLeavePolicy, deleteLeavePolicy } from "../controllers/leavePolicyController";

const router = Router();

router.post("/", protect, requireRole("admin"), createLeavePolicy);
router.get("/", protect, requireRole("admin"), getLeavePolicies);
router.put("/:id", protect, requireRole("admin"), updateLeavePolicy);
router.delete("/:id", protect, requireRole("admin"), deleteLeavePolicy);

export default router;