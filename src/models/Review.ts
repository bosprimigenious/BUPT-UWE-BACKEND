import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  user?: Types.ObjectId;
  authorName?: string;
  course: Types.ObjectId;
  rating: number;
  comment?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema: Schema<IReview> = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
    authorName: { type: String, required: false, trim: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// 防止同一用户对同一课程重复评价（仅对登录用户生效）
reviewSchema.index({ user: 1, course: 1 }, { unique: true, sparse: true });
// 防止同一匿名昵称对同一课程重复评价（可选，按需启用）
reviewSchema.index({ authorName: 1, course: 1 }, { unique: false, sparse: true });
// 查询课程评价常用索引
reviewSchema.index({ course: 1, createdAt: -1 });

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;


