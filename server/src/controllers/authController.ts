import express from "express";
import User from "../models/user.model";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/errorHandler";
import jwt from "jsonwebtoken";
import { Document, Model } from "mongoose";

export const signUp = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { username, password, email } = req.body;
    console.log(username, "username", password, "password", email, "email");
    if (!username.trim() || !password.trim() || !email.trim()) {
      next(errorHandler(400, "All fields are required"));
    }
    // There are number of ways to create an object and send to the database
    // const user = await User.create({
    //   email,
    //   username,
    //   password,
    // });
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();

    return res.status(201).json(user);
  } catch (error) {
    // if (error instanceof Error) {
    //   return res.status(500).json({ message: error.message });
    // } else if (typeof error === "string") {
    //   return res.status(500).json({ message: error.toString() });
    // } else {
    //   return res.status(500).json({ message: "An error occured" });
    // }
    next(error);
  }
};

export const signIn = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email, password: pass } = req.body;
  if (!email.trim() || !pass.trim()) {
    next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser: any = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }
    const validPassword = bcryptjs.compareSync(
      pass,
      validUser?.password as string
    );

    if (!validPassword) {
      return next(errorHandler(400, "Invalid Password"));
    }
    console.log(validPassword, "validPassword");

    const token = jwt.sign(
      {
        id: validUser?._id,
        isAdmin: validUser.isAdmin,
      },
      process.env.JWT_SECRET as string
    );
    const { password, ...rest } = validUser?._doc;
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { name, email, googlePhotoUrl } = req.body;
  try {
    const user: any = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET as string
      );
      const { password, ...rest } = user?._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser: any = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });

      await newUser.save();
      const token = jwt.sign(
        {
          id: newUser._id,
          isAdmin: newUser.isAdmin,
        },
        process.env.JWT_SECRET as string
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "User has been signed out" });
  } catch (error) {
    next(error);
  }
};
