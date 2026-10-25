import { Schema, model, Types } from "mongoose";

const userSchema = new Schema(
  {
    // null for superadmin — they don't belong to any one client
    companyId: { type: Types.ObjectId, ref: "Company", default: null },
    name: { type: String, required: true },
    email: { type: String, lowercase: true },
    phone: { type: String },
    password: { type: String }, // superadmin/admin login
    loginCode: { type: String }, // employee login — code only, no password
    role: { type: String, enum: ["superadmin", "admin", "user"], default: "user" },

    // employee profile — only meaningful for role: "user"
    designation : {type: String},
    department : {type: String},
    joinDate: { type: Date },
  },
  { timestamps: true }
);

// global, not per-company — login finds a user by email alone, so email must be unique across all clients
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ companyId: 1, phone: 1 }, { unique: true, sparse: true });
// global (not per-company) since login-by-code has no company context to scope by
userSchema.index({ loginCode: 1 }, { unique: true, sparse: true });

export default model("User", userSchema);
