import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $match: {
        _id: req.user._id,
      },
    },

    // Get all videos of this channel
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },

    // Get subscribers
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    // Get likes on all videos
    {
      $lookup: {
        from: "likes",
        let: {
          videoIds: "$videos._id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$video", "$$videoIds"],
              },
            },
          },
        ],
        as: "likes",
      },
    },

    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },

        subscribersCount: {
          $size: "$subscribers",
        },

        totalLikes: {
          $size: "$likes",
        },

        totalViews: {
          $sum: "$videos.views",
        },
      },
    },

    {
      $project: {
        fullName: 1,
        username: 1,
        coverImage: 1,
        avatar: 1,
        totalVideos: 1,
        subscribersCount: 1,
        totalLikes: 1,
        totalViews: 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Channel stats fetched successfully",
      stats[0]
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const channelVideos = await Video.aggregate([
    {
      $match: {
        owner: req.user._id,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        commentsCount: {
          $size: "$comments",
        },
      },
    },
    {
      $project: {
        likes: 0,
        comments: 0,
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
    .json(
      new ApiResponse(
        200,
        "channel videos fetched sucessfully.",
        channelVideos,
      ),
    );
});

export { getChannelStats, getChannelVideos };
