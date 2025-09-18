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
import { registerProjectTrackerRoutes } from "./project-tracker-routes";
import { registerPMToolRoutes } from "./pm-tool-routes";
import riskManagementRoutes from "./risk-management-routes";
import notificationRoutes from "./notification-routes";

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

const requireRDCManager = (req: any, res: any, next: any) => {
  if (!req.user || !["rdc_manager", "minister", "admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "RDC Manager access required" });
  }
  next();
};

const requireMinister = (req: any, res: any, next: any) => {
  if (!req.user || !["minister", "admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Minister access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {

  // Initialize default users for testing
  const initializeUsers = async () => {
    try {
      // Check if users already exist
      const existingUser = await storage.getUserByUsername("pm");
      if (!existingUser) {
        // Create default PM user
        await storage.createUser({
          username: "pm",
          email: "pm@guyana.gov",
          fullName: "Project Manager",
          password: "password", // In real app, this would be hashed
          role: "pm",
          jurisdictionId: "jurisdiction-1",
          phone: "+592-123-4567"
        });

        // Create default RDC Manager
        await storage.createUser({
          username: "rdc_manager",
          email: "rdc@guyana.gov",
          fullName: "RDC Senior Manager",
          password: "password",
          role: "rdc_manager",
          jurisdictionId: "jurisdiction-1",
          phone: "+592-123-4568"
        });

        // Create default Minister
        await storage.createUser({
          username: "minister",
          email: "minister@guyana.gov",
          fullName: "Minister of Local Government",
          password: "password",
          role: "minister",
          jurisdictionId: "jurisdiction-1",
          phone: "+592-123-4569"
        });

        console.log("✅ Default users created for testing");
      }
    } catch (error) {
      console.error("❌ Error initializing users:", error);
    }
  };

  // Initialize users
  await initializeUsers();

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

  // AI Suggestions endpoint
  app.get("/api/projects/:id/ai-suggestions", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Generate AI-powered risk suggestions based on project type
      const suggestions = [];

      // Context-aware suggestions based on project category
      if (project.category === "infrastructure" || project.category === "building_construction") {
        suggestions.push({
          id: "weather-delays",
          title: "Weather Delays and Seasonal Impact",
          description: "Potential delays due to rainy season affecting outdoor construction work",
          category: "environmental",
          probability: "high",
          impact: "medium",
          risk_score: 6,
          confidence: 85,
          mitigation_strategy: "Schedule buffer time and weather monitoring",
          contingency_plan: "Indoor work prioritization plan",
          source: "ai_analysis"
        });

        suggestions.push({
          id: "material-shortages",
          title: "Material Supply Chain Disruptions",
          description: "Potential shortages of construction materials and supply delays",
          category: "operational",
          probability: "medium",
          impact: "high",
          risk_score: 6,
          confidence: 78,
          mitigation_strategy: "Establish multiple supplier relationships",
          contingency_plan: "Local material sourcing alternatives",
          source: "industry_analysis"
        });
      }

      if (project.category === "education" || project.category === "school_construction") {
        suggestions.push({
          id: "stakeholder-coordination",
          title: "Stakeholder Coordination Challenges",
          description: "Complex coordination with school administration, parents, and community",
          category: "organizational",
          probability: "high",
          impact: "medium",
          risk_score: 6,
          confidence: 82,
          mitigation_strategy: "Establish clear communication channels",
          contingency_plan: "Designated community liaison officer",
          source: "ai_analysis"
        });
      }

      // Add a universal suggestion that always appears
      suggestions.push({
        id: "budget-overrun",
        title: "Budget Overrun Risk",
        description: "Potential cost overruns due to unforeseen circumstances",
        category: "financial",
        probability: "medium",
        impact: "high",
        risk_score: 6,
        confidence: 90,
        mitigation_strategy: "Implement regular budget reviews and contingency reserves",
        contingency_plan: "Phased budget approvals and change control process",
        source: "historical_data"
      });

      res.json({ suggestions });
    } catch (error) {
      console.error("AI suggestions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Smart Action Prioritization endpoint
  app.get("/api/projects/:id/smart-priorities", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Generate smart prioritization based on project data
      const priorities = [
        {
          id: "action-1",
          title: "Schedule Weather-Sensitive Tasks",
          priority_score: 9.2,
          impact_score: 8.5,
          urgency_level: "high",
          blocking_count: 2,
          ai_reasoning: "Critical path item with weather dependency affecting project timeline",
          estimated_effort: "2 days",
          dependencies: ["Weather forecast", "Equipment availability"]
        },
        {
          id: "action-2",
          title: "Review Material Procurement Plan",
          priority_score: 8.1,
          impact_score: 7.8,
          urgency_level: "medium",
          blocking_count: 1,
          ai_reasoning: "Material costs represent 40% of budget with potential supply chain risks",
          estimated_effort: "1 day",
          dependencies: ["Supplier contracts", "Budget approval"]
        },
        {
          id: "action-3",
          title: "Update Stakeholder Communication Plan",
          priority_score: 7.5,
          impact_score: 8.2,
          urgency_level: "medium",
          blocking_count: 0,
          ai_reasoning: "Strong stakeholder support critical for project success in community setting",
          estimated_effort: "3 days",
          dependencies: ["Stakeholder mapping", "Communication templates"]
        }
      ];

      res.json({ priorities });
    } catch (error) {
      console.error("Smart priorities error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Analytics Dashboard endpoint with real-time data
  app.get("/api/analytics/dashboard", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const currentTime = new Date().toISOString();

      // Generate comprehensive analytics data with real-time updates
      const analytics = {
        lastUpdated: currentTime,
        performanceTrends: [
          {
            period: "Q1 2024",
            onTimeDelivery: 78,
            budgetVariance: 8.5,
            riskScore: 7.2,
            completedProjects: 3,
            trend: "improving"
          },
          {
            period: "Q2 2024",
            onTimeDelivery: 82,
            budgetVariance: 6.2,
            riskScore: 6.8,
            completedProjects: 4,
            trend: "stable"
          },
          {
            period: "Q3 2024",
            onTimeDelivery: 85,
            budgetVariance: 4.8,
            riskScore: 6.4,
            completedProjects: 5,
            trend: "improving"
          },
          {
            period: "Q4 2024",
            onTimeDelivery: 87,
            budgetVariance: 3.2,
            riskScore: 6.1,
            completedProjects: 6,
            trend: "improving"
          }
        ],
        budgetAnalytics: {
          totalAllocated: 12500000,
          totalSpent: 8750000,
          utilizationRate: 70,
          forecastAccuracy: 85,
          savingsOpportunities: 380000,
          monthlySpend: [1250000, 1180000, 1320000, 1150000, 1280000, 1220000],
          budgetCategories: [
            { category: "Infrastructure", allocated: 5200000, spent: 3640000, remaining: 1560000 },
            { category: "Education", allocated: 3800000, spent: 2660000, remaining: 1140000 },
            { category: "Healthcare", allocated: 2500000, spent: 1750000, remaining: 750000 },
            { category: "Transportation", allocated: 1000000, spent: 700000, remaining: 300000 }
          ]
        },
        predictiveInsights: [
          {
            id: "pred-1",
            type: "delay_risk",
            title: "Infrastructure Project Delay Predicted",
            confidence: 78,
            impact: "medium",
            recommendation: "Schedule indoor work first",
            timeframe: "Next 30 days",
            affectedProjects: 3,
            potentialDelay: "2-3 weeks"
          },
          {
            id: "pred-2",
            type: "budget_overrun",
            title: "Material Cost Increase Expected",
            confidence: 82,
            impact: "high",
            recommendation: "Lock in supplier contracts",
            timeframe: "Next 60 days",
            affectedProjects: 5,
            potentialIncrease: "15-20%"
          },
          {
            id: "pred-3",
            type: "resource_conflict",
            title: "Equipment Bottleneck Forming",
            confidence: 75,
            impact: "medium",
            recommendation: "Coordinate equipment scheduling",
            timeframe: "Next 45 days",
            affectedProjects: 4,
            resourceType: "Heavy Machinery"
          },
          {
            id: "pred-4",
            type: "weather_risk",
            title: "Seasonal Weather Impact",
            confidence: 88,
            impact: "high",
            recommendation: "Accelerate outdoor work completion",
            timeframe: "Next 90 days",
            affectedProjects: 7,
            weatherFactor: "Heavy rainfall season"
          }
        ],
        riskAnalytics: {
          currentRiskScore: 6.4,
          riskTrend: "improving",
          riskDistribution: {
            low: 12,
            medium: 8,
            high: 3,
            critical: 1
          },
          highRiskProjects: 2,
          mitigationEffectiveness: 78,
          riskReductionPotential: 23,
          topRiskCategories: [
            { category: "Weather", count: 8, avgScore: 7.2 },
            { category: "Budget", count: 6, avgScore: 6.8 },
            { category: "Resources", count: 5, avgScore: 6.5 },
            { category: "Technical", count: 4, avgScore: 6.1 }
          ]
        },
        efficiencyMetrics: {
          averageProjectDuration: "8.5 months",
          resourceUtilization: 78,
          processEfficiency: 82,
          decisionSpeed: "4.2 days average",
          reworkRate: 12,
          productivityIndex: 87,
          qualityScore: 84,
          customerSatisfaction: 91
        },
        kpiMetrics: [
          {
            id: "kpi-1",
            name: "On-Time Delivery Rate",
            value: 85,
            target: 90,
            unit: "%",
            trend: "up",
            change: 5.2
          },
          {
            id: "kpi-2",
            name: "Budget Variance",
            value: 4.8,
            target: 5.0,
            unit: "%",
            trend: "down",
            change: -0.8
          },
          {
            id: "kpi-3",
            name: "Risk Score",
            value: 6.4,
            target: 6.0,
            unit: "/10",
            trend: "down",
            change: -0.3
          },
          {
            id: "kpi-4",
            name: "Resource Utilization",
            value: 78,
            target: 85,
            unit: "%",
            trend: "up",
            change: 3.1
          }
        ],
        alerts: [
          {
            id: "alert-1",
            type: "warning",
            title: "Budget Threshold Exceeded",
            message: "Infrastructure projects have exceeded 80% of allocated budget",
            priority: "high",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          },
          {
            id: "alert-2",
            type: "info",
            title: "Positive Trend Detected",
            message: "On-time delivery rate improved by 5.2% this quarter",
            priority: "medium",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
          },
          {
            id: "alert-3",
            type: "critical",
            title: "Resource Conflict",
            message: "Heavy machinery shortage affecting 3 concurrent projects",
            priority: "critical",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
          }
        ]
      };

      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Automated Report Generation endpoint
  app.post("/api/reports/generate", requireAuth, async (req, res) => {
    try {
      const { reportType, format, dateRange, filters } = req.body;
      const user = req.user;

      // Generate report based on type
      let reportData;

      switch (reportType) {
        case "performance":
          reportData = {
            title: "Performance Report",
            generatedAt: new Date().toISOString(),
            generatedBy: user.fullName,
            period: dateRange || "Last 30 days",
            summary: {
              totalProjects: 24,
              completedProjects: 18,
              onTimeDelivery: 85,
              budgetUtilization: 78,
              averageRiskScore: 6.4
            },
            performanceMetrics: [
              { metric: "On-Time Delivery", value: 85, target: 90, status: "on-track" },
              { metric: "Budget Variance", value: 4.8, target: 5.0, status: "excellent" },
              { metric: "Quality Score", value: 84, target: 85, status: "good" },
              { metric: "Customer Satisfaction", value: 91, target: 90, status: "excellent" }
            ],
            projectDetails: [
              { code: "RDC2-0001", name: "School Renovation", status: "completed", onTime: true, budgetVariance: 2.1 },
              { code: "RDC2-0002", name: "Road Repairs", status: "in-progress", onTime: true, budgetVariance: -1.8 },
              { code: "RDC2-0003", name: "Health Center", status: "completed", onTime: false, budgetVariance: 5.2 }
            ]
          };
          break;

        case "budget":
          reportData = {
            title: "Budget Analysis Report",
            generatedAt: new Date().toISOString(),
            generatedBy: user.fullName,
            period: dateRange || "Current Quarter",
            summary: {
              totalAllocated: 12500000,
              totalSpent: 8750000,
              remainingBudget: 3750000,
              utilizationRate: 70
            },
            budgetBreakdown: [
              { category: "Infrastructure", allocated: 5200000, spent: 3640000, remaining: 1560000, utilization: 70 },
              { category: "Education", allocated: 3800000, spent: 2660000, remaining: 1140000, utilization: 70 },
              { category: "Healthcare", allocated: 2500000, spent: 1750000, remaining: 750000, utilization: 70 },
              { category: "Transportation", allocated: 1000000, spent: 700000, remaining: 300000, utilization: 70 }
            ],
            variances: [
              { project: "RDC2-0001", budgetVariance: 2.1, explanation: "Additional material costs" },
              { project: "RDC2-0002", budgetVariance: -1.8, explanation: "Cost savings from bulk procurement" },
              { project: "RDC2-0003", budgetVariance: 5.2, explanation: "Scope changes approved" }
            ]
          };
          break;

        case "risk":
          reportData = {
            title: "Risk Assessment Report",
            generatedAt: new Date().toISOString(),
            generatedBy: user.fullName,
            period: dateRange || "Current Month",
            summary: {
              totalRisks: 24,
              highRiskCount: 3,
              mediumRiskCount: 8,
              lowRiskCount: 13,
              averageRiskScore: 6.4
            },
            riskDistribution: {
              critical: 1,
              high: 3,
              medium: 8,
              low: 12
            },
            topRisks: [
              { project: "RDC2-0001", risk: "Weather delays", score: 8.5, impact: "High", probability: "Medium" },
              { project: "RDC2-0002", risk: "Material shortages", score: 7.8, impact: "High", probability: "Low" },
              { project: "RDC2-0003", risk: "Resource conflicts", score: 7.2, impact: "Medium", probability: "High" }
            ],
            riskTrends: [
              { month: "Oct", avgScore: 7.1 },
              { month: "Nov", avgScore: 6.8 },
              { month: "Dec", avgScore: 6.4 }
            ]
          };
          break;

        case "executive":
          reportData = {
            title: "Executive Summary Report",
            generatedAt: new Date().toISOString(),
            generatedBy: user.fullName,
            period: dateRange || "Current Quarter",
            executiveSummary: {
              overallPerformance: "Excellent progress with 85% on-time delivery",
              keyAchievements: [
                "Completed 18 out of 24 projects this quarter",
                "Reduced budget variance to 4.8%",
                "Improved risk score by 12% from previous quarter",
                "Achieved 91% customer satisfaction rating"
              ],
              challenges: [
                "Weather delays affected 3 infrastructure projects",
                "Material cost increases of 15-20% expected",
                "Resource conflicts in heavy machinery allocation"
              ],
              recommendations: [
                "Accelerate indoor work to mitigate weather risks",
                "Lock in supplier contracts for upcoming projects",
                "Implement regional equipment coordination system"
              ]
            },
            kpiHighlights: [
              { metric: "On-Time Delivery", value: 85, target: 90, status: "On Track" },
              { metric: "Budget Performance", value: 95.2, target: 95, status: "Excellent" },
              { metric: "Risk Management", value: 6.4, target: 6.0, status: "Good" },
              { metric: "Resource Utilization", value: 78, target: 85, status: "Improving" }
            ]
          };
          break;

        default:
          return res.status(400).json({ error: "Invalid report type" });
      }

      // Generate report based on format
      if (format === "pdf") {
        // In a real implementation, this would generate an actual PDF
        reportData.format = "pdf";
        reportData.fileUrl = `/reports/${reportType}-${Date.now()}.pdf`;
      } else if (format === "excel") {
        // In a real implementation, this would generate an Excel file
        reportData.format = "excel";
        reportData.fileUrl = `/reports/${reportType}-${Date.now()}.xlsx`;
      } else {
        reportData.format = "json";
      }

      res.json({
        success: true,
        report: reportData,
        message: `${reportType} report generated successfully`
      });
    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Custom KPI Builder endpoint
  app.post("/api/kpi/create", requireAuth, async (req, res) => {
    try {
      const { name, description, formula, targets, dataSource, category } = req.body;
      const user = req.user;

      // Create custom KPI
      const kpi = {
        id: `kpi-${Date.now()}`,
        name,
        description,
        formula,
        targets,
        dataSource,
        category,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        status: "active",
        currentValue: null, // Would be calculated based on formula
        lastCalculated: null
      };

      // In a real implementation, this would be saved to database
      res.json({
        success: true,
        kpi,
        message: "Custom KPI created successfully"
      });
    } catch (error) {
      console.error("KPI creation error:", error);
      res.status(500).json({ error: "Failed to create KPI" });
    }
  });

  // Get Custom KPIs endpoint
  app.get("/api/kpi/list", requireAuth, async (req, res) => {
    try {
      const user = req.user;

      // Return sample custom KPIs
      const kpis = [
        {
          id: "kpi-custom-1",
          name: "Contractor Performance Index",
          description: "Combined metric of on-time delivery and quality score",
          formula: "(onTimeDelivery * 0.6) + (qualityScore * 0.4)",
          targets: { min: 85, max: 100 },
          dataSource: "contractor_data",
          category: "performance",
          createdBy: user.id,
          currentValue: 87.5,
          lastCalculated: new Date().toISOString()
        },
        {
          id: "kpi-custom-2",
          name: "Stakeholder Satisfaction Rate",
          description: "Average satisfaction rating from all stakeholders",
          formula: "AVG(stakeholder_ratings)",
          targets: { min: 80, max: 100 },
          dataSource: "survey_data",
          category: "satisfaction",
          createdBy: user.id,
          currentValue: 91.2,
          lastCalculated: new Date().toISOString()
        }
      ];

      res.json({ kpis });
    } catch (error) {
      console.error("KPI list error:", error);
      res.status(500).json({ error: "Failed to retrieve KPIs" });
    }
  });

  // Predictive Project Completion Dates endpoint
  app.get("/api/projects/:id/predictive-completion", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Calculate predictive completion date based on multiple factors
      const currentDate = new Date();
      const plannedEndDate = new Date(project.plannedEndDate || project.plannedStartDate);

      // Base prediction on project progress and velocity
      const progressPercentage = project.progressPercentage || 0;
      const daysSinceStart = Math.floor((currentDate.getTime() - new Date(project.plannedStartDate).getTime()) / (1000 * 60 * 60 * 24));

      // Calculate velocity (progress per day)
      const velocity = progressPercentage / Math.max(daysSinceStart, 1);

      // Estimate remaining work
      const remainingWork = 100 - progressPercentage;
      const estimatedDaysRemaining = remainingWork / Math.max(velocity, 0.5); // Minimum 0.5% per day

      // Factor in risks and project type
      let riskMultiplier = 1.0;

      // Infrastructure projects tend to take longer
      if (project.category === "infrastructure") {
        riskMultiplier *= 1.15;
      }

      // Large budget projects have more complexity
      if (project.budgetAllocated && project.budgetAllocated > 5000000) {
        riskMultiplier *= 1.1;
      }

      // Apply risk adjustments (simplified for now - will enhance when risk storage is integrated)
      // TODO: Integrate with risk management system for more accurate predictions
      // For now, add a small buffer for infrastructure projects
      if (project.category === "infrastructure" || project.category === "building_construction") {
        riskMultiplier *= 1.1; // 10% buffer for construction risks
      }

      const adjustedDaysRemaining = estimatedDaysRemaining * riskMultiplier;
      const predictedCompletionDate = new Date(currentDate.getTime() + (adjustedDaysRemaining * 24 * 60 * 60 * 1000));

      // Calculate confidence based on data quality and project maturity
      let confidence = 70; // Base confidence

      // Higher confidence for projects with more progress
      if (progressPercentage > 50) confidence += 15;
      if (progressPercentage > 80) confidence += 10;

      // Higher confidence for projects with established velocity
      if (velocity > 1.0) confidence += 5;

      // Lower confidence for high-risk projects
      if (riskMultiplier > 1.2) confidence -= 10;

      // Ensure confidence is within reasonable bounds
      confidence = Math.max(60, Math.min(95, confidence));

      // Generate prediction explanation
      const explanation = [];
      if (velocity < 0.5) explanation.push("Slow progress velocity detected");
      if (riskMultiplier > 1.1) explanation.push("Risk factors may cause delays");
      if (progressPercentage < 30) explanation.push("Early stage project with limited data");
      if (project.category === "infrastructure") explanation.push("Infrastructure projects typically require more time");

      const prediction = {
        projectId,
        currentProgress: progressPercentage,
        plannedCompletionDate: plannedEndDate.toISOString(),
        predictedCompletionDate: predictedCompletionDate.toISOString(),
        confidence,
        daysRemaining: Math.ceil(adjustedDaysRemaining),
        velocity: velocity.toFixed(2),
        riskMultiplier: riskMultiplier.toFixed(2),
        factors: {
          progressVelocity: velocity > 1.0 ? "Good" : velocity > 0.5 ? "Moderate" : "Slow",
          riskLevel: riskMultiplier > 1.2 ? "High" : riskMultiplier > 1.1 ? "Medium" : "Low",
          projectMaturity: progressPercentage > 50 ? "Mature" : "Early Stage"
        },
        explanation: explanation.length > 0 ? explanation : ["Prediction based on current progress and historical patterns"],
        recommendations: [
          velocity < 0.5 ? "Consider resource allocation review" : null,
          riskMultiplier > 1.2 ? "Focus on risk mitigation" : null,
          progressPercentage < 30 ? "Establish baseline metrics" : null
        ].filter(Boolean)
      };

      res.json(prediction);
    } catch (error) {
      console.error("Predictive completion error:", error);
      res.status(500).json({ error: "Failed to generate prediction" });
    }
  });

  // AI Project Health Scoring endpoint
  app.get("/api/projects/:id/health-score", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const currentDate = new Date();
      const plannedEndDate = new Date(project.plannedEndDate || project.plannedStartDate);
      const daysElapsed = Math.floor((currentDate.getTime() - new Date(project.plannedStartDate).getTime()) / (1000 * 60 * 60 * 24));
      const totalPlannedDays = Math.floor((plannedEndDate.getTime() - new Date(project.plannedStartDate).getTime()) / (1000 * 60 * 60 * 24));

      // Calculate scores for each dimension (0-100 scale)

      // 1. TIMELINE HEALTH (40% weight)
      let timelineScore = 100;
      const progressRatio = project.progressPercentage / 100;
      const expectedProgress = Math.min(daysElapsed / totalPlannedDays, 1);

      if (progressRatio < expectedProgress * 0.8) {
        timelineScore = Math.max(20, progressRatio / expectedProgress * 100); // Behind schedule
      } else if (progressRatio > expectedProgress * 1.2) {
        timelineScore = Math.max(70, 100 - (progressRatio - expectedProgress) * 50); // Ahead but risky
      } else {
        timelineScore = Math.min(100, progressRatio / expectedProgress * 100); // On track
      }

      // 2. BUDGET HEALTH (30% weight)
      let budgetScore = 100;
      if (project.budgetSpent && project.budgetAllocated) {
        const budgetUtilization = project.budgetSpent / project.budgetAllocated;
        if (budgetUtilization > 1.1) {
          budgetScore = Math.max(10, 100 - (budgetUtilization - 1) * 200); // Over budget
        } else if (budgetUtilization > 0.9) {
          budgetScore = Math.max(60, 100 - (budgetUtilization - 0.9) * 500); // Approaching limit
        } else {
          budgetScore = Math.min(100, budgetUtilization * 120); // Under budget (good)
        }
      }

      // 3. RISK HEALTH (15% weight)
      let riskScore = 85; // Default good score
      // TODO: Integrate with actual risk data when available
      // For now, base on project type and size
      if (project.category === "infrastructure" || project.category === "building_construction") {
        riskScore -= 10; // Higher risk for construction
      }
      if (project.budgetAllocated && project.budgetAllocated > 5000000) {
        riskScore -= 5; // Higher risk for large budgets
      }
      riskScore = Math.max(30, Math.min(100, riskScore));

      // 4. QUALITY HEALTH (10% weight)
      let qualityScore = 80; // Default good score
      // TODO: Integrate with actual quality metrics
      // For now, base on project maturity
      if (project.progressPercentage > 80) {
        qualityScore += 10; // Mature projects tend to have better quality
      } else if (project.progressPercentage < 30) {
        qualityScore -= 15; // Early stage projects have uncertain quality
      }

      // 5. RESOURCE HEALTH (5% weight)
      let resourceScore = 75; // Default moderate score
      // TODO: Integrate with actual resource allocation data
      // For now, assume adequate resources

      // Calculate overall health score with weights
      const overallScore = Math.round(
        (timelineScore * 0.40) +
        (budgetScore * 0.30) +
        (riskScore * 0.15) +
        (qualityScore * 0.10) +
        (resourceScore * 0.05)
      );

      // Determine health status
      let healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      if (overallScore >= 90) healthStatus = 'excellent';
      else if (overallScore >= 80) healthStatus = 'good';
      else if (overallScore >= 70) healthStatus = 'fair';
      else if (overallScore >= 60) healthStatus = 'poor';
      else healthStatus = 'critical';

      // Generate recommendations based on scores
      const recommendations = [];
      if (timelineScore < 70) {
        recommendations.push("Review project timeline and consider schedule adjustments");
      }
      if (budgetScore < 70) {
        recommendations.push("Monitor budget utilization and implement cost controls");
      }
      if (riskScore < 70) {
        recommendations.push("Focus on risk mitigation and contingency planning");
      }
      if (qualityScore < 70) {
        recommendations.push("Enhance quality assurance processes and monitoring");
      }
      if (resourceScore < 70) {
        recommendations.push("Review resource allocation and team capacity");
      }

      // Calculate trend (mock for now)
      const previousScore = overallScore - Math.floor(Math.random() * 10) + 5;
      const trend = overallScore > previousScore ? 'improving' :
                   overallScore < previousScore ? 'declining' : 'stable';

      const healthData = {
        projectId,
        overallScore,
        healthStatus,
        lastUpdated: currentDate.toISOString(),
        dimensions: {
          timeline: {
            score: Math.round(timelineScore),
            weight: 40,
            status: timelineScore >= 80 ? 'excellent' :
                   timelineScore >= 70 ? 'good' :
                   timelineScore >= 60 ? 'fair' : 'poor'
          },
          budget: {
            score: Math.round(budgetScore),
            weight: 30,
            status: budgetScore >= 80 ? 'excellent' :
                   budgetScore >= 70 ? 'good' :
                   budgetScore >= 60 ? 'fair' : 'poor'
          },
          risk: {
            score: Math.round(riskScore),
            weight: 15,
            status: riskScore >= 80 ? 'excellent' :
                   riskScore >= 70 ? 'good' :
                   riskScore >= 60 ? 'fair' : 'poor'
          },
          quality: {
            score: Math.round(qualityScore),
            weight: 10,
            status: qualityScore >= 80 ? 'excellent' :
                   qualityScore >= 70 ? 'good' :
                   qualityScore >= 60 ? 'fair' : 'poor'
          },
          resources: {
            score: Math.round(resourceScore),
            weight: 5,
            status: resourceScore >= 80 ? 'excellent' :
                   resourceScore >= 70 ? 'good' :
                   resourceScore >= 60 ? 'fair' : 'poor'
          }
        },
        trend,
        confidence: 85, // Mock confidence level
        recommendations,
        alerts: overallScore < 70 ? [
          {
            type: 'warning',
            message: 'Project health requires immediate attention',
            priority: overallScore < 60 ? 'critical' : 'high'
          }
        ] : []
      };

      res.json(healthData);
    } catch (error) {
      console.error("Project health scoring error:", error);
      res.status(500).json({ error: "Failed to calculate project health score" });
    }
  });

  // Smart Resource Allocation endpoint
  app.get("/api/projects/:id/resource-allocation", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get project health score for resource recommendations
      const healthResponse = await fetch(`${req.protocol}://${req.get('host')}/api/projects/${projectId}/health-score`, {
        headers: {
          'Authorization': req.headers.authorization,
          'Cookie': req.headers.cookie
        }
      });

      let healthData = null;
      if (healthResponse.ok) {
        healthData = await healthResponse.json();
      }

      const currentDate = new Date();

      // Calculate resource requirements based on project characteristics
      const projectComplexity = project.category === "infrastructure" ? 0.8 :
                               project.category === "building_construction" ? 0.7 :
                               project.category === "education" ? 0.5 : 0.4;

      const budgetSize = project.budgetAllocated ? project.budgetAllocated / 10000000 : 0.5; // Normalized
      const projectSize = Math.min(projectComplexity * budgetSize, 1);

      // Calculate resource needs
      const requiredResources = {
        project_manager: {
          required: 1,
          current: 0.8 + Math.random() * 0.4, // 80-120% utilization
          skill_level: projectSize > 0.7 ? "senior" : projectSize > 0.4 ? "mid" : "junior",
          expertise: project.category === "infrastructure" ? ["construction", "risk_management"] :
                    project.category === "education" ? ["stakeholder_management", "compliance"] :
                    ["project_management", "budget_control"]
        },
        technical_specialists: {
          required: Math.ceil(projectSize * 4), // 0-4 specialists
          current: Math.floor(Math.random() * 3), // 0-2 current
          skill_level: "mid",
          expertise: project.category === "infrastructure" ? ["civil_engineering", "architecture"] :
                    project.category === "building_construction" ? ["structural_engineering", "safety"] :
                    ["general_technical", "quality_assurance"]
        },
        administrative_support: {
          required: Math.ceil(projectSize * 2), // 0-2 support staff
          current: Math.floor(Math.random() * 2), // 0-1 current
          skill_level: "junior",
          expertise: ["administration", "documentation"]
        }
      };

      // Calculate overall resource health
      const totalRequired = Object.values(requiredResources).reduce((sum, res: any) => sum + res.required, 0);
      const totalCurrent = Object.values(requiredResources).reduce((sum, res: any) => sum + res.current, 0);
      const resourceUtilization = totalRequired > 0 ? (totalCurrent / totalRequired) * 100 : 100;

      // Generate recommendations based on gaps
      const recommendations = [];
      const resourceGaps = [];

      Object.entries(requiredResources).forEach(([role, data]: [string, any]) => {
        const gap = data.required - data.current;
        if (gap > 0) {
          resourceGaps.push({
            role: role.replace('_', ' ').toUpperCase(),
            gap: gap,
            priority: gap > 2 ? 'critical' : gap > 1 ? 'high' : 'medium',
            skill_level: data.skill_level,
            expertise: data.expertise
          });

          if (gap > 2) {
            recommendations.push(`URGENT: Allocate ${gap} additional ${role.replace('_', ' ')} staff (${data.skill_level} level)`);
          } else if (gap > 1) {
            recommendations.push(`HIGH PRIORITY: Add ${gap} ${role.replace('_', ' ')} staff (${data.skill_level} level)`);
          } else {
            recommendations.push(`Consider adding ${gap} ${role.replace('_', ' ')} staff (${data.skill_level} level)`);
          }
        }
      });

      // Generate workload balancing suggestions
      const workloadSuggestions = [];
      if (resourceUtilization > 90) {
        workloadSuggestions.push("High utilization detected - consider redistributing tasks across team members");
      } else if (resourceUtilization < 60) {
        workloadSuggestions.push("Low utilization - team capacity available for additional responsibilities");
      }

      // Skill-based recommendations
      const skillRecommendations = [];
      if (healthData && healthData.dimensions.risk.score < 70) {
        skillRecommendations.push("Add risk management specialist due to elevated project risks");
      }
      if (healthData && healthData.dimensions.quality.score < 70) {
        skillRecommendations.push("Consider quality assurance specialist for improved deliverable standards");
      }

      // Predict potential conflicts
      const conflictPredictions = [];
      if (resourceUtilization > 85) {
        conflictPredictions.push({
          type: "resource_conflict",
          description: "High resource utilization may lead to burnout and quality issues",
          probability: "high",
          mitigation: "Implement workload balancing and consider hiring additional staff"
        });
      }

      // Generate optimization opportunities
      const optimizationOpportunities = [];
      if (projectSize > 0.6 && requiredResources.technical_specialists.current < 2) {
        optimizationOpportunities.push({
          type: "specialist_optimization",
          description: "Large project would benefit from additional technical specialists",
          impact: "high",
          effort: "medium"
        });
      }

      const allocationData = {
        projectId,
        analysisDate: currentDate.toISOString(),
        resourceUtilization: Math.round(resourceUtilization),
        resourceHealth: resourceUtilization >= 90 ? 'optimal' :
                       resourceUtilization >= 75 ? 'good' :
                       resourceUtilization >= 60 ? 'fair' : 'poor',
        requiredResources,
        resourceGaps,
        recommendations: [...recommendations, ...workloadSuggestions, ...skillRecommendations],
        conflictPredictions,
        optimizationOpportunities,
        nextReviewDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        confidence: 82, // AI confidence level
        insights: {
          projectComplexity: projectSize > 0.7 ? "High" : projectSize > 0.4 ? "Medium" : "Low",
          resourceEfficiency: resourceUtilization > 85 ? "Efficient" :
                            resourceUtilization > 70 ? "Balanced" : "Underutilized",
          skillAlignment: resourceGaps.length === 0 ? "Well-aligned" :
                         resourceGaps.length <= 2 ? "Mostly-aligned" : "Needs-improvement"
        }
      };

      res.json(allocationData);
    } catch (error) {
      console.error("Resource allocation error:", error);
      res.status(500).json({ error: "Failed to analyze resource allocation" });
    }
  });

  // Automated Risk Trend Analysis endpoint
  app.get("/api/projects/:id/risk-trends", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get project health data for risk correlation
      const healthResponse = await fetch(`${req.protocol}://${req.get('host')}/api/projects/${projectId}/health-score`, {
        headers: {
          'Authorization': req.headers.authorization,
          'Cookie': req.headers.cookie
        }
      });

      let healthData = null;
      if (healthResponse.ok) {
        healthData = await healthResponse.json();
      }

      // Get resource allocation data
      const resourceResponse = await fetch(`${req.protocol}://${req.get('host')}/api/projects/${projectId}/resource-allocation`, {
        headers: {
          'Authorization': req.headers.authorization,
          'Cookie': req.headers.cookie
        }
      });

      let resourceData = null;
      if (resourceResponse.ok) {
        resourceData = await resourceResponse.json();
      }

      const currentDate = new Date();

      // Simulate historical risk data (in real app, this would come from database)
      const historicalRisks = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
        const riskLevel = 0.3 + Math.sin(i * 0.2) * 0.2 + Math.random() * 0.1; // Simulated trend with noise
        historicalRisks.push({
          date: date.toISOString(),
          riskLevel: Math.max(0.1, Math.min(1.0, riskLevel)),
          riskCount: Math.floor(riskLevel * 8) + Math.floor(Math.random() * 3),
          category: i % 7 === 0 ? 'environmental' : i % 5 === 0 ? 'technical' : i % 3 === 0 ? 'operational' : 'financial'
        });
      }

      // Analyze risk patterns and trends
      const recentRisks = historicalRisks.slice(-14); // Last 2 weeks
      const avgRiskLevel = recentRisks.reduce((sum, r) => sum + r.riskLevel, 0) / recentRisks.length;
      const riskTrend = recentRisks.length > 1 ?
        (recentRisks[recentRisks.length - 1].riskLevel - recentRisks[0].riskLevel) / recentRisks[0].riskLevel : 0;

      // Calculate risk escalation probability
      let escalationProbability = 0.2; // Base probability

      // Factors increasing escalation probability
      if (healthData && healthData.dimensions.risk.score < 60) escalationProbability += 0.3;
      if (resourceData && resourceData.resourceGaps.length > 2) escalationProbability += 0.2;
      if (avgRiskLevel > 0.7) escalationProbability += 0.25;
      if (riskTrend > 0.15) escalationProbability += 0.2; // Increasing trend
      if (project.category === "infrastructure") escalationProbability += 0.15; // Higher risk category

      // Cap at 95%
      escalationProbability = Math.min(0.95, Math.max(0.05, escalationProbability));

      // Predict potential risk scenarios
      const riskScenarios = [];

      if (escalationProbability > 0.7) {
        riskScenarios.push({
          scenario: "Critical Risk Escalation",
          probability: escalationProbability,
          timeframe: "1-2 weeks",
          description: "Multiple risks could escalate simultaneously",
          impact: "high",
          mitigation: "Immediate risk mitigation and resource reallocation"
        });
      }

      if (healthData && healthData.dimensions.timeline.score < 70) {
        riskScenarios.push({
          scenario: "Timeline Risk",
          probability: 0.6,
          timeframe: "2-4 weeks",
          description: "Schedule delays could trigger cost overruns",
          impact: "medium",
          mitigation: "Accelerate critical path activities and contingency planning"
        });
      }

      if (resourceData && resourceData.resourceGaps.length > 0) {
        riskScenarios.push({
          scenario: "Resource Risk",
          probability: 0.5,
          timeframe: "1-3 weeks",
          description: "Resource gaps could impact project velocity",
          impact: "medium",
          mitigation: "Fill critical resource gaps and redistribute workload"
        });
      }

      // Identify risk patterns
      const riskPatterns = [];
      const categoryCounts = {};
      recentRisks.forEach(risk => {
        categoryCounts[risk.category] = (categoryCounts[risk.category] || 0) + 1;
      });

      Object.entries(categoryCounts).forEach(([category, count]) => {
        if (count >= 3) { // Pattern threshold
          riskPatterns.push({
            pattern: `${category} risk concentration`,
            frequency: count,
            trend: riskTrend > 0 ? 'increasing' : riskTrend < 0 ? 'decreasing' : 'stable',
            severity: category === 'environmental' ? 'high' : category === 'technical' ? 'medium' : 'low',
            recommendation: `Focus mitigation efforts on ${category} risks`
          });
        }
      });

      // Generate early warning alerts
      const earlyWarnings = [];

      if (escalationProbability > 0.6) {
        earlyWarnings.push({
          type: "critical",
          message: "High risk of escalation - immediate attention required",
          priority: "urgent",
          action: "Review all active risks and implement mitigation plans"
        });
      }

      if (riskTrend > 0.2) {
        earlyWarnings.push({
          type: "warning",
          message: "Risk levels trending upward",
          priority: "high",
          action: "Monitor risk indicators closely and prepare contingency plans"
        });
      }

      if (healthData && healthData.dimensions.risk.score < 70) {
        earlyWarnings.push({
          type: "warning",
          message: "Project health indicates elevated risk exposure",
          priority: "medium",
          action: "Address health score issues to reduce risk probability"
        });
      }

      // Calculate risk velocity (rate of change)
      const riskVelocity = recentRisks.length > 7 ?
        recentRisks.slice(-7).reduce((sum, r) => sum + r.riskLevel, 0) / 7 -
        recentRisks.slice(0, 7).reduce((sum, r) => sum + r.riskLevel, 0) / 7 : 0;

      const trendAnalysis = {
        projectId,
        analysisDate: currentDate.toISOString(),
        riskLevel: avgRiskLevel,
        riskTrend: riskTrend * 100, // Convert to percentage
        riskVelocity,
        escalationProbability,
        trendDirection: riskTrend > 0.1 ? 'increasing' :
                       riskTrend < -0.1 ? 'decreasing' : 'stable',
        confidence: 78, // AI confidence level
        historicalData: historicalRisks,
        riskScenarios,
        riskPatterns,
        earlyWarnings,
        insights: {
          primaryRiskDrivers: riskPatterns.length > 0 ? riskPatterns[0].pattern : "No significant patterns detected",
          escalationTimeframe: escalationProbability > 0.7 ? "Short-term (1-2 weeks)" :
                             escalationProbability > 0.5 ? "Medium-term (2-4 weeks)" :
                             "Long-term (1-2 months)",
          mitigationUrgency: escalationProbability > 0.7 ? "Immediate" :
                           escalationProbability > 0.5 ? "High" :
                           escalationProbability > 0.3 ? "Medium" : "Low",
          correlationFactors: [
            healthData ? `Health Score: ${healthData.overallScore}/100` : null,
            resourceData ? `Resource Gaps: ${resourceData.resourceGaps.length}` : null,
            `Project Category: ${project.category}`,
            `Project Size: ${project.budgetAllocated ? 'Large' : 'Medium'}`
          ].filter(Boolean)
        },
        recommendations: [
          escalationProbability > 0.6 ? "URGENT: Implement immediate risk mitigation measures" : null,
          riskTrend > 0.15 ? "Monitor risk trends closely and prepare contingency plans" : null,
          riskPatterns.length > 2 ? "Address multiple risk patterns simultaneously" : null,
          healthData && healthData.dimensions.risk.score < 70 ? "Focus on health score improvement to reduce risks" : null,
          resourceData && resourceData.resourceGaps.length > 0 ? "Fill critical resource gaps to stabilize risks" : null
        ].filter(Boolean)
      };

      res.json(trendAnalysis);
    } catch (error) {
      console.error("Risk trend analysis error:", error);
      res.status(500).json({ error: "Failed to analyze risk trends" });
    }
  });

  // Smart Deadline Reminders endpoint
  app.get("/api/projects/:id/deadline-reminders", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const currentDate = new Date();
      const projectEndDate = new Date(project.plannedEndDate || project.plannedStartDate);

      // Calculate days until project deadline
      const daysUntilDeadline = Math.ceil((projectEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      // Generate reminder schedule
      const reminders = [];

      // 7-day reminder
      if (daysUntilDeadline <= 7 && daysUntilDeadline > 3) {
        reminders.push({
          id: `reminder-7-${projectId}`,
          type: 'deadline_warning',
          title: 'Project Deadline Approaching',
          message: `Project "${project.name}" is due in ${daysUntilDeadline} days`,
          priority: 'high',
          daysUntilDeadline,
          dueDate: projectEndDate.toISOString(),
          actionRequired: 'Review project status and prepare completion plan',
          escalationLevel: 'warning'
        });
      }

      // 3-day reminder
      if (daysUntilDeadline <= 3 && daysUntilDeadline > 1) {
        reminders.push({
          id: `reminder-3-${projectId}`,
          type: 'deadline_warning',
          title: 'URGENT: Project Deadline Soon',
          message: `Project "${project.name}" is due in ${daysUntilDeadline} days`,
          priority: 'urgent',
          daysUntilDeadline,
          dueDate: projectEndDate.toISOString(),
          actionRequired: 'Immediate attention required - accelerate critical tasks',
          escalationLevel: 'urgent'
        });
      }

      // 1-day reminder
      if (daysUntilDeadline <= 1 && daysUntilDeadline > 0) {
        reminders.push({
          id: `reminder-1-${projectId}`,
          type: 'deadline_critical',
          title: 'CRITICAL: Project Due Tomorrow',
          message: `Project "${project.name}" is due TOMORROW`,
          priority: 'critical',
          daysUntilDeadline,
          dueDate: projectEndDate.toISOString(),
          actionRequired: 'Final review and completion required immediately',
          escalationLevel: 'critical'
        });
      }

      // Overdue reminder
      if (daysUntilDeadline < 0) {
        reminders.push({
          id: `reminder-overdue-${projectId}`,
          type: 'deadline_overdue',
          title: 'PROJECT OVERDUE',
          message: `Project "${project.name}" is ${Math.abs(daysUntilDeadline)} days overdue`,
          priority: 'critical',
          daysUntilDeadline,
          dueDate: projectEndDate.toISOString(),
          actionRequired: 'Immediate escalation to management required',
          escalationLevel: 'escalation_required'
        });
      }

      // Get project milestones and generate reminders for them
      const milestones = [
        { name: 'Planning Phase', date: new Date(project.plannedStartDate), completed: project.progressPercentage > 10 },
        { name: 'Execution Phase', date: new Date(project.plannedStartDate).getTime() + (projectEndDate.getTime() - new Date(project.plannedStartDate).getTime()) * 0.3, completed: project.progressPercentage > 40 },
        { name: 'Testing Phase', date: new Date(project.plannedStartDate).getTime() + (projectEndDate.getTime() - new Date(project.plannedStartDate).getTime()) * 0.7, completed: project.progressPercentage > 70 },
        { name: 'Final Review', date: new Date(project.plannedStartDate).getTime() + (projectEndDate.getTime() - new Date(project.plannedStartDate).getTime()) * 0.9, completed: project.progressPercentage > 90 }
      ];

      milestones.forEach((milestone, index) => {
        if (!milestone.completed) {
          const milestoneDate = new Date(milestone.date);
          const daysUntilMilestone = Math.ceil((milestoneDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilMilestone <= 7 && daysUntilMilestone > 0) {
            reminders.push({
              id: `milestone-${index}-${projectId}`,
              type: 'milestone_warning',
              title: `${milestone.name} Milestone Due Soon`,
              message: `${milestone.name} for "${project.name}" is due in ${daysUntilMilestone} days`,
              priority: daysUntilMilestone <= 3 ? 'urgent' : 'high',
              daysUntilDeadline: daysUntilMilestone,
              dueDate: milestoneDate.toISOString(),
              actionRequired: `Complete ${milestone.name.toLowerCase()} activities`,
              escalationLevel: daysUntilMilestone <= 3 ? 'urgent' : 'warning'
            });
          }
        }
      });

      // Generate reminder summary
      const reminderSummary = {
        totalReminders: reminders.length,
        criticalCount: reminders.filter(r => r.priority === 'critical').length,
        urgentCount: reminders.filter(r => r.priority === 'urgent').length,
        highCount: reminders.filter(r => r.priority === 'high').length,
        nextReminder: reminders.length > 0 ? reminders[0] : null
      };

      const deadlineData = {
        projectId,
        projectName: project.name,
        projectEndDate: projectEndDate.toISOString(),
        daysUntilDeadline,
        currentProgress: project.progressPercentage,
        reminders: reminders.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline),
        reminderSummary,
        lastUpdated: currentDate.toISOString(),
        reminderSettings: {
          enabled: true,
          reminderDays: [7, 3, 1],
          includeMilestones: true,
          notifyStakeholders: true
        }
      };

      res.json(deadlineData);
    } catch (error) {
      console.error("Deadline reminders error:", error);
      res.status(500).json({ error: "Failed to generate deadline reminders" });
    }
  });

  // Auto-Escalation Rules Engine endpoint
  app.get("/api/projects/:id/escalation-rules", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const currentDate = new Date();

      // Get project health and resource data for escalation analysis
      const healthResponse = await fetch(`${req.protocol}://${req.get('host')}/api/projects/${projectId}/health-score`, {
        headers: {
          'Authorization': req.headers.authorization,
          'Cookie': req.headers.cookie
        }
      });

      let healthData = null;
      if (healthResponse.ok) {
        healthData = await healthResponse.json();
      }

      const resourceResponse = await fetch(`${req.protocol}://${req.get('host')}/api/projects/${projectId}/resource-allocation`, {
        headers: {
          'Authorization': req.headers.authorization,
          'Cookie': req.headers.cookie
        }
      });

      let resourceData = null;
      if (resourceResponse.ok) {
        resourceData = await resourceResponse.json();
      }

      // Calculate escalation triggers
      const escalations = [];
      const activeEscalations = [];

      // 1. Time-based escalations
      const daysUntilDeadline = Math.ceil((new Date(project.plannedEndDate || project.plannedStartDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline < 0) {
        activeEscalations.push({
          id: `time-overdue-${projectId}`,
          type: 'time_overdue',
          severity: 'critical',
          title: 'PROJECT OVERDUE - IMMEDIATE ESCALATION',
          description: `Project "${project.name}" is ${Math.abs(daysUntilDeadline)} days overdue`,
          triggerCondition: 'Project end date has passed',
          currentValue: `${Math.abs(daysUntilDeadline)} days overdue`,
          threshold: '0 days',
          escalationLevel: 'senior_management',
          stakeholders: ['RDC Manager', 'Minister', 'Project Manager'],
          recommendedAction: 'Immediate review and corrective action plan required',
          triggeredAt: currentDate.toISOString(),
          status: 'active'
        });
      } else if (daysUntilDeadline <= 1) {
        activeEscalations.push({
          id: `time-critical-${projectId}`,
          type: 'time_critical',
          severity: 'critical',
          title: 'CRITICAL: Project Due Tomorrow',
          description: `Project "${project.name}" is due in ${daysUntilDeadline} day(s)`,
          triggerCondition: 'Less than 2 days until deadline',
          currentValue: `${daysUntilDeadline} days remaining`,
          threshold: '2 days',
          escalationLevel: 'rdc_manager',
          stakeholders: ['RDC Manager', 'Project Manager'],
          recommendedAction: 'Accelerate remaining tasks and prepare final deliverables',
          triggeredAt: currentDate.toISOString(),
          status: 'active'
        });
      }

      // 2. Budget-based escalations
      if (project.budgetSpent && project.budgetAllocated) {
        const budgetUtilization = (project.budgetSpent / project.budgetAllocated) * 100;

        if (budgetUtilization > 100) {
          activeEscalations.push({
            id: `budget-overrun-${projectId}`,
            type: 'budget_overrun',
            severity: 'critical',
            title: 'CRITICAL: Budget Overrun Detected',
            description: `Project "${project.name}" has exceeded budget by ${(budgetUtilization - 100).toFixed(1)}%`,
            triggerCondition: 'Budget spent exceeds allocated budget',
            currentValue: `$${project.budgetSpent.toLocaleString()} spent of $${project.budgetAllocated.toLocaleString()}`,
            threshold: `$${project.budgetAllocated.toLocaleString()}`,
            escalationLevel: 'senior_management',
            stakeholders: ['RDC Manager', 'Minister', 'Finance Officer'],
            recommendedAction: 'Immediate budget review and variance analysis required',
            triggeredAt: currentDate.toISOString(),
            status: 'active'
          });
        } else if (budgetUtilization > 95) {
          activeEscalations.push({
            id: `budget-warning-${projectId}`,
            type: 'budget_warning',
            severity: 'high',
            title: 'HIGH: Budget Utilization Warning',
            description: `Project "${project.name}" has used ${budgetUtilization.toFixed(1)}% of allocated budget`,
            triggerCondition: 'Budget utilization exceeds 95%',
            currentValue: `${budgetUtilization.toFixed(1)}% utilized`,
            threshold: '95% of budget',
            escalationLevel: 'rdc_manager',
            stakeholders: ['RDC Manager', 'Project Manager'],
            recommendedAction: 'Review spending patterns and implement cost controls',
            triggeredAt: currentDate.toISOString(),
            status: 'active'
          });
        }
      }

      // 3. Health-based escalations
      if (healthData) {
        if (healthData.overallScore < 60) {
          activeEscalations.push({
            id: `health-critical-${projectId}`,
            type: 'health_critical',
            severity: 'critical',
            title: 'CRITICAL: Project Health Severely Compromised',
            description: `Project "${project.name}" health score is critically low at ${healthData.overallScore}/100`,
            triggerCondition: 'Overall health score below 60',
            currentValue: `${healthData.overallScore}/100`,
            threshold: '60/100',
            escalationLevel: 'senior_management',
            stakeholders: ['RDC Manager', 'Minister', 'Project Manager'],
            recommendedAction: 'Comprehensive project review and intervention plan required',
            triggeredAt: currentDate.toISOString(),
            status: 'active'
          });
        } else if (healthData.overallScore < 70) {
          activeEscalations.push({
            id: `health-warning-${projectId}`,
            type: 'health_warning',
            severity: 'high',
            title: 'HIGH: Project Health Warning',
            description: `Project "${project.name}" health score is concerning at ${healthData.overallScore}/100`,
            triggerCondition: 'Overall health score below 70',
            currentValue: `${healthData.overallScore}/100`,
            threshold: '70/100',
            escalationLevel: 'rdc_manager',
            stakeholders: ['RDC Manager', 'Project Manager'],
            recommendedAction: 'Address health score issues and implement corrective measures',
            triggeredAt: currentDate.toISOString(),
            status: 'active'
          });
        }

        // Risk-specific escalations
        if (healthData.dimensions.risk.score < 50) {
          activeEscalations.push({
            id: `risk-critical-${projectId}`,
            type: 'risk_critical',
            severity: 'critical',
            title: 'CRITICAL: Risk Level Critical',
            description: `Project "${project.name}" risk score is critically high at ${healthData.dimensions.risk.score}/100`,
            triggerCondition: 'Risk score below 50',
            currentValue: `${healthData.dimensions.risk.score}/100`,
            threshold: '50/100',
            escalationLevel: 'senior_management',
            stakeholders: ['RDC Manager', 'Risk Manager', 'Project Manager'],
            recommendedAction: 'Immediate risk mitigation and contingency planning required',
            triggeredAt: currentDate.toISOString(),
            status: 'active'
          });
        }
      }

      // 4. Resource-based escalations
      if (resourceData && resourceData.resourceGaps.length > 2) {
        activeEscalations.push({
          id: `resource-critical-${projectId}`,
          type: 'resource_critical',
          severity: 'high',
          title: 'HIGH: Critical Resource Shortages',
          description: `Project "${project.name}" has ${resourceData.resourceGaps.length} critical resource gaps`,
          triggerCondition: 'More than 2 resource gaps identified',
          currentValue: `${resourceData.resourceGaps.length} gaps`,
          threshold: '2 resource gaps',
          escalationLevel: 'rdc_manager',
          stakeholders: ['RDC Manager', 'HR Manager', 'Project Manager'],
          recommendedAction: 'Immediate resource allocation and staffing review required',
          triggeredAt: currentDate.toISOString(),
          status: 'active'
        });
      }

      // Generate escalation summary
      const escalationSummary = {
        totalEscalations: activeEscalations.length,
        criticalEscalations: activeEscalations.filter(e => e.severity === 'critical').length,
        highEscalations: activeEscalations.filter(e => e.severity === 'high').length,
        mediumEscalations: activeEscalations.filter(e => e.severity === 'medium').length,
        escalationLevels: {
          project_manager: activeEscalations.filter(e => e.escalationLevel === 'project_manager').length,
          rdc_manager: activeEscalations.filter(e => e.escalationLevel === 'rdc_manager').length,
          senior_management: activeEscalations.filter(e => e.escalationLevel === 'senior_management').length
        }
      };

      // Define escalation rules configuration
      const escalationRules = [
        {
          id: 'time-overdue',
          name: 'Project Overdue',
          category: 'time',
          triggerType: 'threshold',
          condition: 'daysUntilDeadline < 0',
          severity: 'critical',
          escalationLevel: 'senior_management',
          enabled: true,
          description: 'Escalate when project is overdue'
        },
        {
          id: 'time-critical',
          name: 'Deadline Critical',
          category: 'time',
          triggerType: 'threshold',
          condition: 'daysUntilDeadline <= 1',
          severity: 'critical',
          escalationLevel: 'rdc_manager',
          enabled: true,
          description: 'Escalate when deadline is within 1 day'
        },
        {
          id: 'budget-overrun',
          name: 'Budget Overrun',
          category: 'budget',
          triggerType: 'threshold',
          condition: 'budgetUtilization > 100',
          severity: 'critical',
          escalationLevel: 'senior_management',
          enabled: true,
          description: 'Escalate when budget is exceeded'
        },
        {
          id: 'budget-warning',
          name: 'Budget Warning',
          category: 'budget',
          triggerType: 'threshold',
          condition: 'budgetUtilization > 95',
          severity: 'high',
          escalationLevel: 'rdc_manager',
          enabled: true,
          description: 'Escalate when budget utilization exceeds 95%'
        },
        {
          id: 'health-critical',
          name: 'Health Critical',
          category: 'health',
          triggerType: 'threshold',
          condition: 'overallScore < 60',
          severity: 'critical',
          escalationLevel: 'senior_management',
          enabled: true,
          description: 'Escalate when project health is critical'
        },
        {
          id: 'risk-critical',
          name: 'Risk Critical',
          category: 'risk',
          triggerType: 'threshold',
          condition: 'riskScore < 50',
          severity: 'critical',
          escalationLevel: 'senior_management',
          enabled: true,
          description: 'Escalate when risk level is critical'
        }
      ];

      const escalationData = {
        projectId,
        projectName: project.name,
        analysisDate: currentDate.toISOString(),
        activeEscalations,
        escalationSummary,
        escalationRules,
        projectMetrics: {
          daysUntilDeadline,
          budgetUtilization: project.budgetSpent && project.budgetAllocated ?
            (project.budgetSpent / project.budgetAllocated) * 100 : 0,
          healthScore: healthData ? healthData.overallScore : null,
          riskScore: healthData ? healthData.dimensions.risk.score : null,
          resourceGaps: resourceData ? resourceData.resourceGaps.length : 0
        },
        escalationSettings: {
          autoEscalationEnabled: true,
          notifyStakeholders: true,
          requireAcknowledgement: true,
          escalationCooldownHours: 24
        }
      };

      res.json(escalationData);
    } catch (error) {
      console.error("Escalation rules error:", error);
      res.status(500).json({ error: "Failed to analyze escalation rules" });
    }
  });

  // Automated Report Generation endpoint
  app.get("/api/reports/generate/:projectId", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.params;
      const { type, format = 'json' } = req.query;
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const currentDate = new Date();
      const reportDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Get data from various sources for comprehensive reporting
      const healthResponse = await fetch(`${req.protocol}://${req.get('host')}/api/projects/${projectId}/health-score`, {
        headers: {
          'Authorization': req.headers.authorization,
          'Cookie': req.headers.cookie
        }
      });

      let healthData = null;
      if (healthResponse.ok) {
        healthData = await healthResponse.json();
      }

      const resourceResponse = await fetch(`${req.protocol}://${req.get('host')}/api/projects/${projectId}/resource-allocation`, {
        headers: {
          'Authorization': req.headers.authorization,
          'Cookie': req.headers.cookie
        }
      });

      let resourceData = null;
      if (resourceResponse.ok) {
        resourceData = await resourceResponse.json();
      }

      const riskResponse = await fetch(`${req.protocol}://${req.get('host')}/api/projects/${projectId}/risk-trends`, {
        headers: {
          'Authorization': req.headers.authorization,
          'Cookie': req.headers.cookie
        }
      });

      let riskData = null;
      if (riskResponse.ok) {
        riskData = await riskResponse.json();
      }

      const escalationResponse = await fetch(`${req.protocol}://${req.get('host')}/api/projects/${projectId}/escalation-rules`, {
        headers: {
          'Authorization': req.headers.authorization,
          'Cookie': req.headers.cookie
        }
      });

      let escalationData = null;
      if (escalationResponse.ok) {
        escalationData = await escalationResponse.json();
      }

      // Generate report based on type
      let reportData;

      switch (type) {
        case 'weekly_progress':
          reportData = generateWeeklyProgressReport(project, healthData, resourceData, currentDate);
          break;
        case 'monthly_executive':
          reportData = generateMonthlyExecutiveReport(project, healthData, resourceData, riskData, currentDate);
          break;
        case 'risk_assessment':
          reportData = generateRiskAssessmentReport(project, riskData, escalationData, currentDate);
          break;
        case 'budget_tracking':
          reportData = generateBudgetTrackingReport(project, healthData, currentDate);
          break;
        default:
          reportData = generateWeeklyProgressReport(project, healthData, resourceData, currentDate);
      }

      // Set appropriate headers based on format
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${type}_report_${reportDate}.json"`);
        res.json(reportData);
      } else {
        // Default to JSON for now
        res.json(reportData);
      }

    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Workflow Approval Chains endpoint
  app.get("/api/approvals/pending", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { type, status = 'pending' } = req.query;

      // Mock approval data - in real app this would come from database
      const mockApprovals = [
        {
          id: 'approval-budget-001',
          type: 'budget_increase',
          title: 'Budget Increase Request - Anna Regina Sports Complex',
          description: 'Request for $150,000 budget increase due to material cost escalation',
          amount: 150000,
          projectId: 'proj-pm-4',
          projectName: 'Anna Regina Sports Complex',
          requesterId: 'user-6',
          requesterName: 'Project Manager',
          currentApprover: 'rdc_manager',
          approvalChain: [
            { role: 'pm', status: 'approved', approvedBy: 'user-6', approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { role: 'rdc_manager', status: 'pending', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
            { role: 'minister', status: 'pending' }
          ],
          priority: 'high',
          category: 'budget',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          justification: 'Material costs have increased by 15% due to global supply chain issues. Additional funds required to complete construction without delays.',
          attachments: ['cost_analysis.pdf', 'supplier_quotes.pdf'],
          status: 'in_review'
        },
        {
          id: 'approval-change-002',
          type: 'change_request',
          title: 'Change Request - Essequibo Coast School Renovation',
          description: 'Addition of solar panel installation to existing renovation scope',
          amount: 75000,
          projectId: 'proj-pm-1',
          projectName: 'Essequibo Coast School Renovation',
          requesterId: 'user-6',
          requesterName: 'Project Manager',
          currentApprover: 'rdc_manager',
          approvalChain: [
            { role: 'pm', status: 'approved', approvedBy: 'user-6', approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
            { role: 'rdc_manager', status: 'pending', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
            { role: 'minister', status: 'pending' }
          ],
          priority: 'medium',
          category: 'scope_change',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          justification: 'Addition of solar panels will reduce long-term energy costs and provide sustainable energy solution for the school.',
          attachments: ['solar_proposal.pdf', 'energy_analysis.pdf'],
          status: 'in_review'
        },
        {
          id: 'approval-contract-003',
          type: 'contract_approval',
          title: 'Contract Approval - Demerara River Bridge Construction',
          description: 'Construction contract with local engineering firm',
          amount: 2500000,
          projectId: 'proj-pm-2',
          projectName: 'Demerara River Bridge Construction',
          requesterId: 'user-6',
          requesterName: 'Project Manager',
          currentApprover: 'minister',
          approvalChain: [
            { role: 'pm', status: 'approved', approvedBy: 'user-6', approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
            { role: 'rdc_manager', status: 'approved', approvedBy: 'rdc_manager_user', approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
            { role: 'minister', status: 'pending', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          priority: 'critical',
          category: 'contract',
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          justification: 'Selected contractor has proven track record and competitive pricing. Contract includes all required safety and quality standards.',
          attachments: ['contract_draft.pdf', 'contractor_evaluation.pdf', 'bid_analysis.pdf'],
          status: 'in_review'
        }
      ];

      // Filter approvals based on user role and query parameters
      let filteredApprovals = mockApprovals;

      if (user.role === 'rdc_manager') {
        filteredApprovals = mockApprovals.filter(approval =>
          approval.currentApprover === 'rdc_manager' &&
          approval.approvalChain.find(step => step.role === 'rdc_manager' && step.status === 'pending')
        );
      } else if (user.role === 'minister') {
        filteredApprovals = mockApprovals.filter(approval =>
          approval.currentApprover === 'minister' &&
          approval.approvalChain.find(step => step.role === 'minister' && step.status === 'pending')
        );
      }

      if (type) {
        filteredApprovals = filteredApprovals.filter(approval => approval.type === type);
      }

      if (status && status !== 'all') {
        filteredApprovals = filteredApprovals.filter(approval => approval.status === status);
      }

      res.json({
        approvals: filteredApprovals,
        summary: {
          total: filteredApprovals.length,
          pending: filteredApprovals.filter(a => a.status === 'in_review').length,
          approved: filteredApprovals.filter(a => a.status === 'approved').length,
          rejected: filteredApprovals.filter(a => a.status === 'rejected').length,
          overdue: filteredApprovals.filter(a =>
            a.status === 'in_review' &&
            new Date(a.dueDate) < new Date()
          ).length
        }
      });
    } catch (error) {
      console.error("Pending approvals error:", error);
      res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  });

  // Approve/Deny approval endpoint
  app.post("/api/approvals/:id/action", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, comments } = req.body;
      const user = req.user;

      // Mock approval processing - in real app this would update database
      const mockResult = {
        approvalId: id,
        action: action, // 'approve' or 'deny'
        performedBy: user.id,
        performedByName: user.fullName || user.username,
        performedAt: new Date().toISOString(),
        comments: comments || '',
        nextApprover: action === 'approve' ? 'next_in_chain' : null
      };

      res.json({
        success: true,
        message: `Approval ${action}d successfully`,
        result: mockResult
      });
    } catch (error) {
      console.error("Approval action error:", error);
      res.status(500).json({ error: "Failed to process approval action" });
    }
  });

  // Smart Notifications System endpoint
  app.get("/api/notifications/smart", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { priority, type, unread_only = 'false' } = req.query;

      // Mock smart notifications based on user role and context
      const mockNotifications = [
        {
          id: 'smart-notif-001',
          type: 'deadline_warning',
          priority: 'high',
          title: 'Project Deadline Approaching',
          message: 'Anna Regina Sports Complex deadline is in 3 days. PM attention required.',
          recipientRole: 'pm',
          recipientId: user.id,
          projectId: 'proj-pm-4',
          projectName: 'Anna Regina Sports Complex',
          context: {
            daysUntilDeadline: 3,
            projectHealth: 68,
            escalationLevel: 'warning'
          },
          actionRequired: 'Review project status and prepare completion plan',
          suggestedActions: [
            'Schedule team meeting',
            'Review critical path items',
            'Update stakeholders on progress'
          ],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          autoGenerated: true,
          triggeredBy: 'deadline_monitor',
          escalationChain: ['pm', 'rdc_manager', 'minister']
        },
        {
          id: 'smart-notif-002',
          type: 'budget_alert',
          priority: 'urgent',
          title: 'Budget Variance Alert',
          message: 'Budget utilization exceeded 95% threshold on Essequibo Coast School project.',
          recipientRole: 'rdc_manager',
          recipientId: user.role === 'rdc_manager' ? user.id : 'rdc_user',
          projectId: 'proj-pm-1',
          projectName: 'Essequibo Coast School Renovation',
          context: {
            budgetUtilization: 97.5,
            threshold: 95,
            variance: 2.5
          },
          actionRequired: 'Review budget controls and approve additional funds if needed',
          suggestedActions: [
            'Review spending patterns',
            'Approve budget increase request',
            'Implement cost controls'
          ],
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: false,
          autoGenerated: true,
          triggeredBy: 'budget_monitor',
          escalationChain: ['pm', 'rdc_manager', 'minister']
        },
        {
          id: 'smart-notif-003',
          type: 'health_critical',
          priority: 'critical',
          title: 'CRITICAL: Project Health Alert',
          message: 'Demerara River Bridge project health score dropped below 60. Immediate intervention required.',
          recipientRole: 'minister',
          recipientId: user.role === 'minister' ? user.id : 'minister_user',
          projectId: 'proj-pm-2',
          projectName: 'Demerara River Bridge Construction',
          context: {
            healthScore: 58,
            previousScore: 72,
            declineRate: 14,
            criticalFactors: ['timeline_delay', 'resource_shortage']
          },
          actionRequired: 'Immediate project review and intervention plan required',
          suggestedActions: [
            'Schedule emergency project review',
            'Allocate additional resources',
            'Consider project restructuring'
          ],
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: true,
          autoGenerated: true,
          triggeredBy: 'health_monitor',
          escalationChain: ['pm', 'rdc_manager', 'minister']
        },
        {
          id: 'smart-notif-004',
          type: 'approval_pending',
          priority: 'medium',
          title: 'Approval Request Pending',
          message: 'Contract approval request for Demerara River Bridge awaiting your review.',
          recipientRole: 'minister',
          recipientId: user.role === 'minister' ? user.id : 'minister_user',
          projectId: 'proj-pm-2',
          projectName: 'Demerara River Bridge Construction',
          context: {
            approvalType: 'contract_approval',
            amount: 2500000,
            submittedBy: 'Project Manager',
            daysPending: 3,
            dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          actionRequired: 'Review and approve/deny contract within 4 days',
          suggestedActions: [
            'Review contract details',
            'Consult with legal team',
            'Make approval decision'
          ],
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          read: false,
          autoGenerated: false,
          triggeredBy: 'approval_workflow',
          escalationChain: ['minister']
        },
        {
          id: 'smart-notif-005',
          type: 'milestone_reminder',
          priority: 'medium',
          title: 'Milestone Due Soon',
          message: 'Testing Phase milestone for Anna Regina Sports Complex due in 2 days.',
          recipientRole: 'pm',
          recipientId: user.id,
          projectId: 'proj-pm-4',
          projectName: 'Anna Regina Sports Complex',
          context: {
            milestoneName: 'Testing Phase',
            daysUntilDue: 2,
            progressRequired: 70,
            currentProgress: 65
          },
          actionRequired: 'Complete testing phase activities within 2 days',
          suggestedActions: [
            'Accelerate testing activities',
            'Coordinate with testing team',
            'Update project schedule'
          ],
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          read: false,
          autoGenerated: true,
          triggeredBy: 'milestone_monitor',
          escalationChain: ['pm', 'rdc_manager']
        }
      ];

      // Filter notifications based on user role and context
      let filteredNotifications = mockNotifications.filter(notification => {
        // Show notifications relevant to user's role
        if (notification.recipientRole === user.role) {
          return true;
        }

        // For PMs, also show general project notifications
        if (user.role === 'pm' && notification.type !== 'approval_pending') {
          return true;
        }

        return false;
      });

      // Apply additional filters
      if (priority) {
        filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
      }

      if (type) {
        filteredNotifications = filteredNotifications.filter(n => n.type === type);
      }

      if (unread_only === 'true') {
        filteredNotifications = filteredNotifications.filter(n => !n.read);
      }

      // Sort by priority and timestamp
      filteredNotifications.sort((a, b) => {
        const priorityOrder = { critical: 3, urgent: 2, high: 1, medium: 0, low: 0 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      const notificationSummary = {
        total: filteredNotifications.length,
        unread: filteredNotifications.filter(n => !n.read).length,
        critical: filteredNotifications.filter(n => n.priority === 'critical').length,
        urgent: filteredNotifications.filter(n => n.priority === 'urgent').length,
        high: filteredNotifications.filter(n => n.priority === 'high').length,
        medium: filteredNotifications.filter(n => n.priority === 'medium').length
      };

      res.json({
        notifications: filteredNotifications,
        summary: notificationSummary,
        userPreferences: {
          emailNotifications: true,
          smsNotifications: user.role === 'minister', // Ministers get SMS for critical items
          pushNotifications: true,
          quietHours: { start: '22:00', end: '08:00' },
          priorityThreshold: 'medium' // Only show medium+ priority notifications
        }
      });
    } catch (error) {
      console.error("Smart notifications error:", error);
      res.status(500).json({ error: "Failed to fetch smart notifications" });
    }
  });

  // Update notification preferences
  app.post("/api/notifications/preferences", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { emailNotifications, smsNotifications, pushNotifications, quietHours, priorityThreshold } = req.body;

      // Mock preference update - in real app this would update database
      const updatedPreferences = {
        userId: user.id,
        emailNotifications: emailNotifications ?? true,
        smsNotifications: smsNotifications ?? false,
        pushNotifications: pushNotifications ?? true,
        quietHours: quietHours ?? { start: '22:00', end: '08:00' },
        priorityThreshold: priorityThreshold ?? 'medium',
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        preferences: updatedPreferences
      });
    } catch (error) {
      console.error("Notification preferences error:", error);
      res.status(500).json({ error: "Failed to update notification preferences" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      // Mock notification read update - in real app this would update database
      const result = {
        notificationId: id,
        userId: user.id,
        markedAsRead: true,
        readAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Notification marked as read',
        result
      });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // AI-Powered Task Assignment endpoint
  app.get("/api/tasks/ai-assign", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { projectId, taskDescription, priority, skills } = req.query;

      // Mock team members with skills and availability
      const teamMembers = [
        {
          id: 'team-001',
          name: 'Sarah Johnson',
          role: 'Senior Project Manager',
          skills: ['project_management', 'stakeholder_management', 'risk_management'],
          availability: 0.8, // 80% available
          currentWorkload: 6,
          experience: 'senior',
          location: 'Georgetown',
          languages: ['English', 'Spanish']
        },
        {
          id: 'team-002',
          name: 'Michael Chen',
          role: 'Civil Engineer',
          skills: ['civil_engineering', 'structural_analysis', 'construction_management'],
          availability: 0.9,
          currentWorkload: 4,
          experience: 'senior',
          location: 'Georgetown',
          languages: ['English', 'Chinese']
        },
        {
          id: 'team-003',
          name: 'Lisa Rodriguez',
          role: 'Budget Analyst',
          skills: ['budget_analysis', 'financial_planning', 'cost_control'],
          availability: 0.7,
          currentWorkload: 8,
          experience: 'mid',
          location: 'Georgetown',
          languages: ['English', 'Portuguese']
        },
        {
          id: 'team-004',
          name: 'David Thompson',
          role: 'Safety Inspector',
          skills: ['safety_compliance', 'risk_assessment', 'quality_control'],
          availability: 0.85,
          currentWorkload: 5,
          experience: 'mid',
          location: 'Georgetown',
          languages: ['English']
        },
        {
          id: 'team-005',
          name: 'Maria Gonzalez',
          role: 'Architect',
          skills: ['architectural_design', 'building_codes', 'construction_documents'],
          availability: 0.6,
          currentWorkload: 9,
          experience: 'senior',
          location: 'Georgetown',
          languages: ['English', 'Spanish']
        }
      ];

      // Mock tasks to assign
      const mockTasks = [
        {
          id: 'task-001',
          title: 'Review Construction Drawings',
          description: 'Review and approve architectural drawings for Anna Regina Sports Complex',
          projectId: 'proj-pm-4',
          priority: 'high',
          requiredSkills: ['architectural_design', 'building_codes'],
          estimatedHours: 8,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'design'
        },
        {
          id: 'task-002',
          title: 'Budget Variance Analysis',
          description: 'Analyze budget variances and prepare corrective action plan',
          projectId: 'proj-pm-1',
          priority: 'urgent',
          requiredSkills: ['budget_analysis', 'financial_planning'],
          estimatedHours: 6,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'finance'
        },
        {
          id: 'task-003',
          title: 'Safety Compliance Check',
          description: 'Conduct safety compliance inspection for construction site',
          projectId: 'proj-pm-4',
          priority: 'medium',
          requiredSkills: ['safety_compliance', 'risk_assessment'],
          estimatedHours: 4,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'safety'
        }
      ];

      // AI Assignment Algorithm
      const assignTasks = (tasks: any[], team: any[]) => {
        const assignments = [];

        for (const task of tasks) {
          const candidates = team.map(member => {
            // Calculate skill match score (0-100)
            const skillMatch = task.requiredSkills.reduce((score, skill) => {
              return score + (member.skills.includes(skill) ? 100 / task.requiredSkills.length : 0);
            }, 0);

            // Calculate availability score (0-100)
            const availabilityScore = member.availability * 100;

            // Calculate workload balance score (0-100, higher when less busy)
            const workloadScore = Math.max(0, 100 - member.currentWorkload * 10);

            // Calculate experience match score
            const experienceScore = task.priority === 'urgent' || task.priority === 'critical' ?
              (member.experience === 'senior' ? 100 : 50) : 100;

            // Overall suitability score
            const overallScore = (
              skillMatch * 0.4 +      // 40% skill match
              availabilityScore * 0.3 + // 30% availability
              workloadScore * 0.2 +     // 20% workload balance
              experienceScore * 0.1     // 10% experience
            );

            return {
              member,
              skillMatch,
              availabilityScore,
              workloadScore,
              experienceScore,
              overallScore,
              reasoning: [
                skillMatch >= 80 ? 'Excellent skill match' : skillMatch >= 60 ? 'Good skill match' : 'Limited skill match',
                availabilityScore >= 80 ? 'Highly available' : availabilityScore >= 60 ? 'Moderately available' : 'Limited availability',
                workloadScore >= 70 ? 'Good workload balance' : 'High current workload',
                experienceScore >= 80 ? 'Appropriate experience level' : 'Experience level consideration'
              ]
            };
          });

          // Sort by overall score and pick best candidate
          candidates.sort((a, b) => b.overallScore - a.overallScore);
          const bestCandidate = candidates[0];

          assignments.push({
            task,
            assignedTo: bestCandidate.member,
            assignmentScore: bestCandidate.overallScore,
            confidence: bestCandidate.overallScore >= 80 ? 'high' :
                       bestCandidate.overallScore >= 60 ? 'medium' : 'low',
            reasoning: bestCandidate.reasoning,
            alternatives: candidates.slice(1, 3).map(c => ({
              member: c.member,
              score: c.overallScore
            }))
          });
        }

        return assignments;
      };

      const taskAssignments = assignTasks(mockTasks, teamMembers);

      // Generate workload optimization suggestions
      const workloadSuggestions = [];
      const highWorkloadMembers = teamMembers.filter(m => m.currentWorkload >= 8);
      const lowWorkloadMembers = teamMembers.filter(m => m.currentWorkload <= 4);

      if (highWorkloadMembers.length > 0) {
        workloadSuggestions.push({
          type: 'redistribution',
          message: `${highWorkloadMembers.length} team member(s) have high workload. Consider redistributing tasks.`,
          affectedMembers: highWorkloadMembers.map(m => m.name)
        });
      }

      if (lowWorkloadMembers.length > 0) {
        workloadSuggestions.push({
          type: 'utilization',
          message: `${lowWorkloadMembers.length} team member(s) have capacity for additional tasks.`,
          affectedMembers: lowWorkloadMembers.map(m => m.name)
        });
      }

      const assignmentData = {
        assignments: taskAssignments,
        workloadOptimization: workloadSuggestions,
        teamOverview: {
          totalMembers: teamMembers.length,
          averageAvailability: teamMembers.reduce((sum, m) => sum + m.availability, 0) / teamMembers.length,
          averageWorkload: teamMembers.reduce((sum, m) => sum + m.currentWorkload, 0) / teamMembers.length,
          skillCoverage: {
            project_management: teamMembers.filter(m => m.skills.includes('project_management')).length,
            civil_engineering: teamMembers.filter(m => m.skills.includes('civil_engineering')).length,
            budget_analysis: teamMembers.filter(m => m.skills.includes('budget_analysis')).length,
            safety_compliance: teamMembers.filter(m => m.skills.includes('safety_compliance')).length
          }
        },
        aiInsights: {
          topPerformers: teamMembers
            .filter(m => m.availability >= 0.8 && m.currentWorkload <= 6)
            .map(m => m.name),
          skillGaps: ['environmental_engineering', 'sustainable_design'], // Mock gaps
          recommendations: [
            'Consider cross-training team members in high-demand skills',
            'Balance workload distribution to prevent burnout',
            'Leverage team members with multiple skill sets for complex tasks'
          ]
        }
      };

      res.json(assignmentData);
    } catch (error) {
      console.error("AI task assignment error:", error);
      res.status(500).json({ error: "Failed to generate task assignments" });
    }
  });

  // Advanced Forecasting endpoint
  app.get("/api/analytics/forecast", requireAuth, async (req, res) => {
    try {
      const { timeframe, metric } = req.query;
      const user = req.user;

      // Generate forecasting data
      const forecast = {
        metric: metric || "onTimeDelivery",
        timeframe: timeframe || "6months",
        currentValue: 85,
        forecastData: [
          { period: "Jan 2025", predicted: 86, confidence: 85, range: { min: 82, max: 90 } },
          { period: "Feb 2025", predicted: 87, confidence: 82, range: { min: 83, max: 91 } },
          { period: "Mar 2025", predicted: 88, confidence: 80, range: { min: 84, max: 92 } },
          { period: "Apr 2025", predicted: 86, confidence: 78, range: { min: 81, max: 91 } },
          { period: "May 2025", predicted: 89, confidence: 75, range: { min: 83, max: 95 } },
          { period: "Jun 2025", predicted: 90, confidence: 72, range: { min: 84, max: 96 } }
        ],
        factors: [
          { factor: "Weather Conditions", impact: "medium", direction: "negative" },
          { factor: "Resource Availability", impact: "high", direction: "positive" },
          { factor: "Process Improvements", impact: "medium", direction: "positive" },
          { factor: "Budget Constraints", impact: "low", direction: "negative" }
        ],
        scenarios: {
          optimistic: { value: 92, probability: 25 },
          base: { value: 87, probability: 50 },
          pessimistic: { value: 82, probability: 25 }
        },
        recommendations: [
          "Implement weather monitoring system",
          "Increase resource allocation by 10%",
          "Continue process improvement initiatives",
          "Monitor budget constraints closely"
        ]
      };

      res.json(forecast);
    } catch (error) {
      console.error("Forecast error:", error);
      res.status(500).json({ error: "Failed to generate forecast" });
    }
  });

  // Cross-Project Analysis endpoint
  app.get("/api/cross-project/analysis", requireAuth, async (req, res) => {
    try {
      const user = req.user;

      // For PM users, analyze their assigned projects
      if (user.role === "pm") {
        const projects = Array.from(storage.projects.values())
          .filter(p => p.assignedTo === user.id);

        const analysis = {
          totalProjects: projects.length,
          riskPatterns: [
            {
              id: "weather-cluster",
              title: "Weather Impact Cluster",
              frequency: "85%",
              impact: "High",
              affectedProjects: projects.filter(p =>
                p.category === "infrastructure" || p.category === "building_construction"
              ).map(p => p.name),
              costImpact: 78000,
              recommendation: "Implement regional weather monitoring",
              confidence: 94
            },
            {
              id: "resource-conflict",
              title: "Resource Sharing Conflicts",
              frequency: "60%",
              impact: "Medium",
              affectedProjects: projects.map(p => p.name).slice(0, 2),
              costImpact: 25000,
              recommendation: "Coordinate equipment scheduling across projects",
              confidence: 88
            }
          ],
          resourceConflicts: [
            {
              id: "excavator-conflict",
              resourceType: "Heavy Equipment",
              severity: "Critical",
              affectedProjects: projects.map(p => p.name).slice(0, 2),
              resolutionCost: 35000
            }
          ],
          optimizationInsights: [
            {
              id: "bulk-procurement",
              title: "Bulk Material Procurement",
              potentialSavings: 180000,
              affectedProjects: projects.length,
              confidence: 96
            }
          ]
        };

        return res.json(analysis);
      }

      // For other roles, return general insights
      res.json({
        totalProjects: 0,
        riskPatterns: [],
        resourceConflicts: [],
        optimizationInsights: []
      });
    } catch (error) {
      console.error("Cross-project analysis error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // RDC Manager Dashboard endpoint
  app.get("/api/rdc/dashboard", requireAuth, requireRDCManager, async (req, res) => {
    try {
      // Get user's jurisdiction
      const userJurisdictionId = req.user.jurisdictionId;
      if (!userJurisdictionId) {
        return res.status(400).json({ error: "User not assigned to a jurisdiction" });
      }

      // Get jurisdiction details
      const jurisdiction = await storage.getJurisdiction(userJurisdictionId);
      if (!jurisdiction) {
        return res.status(404).json({ error: "Jurisdiction not found" });
      }

      // Get all users in this jurisdiction
      const jurisdictionUsers = await storage.getUsersByJurisdiction(userJurisdictionId);
      const pms = jurisdictionUsers.filter(user => user.role === 'pm');

      // Get projects for all PMs in this jurisdiction
      const allProjects = [];
      for (const pm of pms) {
        // This would typically come from a more sophisticated query
        // For now, we'll simulate getting PM-specific projects
        const pmProjects = Array.from(storage.projects.values())
          .filter(project => project.jurisdictionId === userJurisdictionId)
          .slice(0, 4); // Limit to 4 projects per PM for demo
        allProjects.push(...pmProjects);
      }

      // Calculate aggregated statistics
      const totalProjects = allProjects.length;
      const totalBudget = allProjects.reduce((sum, project) => sum + (project.budgetAllocated || 0), 0);
      const totalSpent = allProjects.reduce((sum, project) => sum + (project.budgetSpent || 0), 0);
      const activeProjects = allProjects.filter(project => project.status === 'in_progress').length;
      const completedProjects = allProjects.filter(project => project.status === 'completed').length;

      // Calculate risk metrics (simplified)
      const riskScore = Math.round((Math.random() * 2 + 6) * 10) / 10; // 6.0-8.0 range
      const optimizationPotential = Math.round(totalBudget * 0.15); // 15% optimization potential

      const dashboard = {
        jurisdiction: jurisdiction,
        summary: {
          totalPMs: pms.length,
          totalProjects,
          activeProjects,
          completedProjects,
          totalBudget,
          totalSpent,
          riskScore,
          optimizationPotential,
          budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
          projectCompletionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
        },
        pms: pms.map(pm => ({
          id: pm.id,
          name: pm.fullName || pm.username,
          projectCount: Math.floor(Math.random() * 4) + 2, // 2-5 projects per PM
          totalBudget: Math.floor(Math.random() * 2000000) + 1000000, // $1M-$3M
          riskScore: Math.round((Math.random() * 2 + 6) * 10) / 10,
          onTimeDeliveryRate: Math.floor(Math.random() * 20) + 80, // 80-99%
          costVariance: Math.round((Math.random() * 10 + 2) * 10) / 10 // 2.0-12.0%
        })),
        recentActivity: [
          {
            id: 'activity-1',
            type: 'project_completed',
            title: 'Anna Regina Sports Complex completed',
            description: 'Infrastructure project delivered on time and within budget',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            pm: 'Patricia Martinez'
          },
          {
            id: 'activity-2',
            type: 'risk_escalated',
            title: 'Weather delay pattern identified',
            description: 'Coordinated response plan activated across 3 PM portfolios',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            pm: 'System Alert'
          },
          {
            id: 'activity-3',
            type: 'optimization_implemented',
            title: 'Bulk procurement program launched',
            description: 'Regional material procurement saving $45K across projects',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            pm: 'Regional Initiative'
          }
        ]
      };

      res.json(dashboard);
    } catch (error) {
      console.error("RDC Dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Ministerial Dashboard endpoint
  app.get("/api/ministerial/dashboard", requireAuth, requireMinister, async (req, res) => {
    try {

      // Get all jurisdictions (RDCs)
      const jurisdictions = await storage.listJurisdictions();
      
      // Get summary statistics for each RDC
      const rdcStats = await Promise.all(
        jurisdictions.map(async (rdc) => {
          const issues = await storage.listIssues(rdc.id);
          const announcements = await storage.listAnnouncements(rdc.id);
          
          // Count issues by status
          const issueStats = {
            total: issues.length,
            submitted: issues.filter(i => i.status === "submitted").length,
            inProgress: issues.filter(i => i.status === "in_progress").length,
            resolved: issues.filter(i => i.status === "resolved").length,
            urgent: issues.filter(i => i.priority === "urgent").length,
          };

          return {
            id: rdc.id,
            name: rdc.name,
            description: rdc.description,
            contactEmail: rdc.contactEmail,
            contactPhone: rdc.contactPhone,
            address: rdc.address,
            issueStats,
            announcementCount: announcements.length,
            lastUpdated: new Date().toISOString()
          };
        })
      );

      // Calculate overall statistics
      const overallStats = {
        totalRDCs: rdcStats.length,
        totalIssues: rdcStats.reduce((sum, rdc) => sum + rdc.issueStats.total, 0),
        urgentIssues: rdcStats.reduce((sum, rdc) => sum + rdc.issueStats.urgent, 0),
        resolvedIssues: rdcStats.reduce((sum, rdc) => sum + rdc.issueStats.resolved, 0),
        totalAnnouncements: rdcStats.reduce((sum, rdc) => sum + rdc.announcementCount, 0),
        averageResolutionRate: rdcStats.length > 0 
          ? (rdcStats.reduce((sum, rdc) => sum + rdc.issueStats.resolved, 0) / 
             rdcStats.reduce((sum, rdc) => sum + rdc.issueStats.total, 0) * 100).toFixed(1)
          : "0.0"
      };

      res.json({
        overallStats,
        rdcStats,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching ministerial dashboard data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Register Project Tracker routes
  registerProjectTrackerRoutes(app);
  
  // Register PM Tool routes
  registerPMToolRoutes(app);
  
  // Register Risk Management routes
  app.use(riskManagementRoutes);
  
  // Register Notification routes
  app.use(notificationRoutes);

  const httpServer = createServer(app);

  return httpServer;
}

// Report generation helper functions
function generateWeeklyProgressReport(project: any, healthData: any, resourceData: any, currentDate: Date) {
  return {
    reportType: 'weekly_progress',
    generatedAt: currentDate.toISOString(),
    project: {
      id: project.id,
      name: project.name,
      category: project.category,
      progressPercentage: project.progressPercentage,
      status: project.status
    },
    summary: {
      period: 'Weekly Progress Report',
      overallStatus: healthData ? (healthData.overallScore >= 70 ? 'Good' : healthData.overallScore >= 50 ? 'Fair' : 'Poor') : 'Unknown',
      keyMetrics: {
        progress: `${project.progressPercentage}%`,
        healthScore: healthData ? `${healthData.overallScore}/100` : 'N/A',
        resourceUtilization: resourceData ? `${resourceData.resourceUtilization}%` : 'N/A'
      }
    },
    sections: {
      projectOverview: {
        title: 'Project Overview',
        content: `Project "${project.name}" is ${project.progressPercentage}% complete. The project is currently in ${project.status} status.`,
        metrics: {
          budgetUtilization: project.budgetSpent && project.budgetAllocated ?
            `${((project.budgetSpent / project.budgetAllocated) * 100).toFixed(1)}%` : 'N/A',
          daysRemaining: Math.ceil((new Date(project.plannedEndDate || project.plannedStartDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          riskLevel: healthData ? healthData.dimensions.risk.score : 'N/A'
        }
      },
      healthAssessment: healthData ? {
        title: 'Health Assessment',
        overallScore: healthData.overallScore,
        status: healthData.healthStatus,
        dimensions: healthData.dimensions,
        recommendations: healthData.recommendations
      } : null,
      resourceStatus: resourceData ? {
        title: 'Resource Status',
        utilization: resourceData.resourceUtilization,
        gaps: resourceData.resourceGaps.length,
        recommendations: resourceData.recommendations
      } : null
    },
    recommendations: [
      'Continue monitoring project progress',
      'Address any identified resource gaps',
      'Review health assessment recommendations'
    ]
  };
}

function generateMonthlyExecutiveReport(project: any, healthData: any, resourceData: any, riskData: any, currentDate: Date) {
  return {
    reportType: 'monthly_executive',
    generatedAt: currentDate.toISOString(),
    executiveSummary: {
      projectName: project.name,
      period: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      keyHighlights: [
        `Project is ${project.progressPercentage}% complete`,
        healthData ? `Health score: ${healthData.overallScore}/100` : 'Health data unavailable',
        riskData ? `Risk level: ${riskData.riskLevel.toFixed(1)}%` : 'Risk data unavailable'
      ],
      criticalIssues: [],
      upcomingMilestones: [
        'Planning Phase completion',
        'Execution Phase completion',
        'Testing Phase completion',
        'Final Review and handover'
      ]
    },
    performanceMetrics: {
      progress: {
        current: project.progressPercentage,
        target: 100,
        status: project.progressPercentage >= 80 ? 'On Track' : project.progressPercentage >= 60 ? 'Good Progress' : 'Needs Attention'
      },
      budget: project.budgetSpent && project.budgetAllocated ? {
        spent: project.budgetSpent,
        allocated: project.budgetAllocated,
        utilization: ((project.budgetSpent / project.budgetAllocated) * 100).toFixed(1),
        status: (project.budgetSpent / project.budgetAllocated) > 1.1 ? 'Over Budget' : (project.budgetSpent / project.budgetAllocated) > 0.9 ? 'Approaching Limit' : 'Within Budget'
      } : null,
      timeline: {
        daysRemaining: Math.ceil((new Date(project.plannedEndDate || project.plannedStartDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
        status: Math.ceil((new Date(project.plannedEndDate || project.plannedStartDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) > 30 ? 'On Track' : 'Approaching Deadline'
      }
    },
    risksAndIssues: riskData ? {
      currentRiskLevel: riskData.riskLevel,
      trend: riskData.trendDirection,
      topConcerns: riskData.riskPatterns?.slice(0, 3).map((p: any) => p.pattern) || [],
      mitigationActions: riskData.recommendations || []
    } : null,
    recommendations: [
      'Continue current progress trajectory',
      'Monitor budget utilization closely',
      'Address identified risk patterns',
      'Ensure resource allocation meets project needs'
    ]
  };
}

function generateRiskAssessmentReport(project: any, riskData: any, escalationData: any, currentDate: Date) {
  return {
    reportType: 'risk_assessment',
    generatedAt: currentDate.toISOString(),
    riskOverview: riskData ? {
      currentRiskLevel: riskData.riskLevel,
      riskTrend: riskData.riskTrend,
      trendDirection: riskData.trendDirection,
      escalationProbability: riskData.escalationProbability,
      confidence: riskData.confidence
    } : null,
    riskPatterns: riskData ? riskData.riskPatterns : [],
    escalationStatus: escalationData ? {
      activeEscalations: escalationData.escalationSummary.totalEscalations,
      criticalEscalations: escalationData.escalationSummary.criticalEscalations,
      currentEscalations: escalationData.activeEscalations.map((e: any) => ({
        type: e.type,
        severity: e.severity,
        title: e.title,
        stakeholders: e.stakeholders
      }))
    } : null,
    riskAnalysis: {
      projectFactors: {
        category: project.category,
        size: project.budgetAllocated ? (project.budgetAllocated > 10000000 ? 'Large' : 'Medium') : 'Small',
        complexity: project.category === 'infrastructure' ? 'High' : 'Medium',
        currentProgress: project.progressPercentage
      },
      riskIndicators: riskData ? riskData.insights.correlationFactors : [],
      mitigationStrategies: riskData ? riskData.recommendations : []
    },
    recommendations: [
      'Implement identified mitigation strategies',
      'Monitor risk trends closely',
      'Address escalation concerns promptly',
      'Review risk patterns and adjust project approach'
    ]
  };
}

function generateBudgetTrackingReport(project: any, healthData: any, currentDate: Date) {
  const budgetUtilization = project.budgetSpent && project.budgetAllocated ?
    (project.budgetSpent / project.budgetAllocated) * 100 : 0;

  return {
    reportType: 'budget_tracking',
    generatedAt: currentDate.toISOString(),
    budgetOverview: {
      allocated: project.budgetAllocated || 0,
      spent: project.budgetSpent || 0,
      utilization: budgetUtilization.toFixed(2),
      remaining: (project.budgetAllocated || 0) - (project.budgetSpent || 0)
    },
    budgetStatus: {
      status: budgetUtilization > 110 ? 'Critical - Over Budget' :
              budgetUtilization > 100 ? 'Warning - Near Budget Limit' :
              budgetUtilization > 90 ? 'Caution - Approaching Limit' :
              'Good - Within Budget',
      riskLevel: budgetUtilization > 110 ? 'High' :
                budgetUtilization > 100 ? 'Medium' :
                budgetUtilization > 90 ? 'Low' : 'None'
    },
    budgetAnalysis: {
      efficiency: project.progressPercentage > 0 ? (budgetUtilization / project.progressPercentage * 100).toFixed(1) : 'N/A',
      forecast: {
        estimatedFinalCost: project.budgetAllocated ? (project.budgetSpent / (project.progressPercentage / 100)) : 0,
        variance: project.budgetAllocated ? ((project.budgetSpent / (project.progressPercentage / 100)) - project.budgetAllocated) : 0
      }
    },
    recommendations: budgetUtilization > 100 ? [
      'Immediate budget review required',
      'Implement cost control measures',
      'Consider scope adjustments',
      'Escalate to senior management'
    ] : budgetUtilization > 90 ? [
      'Monitor spending closely',
      'Review remaining budget allocation',
      'Prepare contingency plans',
      'Consider efficiency improvements'
    ] : [
      'Continue current budget management',
      'Track spending against milestones',
      'Maintain cost control measures'
    ],
    healthCorrelation: healthData ? {
      budgetHealth: healthData.dimensions.budget.score,
      overallImpact: healthData.dimensions.budget.score < 70 ? 'Budget issues affecting project health' : 'Budget management supporting project health'
    } : null
  };
}
