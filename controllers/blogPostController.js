import mongoose from "mongoose";
import blogPostModel from "../models/blogPost.js";
import {unlink,access} from "fs";

//get all BlogPost
export const getAllBlogPost = async (req, res) => {
  let blogPost;
  try {
    if(req.query.type){
      if(req.query.type!=="current") return res.status(400).json({
        error:"VALIDATION_ERROR",
        statusCode: 400,
        message: "Invalid query parameter"
      });
      // get parameter
      blogPost = await blogPostModel.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate("author","-password -__v");
    }else{
      blogPost = await blogPostModel.find().sort({ createdAt: -1 }).populate("author","-password -__v");
    }
    res.status(200).json({
      error : null,
      statusCode: 200,
      message: "Blog Post Retrieved",
      data:{
        count:blogPost.length,
        blogs:blogPost
      }
    });
  } catch (error) {
    res.status(500).json({
      error:"INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message:"Internal Server Error"
    });
  }
};

//create BlogPost
export const createBlogPost = async (req, res) => {
  const { title, body } = req.body;
  if(!req.file){
    return res.status(400).json({ 
      error: "VALIDATION_ERROR",
      statusCode: 400,
      message: "Please upload an image"
    });
  }
  const media = req.protocol+"://"+req.get("host")+"/assets/images/"+req.file.filename
  // validation
  if(!title || !body){
    if (req.file) {
      unlink(`${req.file.path}`, (err) => {
        if (err) throw new Error("Failed to delete file!");
      })
    }
    if (!title) return res.status(400).json({ 
      error: "VALIDATION_ERROR",
      statusCode: 400,
      message: "title is required" 
    });
    if (!body) return res.status(400).json({ 
      error: "VALIDATION_ERROR",
      statusCode: 400,
      message: "body is required" 
    });
  }

  try {
    const createBlogPost = await blogPostModel.create({ title, body, media, author: req.user.id });
    const blogPost = await blogPostModel.findById(createBlogPost._id).populate("author", "-password -__v");
    
    res.status(200).json({
       error : null,
       statusCode: 200,
       message: "Blog Post Created",
       data: blogPost 
      });
  } catch (error) {
    if (req.file) {
      unlink(`${req.file.path}`, (err) => {
        if (err) throw new Error("Failed to delete file!");
      })
    }
    res.status(500).json({
      error:"INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message:"Internal Server Error"
    });
  }
};

//single BlogPost
export const singleBlogPost = async (req, res) => {
  try {
    const singleBlogPost = await blogPostModel.findById(req.params.id).populate("author", "-password -__v");
    if (!singleBlogPost) {
      return res.status(404).json({
         error:"VALIDATION_ERROR",
         statusCode: 404,
         message: "Blog Post not found" 
        });
    }
    res.status(200).json({
       error : null,
       statusCode: 200,
       message: "Blog Post Retrieved",
       data:singleBlogPost
    });
  } catch (error) {
    res.status(500).json({
       error:"INTERNAL_SERVER_ERROR",
       statusCode: 500,
       message:"Internal Server Error"
    });
  }
};

//edit BlogPost
export const editBlogPost = async (req, res) => {
  const { title, body } = req.body;
  let media = null;

  // check valid id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    if (req.file) {
      unlink(`${req.file.path}`, (err) => {
        if (err) throw new Error("Failed to delete file!");
      })
    }
    return res.status(400).json({
       error:"VALIDATION_ERROR",
       statusCode: 400,
       message: "Invalid ID" 
      });
  }
  try {
    let getBlog = await blogPostModel.findById(req.params.id).populate("author");
    if (!getBlog) {
      return res.status(404).json({
         error:"VALIDATION_ERROR",
         statusCode: 404,
         message: "Blog Post not found" 
        });
    }
    if (req.user.id != getBlog.author._id) {
      return res.status(401).json({
         error:"VALIDATION_ERROR",
         statusCode: 401,
         message: "Unauthorized" 
        });
    }
    if(req.file){
      const imageName = getBlog.media.split("/").pop();
      access(`${req.file.destination}/${imageName}`, (err) => {
        if (err) throw new Error("File not found!");
        unlink(`${req.file.destination}/${imageName}`, (err) => {
          if (err) throw new Error("Failed to delete file!");
        });
      })
      media = req.protocol+"://"+req.get("host")+"/assets/images/"+req.file.filename;
    }
    await blogPostModel.updateOne(
      { _id: req.params.id },
      {
        title: title || getBlog.title,
        body: body || getBlog.body,
        media: media || getBlog.media,
      }
    );

    getBlog = await blogPostModel.findById(req.params.id).populate("author", "-password -__v");

    res
      .status(200)
      .json({
        error : null,
        statusCode: 200, 
        message: "Blog Post has been updated", 
        data: getBlog 
      });
  } catch (error) {
    if (req.file) {
      unlink(`${req.file.path}`, (err) => {
        if (err) throw new Error("Failed to delete file!");
      })
    }
    res.status(500).json({
       error:"INTERNAL_SERVER_ERROR",
       statusCode: 500,
       message:"Internal Server Error"
    });
  }
};

//delete BlogPost
export const deleteBlogPost = async (req, res) => {
  try {
    const getBlog = await blogPostModel.findById(req.params.id).populate("author", "-password -__v");
    if (!getBlog) {
      return res.status(404).json({
         error:"VALIDATION_ERROR",
         statusCode: 404,
         message: "Blog Post not found" 
        });
    }
    if (req.user.id != getBlog.author._id) {
      return res.status(401).json({
         error:"VALIDATION_ERROR",
         statusCode: 401,
         message: "Unauthorized" 
        });
    }
    await blogPostModel.deleteOne({ _id: req.params.id });
    res
      .status(200)
      .json({ 
        error : null,
        statusCode: 200,
        message: "Blog Post has been deleted", 
        data: getBlog 
      });
  } catch (error) {
    res.status(500).json({
       error:"INTERNAL_SERVER_ERROR",
       statusCode: 500,
       message:"Internal Server Error"
    });
  }
};
