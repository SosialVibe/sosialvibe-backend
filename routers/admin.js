import express from "express";

import {
  singleUser,
  editUser,
} from "./../controllers/userController.js";
import {
  getAllBlogPost,
  singleBlogPost,
  createBlogPost,
  deleteBlogPost,
  editBlogPost,
} from "./../controllers/blogPostController.js";
import {
  getAllImagePost,
  singleImagePost,
  createImagePost,
  deleteImagePost,
  editImagePost,
} from "./../controllers/imagePostController.js";
import {
  getAllVideoPost,
  singleVideoPost,
  createVideoPost,
  deleteVideoPost,
  editVideoPost,
} from "./../controllers/videoPostController.js";
import auth from './../middlewares/authMiddleware.js';
import emailToLowerCase from './../middlewares/helperMiddleware.js';
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

// middleware
router.use(auth);

// Route User
router.get("/user/:id", singleUser);
router.patch("/user/:id/edit",emailToLowerCase, editUser);

//Route BlogPost
router.get("/blog", getAllBlogPost);
router.get("/blog/:id", singleBlogPost);
router.post("/blog", createBlogPost);
router.delete("/blog/:id", deleteBlogPost);
router.patch("/blog/:id/edit", editBlogPost);

//Route ImagePost
router.get("/image", getAllImagePost);
router.get("/image/:id", singleImagePost);
router.post("/image", createImagePost);
router.delete("/image/:id", deleteImagePost);
router.patch("/image/:id/edit", editImagePost);

//Route VideoPost
router.get("/video", getAllVideoPost);
router.get("/video/:id", singleVideoPost);
router.post("/video", createVideoPost);
router.delete("/video/:id", deleteVideoPost);
router.patch("/video/:id/edit", editVideoPost);

export default router;
