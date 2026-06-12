import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);

    return res.status(200).json(
      new ApiResponse(200, "Channel unsubscribed", {
        isSubscribed: false,
      }),
    );
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res.status(200).json(
    new ApiResponse(200, "Channel subscribed", {
      isSubscribed: true,
    }),
  );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({
    channel: channelId,
  }).populate("subscriber", "username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "channel subscribers fetched sucessfully.",
        subscribers,
      ),
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        subscriber: req.user._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "channel._id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        "channel.subscribersCount": {
          $size: "$subscribers",
        },
      },
    },
    {
      $project: {
        "channel.username": 1,
        "channel.avatar": 1,
        "channel.subscribersCount": 1,
      },
    },
    {
      $replaceRoot: {
        newRoot: "$channel",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "subscriptions by user fetched sucessfully.",
        subscriptions,
      ),
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
