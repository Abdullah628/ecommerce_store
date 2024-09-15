import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js";

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "30d",
    });

    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 days
}


const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //prevent XSS attacks, cross site scripting
        secure: process.env.NODE_ENV === "production",
        sameSite:"strict" ,//prevents CSRF attack, cross site request forgery
        maxAge: 15 * 60 * 1000, // 15 minutes
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, //prevent XSS attacks, cross site scripting
        secure: process.env.NODE_ENV === "production",
        sameSite:"strict" ,//prevents CSRF attack, cross site request forgery
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
}


export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = User.findOne({ email });

    if (!userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    //generate token by jwt and authenticate user
    const {accessToken, refreshToken} =  generateToken(user._id);

    //store into redis
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({ user:{
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
  }, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = (req, res) => {
  res.send("login route called");
};

export const logout = (req, res) => {
  res.send("logout route called");
};
