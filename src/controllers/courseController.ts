import type { Request, Response } from "express";
import Course from "../models/Course.js";

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { name, teacher, semester } = req.body;
    if (!name || !teacher || !semester) {
      return res.status(400).json({ message: "缺少必要字段" });
    }

    const course = await Course.create({ name, teacher, semester });
    return res.status(201).json({ message: "课程创建成功", course });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "课程已存在(名称+教师+学期唯一)", error });
    }
    return res.status(500).json({ message: "服务器错误", error });
  }
};

export const listCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.json({ courses });
  } catch (error) {
    return res.status(500).json({ message: "服务器错误", error });
  }
};


