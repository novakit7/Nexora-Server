import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1)
    const limitNumber = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10))

    if (userId && !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const filter = { isPublished: true }

    if (query?.trim()) {
        filter.$or = [
            { title: { $regex: query.trim(), $options: "i" } },
            { description: { $regex: query.trim(), $options: "i" } }
        ]
    }

    if (userId) {
        filter.owner = new mongoose.Types.ObjectId(userId)
    }

    const allowedSortFields = ["createdAt", "updatedAt", "views", "duration", "title"]
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt"
    const sortDirection = sortType === "asc" ? 1 : -1

    const videos = await Video.paginate(filter, {
        page: pageNumber,
        limit: limitNumber,
        sort: { [sortField]: sortDirection },
        populate: {
            path: "owner",
            select: "fullName username avatar"
        },
        lean: true,
        select: "-__v"
    })

    return res
        .status(200)
        .json(new ApiResponse(200, "Videos fetched successfully", videos))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
