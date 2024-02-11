import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

import Pdf from "../model/pdf.model.js";

// Signup function for user registration
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  // Hash the password using bcrypt
  const hashedPassword = bcryptjs.hashSync(password, 10);
  // Create a new user object with hashed password
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    // Save the new user to the database
    await newUser.save();
    res.status(201).json("user created successfully");
  } catch (error) {
    next(error);
  }
};

// Signin function for user login
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const validUser = await User.findOne({ email });
    // If user not found, return error
    if (!validUser) return next(errorHandler(404, "user not found!"));
    // Compare provided password with hashed password
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    // If passwords don't match, return error
    if (!validPassword) return next(errorHandler(401, "wrong credentilas!"));
    // Generate JWT token for authenticated user
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    // Omit password field from user data and send user data along with token in response
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie("access_token", token, { httpOnly: true }) // Set token as a cookie
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// Signout function to clear access token cookie
export const signout = (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("user signout succesfully");
  } catch (error) {
    next(error);
  }
};

// Upload PDF files
export const uploadFiles = async (req, res, next) => {
  try {
    // Create a new PDF document with data from request body
    const pdfFile = await Pdf.create(req.body);
    return res.status(201).json(pdfFile);
  } catch (error) {
    next(error);
  }
};

// Get a specific PDF by ID
export const getUserPdf = async (req, res, next) => {
  try {
    // Find the PDF by ID
    const pdf = await Pdf.findById(req.params.id);
    // If PDF not found, return error
    if (!pdf) {
      return next(errorHandler(404, "pdf not found"));
    }
    // Fetch the PDF content from external URL
    const pdfUrl = pdf.pdfUrls[0].pdfUrl[0];
    const pdfResponse = await fetch(pdfUrl);
    // If PDF fetch fails, throw error
    if (!pdfResponse.ok) {
      throw new Error(
        `Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`
      );
    }
    // Set the appropriate content type header and stream PDF content to response
    res.setHeader("Content-Type", "application/pdf");
    pdfResponse.body.pipe(res);
  } catch (error) {
    next(error);
  }
};

// Get all PDFs belonging to a specific user
export const getPdfs = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      // Find all PDFs belonging to the user
      const pdfs = await Pdf.find({ userRef: req.params.id });
      res.status(200).json(pdfs);
    } catch (error) {
      next(error);
    }
  } else {
    // If user ID in request doesn't match authenticated user, return unauthorized error
    return next(errorHandler(401, "you can see yourownlistings"));
  }
};
