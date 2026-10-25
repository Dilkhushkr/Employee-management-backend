import { Schema, model, Document, Types } from "mongoose";

const leaveBalanceSchema = new Schema(
    {
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        leaveTypeId: { type: Types.ObjectId, ref: "LeavePolicy", required: true },
        leaveYear: { type: Number, required: true },

        allocated: { type: Number, default: 0 },
        carryForward: { type: Number, default: 0 },
        manualAdjustment: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
    },

    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


leaveBalanceSchema.virtual("available").get(
    function () {
        return this.allocated + this.carryForward + this.manualAdjustment - this.used - this.pending;
    }
)

leaveBalanceSchema.index({ userId: 1, leaveTypeId: 1, leaveYear: 1 }, { unique: true });

export default model("LeaveBalance", leaveBalanceSchema);