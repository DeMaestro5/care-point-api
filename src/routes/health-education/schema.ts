import Joi from 'joi';
import {
  ResourceType,
  DifficultyLevel,
} from '../../database/model/EducationResource';

// Custom ObjectId validation
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'valid ObjectId');

export default {
  resourceId: Joi.object().keys({
    id: objectId.required(),
  }),

  patientId: Joi.object().keys({
    id: objectId.required(),
  }),

  createResource: Joi.object().keys({
    title: Joi.string().required().min(3).max(200).trim(),
    description: Joi.string().required().min(10).max(1000).trim(),
    content: Joi.string().optional().trim(),
    type: Joi.string()
      .valid(...Object.values(ResourceType))
      .required(),
    category: objectId.required(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    difficultyLevel: Joi.string()
      .valid(...Object.values(DifficultyLevel))
      .required(),
    estimatedReadTime: Joi.number().min(1).optional(),
    author: Joi.string().required().min(2).max(100).trim(),
    medicalConditions: Joi.array().items(Joi.string().trim()).optional(),
    targetAudience: Joi.string().required().default('patients'),
    language: Joi.string().required().default('en'),
    fileUrl: Joi.string().uri().optional(),
    thumbnailUrl: Joi.string().uri().optional(),
    externalUrl: Joi.string().uri().optional(),
    isPublished: Joi.boolean().default(false),
  }),

  updateResource: Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().optional(),
    description: Joi.string().min(10).max(1000).trim().optional(),
    content: Joi.string().trim().optional(),
    type: Joi.string()
      .valid(...Object.values(ResourceType))
      .optional(),
    category: objectId.optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    difficultyLevel: Joi.string()
      .valid(...Object.values(DifficultyLevel))
      .optional(),
    estimatedReadTime: Joi.number().min(1).optional(),
    author: Joi.string().min(2).max(100).trim().optional(),
    medicalConditions: Joi.array().items(Joi.string().trim()).optional(),
    targetAudience: Joi.string().optional(),
    language: Joi.string().optional(),
    fileUrl: Joi.string().uri().optional(),
    thumbnailUrl: Joi.string().uri().optional(),
    externalUrl: Joi.string().uri().optional(),
    isPublished: Joi.boolean().optional(),
  }),

  createCategory: Joi.object().keys({
    name: Joi.string().required().min(2).max(100).trim(),
    description: Joi.string().max(500).trim().optional(),
    parentCategory: objectId.optional(),
    displayOrder: Joi.number().optional(),
  }),

  updateCategory: Joi.object().keys({
    name: Joi.string().min(2).max(100).trim().optional(),
    description: Joi.string().max(500).trim().optional(),
    parentCategory: objectId.optional(),
    displayOrder: Joi.number().optional(),
  }),

  resourceQuery: Joi.object().keys({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid('title', 'publishedAt', 'viewCount', 'rating.average', 'createdAt')
      .default('publishedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    category: objectId.optional(),
    type: Joi.string()
      .valid(...Object.values(ResourceType))
      .optional(),
    difficultyLevel: Joi.string()
      .valid(...Object.values(DifficultyLevel))
      .optional(),
    medicalConditions: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    language: Joi.string().optional(),
    tags: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    search: Joi.string().optional(),
  }),

  categoryQuery: Joi.object().keys({
    parentCategory: objectId.optional(),
    search: Joi.string().optional(),
  }),

  recommendationQuery: Joi.object().keys({
    limit: Joi.number().min(1).max(50).default(10),
    language: Joi.string().optional(),
  }),
};
