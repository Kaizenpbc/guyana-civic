import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTimesheetSchema, 
  insertTimesheetEntrySchema,
  insertLeaveRequestSchema,
  directoryFiltersSchema
} from "@shared/schema";
import session from "express-session";

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = req.session.user;
  next();
};

const requireStaff = (req: any, res: any, next: any) => {
  if (!req.user || !["staff", "admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Staff access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      // Simple demo authentication - in real app, hash passwords and check database
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // For demo, accept any password. In real app, verify password hash
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        jurisdictionId: user.jurisdictionId || undefined
      };
      
      res.json({ 
        user: req.session.user,
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session?.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Public/Citizen endpoints (no auth required)
  app.get("/api/jurisdictions", async (req, res) => {
    try {
      const jurisdictions = await storage.listJurisdictions();
      res.json(jurisdictions);
    } catch (error) {
      console.error("Error fetching jurisdictions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/jurisdictions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const jurisdiction = await storage.getJurisdiction(id);
      if (!jurisdiction) {
        return res.status(404).json({ error: "Jurisdiction not found" });
      }
      res.json(jurisdiction);
    } catch (error) {
      console.error("Error fetching jurisdiction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/jurisdictions/:id/issues", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, category, page = 1, limit = 20 } = req.query;
      
      const issues = await storage.listIssues(id, {
        status: status as string,
        category: category as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      res.json(issues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/jurisdictions/:id/announcements", async (req, res) => {
    try {
      const { id } = req.params;
      const announcements = await storage.listAnnouncements(id);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/jurisdictions/:id/issues", async (req, res) => {
    try {
      const { id } = req.params;
      const issueData = {
        ...req.body,
        jurisdictionId: id,
        citizenId: "citizen-1" // TODO: Get from auth
      };
      
      const issue = await storage.createIssue(issueData);
      res.status(201).json(issue);
    } catch (error) {
      console.error("Error creating issue:", error);
      res.status(400).json({ error: "Invalid issue data" });
    }
  });

  // HR Dashboard Summary
  app.get("/api/hr/summary", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const employee = await storage.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee record not found" });
      }

      const summary = await storage.getEmployeeSummary(employee.id);
      if (!summary) {
        return res.status(404).json({ error: "Employee summary not found" });
      }

      res.json(summary);
    } catch (error) {
      console.error("Error fetching employee summary:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Timesheet routes
  app.get("/api/hr/timesheets", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const employee = await storage.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee record not found" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const timesheets = await storage.listTimesheets(employee.id, limit);
      
      // Get entries for each timesheet
      const timesheetsWithEntries = await Promise.all(
        timesheets.map(async (timesheet) => {
          const entries = await storage.getTimesheetEntries(timesheet.id);
          return { ...timesheet, entries };
        })
      );

      res.json(timesheetsWithEntries);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/hr/timesheets/current", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const employee = await storage.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee record not found" });
      }

      const timesheet = await storage.getCurrentTimesheet(employee.id);
      if (!timesheet) {
        return res.status(404).json({ error: "No current timesheet found" });
      }

      const entries = await storage.getTimesheetEntries(timesheet.id);
      res.json({ ...timesheet, entries });
    } catch (error) {
      console.error("Error fetching current timesheet:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/hr/timesheets", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const employee = await storage.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee record not found" });
      }

      const timesheetData = insertTimesheetSchema.parse({
        ...req.body,
        employeeId: employee.id
      });

      const timesheet = await storage.createTimesheet(timesheetData);
      res.status(201).json(timesheet);
    } catch (error) {
      console.error("Error creating timesheet:", error);
      res.status(400).json({ error: "Invalid timesheet data" });
    }
  });

  app.post("/api/hr/timesheets/:id/entries", requireAuth, requireStaff, async (req, res) => {
    try {
      const { id: timesheetId } = req.params;
      
      const entryData = insertTimesheetEntrySchema.parse({
        ...req.body,
        timesheetId
      });

      const entry = await storage.createTimesheetEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating timesheet entry:", error);
      res.status(400).json({ error: "Invalid entry data" });
    }
  });

  // Paystub routes
  app.get("/api/hr/paystubs", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const employee = await storage.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee record not found" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const paystubs = await storage.listPaystubs(employee.id, limit);
      res.json(paystubs);
    } catch (error) {
      console.error("Error fetching paystubs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Leave routes
  app.get("/api/hr/leave/balances", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const employee = await storage.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee record not found" });
      }

      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const balances = await storage.getLeaveBalances(employee.id, year);
      res.json(balances);
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/hr/leave/requests", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const employee = await storage.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee record not found" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const requests = await storage.listLeaveRequests(employee.id, limit);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/hr/leave/requests", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const employee = await storage.getEmployeeByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee record not found" });
      }

      const requestData = insertLeaveRequestSchema.parse({
        ...req.body,
        employeeId: employee.id
      });

      const request = await storage.createLeaveRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating leave request:", error);
      res.status(400).json({ error: "Invalid leave request data" });
    }
  });

  // Manager approval routes
  app.get("/api/hr/approvals", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      // For now, anyone with staff role can see pending approvals
      // In real implementation, check if user is a manager
      const approvals = await storage.listPendingApprovals(req.user.id);
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Employee Summary endpoint
  app.get("/api/hr/employee/summary", requireAuth, async (req, res) => {
    try {
      const employeeId = req.user?.employeeId;
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID required" });
      }
      
      const summary = await storage.getEmployeeSummary(employeeId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching employee summary:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Employee Directory routes
  app.get("/api/hr/employees", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Parse and validate query parameters using zod schema
      const filters = directoryFiltersSchema.parse({
        query: req.query.query || undefined,
        department: req.query.department || undefined,
        role: req.query.role || undefined,
        status: req.query.status || "active",
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy || "name",
        sortOrder: req.query.sortOrder || "asc",
      });

      const response = await storage.listEmployees(filters, req.user.id);
      res.json(response);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/hr/employees/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { id } = req.params;
      const employee = await storage.getEmployeeWithUser(id, req.user.id);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/hr/org/tree", requireAuth, requireStaff, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const rootEmployeeId = req.query.rootEmployeeId as string || undefined;
      const depth = parseInt(req.query.depth as string) || 3;

      const orgTree = await storage.getOrgTree(rootEmployeeId, depth);
      res.json(orgTree);
    } catch (error) {
      console.error("Error fetching organizational tree:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
