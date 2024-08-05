import imagePostModel from './../models/imagePost.js';
import { unlink, access } from 'fs';
import mongoose from 'mongoose';

//get all ImagePost
export const getAllImagePost = async (req, res) => {
  let imagePost;
  try {
    if(req.query.type){
      if(req.query.type!=="current") return res.status(400).json({
        error:"VALIDATION_ERROR",
        statusCode: 400,
        message: "Invalid query parameter"
      });
      // get parameter
      imagePost = await imagePostModel.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate("author", "-password -__v");
    }else{
        imagePost = await imagePostModel.find().sort({ createdAt: -1 }).populate("author", "-password -__v");
    }
    res.status(200).json({
      error: null,
      statusCode: 200,
      message: "Blog Image Retrieved",
      data:{
        count:imagePost.length,
        blogs:imagePost
      }
    });
  } catch (error) {
    res.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message: "Internal Server Error"
    });
  }
};

//create ImagePost
export const createImagePost = async (req, res) => {
  const { title, body } = req.body;
  if (!req.file) {
    return res.status(400).json({
      error:"VALIDATION_ERROR",
      statusCode: 400, 
      message: "media is required"
     });
  }
  const media = req.protocol + "://" + req.get("host") + "/assets/images/" + req.file.filename
  // validation
  if (!title || !body) {
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
    const createImagePost = await imagePostModel.create({ title, body, media,author: req.user.id });
    const imagePost = await imagePostModel.findById(createImagePost._id).populate("author", "-password -__v");
    res.status(200).json({
       error : null,
       statusCode: 200,
       message: "Image Post has been created", 
       data:imagePost 
      });
  } catch (error) {
    res.status(500).send({
      error:"INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message:"Internal Server Error"
    });
  }
};

//single ImagePost
export const singleImagePost = async (req, res) => {
  try {
    const singleImagePost = await imagePostModel.findById(req.params.id).populate("author", "-password -__v");
    if (!singleImagePost) {
      return res.status(404).json({
         error:"VALIDATION_ERROR",
         statusCode: 404,
         message: "Image Post not found" 
        });
    }
    res.status(200).json(singleImagePost);
  } catch (error) {
    res.status(500).send({
      error:"INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message:"Internal Server Error"
    });
  }
};

//edit ImagePost
export const editImagePost = async (req, res) => {
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
    let getImage = await imagePostModel.findById(req.params.id);
    if (!getImage) {
      return res.status(404).json({ 
        error:"VALIDATION_ERROR",
        statusCode: 404,
        message: "Image Post not found" 
      });
    }
    if (req.user.id != getImage.author._id) {
      return res.status(401).json({ 
        error:"VALIDATION_ERROR",
        statusCode: 401,
        message: "Unauthorized" 
      });
    }
    if (req.file) {
      const imageName = getImage.media.split("/").pop();
      access(`${req.file.destination}/${imageName}`, (err) => {
        if (err) throw new Error("File not found!");
        unlink(`${req.file.destination}/${imageName}`, (err) => {
          if (err) throw new Error("Failed to delete file!");
        });
      })
      media = req.protocol + "://" + req.get("host") + "/assets/images/" + req.file.filename;
    }
    await imagePostModel.updateOne(
      { _id: req.params.id },
      {
        title: title || getImage.title,
        body: body || getImage.body,
        media: media || getImage.media
      }
    );

    getImage = await imagePostModel.findById(req.params.id).populate("author", "-password -__v");
    res.status(200).json({ 
      error : null,
      statusCode: 200,
      message: "Image Post has been updated", 
      data: getImage 
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

//delete ImagePost
export const deleteImagePost = async (req, res) => {
  try {
    const getImage = await imagePostModel.findById(req.params.id).populate("author", "-password -__v");
    if (!getImage) {
      return res.status(404).json({ 
        error:"VALIDATION_ERROR",
        statusCode: 404,
        message: "Image Post not found" 
      });
    }
    if (req.user.id != getImage.author._id) {
      return res.status(401).json({ 
        error:"VALIDATION_ERROR",
        statusCode: 401,
        message: "Unauthorized" 
      });
    }
    await imagePostModel.deleteOne(
      { _id: req.params.id, }
    );
    res.status(200).json({ 
      error : null,
      statusCode: 200,
      message: "Image Post has been deleted", 
      data: getImage 
    });
  } catch (error) {
    res.status(500).json({
      error:"INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message:"Internal Server Error"
    });
  }
};

