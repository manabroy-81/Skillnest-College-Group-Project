const ExpressError = require("../utils/expressError");
const {
  postSchema,
  commentSchema,
  registrationSchema,
  loginSchema,
  profileSchema,
  searchSchema,
} = require("../schemas/joiScema");

const validationOptions = { abortEarly: false, stripUnknown: true };

const validationError = (error) =>
  new ExpressError(
    error.details.map((detail) => detail.message).join(" "),
    400,
  );

const validateBody = (schema, key) => (req, res, next) => {
  const { error, value } = schema.validate(req.body[key], validationOptions);
  if (error) return next(validationError(error));
  req.body[key] = value;
  next();
};

const validateLogin = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, validationOptions);
  if (error) return next(validationError(error));
  req.body = value;
  next();
};

const validateSearch = (req, res, next) => {
  const { error } = searchSchema.validate(req.query, validationOptions);
  if (error) return next(validationError(error));
  next();
};

module.exports = {
  validatePost: validateBody(postSchema, "post"),
  validateComment: validateBody(commentSchema, "comment"),
  validateRegistration: validateBody(registrationSchema, "user"),
  validateProfile: validateBody(profileSchema, "user"),
  validateLogin,
  validateSearch,
};
