import crypto from "crypto";
import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

// Create user — only admin can create users, and only for their own company

export const createUser = async (req: AuthRequest, res: Response) => {
  const { name, phone, designation, department } = req.body;
  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  const loginCode = crypto.randomInt(100000, 999999).toString();

  const user = await User.create({
    companyId: req.user!.companyId,
    name,
    phone,
    loginCode,
    designation,
    department,
    role: "user",
  });

  // loginCode is the employee's only credential — give it to them, this is the only time it's returned
  res.status(201).json({
    user: { id: user._id, name: user.name, phone: user.phone, designation: user.designation, department: user.department, role: user.role },
    loginCode,
  });
};



// get user profile — only admin can get users, and only for their own company
export const getUsers = async (req: AuthRequest, res: Response) => {
  const users = await User.find({ companyId: req.user!.companyId, role: "user" }).select(
    "name phone email designation department joiningDate createdAt"
  );

  res.json({ users });
};

// update the user details — only admin can update users, and only for their own company


export const updateUser = async (req: AuthRequest, res: Response) => {
  const { name, phone, designation, department } = req.body;
  const updates: Record<string, string> = {};
  if(name !== undefined) updates.name = name;
  if(phone !== undefined) updates.phone = phone;
  if(designation !== undefined) updates.designation = designation;
  if(department !== undefined) updates.department = department;

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, companyId: req.user!.companyId, role: "user" },
    { $set: updates },
    { new: true }
  ).select("name phone email designation department joiningDate createdAt");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });

}


// delete user — only admin can delete users, and only for their own company

export const deleteUser = async (req: AuthRequest, res: Response) => {

  const user = await User.findOneAndDelete({ _id: req.params.id, companyId: req.user!.companyId, role: "user" });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ message: "User deleted successfully" });
}





