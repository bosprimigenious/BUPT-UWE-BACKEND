import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import xlsx from "xlsx";
const { readFile: xlsxReadFile, utils: xlsxUtils } = xlsx;
import mongoose from "mongoose";

dotenv.config();

const DEFAULT_EXCEL = path.resolve(process.cwd(), "..", "BUPT_UWE", "src", "assets", "BUPT_UWE.xlsx");

async function connect() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bupt_uwe";
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected for seeding");
}

// 在脚本内联定义与后端一致的 Course 模型，避免加载 TS 文件
const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    teacher: { type: String, required: true, index: true },
    semester: { type: String, required: true, index: true },
  },
  { timestamps: true }
);
courseSchema.index({ name: 1, teacher: 1, semester: 1 }, { unique: true });
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

function readRows(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel 文件不存在: ${filePath}`);
  }
  const wb = xlsxReadFile(filePath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  // 调试：打印表头与前几行
  const rowsArray = xlsxUtils.sheet_to_json(sheet, { header: 1, defval: "" });
  const header = rowsArray[0] || [];
  console.log("🧭 表头:", header);
  console.log("🧭 示例行1:", rowsArray[1] || []);
  console.log("🧭 示例行2:", rowsArray[2] || []);
  const rows = xlsxUtils.sheet_to_json(sheet, { defval: "" });
  return rows;
}

async function upsertCourses(rows) {
  let success = 0;
  let candidates = 0;
  const pick = (obj, keys) => {
    for (const k of keys) {
      if (obj[k] != null && String(obj[k]).trim() !== "") return String(obj[k]).trim();
    }
    return "";
  };
  for (const r of rows) {
    const name = pick(r, ["name", "课程名", "课程名称", "课程", "course", "Course", "推荐课程", " 推荐课程", "避雷课程"]);
    const teacher = pick(r, ["teacher", "教师", "老师", "任课教师", "教师名", "teacherName", "Teacher"]) || "未知教师";
    const semester = pick(r, ["semester", "学期", "term", "Semester"]) || "未知学期";
    if (name || teacher) candidates += 1;
    if (!name || !teacher) continue;
    try {
      const doc = await Course.findOneAndUpdate(
        { name, teacher, semester },
        { $setOnInsert: { name, teacher, semester } },
        { upsert: true, new: true }
      );
      if (doc) success += 1;
    } catch (e) {
      console.error("Upsert 失败:", name, teacher, semester, e?.message || e);
    }
  }
  console.log(`✅ 导入完成：共处理 ${rows.length} 行，识别到含课程/教师的行 ${candidates} 行，成功写入/更新 ${success} 条课程记录`);
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


