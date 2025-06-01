import { Types } from 'mongoose';
import { InternalError } from '../../core/ApiError';
import { CarePlanModel, Goal, Activity } from '../model/CarePlan';
import { CarePlan } from '../model/CarePlan';

async function create(carePlan: CarePlan): Promise<CarePlan> {
  try {
    const now = new Date();
    carePlan.createdAt = carePlan.updatedAt = now;
    const createdCarePlan = await CarePlanModel.create(carePlan);
    return createdCarePlan;
  } catch (error) {
    throw new InternalError('Error creating care plan');
  }
}

async function findById(id: Types.ObjectId): Promise<CarePlan | null> {
  try {
    return await CarePlanModel.findById(id);
  } catch (error) {
    throw new InternalError('Error finding care plan');
  }
}

async function findByPatientId(patientId: Types.ObjectId): Promise<CarePlan[]> {
  try {
    return await CarePlanModel.find({ patientId });
  } catch (error) {
    throw new InternalError('Error finding patient care plans');
  }
}

async function update(
  id: Types.ObjectId,
  carePlan: Partial<CarePlan>,
): Promise<CarePlan | null> {
  try {
    carePlan.updatedAt = new Date();
    return await CarePlanModel.findByIdAndUpdate(id, carePlan, { new: true });
  } catch (error) {
    throw new InternalError('Error updating care plan');
  }
}

async function calculateProgress(
  id: Types.ObjectId,
): Promise<{ goalsProgress: number; activitiesProgress: number }> {
  try {
    const carePlan = await CarePlanModel.findById(id);
    if (!carePlan) return { goalsProgress: 0, activitiesProgress: 0 };

    const goalsProgress =
      (carePlan.goals.reduce((acc: number, goal: Goal) => {
        if (goal.status === 'COMPLETED') return acc + 1;
        return acc;
      }, 0) /
        carePlan.goals.length) *
      100;

    const activitiesProgress =
      (carePlan.activities.reduce((acc: number, activity: Activity) => {
        if (activity.status === 'COMPLETED') return acc + 1;
        return acc;
      }, 0) /
        carePlan.activities.length) *
      100;

    return { goalsProgress, activitiesProgress };
  } catch (error) {
    throw new InternalError('Error calculating care plan progress');
  }
}

export default {
  create,
  findById,
  findByPatientId,
  update,
  calculateProgress,
};
