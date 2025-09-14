import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTimesheetSchema, 
  insertTimesheetEntrySchema,
  insertLeaveRequestSchema,
  directoryFiltersSchema
} from "@shared/schema";

// Basic auth middleware - stub for now
const requireAuth = (req: any, res: any, next: any) => {
  // For demo purposes, assume user is authenticated
  // In real implementation, check JWT/session
  req.user = { 
    id: "user-1", 
    role: "staff",
    employeeId: "employee-1" 
  };
  next();
};

const requireStaff = (req: any, res: any, next: any) => {
  if (!req.user || !["staff", "admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Staff access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
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
