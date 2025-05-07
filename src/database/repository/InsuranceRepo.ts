import { Types } from 'mongoose';
import { Insurance, IInsurance } from '../model/Insurance';

export default class InsuranceRepo {
  public static async findById(id: Types.ObjectId): Promise<IInsurance | null> {
    return Insurance.findById(id);
  }

  public static async findByPatientId(
    patientId: Types.ObjectId,
  ): Promise<IInsurance | null> {
    return Insurance.findOne({ patientId });
  }

  public static async create(data: Partial<IInsurance>): Promise<IInsurance> {
    const insurance = await Insurance.create(data);
    return insurance;
  }

  public static async update(
    patientId: Types.ObjectId,
    data: Partial<IInsurance>,
  ): Promise<IInsurance | null> {
    return Insurance.findOneAndUpdate(
      { patientId },
      { ...data, patientId },
      { new: true, upsert: true },
    );
  }

  public static async delete(patientId: Types.ObjectId): Promise<boolean> {
    const result = await Insurance.deleteOne({ patientId });
    return result.deletedCount > 0;
  }
}
