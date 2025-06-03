import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../core/ApiError';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import { ProtectedRequest } from 'app-request';
import EducationResourceRepo, {
  ResourceFilters,
  PaginationOptions,
} from '../../database/repository/EducationResourceRepo';
import EducationCategoryRepo from '../../database/repository/EducationCategoryRepo';
import PatientRepo from '../../database/repository/PatientRepo';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

/*-------------------------------------------------------------------------*/
// Education Resources Routes
/*-------------------------------------------------------------------------*/

// GET /api/education/resources - List educational resources
router.get(
  '/resources',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      category,
      type,
      difficultyLevel,
      medicalConditions,
      language,
      tags,
      search,
    } = req.query;

    // Build filters
    const filters: ResourceFilters = {};

    if (category) {
      if (!Types.ObjectId.isValid(category as string)) {
        throw new BadRequestError('Invalid category ID format');
      }
      filters.category = new Types.ObjectId(category as string);
    }

    if (type) filters.type = type as any;
    if (difficultyLevel) filters.difficultyLevel = difficultyLevel as any;
    if (language) filters.language = language as string;
    if (search) filters.search = search as string;

    // Handle array parameters
    if (medicalConditions) {
      filters.medicalConditions = Array.isArray(medicalConditions)
        ? (medicalConditions as string[])
        : [medicalConditions as string];
    }

    if (tags) {
      filters.tags = Array.isArray(tags)
        ? (tags as string[])
        : [tags as string];
    }

    // Build pagination
    const pagination: PaginationOptions = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 20,
      sortBy: (sortBy as string) || 'publishedAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await EducationResourceRepo.findAll(filters, pagination);

    new SuccessResponse('Educational resources retrieved successfully', {
      resources: result.resources,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit!),
        hasNext: pagination.page! * pagination.limit! < result.total,
        hasPrev: pagination.page! > 1,
      },
    }).send(res);
  }),
);

// GET /api/education/resources/:id - Get specific resource
router.get(
  '/resources/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid resource ID format');
    }

    const resourceId = new Types.ObjectId(req.params.id);
    const resource = await EducationResourceRepo.findById(resourceId);

    if (!resource) {
      throw new NotFoundError('Educational resource not found');
    }

    // Increment view count
    await EducationResourceRepo.incrementViewCount(resourceId);

    new SuccessResponse(
      'Educational resource retrieved successfully',
      resource,
    ).send(res);
  }),
);

// POST /api/education/resources - Add educational resource
router.post(
  '/resources',
  validator(schema.createResource),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // Check if user has permission to create resources (typically doctors/admin)
    const allowedRoles = ['DOCTOR', 'ADMIN', 'STAFF'];
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        'Not authorized to create educational resources',
      );
    }

    // Validate category exists
    if (!Types.ObjectId.isValid(req.body.category)) {
      throw new BadRequestError('Invalid category ID format');
    }

    const categoryId = new Types.ObjectId(req.body.category);
    const category = await EducationCategoryRepo.findById(categoryId);
    if (!category) {
      throw new BadRequestError('Category not found');
    }

    const resourceData = {
      ...req.body,
      category: categoryId,
      createdBy: req.user._id,
    };

    const resource = await EducationResourceRepo.create(resourceData);

    new SuccessResponse(
      'Educational resource created successfully',
      resource,
    ).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Education Categories Routes
/*-------------------------------------------------------------------------*/

// GET /api/education/categories - List education categories
router.get(
  '/categories',
  validator(schema.categoryQuery, ValidationSource.QUERY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { parentCategory, search } = req.query;

    let categories;

    if (search) {
      categories = await EducationCategoryRepo.searchCategories(
        search as string,
      );
    } else if (parentCategory) {
      if (!Types.ObjectId.isValid(parentCategory as string)) {
        throw new BadRequestError('Invalid parent category ID format');
      }
      const parentId = new Types.ObjectId(parentCategory as string);
      categories = await EducationCategoryRepo.findByParentCategory(parentId);
    } else {
      categories = await EducationCategoryRepo.findAll();
    }

    new SuccessResponse(
      'Education categories retrieved successfully',
      categories,
    ).send(res);
  }),
);

