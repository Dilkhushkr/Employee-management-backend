import { Response } from "express";
import Attendance from "../models/Attendance";
import { AuthRequest } from "../middleware/auth";


const today = () => new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

export const checkIn = async (req: AuthRequest, res: Response) => {

    const existing = await Attendance.findOne({ userId: req.user!.userId, date: today() });
    if (existing) {
        return res.status(400).json({ message: "Already checked in today" });
    }

    const record = await Attendance.create(
        {
            userId: req.user!.userId,
            companyId: req.user!.companyId,
            date: today(),
            status: "present",
            checkInTime: new Date()
        }
    );
    res.status(201).json({ message: "Checked in", record });

}

export const checkOut = async (req: AuthRequest, res: Response) => {
    const record = await Attendance.findOne({ userId: req.user!.userId, date: today() });
    if (!record) {
        return res.status(400).json({ message: "checking first" });
    }
    if(record.checkOutTime) {
        return res.status(400).json({ message: "Already checked out today" });
    }

    record.checkOutTime = new Date();
    record.totalHours = (record.checkOutTime.getTime() - record.checkInTime!.getTime()) / (1000 * 60 * 60);
    await record.save();
    res.status(200).json({ message: "Checked out", record });
}


export const getMyAttendance = async (req: AuthRequest, res: Response) => {
    const date = (req.query.date as string) || today();
    const record = await Attendance.findOne({ userId: req.user!.userId, date });

    if (!record) {
        return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json({ record });
}


export const getAllAttendance = async (req: AuthRequest, res: Response) => {
    const { from, to, userId } = req.query as { from?: string; to?: string; userId?: string };
    const filter: Record<string, any> = { companyId: req.user!.companyId };
    if (userId) filter.userId = userId;
    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = from;
        if (to) filter.date.$lte = to;
    }
    const records = await Attendance.find(filter)
        .populate("userId", "name designation department")
        .sort({ date: -1 });
    res.json({ attendance: records });
};
