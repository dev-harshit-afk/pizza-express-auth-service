import type { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  tenantId?: number;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface RequestAuth extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
  };
}

export type AuthCookie = {
  accessToken: string;
  refreshToken: string;
};

export type ITenant = {
  name: string;
  address: string;
};
export interface CreateUserRequest extends Request {
  body: UserData;
}
export interface LimitedUserData {
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserRequest extends Request {
  body: LimitedUserData;
}
