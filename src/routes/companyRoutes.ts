import { Router } from "express";
import { protect, requireRole } from "../middleware/auth";
import { createCompany, getAdmins } from "../controllers/companyController";

const router = Router();

router.post("/", protect, requireRole("superadmin"), createCompany);
router.get("/admins", protect, requireRole("superadmin"), getAdmins);

export default router;
