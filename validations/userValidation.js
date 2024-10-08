import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

export const updateSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  name: Joi.string().optional(),
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  profileImage: Joi.string().optional(),
  backgroundImage: Joi.string().optional(),
})
