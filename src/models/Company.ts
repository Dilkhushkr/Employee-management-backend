import { Schema, model } from "mongoose";

const companySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default model("Company", companySchema);
