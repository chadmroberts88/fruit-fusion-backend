const joi = require('joi');

exports.validateNewUser = async (newUser) => {
  const schema = joi.object({
    id: joi.string().required(),
    email: joi.string().email().required(),
    soundOn: joi.boolean().required(),
    darkModeOn: joi.boolean().required(),
    useSwipeOn: joi.boolean().required(),
    best: joi.number().integer().min(0).required(),
    score: joi.number().integer().min(0).required(),
    multiplier: joi.number().integer().min(1).required(),
    tileCount: joi.number().integer().min(0).required(),
    tiles: joi.string().required(),
  });
  return schema.validate(newUser);
};