import {
  createComment,
  deleteComment,
  editComment,
  getPostComment,
  getcomments,
  likeComment,
} from "../controllers/commentController";
import { verifyToken } from "../utils/verifyUser";
import express from "express";

const router = express.Router();

router.post("/create", verifyToken, createComment);
router.get("/getPostComments/:postId", getPostComment);
router.put("/likeComment/:commentId", verifyToken, likeComment);
router.put("/editComment/:commentId", verifyToken, editComment);
router.delete(`/deleteComment/:commentId`, verifyToken, deleteComment);
router.get("/getcomments", verifyToken, getcomments);

export default router;
