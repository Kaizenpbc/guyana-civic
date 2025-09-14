import type { userRoleEnum } from "@shared/schema";

// Define user claims interface for authentication
export interface UserClaims {
  id: string;
  role: typeof userRoleEnum._def.values[number];
  employeeId?: string;
}

// Augment Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserClaims;
    }
  }
}