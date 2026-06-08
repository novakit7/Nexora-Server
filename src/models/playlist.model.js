import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    discription: {
      type: String,
      required: true,
    },
    videos: {
      type: Schema.types.objectId,
      ref: "Video",
    },
    owner: {
      type: Schema.types.objectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
