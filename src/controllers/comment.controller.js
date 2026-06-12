import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

//comments on a particular video..........
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  const comments = await Comment.aggregate([
  {
    $match: {
      video: new mongoose.Types.ObjectId(videoId),
    },
  },
  {
    $sort: {
      createdAt: -1,
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
    },
  },
  {
    $unwind: "$owner",
  },
  {
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "comment",
      as: "likes",
    },
  },
  {
    $addFields: {
      likesCount: {
        $size: "$likes",
      },
      isLiked: {
        $in: [req.user._id, "$likes.likedBy"],
      },
    },
  },
  {
    $project: {
      content: 1,
      createdAt: 1,
      likesCount: 1,
      isLiked: 1,
      owner: {
        _id: "$owner._id",
        username: "$owner.username",
        avatar: "$owner.avatar",
      },
    },
  },
  {
    $skip: (page - 1) * limit,
  },
  {
    $limit: limit,
  },
]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Comments fetched sucessfully", comments));
});

// adding a comment.............
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  const { content } = req.body;
  const videoExists = await Video.findById(videoId);
  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }
  if (!content?.trim()) {
    throw new ApiError(400, "content is required");
  }

  const comment = await Comment.create({
    content: content?.trim(),
    video: videoId,
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "comment created sucessfully", comment));
});

//updating existing comment.......
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }
  const { newContent } = req.body;
  if (!newContent?.trim()) {
    throw new ApiError(400, "content is required");
  }
  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req.user?._id,
    },
    {
      $set: {
        content: newContent.trim(),
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedComment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "comment is updated sucessfully", updatedComment),
    );
});
// delete a comment..........
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
  throw new ApiError(400, "commentId is required");
}

  const deletedcomment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });

  if (!deletedcomment) {
    throw new ApiError(
      404,
      "Comment not found or you are not authorized to delete it",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "comment deleted successfully", {}));
});

export { getVideoComments, addComment, updateComment, deleteComment };
