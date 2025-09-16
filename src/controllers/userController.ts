import type { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 查重
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const safeUser = { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } as any;
    res.status(201).json({ message: "User registered successfully", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const safeUser = { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } as any;
    res.json({ message: "Login successful", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
