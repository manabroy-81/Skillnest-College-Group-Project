const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  content: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    default: null,
  },

  imagePublicId: {
    type: String,
    default: null,
  },

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
