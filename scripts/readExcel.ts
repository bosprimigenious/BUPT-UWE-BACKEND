import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import * as XLSX from "xlsx";
import mongoose from "mongoose";
import Course from "../src/models/Course.js";

dotenv.config();

const DEFAULT_EXCEL = path.resolve(process.cwd(), "..", "BUPT_UWE", "src", "assets", "BUPT_UWE.xlsx");

async function connect() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bupt_uwe";
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected for seeding");
}

type Row = {
  name?: string;
  teacher?: string;
  semester?: string;
};

function readRows(filePath: string): Row[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel 文件不存在: ${filePath}`);
  }
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" });
  return rows;
}

async function upsertCourses(rows: Row[]) {
  let success = 0;
  for (const r of rows) {
    const name = (r.name || r["课程名"] as any || "").toString().trim();
    const teacher = (r.teacher || r["教师"] as any || "").toString().trim();
    const semester = (r.semester || r["学期"] as any || "").toString().trim() || "未知学期";
    if (!name || !teacher) continue;
    try {
      const doc = await Course.findOneAndUpdate(
        { name, teacher, semester },
        { $setOnInsert: { name, teacher, semester } },
        { upsert: true, new: true }
      );
      if (doc) success += 1;
    } catch (e) {
      console.error("Upsert 失败:", name, teacher, semester, e);
    }
  }
  console.log(`✅ 导入完成：共处理 ${rows.length} 行，成功写入/更新 ${success} 条课程记录`);
}

async function main() {
  const filePath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_EXCEL;
  await connect();
  const rows = readRows(filePath);
  await upsertCourses(rows);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


