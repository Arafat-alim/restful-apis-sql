const Joi = require("joi");

exports.registerSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(50)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  password: Joi.string().min(4).max(20).required().alphanum(),
  name: Joi.string().min(4).max(50).required(),
});

exports.userByIdSchema = Joi.object({
  id: Joi.number().required().min(1).max(100),
});
