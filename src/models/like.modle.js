import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.types.objectId,
      ref: "Video",
    },
    comment: {
      type: Schema.types.objectId,
      ref : "Comment"
    },
    tweet: {
      type: Schema.types.objectId,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.types.objectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const Like = mongoose.model("Like", likeSchema);
