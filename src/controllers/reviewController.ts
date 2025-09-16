import type { Request, Response } from "express";
import Review from "../models/Review.js";

export const createReview = async (req: Request, res: Response) => {
  try {
    const { user, authorName, course, rating, comment, tags } = req.body;
    if ((!user && !authorName) || !course || !rating) {
      return res.status(400).json({ message: "缺少必要字段(需提供 user 或 authorName)" });
    }

    const review = await Review.create({ user, authorName, course, rating, comment, tags });
    return res.status(201).json({ message: "评价创建成功", review });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "重复评价冲突(登录用户或同昵称)", error });
    }
    return res.status(500).json({ message: "服务器错误", error });
  }
};

export const listCourseReviews = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const reviews = await Review.find({ course: courseId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: "服务器错误", error });
  }
};


