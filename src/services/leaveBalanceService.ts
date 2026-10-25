import LeavePolicy from "../models/LeavePolicy";
import LeaveBalance from "../models/LeaveBalance";
import User from "../models/User";
import { Types } from "mongoose";


export const getOrCreateBalance = async (
    companyId: string,
    userId: string,
    leaveTypeId: string,
    leaveYear: number
) => {

    const policy = await LeavePolicy.findOne({ _id: leaveTypeId, companyId });
    if (!policy) {
        throw new Error("Leave policy not found");
    }

    const user = await User.findById(userId);

    let balance = await LeaveBalance.findOne({ userId, leaveTypeId, leaveYear });

    if (!balance) {
        balance = await LeaveBalance.create({
            companyId,
            userId,
            leaveTypeId,
            leaveYear,
        });
    }

    balance.allocated = calculateAllocated(policy, leaveYear, user?.joinDate);
    await balance.save();

    return balance;
}

const calculateAllocated = (policy: any, leaveYear: number, joinDate?: Date | null) => {
    const joinedThisYear = !!joinDate && joinDate.getFullYear() === leaveYear;
    const joinedAfterYear = !!joinDate && joinDate.getFullYear() > leaveYear;

    if (joinedAfterYear) {
        return 0; // not employed yet during this leave year
    }

    if (policy.accrualType === "ANNUAL") {
        return policy.yearlyQuota;
    }

    // MONTHLY: count months elapsed since join (or since Jan if joined earlier), capped at yearlyQuota
    const now = new Date();
    const isCurrentYear = now.getFullYear() === leaveYear;
    const lastMonthOfYear = isCurrentYear ? now.getMonth() : 11; // Jan = month 0

    const startMonth = joinedThisYear ? joinDate!.getMonth() : 0;
    const monthsElapsed = Math.max(lastMonthOfYear - startMonth + 1, 0);

    const accrued = monthsElapsed * policy.accrualAmount;
    return Math.min(accrued, policy.yearlyQuota);
};