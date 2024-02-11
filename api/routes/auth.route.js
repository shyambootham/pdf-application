import express from "express";
import {
  getPdfs,
  getUserPdf,
  signin,
  signout,
  signup,
  uploadFiles,
} from "../controller/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/signout", signout);
router.post("/uploadfiles", uploadFiles);
router.get("/get/:id", getUserPdf);
router.get("/pdfs/:id", verifyToken, getPdfs);
// auth.route.js

// ... (other imports)

export default router;
