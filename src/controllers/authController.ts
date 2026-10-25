import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { signToken } from "../utils/jwt";

// superadmin / admin login — email + password only, email is globally unique so no companySlug needed
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ email });

  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  if (!user.password) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ userId: user._id, companyId: user.companyId, role: user.role });

  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

// employee login — just the invite code, nothing else
export const loginWithCode = async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "code is required" });
  }

  const user = await User.findOne({ loginCode: code });
  if (!user) return res.status(401).json({ message: "Invalid code" });

  const token = signToken({ userId: user._id, companyId: user.companyId, role: user.role });

  res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
};2
