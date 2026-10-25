import { Response } from "express";
import LeavePolicy from "../models/LeavePolicy";
import { AuthRequest } from "../middleware/auth";



export const createLeavePolicy = async (req: AuthRequest, res: Response) => {

    const { name, yearlyQuota, accrualType, accrualAmount } = req.body;
    if (!name) {
        return res.status(400).json({ message: "name is required" });
    }

    const existing = await LeavePolicy.findOne({ companyId: req.user!.companyId, name });
    if (existing) {
        return res.status(400).json({ message: "Leave policy with this name already exists" });
    }

    const policy = await LeavePolicy.create({
        ...req.body,
        companyId: req.user!.companyId,
    });

    res.status(201).json({ policy });
}



export const getLeavePolicies = async (req: AuthRequest, res: Response) => {
    const policies = await LeavePolicy.find({ companyId: req.user!.companyId, isActive: true });
    res.json(policies);
};


export const updateLeavePolicy = async (req: AuthRequest, res: Response) => {
    const policy = await LeavePolicy.findOneAndUpdate(
        { _id: req.params.id, companyId: req.user!.companyId },
        req.body,
        { new: true }
    );
    if (!policy) {
        return res.status(404).json({ message: "Leave policy not found" });
    }
    res.json(policy);
};


export const deleteLeavePolicy = async (req: AuthRequest, res: Response) => {
    const policy = await LeavePolicy.findOneAndDelete(
        { _id: req.params.id, companyId: req.user!.companyId }
    );
    if (!policy) {
        return res.status(404).json({ message: "Leave policy not found" });
    }
    res.json({ message: "Leave policy deleted successfully" });
};





