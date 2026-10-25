import {Response, Request} from "express";
import { AuthRequest } from "../middleware/auth";
import { getOrCreateBalance } from "../services/leaveBalanceService";
import LeavePolicy from "../models/LeavePolicy";



export const getLeaveBalance = async (req: AuthRequest, res: Response) => {

    const { companyId, userId } = req.user!;
    const leaveYear = new Date().getFullYear();

    const policies = await LeavePolicy.find({ companyId, isActive: true });

    const balances = await Promise.all(
        policies.map((policy) => getOrCreateBalance(companyId!, userId, String(policy._id), leaveYear))
    );
    res.json(balances);

}