import { Request } from 'express';
import User from '../database/model/User';
import Keystore from '../database/model/Keystore';
import ApiKey from '../database/model/ApiKey';
import Pharmacy from '../database/model/Pharmacy';

declare interface PublicRequest extends Request {
  apiKey: ApiKey;
}

declare interface RoleRequest extends PublicRequest {
  currentRoleCodes: string[];
}

declare interface ProtectedRequest extends RoleRequest {
  user: User;
  accessToken: string;
  keystore: Keystore;
  pharmacy?: Pharmacy;
}

declare interface Tokens {
  accessToken: string;
  refreshToken: string;
}
