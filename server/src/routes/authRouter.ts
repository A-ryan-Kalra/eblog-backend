import express from "express";
import { google, signIn, signUp, signout } from "../controllers/authController";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/google", google);
router.post("/signout", signout);

export default router;
