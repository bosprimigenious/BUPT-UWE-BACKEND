import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";


dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
connectDB();

// 路由
app.get("/", (req: Request, res: Response) => {
  res.send("BUPT-UWE Backend is running 🚀");
});
app.use("/api/users", userRoutes);

// 启动服务
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
