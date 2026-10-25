import Attendance from "../models/Attendance";

interface AttendanceSummary {
    presentDays: number;
    leaveDays: number; // paid + unpaid combined for now — split happens in Step 4
    absentDays: number;
    totalDaysInMonth: number;
}



export const getAttendanceSummary = async(
    userId: string,
    month : number,
    year : number
): Promise<AttendanceSummary> => {

    const totalDaysInMonth = new Date(year, month, 0).getDate(); // month is 1-12
    
    const monthstr = String(month).padStart(2, "0");
    const startDate = `${year}-${monthstr}-01`;
    const endDate = `${year}-${monthstr}-${String(totalDaysInMonth).padStart(2, "0")}`;


    const records = await Attendance.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
    })


    let presentDays = 0;
    let leaveDays = 0;
    let absentDays = 0;

    for (const record of records) {
        if (record.status === "present") {
            presentDays++;
        } else if (record.status === "leave") {
            leaveDays++;
        } else if (record.status === "absent") {
            absentDays++;
        }
    }

    return { presentDays, leaveDays, absentDays, totalDaysInMonth }; }