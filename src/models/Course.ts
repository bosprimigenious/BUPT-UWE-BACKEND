import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  name: string;
  teacher: string;
  semester: string;
}

const courseSchema: Schema<ICourse> = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    teacher: { type: String, required: true, index: true },
    semester: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

courseSchema.index({ name: 1, teacher: 1, semester: 1 }, { unique: true });

const Course = mongoose.model<ICourse>("Course", courseSchema);

export default Course;


