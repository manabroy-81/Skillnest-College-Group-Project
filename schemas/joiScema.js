const Joi = require("joi");

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isImageSource = (value) =>
  isHttpUrl(value) ||
  (/^data:image\/(jpeg|jpg|png|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(value) &&
    value.length <= 2800000);

const imageSource = Joi.string()
  .trim()
  .custom((value, helpers) =>
    isImageSource(value) ? value : helpers.error("any.invalid"),
  )
  .messages({ "any.invalid": "Image must be a valid image file." });

const nullableImageSource = Joi.alternatives()
  .try(imageSource, Joi.valid(null))
  .optional();

const postSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    "string.empty": "Post content is required.",
    "string.min": "Post content is required.",
    "string.max": "Post content cannot exceed 1000 characters.",
  }),
  image: nullableImageSource,
});

const commentSchema = Joi.object({
  text: Joi.string().trim().min(1).max(500).required().messages({
    "string.empty": "Comment text is required.",
    "string.min": "Comment text is required.",
    "string.max": "Comments cannot exceed 500 characters.",
  }),
});

const registrationSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required().messages({
    "string.empty": "Username is required.",
    "string.min": "Username must have at least 3 characters.",
    "string.max": "Username cannot exceed 30 characters.",
  }),
  email: Joi.string().trim().email().max(254).required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email is required.",
  }),
  password: Joi.string().min(8).max(128).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must have at least 8 characters.",
    "string.max": "Password cannot exceed 128 characters.",
  }),
});

const loginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  password: Joi.string().min(1).max(128).required(),
  returnTo: Joi.string().trim().max(2048).allow(""),
});

const profileSchema = Joi.object({
  fullName: Joi.string().trim().max(80).allow(""),
  bio: Joi.string().max(300).allow(""),
  profileImage: nullableImageSource,
  bannerImage: nullableImageSource,
});

const searchSchema = Joi.object({
  q: Joi.string().trim().max(100).allow("", null).default(""),
});

module.exports = {
  postSchema,
  commentSchema,
  registrationSchema,
  loginSchema,
  profileSchema,
  searchSchema,
};
