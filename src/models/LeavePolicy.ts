import { Schema, model, Types } from "mongoose";


const leavePolicySchema = new Schema(
    {
        companyId: { type: Types.ObjectId, ref: "Company", required: true },
        name: { type: String, required: true },
        description: { type: String },
        isPaid: { type: Boolean, default: true },

        yearlyQuota: { type: Number, default: 0 },
        accrualType: { type: String, enum: ["ANNUAL", "MONTHLY"], default: "ANNUAL" },
        accrualAmount: { type: Number, default: 0 },


        allowHalfDay: { type: Boolean, default: false },
        requireApproval: { type: Boolean, default: true },
        requiresDocument: { type: Boolean, default: false },


        carryForward: { type: Boolean, default: false },
        maxCarryForward: { type: Number, default: 0 },

        minimumNoticeDays: { type: Number, default: 0 },
        maximumConsecutiveDays: { type: Number, default: 0 },

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);


leavePolicySchema.index({ companyId: 1, name: 1 }, { unique: true });

export default model("LeavePolicy", leavePolicySchema);