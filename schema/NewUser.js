const joi = require('joi');

exports.validateNewUser = async (newUser) => {
  const schema = joi.object({
    id: joi.string().required(),
    email: joi.string().email().required(),
    username: joi.string().required(),
  });
  return schema.validate(newUser);
};