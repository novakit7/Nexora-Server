import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//create tweet...........
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "content is required");
  }
  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "tweet created sucessfully", tweet));
});

// current user tweets..........
const getUserTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find({
    owner: req.user._id,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "user tweets fetched sucessfully.", tweets));
});

const allTweets = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const tweets = await Tweet.find({})
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, "All tweets fetched successfully", tweets));
});

// update tweets..............
const updateTweet = asyncHandler(async (req, res) => {
  const { newContent } = req.body;

  if (!newContent?.trim()) {
    throw new ApiError(400, "Content is required for updating tweet");
  }
  const { tweetId } = req.params;

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this tweet");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: newContent,
      },
    },
    {
      returnDocument: "after",
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "tweet updated sucessfully", updatedTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!deletedTweet) {
    throw new ApiError(
      404,
      "Tweet not found or you are not authorized to delete it",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", {}));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet, allTweets };
