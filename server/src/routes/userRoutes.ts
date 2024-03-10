import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  test,
  updateUser,
} from "../controllers/userController";
import { verifyToken } from "../utils/verifyUser";

const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/getusers", verifyToken, getUsers);
router.get("/:userId", getUser);
export default router;
