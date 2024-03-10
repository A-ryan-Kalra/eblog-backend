import express from "express";
import { errorHandler } from "../utils/errorHandler";
import { UserProps } from "../utils/verifyUser";
import Post from "../models/post.model";

export const create = async (
  req: UserProps,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log(req.body, "req.body");
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to create a post"));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }
  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
  const newPost = new Post({ ...req.body, slug, userId: req.user.id });
  try {
    const savedPost = await newPost.save();

    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (
  req: UserProps,
  res: express.Response,
  next: express.NextFunction
) => {
  const query: any = {};

  if (req.query.userId) {
    query.userId = req.query.userId;
  }
  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.slug) {
    query.slug = req.query.slug;
  }
  if (req.query.postId) {
    query._id = req.query.postId;
  }

  if (req.query.searchTerm) {
    query.$or = [
      { title: { $regex: req.query.searchTerm, $options: "i" } },
      {
        content: { $regex: req.query.searchTerm, $options: "i" },
      },
    ];
  }

  try {
    const startInex = parseInt(req.query.startIndex as string) || 0;
    const limit = parseInt(req.query.limit as string) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const posts = await Post.find(query)
      .sort({ updatedAt: sortDirection })
      .skip(startInex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();
    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (
  req: UserProps,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete the post"));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: "The post has been deleted" });
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (
  req: UserProps,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this post"));
  }
  try {
    const slug = req.body.title
      .split(" ")
      .join("-")
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, "");
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          category: req.body.category,
          content: req.body.content,
          image: req.body.image,
          slug,
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};
