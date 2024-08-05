import mongoose from 'mongoose';
import videoPostModel from './../models/videoPost.js';
import { unlink, access } from 'fs';


//get all videoPost
export const getAllVideoPost = async (req, res) => {
  let videoPost;
  try {
    if(req.query.type){
      if(req.query.type!=="current") return res.status(400).json({
        error:"VALIDATION_ERROR",
        statusCode: 400,
        message: "Invalid query parameter"
      });
      // get parameter
      videoPost = await videoPostModel.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate("author", "-password -__v");
    }else{
      videoPost = await videoPostModel.find().sort({ createdAt: -1 }).populate("author", "-password -__v");
    }
    res.status(200).json({
      error : null,
      statusCode: 200,
      message: "Blog Video Retrieved",
      data:{
        count:videoPost.length,
        blogs:videoPost
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

//create VideoPost
export const createVideoPost = async (req, res) => {
  const { title, body } = req.body;
  if (!req.file) {
    return res.status(400).json({ 
      error: "VALIDATION_ERROR",
      statusCode: 400,
      message: "media is required"
     });
  }
  const media = req.protocol + "://" + req.get("host") + "/assets/videos/" + req.file.filename
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
    const createVideoPost = await videoPostModel.create({ title, body, media, author: req.user.id });
    const videoPost = await videoPostModel.findById(createVideoPost._id).populate("author", "-password -__v");
    res.status(200).json({
       error : null,
       statusCode: 200, 
       message: "Video Post has been created", 
       data:videoPost 
    });
  } catch (error) {
    res.status(500).json({
      error:"INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message:"Internal Server Error"
    });
  }
};

//single VideoPost
export const singleVideoPost = async (req, res) => {
  try {
    const singleVideoPost = await videoPostModel.findById(req.params.id).populate("author", "-password -__v");
    if (!singleVideoPost) {
      return res.status(404).json({ 
        error:"VALIDATION_ERROR",
        statusCode: 404,
        message: "Video Post not found" 
      });
    }
    if (req.user.id != getVideo.author._id) {
      return res.status(401).json({
         error:"VALIDATION_ERROR",
         statusCode: 401,
         message: "Unauthorized" 
        });
    }
    res.status(200).json({
       error : null,
       statusCode: 200,
       message: "Video Post Retrieved",
       data:singleVideoPost
    });
  } catch (error) {
    res.status(500).json({
      error:"INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message:"Internal Server Error"
    });
  }
};

//edit VideoPost
export const editVideoPost = async (req, res) => {
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
    let getVideo = await videoPostModel.findById(req.params.id);
    if (!getVideo) {
      return res.status(404).json({ 
        error:"VALIDATION_ERROR",
        statusCode: 404,
        message: "Video Post not found" 
      });
    }
    if (req.user.id != getVideo.author._id) {
      return res.status(401).json({ 
        error:"VALIDATION_ERROR",
        statusCode: 401,
        message: "Unauthorized" 
      });
    }
    if (req.file) {
      const videoName = getVideo.media.split("/").pop();
      access(`${req.file.destination}/${videoName}`, (err) => {
        if (err) throw new Error("File not found!");
        unlink(`${req.file.destination}/${videoName}`, (err) => {
          if (err) throw new Error("Failed to delete file!");
        });
      })
      media = req.protocol + "://" + req.get("host") + "/assets/videos/" + req.file.filename;
    }
    await videoPostModel.updateOne(
      { _id: req.params.id },
      {
        title: title || getVideo.title,
        body: body || getVideo.body,
        media: media || getVideo.media
      }
    );

    getVideo = await videoPostModel.findById(req.params.id).populate("author", "-password -__v");
    res.status(200).json({
       error : null,
       statusCode: 200, 
       message: "Video Post has been updated", 
       data: getVideo 
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

//delete VideoPost
export const deleteVideoPost = async (req, res) => {
  try {
    const deleteVideoPost = await videoPostModel.findById(req.params.id).populate("author", "-password -__v");
    if (!deleteVideoPost) {
      return res.status(404).json({ 
        error:"VALIDATION_ERROR",
        statusCode: 404,
        message: "Video Post not found" 
      });
    }
    await videoPostModel.deleteOne(
      { _id: req.params.id }
    );
    res.status(200).json({ 
      error : null,
      statusCode: 200,
      message: "Video Post has been deleted", 
      data: deleteVideoPost 
    });
  } catch (error) {
    res.status(500).json({
      error:"INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message:"Internal Server Error"
    });
  }
};

