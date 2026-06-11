import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    const likesCount = await Like.countDocuments({
      video: videoId,
    });

    return res.status(200).json(
      new ApiResponse(200, "Video unliked", {
        isLiked: false,
        likesCount,
      })
    );
  }

  await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  const likesCount = await Like.countDocuments({
    video: videoId,
  });

  return res.status(200).json(
    new ApiResponse(200, "Video liked", {
      isLiked: true,
      likesCount,
    })
  );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    const likesCount = await Like.countDocuments({
      comment: commentId,
    });

    return res.status(200).json(
      new ApiResponse(200, "Comment unliked", {
        isLiked: false,
        likesCount,
      })
    );
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  const likesCount = await Like.countDocuments({
    comment: commentId,
  });

  return res.status(200).json(
    new ApiResponse(200, "Comment liked", {
      isLiked: true,
      likesCount,
    })
  );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    const likesCount = await Like.countDocuments({
      tweet: tweetId,
    });

    return res.status(200).json(
      new ApiResponse(200, "Tweet unliked", {
        isLiked: false,
        likesCount,
      })
    );
  }

  await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  const likesCount = await Like.countDocuments({
    tweet: tweetId,
  });

  return res.status(200).json(
    new ApiResponse(200, "Tweet liked", {
      isLiked: true,
      likesCount,
    })
  );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: req.user._id,
        video: { $exists: true },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $replaceRoot: {
        newRoot: "$video",
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      "liked videos fetched sucessfully",
      likedVideos
    )
  );
});

const getLikedTweets = asyncHandler(async (req, res) => {
  const likedTweets = await Like.aggregate([
    {
      $match: {
        likedBy: req.user._id,
        tweet: { $exists: true },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "tweet",
        foreignField: "_id",
        as: "tweet",
      },
    },
    {
      $unwind: "$tweet",
    },
    {
      $replaceRoot: {
        newRoot: "$tweet",
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      "liked tweets fetched sucessfully",
      likedTweets
    )
  );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getLikedTweets,
};