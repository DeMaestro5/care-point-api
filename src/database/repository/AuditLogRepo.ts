import { AuditLog } from '../../database/model/AuditLog';
import AuditLogModel from '../../database/model/AuditLog';

async function findAll(
  page: number = 1,
  limit: number = 10,
  filters: any = {},
): Promise<{ logs: AuditLog[]; total: number }> {
  const skip = (page - 1) * limit;
  const logs = await AuditLogModel.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  const total = await AuditLogModel.countDocuments(filters);
  return { logs, total };
}

async function create(log: AuditLog): Promise<AuditLog> {
  const now = new Date();
  log.createdAt = now;
  log.updatedAt = now;
  const created = await AuditLogModel.create(log);
  return created.toObject();
}

export default {
  findAll,
  create,
};
