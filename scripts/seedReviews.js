import dotenv from "dotenv";
import mongoose from "mongoose";

// Inline schemas to avoid TS import issues
const courseSchema = new mongoose.Schema({
  name: String,
  teacher: String,
  semester: String,
}, { timestamps: true });
courseSchema.index({ name: 1, teacher: 1, semester: 1 }, { unique: true });
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  authorName: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  tags: { type: [String], default: [] },
}, { timestamps: true });
reviewSchema.index({ user: 1, course: 1 }, { unique: true, sparse: true });
reviewSchema.index({ course: 1, createdAt: -1 });
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

dotenv.config();

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDateWithinDays(days) {
  const now = Date.now();
  const past = now - randomInt(0, days) * 24 * 60 * 60 * 1000;
  return new Date(past);
}

const authorNames = ["匿名同学", "热心同学", "学霸", "路人甲", "认真上课的我", "UWEer", "通信学子", "工科生"];
const tagPool = ["不点名", "给分高", "作业少", "干货多", "节奏快", "互动多", "实验多", "出勤严"];
const comments = [
  "老师讲解很清晰，作业不多，考试不难。",
  "内容扎实，收获很大，推荐！",
  "节奏稍快，预习很重要。",
  "线上课程为主，考核方式公平。",
  "结合实际案例，课堂氛围不错。",
  "课后作业较多，但给分不低。",
];

async function main() {
  const uri = process.env.MONGO_URI || "";
  if (!uri) throw new Error("MONGO_URI not set");
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected for seeding reviews");

  const courses = await Course.find().limit(200);
  console.log(`Found courses: ${courses.length}`);
  let created = 0;

  for (const course of courses) {
    const count = randomInt(2, 8);
    for (let i = 0; i < count; i++) {
      const payload = {
        authorName: randomPick(authorNames),
        course: course._id,
        rating: randomInt(3, 5),
        comment: randomPick(comments),
        tags: Array.from(new Set(Array.from({ length: randomInt(1, 3) }, () => randomPick(tagPool)))),
        createdAt: randomDateWithinDays(180),
        updatedAt: new Date(),
      };
      try {
        await Review.create(payload);
        created++;
      } catch (e) {
        // ignore duplicates or validation errors
      }
    }
  }

  console.log(`✅ 评价生成完成：新增 ${created} 条`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });


