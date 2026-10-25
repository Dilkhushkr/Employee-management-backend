import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);

  const email = "superadmin@gmail.com";
  const password = "Super@123";

  const existing = await User.findOne({ role: "superadmin", email });
  if (existing) {
    console.log("Super admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ companyId: null, name: "Super Admin", email, password: hashedPassword, role: "superadmin" });

  console.log("Super admin created:", email);
  process.exit(0);
};

run();