// POST /api/education/categories - Create education category
router.post(
  '/categories',
  validator(schema.createCategory),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // Check if user has permission to create categories (typically admin/staff)
    const allowedRoles = ['ADMIN', 'STAFF', 'DOCTOR'];
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Not authorized to create education categories');
    }

    // Check if category name already exists
    const existingCategory = await EducationCategoryRepo.findByName(
      req.body.name,
    );
    if (existingCategory) {
      throw new BadRequestError('Category with this name already exists');
    }

    // Validate parent category if provided
    if (req.body.parentCategory) {
      if (!Types.ObjectId.isValid(req.body.parentCategory)) {
        throw new BadRequestError('Invalid parent category ID format');
      }
      const parentId = new Types.ObjectId(req.body.parentCategory);
      const parentCategory = await EducationCategoryRepo.findById(parentId);
      if (!parentCategory) {
        throw new BadRequestError('Parent category not found');
      }
    }

    const categoryData = {
      ...req.body,
      createdBy: req.user._id,
      parentCategory: req.body.parentCategory
        ? new Types.ObjectId(req.body.parentCategory)
        : undefined,
    };

    const category = await EducationCategoryRepo.create(categoryData);

    new SuccessResponse(
      'Education category created successfully',
      category,
    ).send(res);
  }),
);

// GET /api/education/categories/:id - Get specific category
router.get(
  '/categories/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid category ID format');
    }

    const categoryId = new Types.ObjectId(req.params.id);
    const category = await EducationCategoryRepo.findById(categoryId);

    if (!category) {
      throw new NotFoundError('Education category not found');
    }

    new SuccessResponse(
      'Education category retrieved successfully',
      category,
    ).send(res);
  }),
);

// PUT /api/education/categories/:id - Update education category
router.put(
  '/categories/:id',
  validator(schema.updateCategory),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // Check if user has permission to update categories
    const allowedRoles = ['ADMIN', 'STAFF', 'DOCTOR'];
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Not authorized to update education categories');
    }

    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid category ID format');
    }

    const categoryId = new Types.ObjectId(req.params.id);

    // Check if category exists
    const existingCategory = await EducationCategoryRepo.findById(categoryId);
    if (!existingCategory) {
      throw new NotFoundError('Education category not found');
    }

    // Check if new name conflicts with existing category (if name is being changed)
    if (req.body.name && req.body.name !== existingCategory.name) {
      const nameConflict = await EducationCategoryRepo.findByName(
        req.body.name,
      );
      if (nameConflict) {
        throw new BadRequestError('Category with this name already exists');
      }
    }

    // Validate parent category if provided
    if (req.body.parentCategory) {
      if (!Types.ObjectId.isValid(req.body.parentCategory)) {
        throw new BadRequestError('Invalid parent category ID format');
      }
      const parentId = new Types.ObjectId(req.body.parentCategory);

      // Prevent circular reference
      if (parentId.equals(categoryId)) {
        throw new BadRequestError('Category cannot be its own parent');
      }

      const parentCategory = await EducationCategoryRepo.findById(parentId);
      if (!parentCategory) {
        throw new BadRequestError('Parent category not found');
      }
    }

    const updateData = {
      ...req.body,
      parentCategory: req.body.parentCategory
        ? new Types.ObjectId(req.body.parentCategory)
        : undefined,
    };

    const updatedCategory = await EducationCategoryRepo.updateById(
      categoryId,
      updateData,
    );

    new SuccessResponse(
      'Education category updated successfully',
      updatedCategory,
    ).send(res);
  }),
);

