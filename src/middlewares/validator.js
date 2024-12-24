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
