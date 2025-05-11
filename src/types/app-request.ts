import { Request } from 'express';
import User from '../database/model/User';
import Pharmacy from '../database/model/Pharmacy';

export interface ProtectedRequest extends Request {
  user: User;
  pharmacy?: Pharmacy;
}