// DELETE /api/education/categories/:id - Delete education category
router.delete(
  '/categories/:id',
  validator(schema.resourceId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // Check if user has permission to delete categories
    const allowedRoles = ['ADMIN'];
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Not authorized to delete education categories');
    }

    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid category ID format');
    }

    const categoryId = new Types.ObjectId(req.params.id);

    // Check if category exists
    const category = await EducationCategoryRepo.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Education category not found');
    }

    // Check if category has subcategories
    const subcategories =
      await EducationCategoryRepo.findByParentCategory(categoryId);
    if (subcategories.length > 0) {
      throw new BadRequestError(
        'Cannot delete category that has subcategories',
      );
    }

    // Check if category has resources (optional - you might want to allow this)
    const resourcesInCategory = await EducationResourceRepo.findByCategory(
      categoryId,
      { limit: 1 },
    );
    if (resourcesInCategory.total > 0) {
      throw new BadRequestError(
        'Cannot delete category that contains resources',
      );
    }

    await EducationCategoryRepo.deleteById(categoryId);

    new SuccessResponse('Education category deleted successfully', {
      deletedCategoryId: categoryId,
    }).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Patient Education Recommendations Routes
/*-------------------------------------------------------------------------*/

// GET /api/patients/:id/recommended-education - Get personalized education recommendations
router.get(
  '/patients/:id/recommended-education',
  validator(schema.patientId),
  validator(schema.recommendationQuery, ValidationSource.QUERY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid patient ID format');
    }

    const patientId = new Types.ObjectId(req.params.id);

    // Get patient information
    const patient = await PatientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Check authorization: only the patient, their doctors, or authorized staff can access
    const isPatientOwner = patient.user._id
      ? patient.user._id.toString() === req.user._id.toString()
      : patient.user.toString() === req.user._id.toString();
    const isAuthorized =
      isPatientOwner ||
      req.user.role === 'DOCTOR' ||
      req.user.role === 'STAFF' ||
      req.user.role === 'ADMIN';

    if (!isAuthorized) {
      throw new ForbiddenError(
        "Not authorized to access this patient's recommendations",
      );
    }

    const { limit, language } = req.query;

    // Extract medical conditions from patient's medical history
    const patientConditions: string[] = [];
    if (patient.medicalHistory && patient.medicalHistory.length > 0) {
      patientConditions.push(
        ...patient.medicalHistory.map((history) => history.condition),
      );
    }

    // Get personalized recommendations
    let recommendations = await EducationResourceRepo.findRecommendedForPatient(
      patientConditions,
      parseInt(limit as string) || 10,
    );

    // Filter by language if specified
    if (language) {
      recommendations = recommendations.filter(
        (resource) => resource.language === language,
      );
    }

    // If no specific recommendations found, get some general popular resources
    if (recommendations.length === 0) {
      recommendations = await EducationResourceRepo.findPopular(
        parseInt(limit as string) || 10,
      );
    }

    new SuccessResponse(
      'Personalized education recommendations retrieved successfully',
      {
        patient: {
          id: patient._id,
          conditions: patientConditions,
        },
        recommendations,
        meta: {
          total: recommendations.length,
          basedOnConditions: patientConditions.length > 0,
          language: language || 'all',
        },
      },
    ).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Additional Helper Routes
/*-------------------------------------------------------------------------*/

// GET /api/education/resources/popular - Get popular resources
router.get(
  '/resources/popular',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const resources = await EducationResourceRepo.findPopular(limit);

    new SuccessResponse(
      'Popular educational resources retrieved successfully',
      resources,
    ).send(res);
  }),
);

// GET /api/education/resources/recent - Get recent resources
router.get(
  '/resources/recent',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const resources = await EducationResourceRepo.findRecent(limit);

    new SuccessResponse(
      'Recent educational resources retrieved successfully',
      resources,
    ).send(res);
  }),
);

// GET /api/education/metadata - Get metadata for filters
router.get(
  '/metadata',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const metadata = await EducationResourceRepo.getUniqueValues();
    const categories = await EducationCategoryRepo.findAll();

    new SuccessResponse('Education metadata retrieved successfully', {
      ...metadata,
      categories,
    }).send(res);
  }),
);

export default router;
