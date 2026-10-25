import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import companyRoutes from "./routes/companyRoutes";
import userRoutes from "./routes/userRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import leavePolicyRoutes from "./routes/leavePolicyRoutes";
import leaveBalanceRoutes from "./routes/leaveBalanceRoutes";
import leaveRequestRoutes from "./routes/leaveRequestRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        message: "Server is running"
    });
});
// login 
app.use("/api/auth", authRoutes);
// admin created 
app.use("/api/companies", companyRoutes);
// user created
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave/types", leavePolicyRoutes);
app.use("/api/leave/balances", leaveBalanceRoutes);
app.use("/api/leave/requests", leaveRequestRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

