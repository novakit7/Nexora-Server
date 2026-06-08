import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
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

commentSchema.plugin(mongoosePaginate);
export const Commnet = mongoose.model("Comment", commentSchema);
