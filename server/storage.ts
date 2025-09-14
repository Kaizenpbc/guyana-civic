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
  type InsertLeaveRequest
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private employees: Map<string, Employee>;
  private timesheets: Map<string, Timesheet>;
  private timesheetEntries: Map<string, TimesheetEntry>;
  private paystubs: Map<string, Paystub>;
  private leaveBalances: Map<string, LeaveBalance>;
  private leaveRequests: Map<string, LeaveRequest>;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.timesheets = new Map();
    this.timesheetEntries = new Map();
    this.paystubs = new Map();
    this.leaveBalances = new Map();
    this.leaveRequests = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: "user-1",
      username: "jdoe",
      email: "john.doe@city.gov",
      fullName: "John Doe",
      role: "staff",
      jurisdictionId: "jurisdiction-1",
      isActive: true,
      createdAt: new Date()
    };
    this.users.set(sampleUser.id, sampleUser);
    
    // Create sample employee
    const sampleEmployee: Employee = {
      id: "employee-1",
      userId: "user-1",
      employeeId: "EMP001",
      department: "Public Works",
      position: "Senior Engineer",
      salary: 75000,
      hireDate: new Date("2020-01-15"),
      isActive: true,
      jurisdictionId: "jurisdiction-1"
    };
    this.employees.set(sampleEmployee.id, sampleEmployee);
    
    // Create sample current timesheet
    const currentDate = new Date();
    const weekEnding = new Date(currentDate);
    weekEnding.setDate(currentDate.getDate() + (7 - currentDate.getDay()));
    
    const sampleTimesheet: Timesheet = {
      id: "timesheet-1",
      employeeId: "employee-1",
      weekEnding: weekEnding.toISOString().split('T')[0],
      totalHours: "32.00",
      regularHours: "32.00",
      overtimeHours: "0.00",
      status: "draft",
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
      isActive: insertUser.isActive ?? true
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
      isActive: insertEmployee.isActive ?? true,
      salary: insertEmployee.salary ?? null
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
      project: insertEntry.project || null,
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
}

export const storage = new MemStorage();
