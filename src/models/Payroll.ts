import { Schema, model, Document ,Types} from "mongoose";

const payrollSchema = new Schema({

    companyId: { type: Types.ObjectId, ref: "Company", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    
    month : { type: Number, required: true }, // 1-12
    year: { type: Number, required: true }, // 2023, 2024, etc.
    
    presentDays: { type: Number, default: 0 },
    paidLeaveDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    totalDaysInMonth: { type: Number, default: 0 },

    monthlySalary: { type: Number, required: true },
    calculatedAmount: { type: Number, required: true },

    adjustmentAmount: { type: Number, default: 0 }, // can be positive or negative
    adjustmentReason: { type: String, default: "" },

    netAmount: { type: Number, required: true },

    satus: {
        trype: String,
        enum: ["DRAFT", "APPROVED", "REJECTED"],
        default: "DRAFT"
    },


    finalizedAt: { type: Date },
    finalizedBy: { type: Types.ObjectId, ref: "User" },

    paidAt: { type: Date },
    paymentReference: { type: String },
},
    { timestamps: true }
)


payrollSchema.index({ companyId: 1, userId: 1, month: 1, year: 1 }, { unique: true });

export default model("PayRoll", payrollSchema);d