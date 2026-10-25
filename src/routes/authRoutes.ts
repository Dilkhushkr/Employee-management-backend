import { Router } from "express";
import { login, loginWithCode } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/login-code", loginWithCode);

export default router;
