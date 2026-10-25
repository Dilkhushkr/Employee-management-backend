import { Router } from "express";
import { protect } from "../middleware/auth";
import { getLeaveBalance } from "../controllers/leaveBalanceController";

const router = Router();

router.get("/", protect, getLeaveBalance);

export default router;