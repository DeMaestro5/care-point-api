import EducationCategory, {
  EducationCategoryModel,
} from '../model/EducationCategory';
import { Types } from 'mongoose';

export default class EducationCategoryRepo {
  public static async findById(
    id: Types.ObjectId,
  ): Promise<EducationCategory | null> {
    return EducationCategoryModel.findOne({ _id: id, isActive: true })
      .populate('createdBy', 'name email')
      .lean()
      .exec();
  }

  public static async findAll(): Promise<EducationCategory[]> {
    return EducationCategoryModel.find({ isActive: true })
      .populate('createdBy', 'name email')
      .populate('parentCategory', 'name')
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .exec();
  }

  public static async findByParentCategory(
    parentId: Types.ObjectId,
  ): Promise<EducationCategory[]> {
    return EducationCategoryModel.find({
      parentCategory: parentId,
      isActive: true,
    })
      .populate('createdBy', 'name email')
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .exec();
  }

  public static async findRootCategories(): Promise<EducationCategory[]> {
    return EducationCategoryModel.find({
      parentCategory: { $exists: false },
      isActive: true,
    })
      .populate('createdBy', 'name email')
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .exec();
  }

  public static async create(
    category: Partial<EducationCategory>,
  ): Promise<EducationCategory> {
    const now = new Date();
    const categoryData = {
      ...category,
      createdAt: now,
      updatedAt: now,
    };
    const createdCategory = await EducationCategoryModel.create(categoryData);
    return createdCategory.toObject();
  }

  public static async updateById(
    id: Types.ObjectId,
    category: Partial<EducationCategory>,
  ): Promise<EducationCategory | null> {
    return EducationCategoryModel.findByIdAndUpdate(
      id,
      { ...category, updatedAt: new Date() },
      { new: true },
    )
      .populate('createdBy', 'name email')
      .populate('parentCategory', 'name')
      .lean()
      .exec();
  }

  public static async deleteById(
    id: Types.ObjectId,
  ): Promise<EducationCategory | null> {
    return EducationCategoryModel.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true },
    )
      .lean()
      .exec();
  }

  public static async findByName(
    name: string,
  ): Promise<EducationCategory | null> {
    return EducationCategoryModel.findOne({
      name: new RegExp(`^${name}$`, 'i'),
      isActive: true,
    })
      .populate('createdBy', 'name email')
      .lean()
      .exec();
  }

  public static async searchCategories(
    query: string,
  ): Promise<EducationCategory[]> {
    return EducationCategoryModel.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: new RegExp(query, 'i') },
            { description: new RegExp(query, 'i') },
          ],
        },
      ],
    })
      .populate('createdBy', 'name email')
      .populate('parentCategory', 'name')
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .exec();
  }
}
