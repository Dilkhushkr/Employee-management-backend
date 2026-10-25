import { Router } from "express";
import { protect, requireRole } from "../middleware/auth";
import {
    createLeaveRequest, listLeaveRequests,
    approveLeaveRequest, rejectLeaveRequest, cancelLeaveRequest,
} from "../controllers/leaveRequestController";

const router = Router();

router.post("/", protect, createLeaveRequest);
router.get("/", protect, listLeaveRequests);
router.patch("/:id/approve", protect, requireRole("admin"), approveLeaveRequest);
router.patch("/:id/reject", protect, requireRole("admin"), rejectLeaveRequest);
router.patch("/:id/cancel", protect, cancelLeaveRequest);

export default router;
