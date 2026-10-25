import { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
    {
    userId : { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyId : { type: Schema.Types.ObjectId, ref: "Company", default: null },
    date : { type: String, required: true }, // "YYYY-MM-DD"
    status : { type: String, enum: ["present", "absent", "leave"], required: true },
    checkInTime : { type: Date },
    checkOutTime : { type: Date },
    totalHours: { type: Number }
    },
    { timestamps: true }
)

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default model("Attendance", attendanceSchema);
