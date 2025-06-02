import Joi from 'joi';

export default {
  documentId: Joi.object().keys({
    id: Joi.string().required(),
  }),

  uploadDocument: Joi.object().keys({
    metadata: Joi.object()
      .keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        tags: Joi.array().items(Joi.string()).optional(),
        category: Joi.string().required(),
        visibility: Joi.string()
          .valid('PRIVATE', 'PUBLIC', 'RESTRICTED')
          .default('PRIVATE'),
      })
      .required(),
  }),

  updateMetadata: Joi.object().keys({
    metadata: Joi.object()
      .keys({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        tags: Joi.array().items(Joi.string()).optional(),
        category: Joi.string().optional(),
        visibility: Joi.string()
          .valid('PRIVATE', 'PUBLIC', 'RESTRICTED')
          .optional(),
      })
      .required(),
  }),

  listTemplates: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    category: Joi.string().optional(),
    search: Joi.string().optional(),
  }),

  generateDocument: Joi.object().keys({
    templateId: Joi.string().required(),
    data: Joi.object().required(),
    outputFormat: Joi.string().valid('PDF', 'DOCX', 'TXT').default('PDF'),
  }),
};
