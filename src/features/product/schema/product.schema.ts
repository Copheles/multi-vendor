import Joi from 'joi';

export const productSchemaCreate = Joi.object({
  name: Joi.string().required(),
  longDescription: Joi.string().required(),
  shortDescription: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  mainImage: Joi.string().required(),
  categoryId: Joi.number().required(),
  price: Joi.number().required()
});
