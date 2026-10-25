import {Router} from "express";
import { protect, requireRole } from "../middleware/auth";
import { checkIn, checkOut, getMyAttendance ,getAllAttendance} from "../controllers/attendanceController";

const router = Router();

router.post("/check-in", protect, requireRole("user"), checkIn);
router.post("/check-out", protect, requireRole("user"), checkOut);
router.get("/my-attendance", protect, requireRole("user"), getMyAttendance);
router.get("/all-attendance", protect, requireRole("admin"), getAllAttendance);
export default router;