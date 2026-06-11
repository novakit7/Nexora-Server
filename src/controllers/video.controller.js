import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/like.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const limitNumber = Math.min(
    100,
    Math.max(1, Number.parseInt(limit, 10) || 10),
  );

  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const filter = { isPublished: true };

  if (query?.trim()) {
    filter.$or = [
      { title: { $regex: query.trim(), $options: "i" } },
      { description: { $regex: query.trim(), $options: "i" } },
    ];
  }

  if (userId) {
    filter.owner = new mongoose.Types.ObjectId(userId);
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "views",
    "duration",
    "title",
  ];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortDirection = sortType === "asc" ? 1 : -1;

  const videos = await Video.paginate(filter, {
    page: pageNumber,
    limit: limitNumber,
    sort: { [sortField]: sortDirection },
    populate: {
      path: "owner",
      select: "fullName username avatar",
    },
    lean: true,
    select: "-__v",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Videos fetched successfully", videos));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, " title and description are required");
  }

  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path || "";
  const videoLocalPath = req.files?.video?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "video file is required");
  }
  let thumbnail = null;
  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  if (!video) {
    throw new ApiError(500, "Failed to upload video");
  }
  const uploadedVideo = await Video.create({
    title: title?.trim(),
    description: description?.trim(),
    videoFile: video.url,
    thumbnail: thumbnail?.url || "",
    duration: video.duration,
    owner: req.user?._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "video uploaded sucessfully", uploadedVideo));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: {
        views: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!video) {
    throw new ApiError(404, "Video does not exist");
  }

  const likesCount = await Like.countDocuments({
    video: videoId,
  });

  const isLiked = !!(await Like.exists({
    video: videoId,
    likedBy: req.user?._id,
  }));

  const videoData = {
    ...video.toObject(),
    likesCount,
    isLiked,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "video fetched sucessfully", videoData));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const { newTitle, newDescription } = req.body;
  if (!newTitle && !newDescription) {
    throw new ApiError(
      400,
      "At least one field (newTitle or newDescription) is required",
    );
  }
  const updateFields = {};
  if (newTitle?.trim()) {
    updateFields.title = newTitle.trim();
  }
  if (newDescription?.trim()) {
    updateFields.description = newDescription.trim();
  }
  const video = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user?._id,
    },
    {
      $set: updateFields,
    },
    {
      returnDocument: "after",
    },
  );
  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

//thumbnail update................
const updateThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file is Missing..");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail.url) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }
  const video = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user?._id,
    },
    {
      $set: {
        thumbnail: thumbnail.url,
      },
    },
    {
      returnDocument: "after",
    },
  );
  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "thumbnail is Updated sucessfully", video));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user?._id,
  });
  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "video deleted  sucessfully", video));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    [
      {
        $set: {
          isPublished: { $not: "$isPublished" },
        },
      },
    ],
    {
      returnDocument: "after",
      updatePipeline: true,
    },
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Video ${updatedVideo.isPublished ? "published" : "unpublished"} successfully`,
        updatedVideo,
      ),
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  updateThumbnail,
};
