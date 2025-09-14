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

// Augment express-session to include user in session data
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
      jurisdictionId?: string;
    };
  }
}