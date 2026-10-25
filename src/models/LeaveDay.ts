import { Schema, model, Document, Types } from "mongoose";


const leaveDaySchema = new Schema(
    {
        leaveRequestId: { type: Types.ObjectId, ref: "LeaveRequest", required: true },
        date: { type: String, required: true }, // "YYYY-MM-DD"
        dayType: {
            type: String,
            enum: ["FULL_DAY", "FIRST_HALF", "SECOND_HALF"],
            default: "FULL_DAY",
        },
        days: { type: Number, required: true }, // 1.0 or 0.5
    },
    { timestamps: true }
);


leaveDaySchema.index({ leaveRequestId: 1, date: 1 }, { unique: true });
export default model("LeaveDay", leaveDaySchema);