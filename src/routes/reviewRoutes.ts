import express from "express";
import { createReview, listCourseReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/course/:courseId", listCourseReviews);

export default router;


