import express from "express";

import { singleUser, editUser } from "../../controllers/userController.js";
import {
  getAllBlogPost,
  singleBlogPost,
  createBlogPost,
  deleteBlogPost,
  editBlogPost,
} from "../../controllers/blogPostController.js";
import {
  getAllImagePost,
  singleImagePost,
  createImagePost,
  deleteImagePost,
  editImagePost,
} from "../../controllers/imagePostController.js";
import {
  getAllVideoPost,
  singleVideoPost,
  createVideoPost,
  deleteVideoPost,
  editVideoPost,
} from "../../controllers/videoPostController.js";
import auth from "../../middlewares/authMiddleware.js";
import { requiredMedia, uploadImage, uploadVideo } from "../../middlewares/uploadFile.js";
import emailLowerCase from "../../middlewares/helperMiddleware.js";

const router = express.Router();

// middleware
router.use(auth);

// Route User
router.get("/user/:id", singleUser);
router.patch("/user/:id",uploadImage.fields([{name: "profile-image", maxCount: 1}, {name: "background-image", maxCount: 1}]), emailLowerCase, editUser);

//Route BlogPost
router.get("/blog", getAllBlogPost);
router.get("/blog/:id", singleBlogPost);
router.post("/blog", uploadImage.single("blog-banner"), requiredMedia, createBlogPost);
router.delete("/blog/:id", deleteBlogPost);
router.patch("/blog/:id",uploadImage.single("blog-banner"), editBlogPost);

//Route ImagePost
router.get("/image", getAllImagePost);
router.get("/image/:id", singleImagePost);
router.post("/image", uploadImage.single("image"), requiredMedia, createImagePost);
router.delete("/image/:id", deleteImagePost);
router.patch("/image/:id",uploadImage.single("image"), editImagePost);

//Route VideoPost
router.get("/video", getAllVideoPost);
router.get("/video/:id", singleVideoPost);
router.post("/video", uploadVideo.single("video"), requiredMedia, createVideoPost);
router.delete("/video/:id", deleteVideoPost);
router.patch("/video/:id",uploadVideo.single("video"), editVideoPost);

router.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    statusCode: 404,
    message: "Page Not Found",
  })
});

router.use((err, req, res, next) => {
  if (err) {
    return res.status(500).json(err);
  }
})

export default router;
