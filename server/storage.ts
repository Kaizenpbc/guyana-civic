import { 
  type User, 
  type InsertUser,
  type Employee,
  type InsertEmployee,
  type Timesheet,
  type InsertTimesheet,
  type TimesheetEntry,
  type InsertTimesheetEntry,
  type Paystub,
  type InsertPaystub,
  type LeaveBalance,
  type InsertLeaveBalance,
  type LeaveRequest,
  type InsertLeaveRequest,
  type EmployeeDirectoryItem,
  type DirectoryFilters,
  type DirectoryResponse,
  type OrgChartNode,
  type Project,
  type InsertProject,
  type Jurisdiction,
  type InsertJurisdiction,
  type Issue,
  type InsertIssue,
  type Announcement,
  type InsertAnnouncement
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Jurisdiction methods
  listJurisdictions(): Promise<Jurisdiction[]>;
  getJurisdiction(id: string): Promise<Jurisdiction | undefined>;
  
  // Issue methods
  listIssues(jurisdictionId: string, filters?: { status?: string; category?: string; page?: number; limit?: number }): Promise<Issue[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  
  // Announcement methods
  listAnnouncements(jurisdictionId: string): Promise<Announcement[]>;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employee methods
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByUserId(userId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  
  // HR Dashboard methods
  getEmployeeSummary(employeeId: string): Promise<{
    employee: Employee;
    currentTimesheet?: Timesheet;
    leaveBalances: LeaveBalance[];
    recentPaystubs: Paystub[];
  } | undefined>;
  
  // Timesheet methods
  getCurrentTimesheet(employeeId: string): Promise<Timesheet | undefined>;
  listTimesheets(employeeId: string, limit?: number): Promise<Timesheet[]>;
  createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet>;
  updateTimesheet(id: string, updates: Partial<Timesheet>): Promise<Timesheet | undefined>;
  
  // Timesheet entries
  getTimesheetEntries(timesheetId: string): Promise<TimesheetEntry[]>;
  createTimesheetEntry(entry: InsertTimesheetEntry): Promise<TimesheetEntry>;
  
  // Paystub methods
  listPaystubs(employeeId: string, limit?: number): Promise<Paystub[]>;
  createPaystub(paystub: InsertPaystub): Promise<Paystub>;
  
  // Leave methods
  getLeaveBalances(employeeId: string, year?: number): Promise<LeaveBalance[]>;
  createLeaveBalance(balance: InsertLeaveBalance): Promise<LeaveBalance>;
  updateLeaveBalance(id: string, updates: Partial<LeaveBalance>): Promise<LeaveBalance | undefined>;
  
  listLeaveRequests(employeeId: string, limit?: number): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  
  // Manager/approval methods
  listPendingApprovals(managerId: string): Promise<{
    timesheets: Timesheet[];
    leaveRequests: LeaveRequest[];
  }>;

  // Employee Directory methods
  listEmployees(filters: DirectoryFilters, requesterId: string): Promise<DirectoryResponse>;
  getEmployeeWithUser(id: string, requesterId: string): Promise<EmployeeDirectoryItem | undefined>;
  getOrgTree(rootEmployeeId?: string, depth?: number): Promise<OrgChartNode[]>;

  // Project management methods
  listProjects(jurisdictionId: string, activeOnly?: boolean): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;

  // Enhanced timesheet management methods
  submitTimesheet(id: string, submitterId: string): Promise<Timesheet | undefined>;
  approveTimesheet(id: string, approverId: string, comments?: string): Promise<Timesheet | undefined>;
  rejectTimesheet(id: string, approverId: string, comments: string): Promise<Timesheet | undefined>;
  listManagedTimesheets(managerId: string, status?: "submitted" | "approved" | "rejected"): Promise<Timesheet[]>;
  getTimesheetWithDetails(id: string, requesterId: string): Promise<{
    timesheet: Timesheet;
    entries: TimesheetEntry[];
    employee: Employee;
    projects: Project[];
  } | undefined>;

  // Payroll export methods
  getApprovedHours(jurisdictionId: string, startDate: string, endDate: string): Promise<{
    employeeId: string;
    employeeName: string;
    department: string;
    weekEnding: string;
    regularHours: string;
    overtimeHours: string;
    hourlyRate: string | null;
    overtimeMultiplier: string;
    projectCode: string | null;
    projectName: string | null;
    category: "admin" | "field" | "training";
  }[]>;
}

export class MemStorage implements IStorage {
  private jurisdictions: Map<string, Jurisdiction>;
  private issues: Map<string, Issue>;
  private announcements: Map<string, Announcement>;
  private users: Map<string, User>;
  private employees: Map<string, Employee>;
  private timesheets: Map<string, Timesheet>;
  private timesheetEntries: Map<string, TimesheetEntry>;
  private paystubs: Map<string, Paystub>;
  private leaveBalances: Map<string, LeaveBalance>;
  private leaveRequests: Map<string, LeaveRequest>;
  private projects: Map<string, Project>;

  constructor() {
    this.jurisdictions = new Map();
    this.issues = new Map();
    this.announcements = new Map();
    this.users = new Map();
    this.employees = new Map();
    this.timesheets = new Map();
    this.timesheetEntries = new Map();
    this.paystubs = new Map();
    this.leaveBalances = new Map();
    this.leaveRequests = new Map();
    this.projects = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Create Guyanese RDCs (Regional Democratic Councils)
    const jurisdictions: Jurisdiction[] = [
      {
        id: "region-1",
        identifier: "RDC1",
        name: "Barima-Waini (Region 1)",
        description: "Northernmost region managing Mabaruma and surrounding areas, focusing on agriculture, mining, and border services.",
        contactEmail: "info@region1.gov.gy",
        contactPhone: "+592 777-1234",
        address: "Regional Democratic Council, Mabaruma, Region 1",
        createdAt: new Date()
      },
      {
        id: "region-2",
        identifier: "RDC2",
        name: "Pomeroon-Supenaam (Region 2)",
        description: "Coastal region managing Anna Regina and surrounding areas, specializing in rice farming and coastal development.",
        contactEmail: "info@region2.gov.gy",
        contactPhone: "+592 777-1235",
        address: "Regional Democratic Council, Anna Regina, Region 2",
        createdAt: new Date()
      },
      {
        id: "region-3",
        identifier: "RDC3",
        name: "Essequibo Islands-West Demerara (Region 3)",
        description: "Strategic region managing Vreed-en-Hoop and Essequibo Islands, focusing on transportation and industrial development.",
        contactEmail: "info@region3.gov.gy",
        contactPhone: "+592 777-1236",
        address: "Regional Democratic Council, Vreed-en-Hoop, Region 3",
        createdAt: new Date()
      },
      {
        id: "region-4",
        identifier: "RDC4",
        name: "Demerara-Mahaica (Region 4)",
        description: "Capital region managing Georgetown and surrounding areas, providing central government services and urban development.",
        contactEmail: "info@region4.gov.gy",
        contactPhone: "+592 777-1237",
        address: "Regional Democratic Council, Georgetown, Region 4",
        createdAt: new Date()
      },
      {
        id: "region-5",
        identifier: "RDC5",
        name: "Mahaica-Berbice (Region 5)",
        description: "Agricultural region managing Fort Wellington and surrounding areas, specializing in sugar production and rural development.",
        contactEmail: "info@region5.gov.gy",
        contactPhone: "+592 777-1238",
        address: "Regional Democratic Council, Fort Wellington, Region 5",
        createdAt: new Date()
      },
      {
        id: "region-6",
        identifier: "RDC6",
        name: "East Berbice-Corentyne (Region 6)",
        description: "Eastern region managing New Amsterdam and surrounding areas, focusing on agriculture, education, and border services.",
        contactEmail: "info@region6.gov.gy",
        contactPhone: "+592 777-1239",
        address: "Regional Democratic Council, New Amsterdam, Region 6",
        createdAt: new Date()
      },
      {
        id: "region-7",
        identifier: "RDC7",
        name: "Cuyuni-Mazaruni (Region 7)",
        description: "Mining region managing Bartica and surrounding areas, specializing in gold mining, forestry, and eco-tourism.",
        contactEmail: "info@region7.gov.gy",
        contactPhone: "+592 777-1240",
        address: "Regional Democratic Council, Bartica, Region 7",
        createdAt: new Date()
      },
      {
        id: "region-8",
        identifier: "RDC8",
        name: "Potaro-Siparuni (Region 8)",
        description: "Interior region managing Mahdia and surrounding areas, focusing on mining, forestry, and indigenous community development.",
        contactEmail: "info@region8.gov.gy",
        contactPhone: "+592 777-1241",
        address: "Regional Democratic Council, Mahdia, Region 8",
        createdAt: new Date()
      },
      {
        id: "region-9",
        identifier: "RDC9",
        name: "Upper Takutu-Upper Essequibo (Region 9)",
        description: "Southern region managing Lethem and surrounding areas, specializing in ranching, agriculture, and border trade.",
        contactEmail: "info@region9.gov.gy",
        contactPhone: "+592 777-1242",
        address: "Regional Democratic Council, Lethem, Region 9",
        createdAt: new Date()
      },
      {
        id: "region-10",
        identifier: "RDC10",
        name: "Upper Demerara-Berbice (Region 10)",
        description: "Industrial region managing Linden and surrounding areas, focusing on bauxite mining, manufacturing, and urban development.",
        contactEmail: "info@region10.gov.gy",
        contactPhone: "+592 777-1243",
        address: "Regional Democratic Council, Linden, Region 10",
        createdAt: new Date()
      }
    ];
    jurisdictions.forEach(jurisdiction => this.jurisdictions.set(jurisdiction.id, jurisdiction));

    // Migrate any existing jurisdictions to have identifiers
    this.migrateJurisdictionsWithIdentifiers();

    // Create sample issues
    const issues: Issue[] = [
      {
        id: "issue-1",
        title: "Pothole on Main Street causing traffic delays",
        description: "Large pothole near the intersection of Main Street and Oak Avenue is causing significant traffic delays and potential vehicle damage.",
        category: "roads",
        priority: "high",
        status: "in_progress",
        location: "Main Street & Oak Avenue",
        citizenId: "citizen-1",
        jurisdictionId: "metro-central",
        assignedToId: "user-1",
        resolutionNotes: null,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15")
      },
      {
        id: "issue-2",
        title: "Street light outage in residential area",
        description: "Multiple street lights are out on Elm Street, creating safety concerns for evening pedestrians.",
        category: "lighting",
        priority: "medium",
        status: "acknowledged",
        location: "Elm Street (100-200 block)",
        citizenId: "citizen-2",
        jurisdictionId: "metro-central",
        assignedToId: null,
        resolutionNotes: null,
        createdAt: new Date("2024-01-12"),
        updatedAt: new Date("2024-01-12")
      },
      {
        id: "issue-3",
        title: "Drainage system backup after heavy rain",
        description: "Storm drain near the community center is backing up during heavy rain, causing flooding.",
        category: "drainage",
        priority: "urgent",
        status: "submitted",
        location: "Community Center Parking Area",
        citizenId: "citizen-3",
        jurisdictionId: "metro-central",
        assignedToId: null,
        resolutionNotes: null,
        createdAt: new Date("2024-01-18"),
        updatedAt: new Date("2024-01-18")
      }
    ];
    issues.forEach(issue => this.issues.set(issue.id, issue));

    // Create sample announcements
    const announcements: Announcement[] = [
      {
        id: "ann-1",
        title: "Road Maintenance Schedule - Main Street",
        content: "Main Street will undergo scheduled maintenance from January 25-27. Traffic will be diverted through Oak Avenue during construction hours.",
        jurisdictionId: "metro-central",
        authorId: "user-2",
        isActive: true,
        createdAt: new Date("2024-01-20")
      },
      {
        id: "ann-2",
        title: "Community Meeting - February Budget Planning",
        content: "Join us for the annual budget planning meeting on February 15th at 7 PM in the Community Center.",
        jurisdictionId: "metro-central",
        authorId: "user-2",
        isActive: true,
        createdAt: new Date("2024-01-18")
      }
    ];
    announcements.forEach(announcement => this.announcements.set(announcement.id, announcement));

    // Create sample users
    const users: User[] = [
      {
        id: "user-1",
        username: "jdoe",
        email: "john.doe@city.gov",
        fullName: "John Doe",
        phone: "+1 (555) 123-4567",
        role: "staff",
        jurisdictionId: "jurisdiction-1",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "user-2",
        username: "ssmith",
        email: "sarah.smith@city.gov",
        fullName: "Sarah Smith",
        phone: "+1 (555) 234-5678",
        role: "admin",
        jurisdictionId: "jurisdiction-1",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "user-3",
        username: "mwilson",
        email: "mike.wilson@city.gov",
        fullName: "Mike Wilson",
        phone: "+1 (555) 345-6789",
        role: "staff",
        jurisdictionId: "jurisdiction-1",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "user-4",
        username: "ljohnson",
        email: "lisa.johnson@city.gov",
        fullName: "Lisa Johnson",
        phone: "+1 (555) 456-7890",
        role: "staff",
        jurisdictionId: "jurisdiction-1",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "user-5",
        username: "rbrown",
        email: "robert.brown@city.gov",
        fullName: "Robert Brown",
        phone: "+1 (555) 567-8901",
        role: "staff",
        jurisdictionId: "jurisdiction-1",
        isActive: false,
        createdAt: new Date()
      },
      {
        id: "user-6",
        username: "PM",
        email: "pm@city.gov",
        fullName: "Project Manager",
        phone: "+1 (555) 678-9012",
        role: "pm",
        jurisdictionId: "region-2",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "user-7",
        username: "rdc_manager",
        email: "rdc@region2.gov.gy",
        fullName: "RDC Senior Manager",
        phone: "+592 777-5678",
        role: "rdc_manager",
        jurisdictionId: "region-2",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "user-8",
        username: "minister",
        email: "minister@gov.gy",
        fullName: "Minister of Public Works",
        phone: "+592 226-1234",
        role: "minister",
        jurisdictionId: null,
        isActive: true,
        createdAt: new Date()
      }
    ];

    users.forEach(user => this.users.set(user.id, user));
    
    // Create sample employees with hierarchy
    const employees: Employee[] = [
      {
        id: "employee-1",
        userId: "user-1",
        employeeId: "EMP001",
        department: "Public Works",
        position: "Senior Engineer",
        salary: 75000,
        employmentType: "hourly",
        hourlyRate: "36.06",
        overtimeMultiplier: "1.5",
        hireDate: new Date("2020-01-15"),
        managerId: "employee-2", // Reports to Sarah Smith
        isActive: true,
        jurisdictionId: "jurisdiction-1"
      },
      {
        id: "employee-2",
        userId: "user-2",
        employeeId: "EMP002",
        department: "Public Works",
        position: "Director of Public Works",
        salary: 95000,
        employmentType: "salaried",
        hourlyRate: null,
        overtimeMultiplier: "1.5",
        hireDate: new Date("2018-03-10"),
        managerId: null, // Top level
        isActive: true,
        jurisdictionId: "jurisdiction-1"
      },
      {
        id: "employee-3",
        userId: "user-3",
        employeeId: "EMP003",
        department: "Human Resources",
        position: "HR Specialist",
        salary: 55000,
        employmentType: "hourly",
        hourlyRate: "26.44",
        overtimeMultiplier: "1.5",
        hireDate: new Date("2021-06-20"),
        managerId: "employee-4", // Reports to Lisa Johnson
        isActive: true,
        jurisdictionId: "jurisdiction-1"
      },
      {
        id: "employee-4",
        userId: "user-4",
        employeeId: "EMP004",
        department: "Human Resources",
        position: "HR Manager",
        salary: 72000,
        employmentType: "salaried",
        hourlyRate: null,
        overtimeMultiplier: "1.5",
        hireDate: new Date("2019-09-15"),
        managerId: null, // Top level
        isActive: true,
        jurisdictionId: "jurisdiction-1"
      },
      {
        id: "employee-5",
        userId: "user-5",
        employeeId: "EMP005",
        department: "Finance",
        position: "Accountant",
        salary: 58000,
        employmentType: "salaried",
        hourlyRate: null,
        overtimeMultiplier: "1.5",
        hireDate: new Date("2017-11-30"),
        managerId: null, // Was top level but now inactive
        isActive: false,
        jurisdictionId: "jurisdiction-1"
      }
    ];

    employees.forEach(employee => this.employees.set(employee.id, employee));

    // Create sample projects
    const projects: Project[] = [
      {
        id: "project-1",
        code: "PW-ROADS-2025",
        name: "Road Maintenance 2025",
        department: "Public Works",
        billable: false,
        active: true,
        jurisdictionId: "jurisdiction-1",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "project-2",
        code: "PW-WATER-2025",
        name: "Water Infrastructure",
        department: "Public Works",
        billable: true,
        active: true,
        jurisdictionId: "jurisdiction-1",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "project-3",
        code: "HR-TRAINING-2025",
        name: "Employee Training Program",
        department: "Human Resources",
        billable: false,
        active: true,
        jurisdictionId: "jurisdiction-1",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    projects.forEach(project => this.projects.set(project.id, project));

    // Use the first employee for timesheet data
    const sampleEmployee = employees[0];
    
    // Create sample current timesheet
    const currentDate = new Date();
    const weekEnding = new Date(currentDate);
    weekEnding.setDate(currentDate.getDate() + (7 - currentDate.getDay()));
    
    const periodStart = new Date(weekEnding);
    periodStart.setDate(weekEnding.getDate() - 6);
    
    const sampleTimesheet: Timesheet = {
      id: "timesheet-1",
      employeeId: "employee-1",
      weekEnding: weekEnding.toISOString().split('T')[0],
      periodStart: periodStart.toISOString().split('T')[0],
      totalHours: "32.00",
      regularHours: "32.00",
      overtimeHours: "0.00",
      status: "draft",
      comments: null,
      managerComments: null,
      locked: false,
      submittedAt: null,
      approvedAt: null,
      approvedById: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.timesheets.set(sampleTimesheet.id, sampleTimesheet);
    
    // Create sample leave balances
    const currentYear = new Date().getFullYear();
    const leaveTypes = ["vacation", "sick", "personal"] as const;
    leaveTypes.forEach((type, index) => {
      const balance: LeaveBalance = {
        id: `balance-${index + 1}`,
        employeeId: "employee-1",
        leaveType: type,
        totalAllowed: type === "vacation" ? "120.00" : type === "sick" ? "80.00" : "40.00",
        usedHours: type === "vacation" ? "24.00" : "8.00",
        remainingHours: type === "vacation" ? "96.00" : type === "sick" ? "72.00" : "40.00",
        carryoverHours: "0.00",
        year: currentYear,
        updatedAt: new Date()
      };
      this.leaveBalances.set(balance.id, balance);
    });
    
    // Create sample paystub
    const payPeriodStart = new Date();
    payPeriodStart.setDate(1);
    const payPeriodEnd = new Date();
    payPeriodEnd.setDate(15);
    
    const samplePaystub: Paystub = {
      id: "paystub-1",
      employeeId: "employee-1",
      payPeriodStart: payPeriodStart.toISOString().split('T')[0],
      payPeriodEnd: payPeriodEnd.toISOString().split('T')[0],
      payDate: new Date().toISOString().split('T')[0],
      grossPay: "2884.62",
      federalTax: "432.69",
      stateTax: "173.08",
      socialSecurity: "178.85",
      medicare: "41.83",
      retirement: "144.23",
      healthcare: "250.00",
      otherDeductions: "0.00",
      netPay: "1663.94",
      status: "issued",
      createdAt: new Date()
    };
    this.paystubs.set(samplePaystub.id, samplePaystub);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id, 
      createdAt: new Date(),
      role: insertUser.role || "citizen",
      jurisdictionId: insertUser.jurisdictionId || null,
      isActive: insertUser.isActive ?? true,
      phone: insertUser.phone ?? null
    };
    this.users.set(id, user);
    return user;
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.userId === userId);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = { 
      ...insertEmployee,
      id,
      isActive: Boolean(insertEmployee.isActive ?? true),
      salary: insertEmployee.salary ? Number(insertEmployee.salary) : null,
      managerId: insertEmployee.managerId ?? null,
      employmentType: insertEmployee.employmentType || "salaried",
      hourlyRate: insertEmployee.hourlyRate || null,
      overtimeMultiplier: insertEmployee.overtimeMultiplier || "1.5"
    };
    this.employees.set(id, employee);
    return employee;
  }

  // HR Dashboard methods
  async getEmployeeSummary(employeeId: string): Promise<{
    employee: Employee;
    currentTimesheet?: Timesheet;
    leaveBalances: LeaveBalance[];
    recentPaystubs: Paystub[];
  } | undefined> {
    const employee = await this.getEmployee(employeeId);
    if (!employee) return undefined;

    const currentTimesheet = await this.getCurrentTimesheet(employeeId);
    const leaveBalances = await this.getLeaveBalances(employeeId);
    const recentPaystubs = await this.listPaystubs(employeeId, 3);

    return {
      employee,
      currentTimesheet,
      leaveBalances,
      recentPaystubs
    };
  }

  // Timesheet methods
  async getCurrentTimesheet(employeeId: string): Promise<Timesheet | undefined> {
    const timesheets = Array.from(this.timesheets.values())
      .filter(ts => ts.employeeId === employeeId && ts.status === "draft")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return timesheets[0];
  }

  async listTimesheets(employeeId: string, limit = 10): Promise<Timesheet[]> {
    return Array.from(this.timesheets.values())
      .filter(ts => ts.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createTimesheet(insertTimesheet: InsertTimesheet): Promise<Timesheet> {
    const id = randomUUID();
    const now = new Date();
    const timesheet: Timesheet = { 
      ...insertTimesheet,
      id, 
      createdAt: now, 
      updatedAt: now,
      totalHours: insertTimesheet.totalHours || "0.00",
      regularHours: insertTimesheet.regularHours || "0.00",
      overtimeHours: insertTimesheet.overtimeHours || "0.00",
      status: insertTimesheet.status || "draft",
      comments: insertTimesheet.comments || null,
      managerComments: insertTimesheet.managerComments || null,
      locked: insertTimesheet.locked || false,
      submittedAt: insertTimesheet.submittedAt || null,
      approvedAt: insertTimesheet.approvedAt || null,
      approvedById: insertTimesheet.approvedById || null
    };
    this.timesheets.set(id, timesheet);
    return timesheet;
  }

  async updateTimesheet(id: string, updates: Partial<Timesheet>): Promise<Timesheet | undefined> {
    const existing = this.timesheets.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.timesheets.set(id, updated);
    return updated;
  }

  // Timesheet entries
  async getTimesheetEntries(timesheetId: string): Promise<TimesheetEntry[]> {
    return Array.from(this.timesheetEntries.values())
      .filter(entry => entry.timesheetId === timesheetId)
      .sort((a, b) => new Date(a.workDate).getTime() - new Date(b.workDate).getTime());
  }

  async createTimesheetEntry(insertEntry: InsertTimesheetEntry): Promise<TimesheetEntry> {
    const id = randomUUID();
    const entry: TimesheetEntry = { 
      ...insertEntry,
      id, 
      createdAt: new Date(),
      overtimeHours: insertEntry.overtimeHours || "0.00",
      projectId: insertEntry.projectId || null,
      category: insertEntry.category || "field",
      costCenter: insertEntry.costCenter || null,
      notes: insertEntry.notes || null
    };
    this.timesheetEntries.set(id, entry);
    return entry;
  }

  // Paystub methods
  async listPaystubs(employeeId: string, limit = 10): Promise<Paystub[]> {
    return Array.from(this.paystubs.values())
      .filter(ps => ps.employeeId === employeeId)
      .sort((a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime())
      .slice(0, limit);
  }

  async createPaystub(insertPaystub: InsertPaystub): Promise<Paystub> {
    const id = randomUUID();
    const paystub: Paystub = { 
      ...insertPaystub,
      id, 
      createdAt: new Date(),
      status: insertPaystub.status || "pending",
      federalTax: insertPaystub.federalTax || "0.00",
      stateTax: insertPaystub.stateTax || "0.00",
      socialSecurity: insertPaystub.socialSecurity || "0.00",
      medicare: insertPaystub.medicare || "0.00",
      retirement: insertPaystub.retirement || "0.00",
      healthcare: insertPaystub.healthcare || "0.00",
      otherDeductions: insertPaystub.otherDeductions || "0.00"
    };
    this.paystubs.set(id, paystub);
    return paystub;
  }

  // Leave methods
  async getLeaveBalances(employeeId: string, year?: number): Promise<LeaveBalance[]> {
    const currentYear = year || new Date().getFullYear();
    return Array.from(this.leaveBalances.values())
      .filter(lb => lb.employeeId === employeeId && lb.year === currentYear);
  }

  async createLeaveBalance(insertBalance: InsertLeaveBalance): Promise<LeaveBalance> {
    const id = randomUUID();
    const balance: LeaveBalance = { 
      ...insertBalance,
      id, 
      updatedAt: new Date(),
      usedHours: insertBalance.usedHours || "0.00",
      carryoverHours: insertBalance.carryoverHours || "0.00"
    };
    this.leaveBalances.set(id, balance);
    return balance;
  }

  async updateLeaveBalance(id: string, updates: Partial<LeaveBalance>): Promise<LeaveBalance | undefined> {
    const existing = this.leaveBalances.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.leaveBalances.set(id, updated);
    return updated;
  }

  async listLeaveRequests(employeeId: string, limit = 10): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequests.values())
      .filter(lr => lr.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = randomUUID();
    const now = new Date();
    const request: LeaveRequest = { 
      ...insertRequest,
      id, 
      createdAt: now, 
      updatedAt: now,
      status: insertRequest.status || "pending",
      reason: insertRequest.reason || null,
      approvedById: insertRequest.approvedById || null,
      approvedAt: insertRequest.approvedAt || null,
      comments: insertRequest.comments || null
    };
    this.leaveRequests.set(id, request);
    return request;
  }

  // Manager/approval methods
  async listPendingApprovals(managerId: string): Promise<{
    timesheets: Timesheet[];
    leaveRequests: LeaveRequest[];
  }> {
    // For now, return all pending items since we don't have manager hierarchy
    const timesheets = Array.from(this.timesheets.values())
      .filter(ts => ts.status === "submitted");
    
    const leaveRequests = Array.from(this.leaveRequests.values())
      .filter(lr => lr.status === "pending");

    return { timesheets, leaveRequests };
  }

  // Employee Directory methods
  async listEmployees(filters: DirectoryFilters, requesterId: string): Promise<DirectoryResponse> {
    const requesterUser = this.users.get(requesterId);
    const isAdmin = requesterUser?.role === "admin" || requesterUser?.role === "super_admin";

    // Get all employees with user data
    const allEmployeeItems: EmployeeDirectoryItem[] = [];
    
    Array.from(this.employees.values()).forEach(employee => {
      const user = this.users.get(employee.userId);
      if (!user) return;

      const item: EmployeeDirectoryItem = {
        id: employee.id,
        employeeId: employee.employeeId,
        fullName: user.fullName,
        department: employee.department,
        position: employee.position,
        role: user.role,
        isActive: employee.isActive,
        email: user.email,
        phone: user.phone ?? undefined,
        hireDate: employee.hireDate.toISOString().split('T')[0],
        salary: isAdmin ? (employee.salary ?? undefined) : undefined, // Only show salary to admins
        managerId: employee.managerId ?? undefined,
        jurisdictionId: employee.jurisdictionId,
      };
      allEmployeeItems.push(item);
    });

    // Apply filters
    let filteredItems = allEmployeeItems;

    // Status filter
    if (filters.status === "active") {
      filteredItems = filteredItems.filter(item => item.isActive);
    } else if (filters.status === "inactive") {
      filteredItems = filteredItems.filter(item => !item.isActive);
    }

    // Search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.fullName.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query) ||
        item.position.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.employeeId.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (filters.department) {
      filteredItems = filteredItems.filter(item => item.department === filters.department);
    }

    // Role filter
    if (filters.role) {
      filteredItems = filteredItems.filter(item => item.role === filters.role);
    }

    // Generate facets from all filtered items
    const departments = new Map<string, number>();
    const roles = new Map<string, number>();
    const statuses = new Map<string, number>();

    filteredItems.forEach(item => {
      departments.set(item.department, (departments.get(item.department) || 0) + 1);
      roles.set(item.role, (roles.get(item.role) || 0) + 1);
      statuses.set(item.isActive ? "active" : "inactive", (statuses.get(item.isActive ? "active" : "inactive") || 0) + 1);
    });

    const facets = {
      departments: Array.from(departments.entries()).map(([value, count]) => ({ value, count })),
      roles: Array.from(roles.entries()).map(([value, count]) => ({ value, count })),
      statuses: Array.from(statuses.entries()).map(([value, count]) => ({ value, count })),
    };

    // Sort
    filteredItems.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "name":
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case "department":
          comparison = a.department.localeCompare(b.department);
          break;
        case "position":
          comparison = a.position.localeCompare(b.position);
          break;
        case "hireDate":
          comparison = new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
          break;
        default:
          comparison = a.fullName.localeCompare(b.fullName);
      }
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    // Pagination
    const totalCount = filteredItems.length;
    const totalPages = Math.ceil(totalCount / filters.limit);
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const employees = filteredItems.slice(startIndex, endIndex);

    return {
      employees,
      totalCount,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      facets,
    };
  }

  async getEmployeeWithUser(id: string, requesterId: string): Promise<EmployeeDirectoryItem | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const user = this.users.get(employee.userId);
    if (!user) return undefined;

    const requesterUser = this.users.get(requesterId);
    const isAdmin = requesterUser?.role === "admin" || requesterUser?.role === "super_admin";

    return {
      id: employee.id,
      employeeId: employee.employeeId,
      fullName: user.fullName,
      department: employee.department,
      position: employee.position,
      role: user.role,
      isActive: employee.isActive,
      email: user.email,
      phone: user.phone ?? undefined,
      hireDate: employee.hireDate.toISOString().split('T')[0],
      salary: isAdmin ? (employee.salary ?? undefined) : undefined,
      managerId: employee.managerId ?? undefined,
      jurisdictionId: employee.jurisdictionId,
    };
  }

  async getOrgTree(rootEmployeeId?: string, depth = 3): Promise<OrgChartNode[]> {
    const buildNodeWithChildren = (employeeId: string, currentDepth: number): OrgChartNode | null => {
      if (currentDepth > depth) return null;

      const employee = this.employees.get(employeeId);
      if (!employee) return null;

      const user = this.users.get(employee.userId);
      if (!user) return null;

      // Find direct reports
      const directReports = Array.from(this.employees.values())
        .filter(emp => emp.managerId === employeeId)
        .map(emp => buildNodeWithChildren(emp.id, currentDepth + 1))
        .filter((node): node is OrgChartNode => node !== null);

      return {
        id: employee.id,
        employeeId: employee.employeeId,
        fullName: user.fullName,
        position: employee.position,
        department: employee.department,
        email: user.email,
        managerId: employee.managerId ?? undefined,
        children: directReports,
      };
    };

    if (rootEmployeeId) {
      const rootNode = buildNodeWithChildren(rootEmployeeId, 0);
      return rootNode ? [rootNode] : [];
    }

    // Find top-level employees (those without managers)
    const topLevelEmployees = Array.from(this.employees.values())
      .filter(emp => !emp.managerId)
      .map(emp => buildNodeWithChildren(emp.id, 0))
      .filter((node): node is OrgChartNode => node !== null);

    return topLevelEmployees;
  }

  // Project management methods
  async listProjects(jurisdictionId: string, activeOnly = true): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => 
        project.jurisdictionId === jurisdictionId && 
        (!activeOnly || project.active)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();

    // Generate project code if not provided
    let projectCode = insertProject.code;
    if (!projectCode) {
      projectCode = await this.generateProjectCode(insertProject.jurisdictionId);
    }

    const project: Project = {
      ...insertProject,
      id,
      code: projectCode,
      billable: insertProject.billable ?? false,
      active: insertProject.active ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }

  async generateProjectCode(jurisdictionId: string): Promise<string> {
    // Get jurisdiction details
    const jurisdiction = await this.getJurisdiction(jurisdictionId);
    if (!jurisdiction) {
      throw new Error(`Jurisdiction ${jurisdictionId} not found`);
    }

    // Use the jurisdiction identifier (e.g., "RDC1", "RDC2") or extract from name if not set
    let rdcIdentifier = jurisdiction.identifier;
    if (!rdcIdentifier) {
      // Fallback to parsing from name - should not happen in production
      if (jurisdiction.name.includes("Georgetown")) {
        rdcIdentifier = "RDC1";
      } else if (jurisdiction.name.includes("Region")) {
        const match = jurisdiction.name.match(/Region\s*(\d+)/i);
        if (match) {
          rdcIdentifier = `RDC${match[1]}`;
        } else {
          rdcIdentifier = "RDC1"; // Default
        }
      } else {
        rdcIdentifier = "RDC1"; // Default
      }
    }

    // Count existing projects in this jurisdiction to get next sequential number
    const jurisdictionProjects = Array.from(this.projects.values())
      .filter(p => p.jurisdictionId === jurisdictionId);

    const nextNumber = jurisdictionProjects.length + 1;

    // Format as {rdcIdentifier}-{sequentialNumber}
    return `${rdcIdentifier}-${nextNumber.toString().padStart(6, '0')}`;
  }

  // Migration helper: Update existing jurisdictions with identifiers
  async migrateJurisdictionsWithIdentifiers() {
    for (const [id, jurisdiction] of this.jurisdictions.entries()) {
      if (!jurisdiction.identifier) {
        let identifier = "RDC1"; // Default

        if (jurisdiction.name.includes("Georgetown")) {
          identifier = "RDC1";
        } else if (jurisdiction.name.includes("Region")) {
          const match = jurisdiction.name.match(/Region\s*(\d+)/i);
          if (match) {
            identifier = `RDC${match[1]}`;
          }
        }

        // Update the jurisdiction with the identifier
        const updatedJurisdiction = {
          ...jurisdiction,
          identifier
        };
        this.jurisdictions.set(id, updatedJurisdiction);
      }
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  // Enhanced timesheet management methods
  async submitTimesheet(id: string, submitterId: string): Promise<Timesheet | undefined> {
    const timesheet = this.timesheets.get(id);
    if (!timesheet || timesheet.status !== "draft") return undefined;

    // Verify submitter owns this timesheet
    const employee = await this.getEmployeeByUserId(submitterId);
    if (!employee || employee.id !== timesheet.employeeId) return undefined;

    // Server-side overtime calculation
    const totalHours = parseFloat(timesheet.totalHours);
    const overtimeHours = Math.max(0, totalHours - 40).toFixed(2);
    const regularHours = Math.min(totalHours, 40).toFixed(2);

    const updated = {
      ...timesheet,
      status: "submitted" as const,
      submittedAt: new Date(),
      regularHours,
      overtimeHours,
      updatedAt: new Date()
    };
    
    this.timesheets.set(id, updated);
    return updated;
  }

  async approveTimesheet(id: string, approverId: string, comments?: string): Promise<Timesheet | undefined> {
    const timesheet = this.timesheets.get(id);
    if (!timesheet || timesheet.status !== "submitted") return undefined;

    // Verify approver is manager of the employee
    const employee = await this.getEmployee(timesheet.employeeId);
    const approverEmployee = await this.getEmployeeByUserId(approverId);
    if (!employee || !approverEmployee || employee.managerId !== approverEmployee.id) {
      return undefined;
    }

    const updated = {
      ...timesheet,
      status: "approved" as const,
      approvedAt: new Date(),
      approvedById: approverId,
      managerComments: comments || null,
      locked: true,
      updatedAt: new Date()
    };
    
    this.timesheets.set(id, updated);
    return updated;
  }

  async rejectTimesheet(id: string, approverId: string, comments: string): Promise<Timesheet | undefined> {
    const timesheet = this.timesheets.get(id);
    if (!timesheet || timesheet.status !== "submitted") return undefined;

    // Verify approver is manager of the employee
    const employee = await this.getEmployee(timesheet.employeeId);
    const approverEmployee = await this.getEmployeeByUserId(approverId);
    if (!employee || !approverEmployee || employee.managerId !== approverEmployee.id) {
      return undefined;
    }

    const updated = {
      ...timesheet,
      status: "rejected" as const,
      approvedAt: new Date(),
      approvedById: approverId,
      managerComments: comments,
      updatedAt: new Date()
    };
    
    this.timesheets.set(id, updated);
    return updated;
  }

  async listManagedTimesheets(managerId: string, status?: "submitted" | "approved" | "rejected"): Promise<Timesheet[]> {
    const managerEmployee = await this.getEmployeeByUserId(managerId);
    if (!managerEmployee) return [];

    // Get all employees managed by this manager
    const managedEmployees = Array.from(this.employees.values())
      .filter(emp => emp.managerId === managerEmployee.id);
    
    const managedEmployeeIds = managedEmployees.map(emp => emp.id);
    
    return Array.from(this.timesheets.values())
      .filter(ts => 
        managedEmployeeIds.includes(ts.employeeId) &&
        (!status || ts.status === status)
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getTimesheetWithDetails(id: string, requesterId: string): Promise<{
    timesheet: Timesheet;
    entries: TimesheetEntry[];
    employee: Employee;
    projects: Project[];
  } | undefined> {
    const timesheet = this.timesheets.get(id);
    if (!timesheet) return undefined;

    const employee = await this.getEmployee(timesheet.employeeId);
    if (!employee) return undefined;

    // Check authorization: employee owns it OR manager manages the employee
    const requesterEmployee = await this.getEmployeeByUserId(requesterId);
    if (!requesterEmployee) return undefined;

    const isOwner = requesterEmployee.id === employee.id;
    const isManager = employee.managerId === requesterEmployee.id;
    
    if (!isOwner && !isManager) return undefined;

    const entries = await this.getTimesheetEntries(id);
    const projects = await this.listProjects(employee.jurisdictionId);

    return {
      timesheet,
      entries,
      employee,
      projects
    };
  }

  // Payroll export methods
  async getApprovedHours(jurisdictionId: string, startDate: string, endDate: string): Promise<{
    employeeId: string;
    employeeName: string;
    department: string;
    weekEnding: string;
    regularHours: string;
    overtimeHours: string;
    hourlyRate: string | null;
    overtimeMultiplier: string;
    projectCode: string | null;
    projectName: string | null;
    category: "admin" | "field" | "training";
  }[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get all approved timesheets in date range for jurisdiction
    const approvedTimesheets = Array.from(this.timesheets.values())
      .filter(ts => {
        const weekEnding = new Date(ts.weekEnding);
        return ts.status === "approved" && 
               weekEnding >= start && 
               weekEnding <= end;
      });

    const results = [];
    
    for (const timesheet of approvedTimesheets) {
      const employee = await this.getEmployee(timesheet.employeeId);
      if (!employee || employee.jurisdictionId !== jurisdictionId) continue;

      const user = await this.getUser(employee.userId);
      if (!user) continue;

      const entries = await this.getTimesheetEntries(timesheet.id);
      
      // Group entries by project and category
      for (const entry of entries) {
        const project = entry.projectId ? await this.getProject(entry.projectId) : null;
        
        results.push({
          employeeId: employee.employeeId,
          employeeName: user.fullName,
          department: employee.department,
          weekEnding: timesheet.weekEnding,
          regularHours: timesheet.regularHours,
          overtimeHours: timesheet.overtimeHours,
          hourlyRate: employee.hourlyRate,
          overtimeMultiplier: employee.overtimeMultiplier,
          projectCode: project?.code || null,
          projectName: project?.name || null,
          category: entry.category
        });
      }
    }
    
    return results;
  }

  // Jurisdiction methods
  async listJurisdictions(): Promise<Jurisdiction[]> {
    return Array.from(this.jurisdictions.values())
      .sort((a, b) => {
        // Extract region number from ID (e.g., "region-1" -> 1)
        const aRegion = parseInt(a.id.split('-')[1]);
        const bRegion = parseInt(b.id.split('-')[1]);
        return aRegion - bRegion;
      });
  }

  async getJurisdiction(id: string): Promise<Jurisdiction | undefined> {
    return this.jurisdictions.get(id);
  }

  // Issue methods
  async listIssues(jurisdictionId: string, filters?: { status?: string; category?: string; page?: number; limit?: number }): Promise<Issue[]> {
    let issues = Array.from(this.issues.values())
      .filter(issue => issue.jurisdictionId === jurisdictionId);

    if (filters?.status && filters.status !== "all") {
      issues = issues.filter(issue => issue.status === filters.status);
    }

    if (filters?.category && filters.category !== "all") {
      issues = issues.filter(issue => issue.category === filters.category);
    }

    issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filters?.page && filters?.limit) {
      const startIndex = (filters.page - 1) * filters.limit;
      const endIndex = startIndex + filters.limit;
      issues = issues.slice(startIndex, endIndex);
    }

    return issues;
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const id = randomUUID();
    const now = new Date();
    const issue: Issue = {
      ...insertIssue,
      id,
      createdAt: now,
      updatedAt: now,
      priority: insertIssue.priority || "medium",
      status: insertIssue.status || "submitted",
      assignedToId: insertIssue.assignedToId || null,
      resolutionNotes: insertIssue.resolutionNotes || null
    };
    this.issues.set(id, issue);
    return issue;
  }

  // Announcement methods
  async listAnnouncements(jurisdictionId: string): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .filter(announcement => 
        announcement.jurisdictionId === jurisdictionId && 
        announcement.isActive
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

}

export const storage = new MemStorage();
