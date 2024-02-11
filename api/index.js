import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";

import cookieParser from "cookie-parser";
import multer from "multer";
dotenv.config();

// Do not encode the entire connection string
const app = express();
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.listen(3000, () => {
  console.log("server is running in 3000!!!");
});

mongoose
  .connect(process.env.MONGO, { useNewUrlParser: true })
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });




app.get("/", async (req, res) => {
  res.send("success");
});

app.use("/api/auth", authRouter);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "intenal error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
