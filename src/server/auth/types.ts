import { PermissionCode } from "../permissions";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: PermissionCode[];
}

export const SESSION_COOKIE_NAME = "erp_session";
