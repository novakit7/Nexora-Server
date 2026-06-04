import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiErrors.js';
import {User} from '../models/User.model.js';
import {upload} from '../middlewares/multer.middleware.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(
  async (req, res) => {
  // user details from request body
  const {
    fullName,
    email,
    username,
    password
  } = req.body;

  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
    // check if user already exists
    const existedUser = await User.findOne(
        {
            $or: [{ email }, { username }]
        }
    );
    if (existedUser) {
      throw new ApiError(409, "User already exists with this email or username");
    }

    // get avatar and cover image from request files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0].path; error if cover image is not provided

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";

    if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    // upload avatar and cover image to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar) {
      throw new ApiError(500, "Failed to upload avatar");
    }

    //create new user
    const user = await User.create(
        {
            fullName,
            email,
            username: username.toLowerCase(),
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || ""
        }
    );

    // check if user created successfully
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser) {
      throw new ApiError(500, "Failed to register user");
    }

    // send response
    res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser));
  }
);

export {registerUser};