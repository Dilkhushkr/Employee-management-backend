
import { Response } from "express";
import LeavePolicy from "../models/LeavePolicy";
import LeaveRequest from "../models/LeaveRequest";
import LeaveDay from "../models/LeaveDay";
import { getOrCreateBalance } from "../services/leaveBalanceService";
import { AuthRequest } from "../middleware/auth";

const getDateRange = (start: string, end: string) => {
    const dates = [];
    const cur = new Date(start);
    const last = new Date(end);
    while (cur <= last) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
};

// pending/used deltas when a request leaves `from` and enters `to`. Pure — see checkBalanceDelta.ts
export const balanceDelta = (from: string, to: string, days: number) => {
    const d = { pending: 0, used: 0 };
    if (from === "PENDING") d.pending -= days;   // release the hold
    if (from === "APPROVED") d.used -= days;     // refund the spend
    if (to === "PENDING") d.pending += days;
    if (to === "APPROVED") d.used += days;
    return d;
};

const applyDelta = async (
    companyId: string, userId: string, leaveTypeId: string,
    startDate: string, from: string, to: string, days: number
) => {
    const balance = await getOrCreateBalance(
        companyId, userId, leaveTypeId, new Date(startDate).getFullYear()
    );
    const delta = balanceDelta(from, to, days);
    balance.pending += delta.pending;
    balance.used += delta.used;
    await balance.save();
};

export const createLeaveRequest = async (req: AuthRequest, res: Response) => {
    const { companyId, userId } = req.user!;
    const { leaveTypeId, startDate, endDate, dayType, reason, attachmentUrl } = req.body;

    if (!leaveTypeId || !startDate || !endDate || !reason) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (startDate > endDate) {
        return res.status(400).json({ message: "Start date cannot be after end date" });
    }

    const policy = await LeavePolicy.findOne({ _id: leaveTypeId, companyId, isActive: true });
    if (!policy) {
        return res.status(404).json({ message: "Leave policy not found" });
    }

    const isSingleDay = startDate === endDate;
    const isHalfDay = isSingleDay && dayType && dayType !== "FULL_DAY";
    if (isHalfDay && !policy.allowHalfDay) {
        return res.status(400).json({ message: "Half-day is not allowed for this leave type" });
    }

    const dates = getDateRange(startDate, endDate);
    const totalDays = isHalfDay ? 0.5 : dates.length;

    if (policy.maximumConsecutiveDays && totalDays > policy.maximumConsecutiveDays) {
        return res.status(400).json({
            message: `Exceeds maximum consecutive days (${policy.maximumConsecutiveDays})`,
        });
    }

    if (policy.minimumNoticeDays) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + policy.minimumNoticeDays);
        if (startDate < cutoff.toISOString().slice(0, 10)) {
            return res.status(400).json({ message: `Requires ${policy.minimumNoticeDays} days notice` });
        }
    }

    if (policy.requiresDocument && !attachmentUrl) {
        return res.status(400).json({ message: "Supporting document required for this leave type" });
    }

    const overlap = await LeaveRequest.findOne({
        userId,
        status: { $in: ["PENDING", "APPROVED"] },
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
    });
    if (overlap) {
        return res.status(409).json({ message: "You already have leave in this period" });
    }

    const balance = await getOrCreateBalance(
        companyId!, userId, leaveTypeId, new Date(startDate).getFullYear()
    );
    if (balance.get("available") < totalDays) {
        return res.status(400).json({ message: "Insufficient leave balance" });
    }

    // ponytail: no transaction — single-node Mongo, low write concurrency. Add a session if this ever races.
    const leaveRequest = await LeaveRequest.create({
        companyId: companyId!, userId, leaveTypeId, startDate, endDate, totalDays, reason,
        attachments: attachmentUrl ? [attachmentUrl] : [],
    });

    const dayRows = isHalfDay
        ? [{ leaveRequestId: leaveRequest._id, date: startDate, dayType, days: 0.5 }]
        : dates.map((date) => ({ leaveRequestId: leaveRequest._id, date, dayType: "FULL_DAY", days: 1 }));
    await LeaveDay.insertMany(dayRows);

    balance.pending += totalDays;
    await balance.save();

    return res.status(201).json(leaveRequest);
};

export const listLeaveRequests = async (req: AuthRequest, res: Response) => {
    const { companyId, userId, role } = req.user!;
    const filter: any = { companyId };
    if (role !== "admin") filter.userId = userId;        // employees see only their own
    if (req.query.status) filter.status = req.query.status;
    const requests = await LeaveRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
};

export const approveLeaveRequest = async (req: AuthRequest, res: Response) => {
    const { companyId, userId } = req.user!;
    const request = await LeaveRequest.findOne({ _id: req.params.id, companyId });
    if (!request) return res.status(404).json({ message: "Leave request not found" });
    if (request.status !== "PENDING") {
        return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    await applyDelta(String(companyId), String(request.userId), String(request.leaveTypeId),
        request.startDate, request.status, "APPROVED", request.totalDays);

    request.status = "APPROVED";
    request.approvedBy = userId as any;
    request.approvedAt = new Date();
    await request.save();
    res.json(request);
};

export const rejectLeaveRequest = async (req: AuthRequest, res: Response) => {
    const { companyId, userId } = req.user!;
    const request = await LeaveRequest.findOne({ _id: req.params.id, companyId });
    if (!request) return res.status(404).json({ message: "Leave request not found" });
    if (request.status !== "PENDING") {
        return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    await applyDelta(String(companyId), String(request.userId), String(request.leaveTypeId),
        request.startDate, request.status, "REJECTED", request.totalDays);
    await LeaveDay.deleteMany({ leaveRequestId: request._id });

    request.status = "REJECTED";
    request.rejectedBy = userId as any;
    request.rejectedAt = new Date();
    request.rejectionReason = req.body.reason;
    await request.save();
    res.json(request);
};

export const cancelLeaveRequest = async (req: AuthRequest, res: Response) => {
    const { userId } = req.user!;
    const request = await LeaveRequest.findOne({ _id: req.params.id, userId });
    if (!request) return res.status(404).json({ message: "Leave request not found" });
    if (request.status === "REJECTED" || request.status === "CANCELLED") {
        return res.status(400).json({ message: `Request is already ${request.status}` });
    }
    if (request.status === "APPROVED" && request.startDate < new Date().toISOString().slice(0, 10)) {
        return res.status(400).json({ message: "Cannot cancel leave that has already started" });
    }

    await applyDelta(String(request.companyId), String(userId), String(request.leaveTypeId),
        request.startDate, request.status, "CANCELLED", request.totalDays);
    await LeaveDay.deleteMany({ leaveRequestId: request._id });

    request.status = "CANCELLED";
    request.cancelledAt = new Date();
    request.cancellationReason = req.body.reason;
    await request.save();
    res.json(request);
};