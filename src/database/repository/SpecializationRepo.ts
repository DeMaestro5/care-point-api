import { DoctorModel } from '../model/Doctor';

async function findAllSpecializations(): Promise<string[]> {
  const specializations = await DoctorModel.distinct('specialization', {
    status: true,
  });
  return specializations.filter(
    (spec): spec is string => spec !== null && spec !== undefined,
  );
}

export default {
  findAllSpecializations,
};
