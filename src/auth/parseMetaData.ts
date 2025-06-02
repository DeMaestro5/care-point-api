import { Request, Response, NextFunction } from 'express';

export function parseMetadata(req: Request, res: Response, next: NextFunction) {
  // If metadata is a string, try to parse it
  if (typeof req.body.metadata === 'string') {
    try {
      req.body.metadata = JSON.parse(req.body.metadata);
    } catch (e) {
      return res
        .status(400)
        .json({ statusCode: '10001', message: 'Invalid metadata JSON' });
    }
  }

  // If metadata is not present in the body but the body itself looks like metadata
  if (!req.body.metadata && (req.body.title || req.body.category)) {
    req.body.metadata = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      tags: req.body.tags,
      visibility: req.body.visibility,
    };
  }

  next();
}
