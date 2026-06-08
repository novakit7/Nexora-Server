import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/User.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const genrateAcessAndRefreshToken = async (userId) => {
  try {
    // generate access token
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    // generate refresh token
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Failed to generate access and refresh tokens",
    );
  }
};
//register........................
const registerUser = asyncHandler(async (req, res) => {
  // user details from request body
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // check if user already exists
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists with this email or username");
  }

  // get avatar and cover image from request files
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0].path; error if cover image is not provided

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload avatar and cover image to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  //create new user
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check if user created successfully
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "Failed to register user");
  }

  // send response
  res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});

//sign in ......................................
const signInUser = asyncHandler(async (req, res) => {
  // user details from request body
  const { email, username, password } = req.body;

  // check if email or username and password are provided
  if ((!email && !username) || !password) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  // find user by email or username
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist with this email or username");
  }

  // check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // generate access and refresh tokens
  const { accessToken, refreshToken } = await genrateAcessAndRefreshToken(
    user._id,
  );

  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  // set access and refresh tokens in httpOnly cookies
  const options = {
    httpOnly: true,
    secure: true,
  };
  // send response with cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User signed in successfully", {
        user: logedInUser,
        accessToken,
        refreshToken,
      }),
    );
});

//logout.........................
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, //this removes field from document
      },
    },
    {
      returnDocument: "after",
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out sucessfully", {}));
});

//access token refress
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incommingToken) {
    throw new ApiError(401, "unAuthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incommingToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (incommingToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken: newRefreshToken } =
      await genrateAcessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, "Access token is refreshed sucessfully", {
          accessToken,
          newRefreshToken,
        }),
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something ewnt wrong while refreshing access token",
    );
  }
});

//change password..........
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(404, "current password and new password is required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordCurrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCurrect) {
    throw new ApiError(400, "invalid current password");
  }
  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "password changed suessfullly!!", {}));
});

//get current user info.............
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully", req.user));
});

// update account details..........
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true },
  ).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, user, "Accout details Updated Successfully.."));
});

//update Avatar.........
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is Missing..");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Failed to upload Avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      },
    },
    {
      returnDocument: "after",
    },
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, "avatar is Updated sucessfully", user));
});

// update cover image..........
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const CoverImageLocalPath = req.file?.path;
  if (!CoverImageLocalPath) {
    throw new ApiError(400, "cover image file is Missing..");
  }
  const coverImage = await uploadOnCloudinary(CoverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(500, "Failed to upload cover image");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, "cover image is Updated sucessfully", user));
});

//get subscribers and subscriptions.......
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id || null, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        createdAt: 1,
      },
    },
  ]);
  if (!channel.length) {
    throw new ApiError(404, "Channel does not exist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel details fetched successfully"),
    );
});

//get watch history.........
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  if (!user.length) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "watch history fetched successfully.",
        user[0].watchHistory
      ),
    );
});

export {
  registerUser,
  signInUser,
  logOutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
