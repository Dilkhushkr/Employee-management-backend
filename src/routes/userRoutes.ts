import { Router } from "express";
import { protect, requireRole } from "../middleware/auth";
import { createUser, getUsers, updateUser, deleteUser } from "../controllers/userController";

const router = Router();

router.post("/", protect, requireRole("admin"), createUser);
router.get("/", protect, requireRole("admin"), getUsers);
router.put("/:id", protect, requireRole("admin"), updateUser);
router.delete("/:id", protect, requireRole("admin"), deleteUser);

export default router;
