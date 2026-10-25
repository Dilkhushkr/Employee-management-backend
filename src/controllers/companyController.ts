import { Response } from "express";
import bcrypt from "bcryptjs";
import Company from "../models/Company";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

export const createCompany = async (req: AuthRequest, res: Response) => {
  const { companyName, adminName, adminEmail, adminPassword } = req.body;
  if (!companyName || !adminName || !adminEmail || !adminPassword) {
    return res.status(400).json({ message: "companyName, adminName, adminEmail, adminPassword are required" });
  }

  const slug = companyName.toLowerCase().trim().replace(/\s+/g, "-");

  const existingCompany = await Company.findOne({ slug });
  if (existingCompany) {
    return res.status(409).json({ message: "Company already exists" });
  }

  const company = await Company.create({ name: companyName, slug });

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const admin = await User.create({
    companyId: company._id,
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
  });

  res.status(201).json({
    company: { id: company._id, name: company.name, slug: company.slug },
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
};

export const getAdmins = async (req: AuthRequest, res: Response) => {

  const admins = await User.find({ role: "admin" })
    .select("name email companyId createdAt")
    .populate("companyId", "name slug");
  
  res.json({count : admins.length, admins});
  
}
