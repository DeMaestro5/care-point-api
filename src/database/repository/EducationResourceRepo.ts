import EducationResource, {
  EducationResourceModel,
  ResourceType,
  DifficultyLevel,
} from '../model/EducationResource';
import { Types } from 'mongoose';

export interface ResourceFilters {
  category?: Types.ObjectId;
  type?: ResourceType;
  difficultyLevel?: DifficultyLevel;
  medicalConditions?: string[];
  language?: string;
  tags?: string[];
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export default class EducationResourceRepo {
  public static async findById(
    id: Types.ObjectId,
  ): Promise<EducationResource | null> {
    return EducationResourceModel.findOne({ _id: id, isPublished: true })
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()
      .exec();
  }

  public static async findByIdForEdit(
    id: Types.ObjectId,
  ): Promise<EducationResource | null> {
    return EducationResourceModel.findById(id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()
      .exec();
  }

  public static async findAll(
    filters: ResourceFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<{ resources: EducationResource[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = pagination;

    const query: any = { isPublished: true };

    // Apply filters
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.difficultyLevel) {
      query.difficultyLevel = filters.difficultyLevel;
    }

    if (filters.medicalConditions && filters.medicalConditions.length > 0) {
      query.medicalConditions = { $in: filters.medicalConditions };
    }

    if (filters.language) {
      query.language = filters.language;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      EducationResourceModel.find(query)
        .populate('category', 'name description')
        .populate('createdBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      EducationResourceModel.countDocuments(query),
    ]);

    return { resources, total };
  }

  public static async findByCategory(
    categoryId: Types.ObjectId,
    pagination: PaginationOptions = {},
  ): Promise<{ resources: EducationResource[]; total: number }> {
    return this.findAll({ category: categoryId }, pagination);
  }

  public static async findByMedicalCondition(
    condition: string,
    pagination: PaginationOptions = {},
  ): Promise<{ resources: EducationResource[]; total: number }> {
    return this.findAll({ medicalConditions: [condition] }, pagination);
  }

  public static async findRecommendedForPatient(
    patientConditions: string[],
    limit: number = 10,
  ): Promise<EducationResource[]> {
    const query: any = {
      isPublished: true,
      $or: [
        { medicalConditions: { $in: patientConditions } },
        { targetAudience: 'patients' },
      ],
    };

    return EducationResourceModel.find(query)
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .sort({ 'rating.average': -1, viewCount: -1, publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  public static async findPopular(
    limit: number = 10,
  ): Promise<EducationResource[]> {
    return EducationResourceModel.find({ isPublished: true })
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .sort({ viewCount: -1, 'rating.average': -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  public static async findRecent(
    limit: number = 10,
  ): Promise<EducationResource[]> {
    return EducationResourceModel.find({ isPublished: true })
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  public static async create(
    resource: Partial<EducationResource>,
  ): Promise<EducationResource> {
    const now = new Date();
    const resourceData = {
      ...resource,
      createdAt: now,
      updatedAt: now,
      publishedAt: resource.isPublished ? now : undefined,
    };
    const createdResource = await EducationResourceModel.create(resourceData);
    return createdResource.toObject();
  }

  public static async updateById(
    id: Types.ObjectId,
    resource: Partial<EducationResource>,
    updatedBy: Types.ObjectId,
  ): Promise<EducationResource | null> {
    const updateData: any = {
      ...resource,
      updatedBy,
      updatedAt: new Date(),
    };

    // If publishing for the first time, set publishedAt
    if (resource.isPublished && !(await this.isAlreadyPublished(id))) {
      updateData.publishedAt = new Date();
    }

    return EducationResourceModel.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()
      .exec();
  }

  public static async incrementViewCount(id: Types.ObjectId): Promise<void> {
    await EducationResourceModel.findByIdAndUpdate(id, {
      $inc: { viewCount: 1 },
    });
  }

  public static async updateRating(
    id: Types.ObjectId,
    newRating: number,
    totalRatings: number,
  ): Promise<void> {
    await EducationResourceModel.findByIdAndUpdate(id, {
      'rating.average': newRating,
      'rating.count': totalRatings,
    });
  }

  public static async deleteById(
    id: Types.ObjectId,
  ): Promise<EducationResource | null> {
    return EducationResourceModel.findByIdAndDelete(id).lean().exec();
  }

  public static async searchResources(
    searchQuery: string,
    filters: ResourceFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<{ resources: EducationResource[]; total: number }> {
    return this.findAll({ ...filters, search: searchQuery }, pagination);
  }

  public static async getResourcesByTags(
    tags: string[],
    pagination: PaginationOptions = {},
  ): Promise<{ resources: EducationResource[]; total: number }> {
    return this.findAll({ tags }, pagination);
  }

  public static async getUniqueValues(): Promise<{
    types: ResourceType[];
    difficultyLevels: DifficultyLevel[];
    languages: string[];
    medicalConditions: string[];
    tags: string[];
  }> {
    const [types, difficultyLevels, languages, medicalConditions, tags] =
      await Promise.all([
        EducationResourceModel.distinct('type', { isPublished: true }),
        EducationResourceModel.distinct('difficultyLevel', {
          isPublished: true,
        }),
        EducationResourceModel.distinct('language', { isPublished: true }),
        EducationResourceModel.distinct('medicalConditions', {
          isPublished: true,
        }),
        EducationResourceModel.distinct('tags', { isPublished: true }),
      ]);

    return {
      types,
      difficultyLevels,
      languages: languages.filter((lang): lang is string => Boolean(lang)),
      medicalConditions: medicalConditions.filter(
        (condition): condition is string => Boolean(condition),
      ),
      tags: tags.filter((tag): tag is string => Boolean(tag)),
    };
  }

  private static async isAlreadyPublished(
    id: Types.ObjectId,
  ): Promise<boolean> {
    const resource = await EducationResourceModel.findById(
      id,
      'publishedAt',
    ).lean();
    return !!resource?.publishedAt;
  }
}
