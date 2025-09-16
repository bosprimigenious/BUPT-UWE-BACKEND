import express from "express";
import { createCourse, listCourses } from "../controllers/courseController.js";

const router = express.Router();

router.post("/", createCourse);
router.get("/", listCourses);

export default router;


