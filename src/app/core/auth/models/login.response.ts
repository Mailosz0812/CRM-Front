import {User} from '../../user/user';

export interface LoginResponse {
  token: string;
  expiresIn: number;
  userInfo: User;
}
