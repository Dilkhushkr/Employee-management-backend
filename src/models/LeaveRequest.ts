import { Schema, model, Document, Types } from "mongoose";

const leaveRequestSchema = new Schema({

    companyId: { type: Types.ObjectId, ref: "Company", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    leaveTypeId: { type: Types.ObjectId, ref: "LeavePolicy", required: true },
    
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    endDate: { type: String, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },

    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
        default: "PENDING",
    },

    attachments: [{ type: String }], // URLs or file paths

    submittedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    approvedBy: { type: Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedBy: { type: Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },

},
    { timestamps: true }
);

leaveRequestSchema.index({ userId: 1, status: 1 });

export default model("LeaveRequest", leaveRequestSchema);