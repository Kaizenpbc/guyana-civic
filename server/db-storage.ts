import { eq, and, desc, asc, sql, ilike, or, lte, gte } from "drizzle-orm";
import { db } from "./db.js";
import {
  users,
  jurisdictions,
  issues,
  announcements,
  employees,
  timesheets,
  timesheetEntries,
  paystubs,
  leaveBalances,
  leaveRequests,
  projects,
} from "../shared/schema.js";
import type {
  User,
  InsertUser,
  Jurisdiction,
  Issue,
  InsertIssue,
  Announcement,
  Employee,
  InsertEmployee,
  Timesheet,
  InsertTimesheet,
  TimesheetEntry,
  InsertTimesheetEntry,
  Paystub,
  InsertPaystub,
  LeaveBalance,
  InsertLeaveBalance,
  LeaveRequest,
  InsertLeaveRequest,
  Project,
  InsertProject,
  EmployeeDirectoryItem,
  DirectoryFilters,
  DirectoryResponse,
  OrgChartNode,
} from "../shared/schema.js";
import type { IStorage } from "./storage.js";
import { randomUUID } from "crypto";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db.insert(users).values({
      id,
      ...insertUser,
      role: insertUser.role || "citizen",
      jurisdictionId: insertUser.jurisdictionId || null,
      isActive: insertUser.isActive ?? true,
      phone: insertUser.phone ?? null,
    }).returning();
    return user;
  }

  // Jurisdiction methods
  async listJurisdictions(): Promise<Jurisdiction[]> {
    return db.select().from(jurisdictions).orderBy(asc(jurisdictions.id));
  }

  async getJurisdiction(id: string): Promise<Jurisdiction | undefined> {
    const [jurisdiction] = await db.select().from(jurisdictions).where(eq(jurisdictions.id, id));
    return jurisdiction;
  }

  // Issue methods
  async listIssues(
    jurisdictionId: string,
    filters?: { status?: string; category?: string; page?: number; limit?: number }
  ): Promise<Issue[]> {
    const conditions = [eq(issues.jurisdictionId, jurisdictionId)];

    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(issues.status, filters.status as any));
    }
    if (filters?.category && filters.category !== "all") {
      conditions.push(eq(issues.category, filters.category as any));
    }

    let query = db.select().from(issues)
      .where(and(...conditions))
      .orderBy(desc(issues.createdAt));

    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      return query.limit(filters.limit).offset(offset);
    }

    return query;
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const id = randomUUID();
    const now = new Date();
    const [issue] = await db.insert(issues).values({
      id,
      ...insertIssue,
      priority: insertIssue.priority || "medium",
      status: insertIssue.status || "submitted",
      assignedToId: insertIssue.assignedToId || null,
      resolutionNotes: insertIssue.resolutionNotes || null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return issue;
  }

  // Announcement methods
  async listAnnouncements(jurisdictionId: string): Promise<Announcement[]> {
    return db.select().from(announcements)
      .where(and(
        eq(announcements.jurisdictionId, jurisdictionId),
        eq(announcements.isActive, true)
      ))
      .orderBy(desc(announcements.createdAt));
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.userId, userId));
    return employee;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const [employee] = await db.insert(employees).values({
      id,
      ...insertEmployee,
      isActive: insertEmployee.isActive ?? true,
      salary: insertEmployee.salary ? Number(insertEmployee.salary) : null,
      managerId: insertEmployee.managerId ?? null,
      employmentType: insertEmployee.employmentType || "salaried",
      hourlyRate: insertEmployee.hourlyRate || null,
      overtimeMultiplier: insertEmployee.overtimeMultiplier || "1.5",
    }).returning();
    return employee;
  }

  // HR Dashboard methods
  async getEmployeeSummary(employeeId: string) {
    const employee = await this.getEmployee(employeeId);
    if (!employee) return undefined;

    const currentTimesheet = await this.getCurrentTimesheet(employeeId);
    const balances = await this.getLeaveBalances(employeeId);
    const recentPaystubs = await this.listPaystubs(employeeId, 3);

    return { employee, currentTimesheet, leaveBalances: balances, recentPaystubs };
  }

  // Timesheet methods
  async getCurrentTimesheet(employeeId: string): Promise<Timesheet | undefined> {
    const [ts] = await db.select().from(timesheets)
      .where(and(eq(timesheets.employeeId, employeeId), eq(timesheets.status, "draft")))
      .orderBy(desc(timesheets.createdAt))
      .limit(1);
    return ts;
  }

  async listTimesheets(employeeId: string, limit = 10): Promise<Timesheet[]> {
    return db.select().from(timesheets)
      .where(eq(timesheets.employeeId, employeeId))
      .orderBy(desc(timesheets.createdAt))
      .limit(limit);
  }

  async createTimesheet(insertTimesheet: InsertTimesheet): Promise<Timesheet> {
    const id = randomUUID();
    const now = new Date();
    const [ts] = await db.insert(timesheets).values({
      id,
      ...insertTimesheet,
      totalHours: insertTimesheet.totalHours || "0.00",
      regularHours: insertTimesheet.regularHours || "0.00",
      overtimeHours: insertTimesheet.overtimeHours || "0.00",
      status: insertTimesheet.status || "draft",
      comments: insertTimesheet.comments || null,
      managerComments: insertTimesheet.managerComments || null,
      locked: insertTimesheet.locked || false,
      submittedAt: insertTimesheet.submittedAt || null,
      approvedAt: insertTimesheet.approvedAt || null,
      approvedById: insertTimesheet.approvedById || null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return ts;
  }

  async updateTimesheet(id: string, updates: Partial<Timesheet>): Promise<Timesheet | undefined> {
    const [updated] = await db.update(timesheets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(timesheets.id, id))
      .returning();
    return updated;
  }

  // Timesheet entries
  async getTimesheetEntries(timesheetId: string): Promise<TimesheetEntry[]> {
    return db.select().from(timesheetEntries)
      .where(eq(timesheetEntries.timesheetId, timesheetId))
      .orderBy(asc(timesheetEntries.workDate));
  }

  async createTimesheetEntry(insertEntry: InsertTimesheetEntry): Promise<TimesheetEntry> {
    const id = randomUUID();
    const [entry] = await db.insert(timesheetEntries).values({
      id,
      ...insertEntry,
      overtimeHours: insertEntry.overtimeHours || "0.00",
      projectId: insertEntry.projectId || null,
      category: insertEntry.category || "field",
      costCenter: insertEntry.costCenter || null,
      notes: insertEntry.notes || null,
      createdAt: new Date(),
    }).returning();
    return entry;
  }

  // Paystub methods
  async listPaystubs(employeeId: string, limit = 10): Promise<Paystub[]> {
    return db.select().from(paystubs)
      .where(eq(paystubs.employeeId, employeeId))
      .orderBy(desc(paystubs.payDate))
      .limit(limit);
  }

  async createPaystub(insertPaystub: InsertPaystub): Promise<Paystub> {
    const id = randomUUID();
    const [ps] = await db.insert(paystubs).values({
      id,
      ...insertPaystub,
      status: insertPaystub.status || "pending",
      federalTax: insertPaystub.federalTax || "0.00",
      stateTax: insertPaystub.stateTax || "0.00",
      socialSecurity: insertPaystub.socialSecurity || "0.00",
      medicare: insertPaystub.medicare || "0.00",
      retirement: insertPaystub.retirement || "0.00",
      healthcare: insertPaystub.healthcare || "0.00",
      otherDeductions: insertPaystub.otherDeductions || "0.00",
      createdAt: new Date(),
    }).returning();
    return ps;
  }

  // Leave methods
  async getLeaveBalances(employeeId: string, year?: number): Promise<LeaveBalance[]> {
    const currentYear = year || new Date().getFullYear();
    return db.select().from(leaveBalances)
      .where(and(
        eq(leaveBalances.employeeId, employeeId),
        eq(leaveBalances.year, currentYear)
      ));
  }

  async createLeaveBalance(insertBalance: InsertLeaveBalance): Promise<LeaveBalance> {
    const id = randomUUID();
    const [balance] = await db.insert(leaveBalances).values({
      id,
      ...insertBalance,
      usedHours: insertBalance.usedHours || "0.00",
      carryoverHours: insertBalance.carryoverHours || "0.00",
      updatedAt: new Date(),
    }).returning();
    return balance;
  }

  async updateLeaveBalance(id: string, updates: Partial<LeaveBalance>): Promise<LeaveBalance | undefined> {
    const [updated] = await db.update(leaveBalances)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leaveBalances.id, id))
      .returning();
    return updated;
  }

  async listLeaveRequests(employeeId: string, limit = 10): Promise<LeaveRequest[]> {
    return db.select().from(leaveRequests)
      .where(eq(leaveRequests.employeeId, employeeId))
      .orderBy(desc(leaveRequests.createdAt))
      .limit(limit);
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = randomUUID();
    const now = new Date();
    const [request] = await db.insert(leaveRequests).values({
      id,
      ...insertRequest,
      status: insertRequest.status || "pending",
      reason: insertRequest.reason || null,
      approvedById: insertRequest.approvedById || null,
      approvedAt: insertRequest.approvedAt || null,
      comments: insertRequest.comments || null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return request;
  }

  // Manager/approval methods
  async listPendingApprovals(managerId: string) {
    const pendingTimesheets = await db.select().from(timesheets)
      .where(eq(timesheets.status, "submitted"));
    const pendingLeaveRequests = await db.select().from(leaveRequests)
      .where(eq(leaveRequests.status, "pending"));
    return { timesheets: pendingTimesheets, leaveRequests: pendingLeaveRequests };
  }

  // Employee Directory methods
  async listEmployees(filters: DirectoryFilters, requesterId: string): Promise<DirectoryResponse> {
    const requesterUser = await this.getUser(requesterId);
    const isAdmin = requesterUser?.role === "admin" || requesterUser?.role === "super_admin";

    // Get all employees joined with users
    const allRows = await db.select({
      employee: employees,
      user: users,
    }).from(employees)
      .innerJoin(users, eq(employees.userId, users.id));

    let items: EmployeeDirectoryItem[] = allRows.map(({ employee, user }) => ({
      id: employee.id,
      employeeId: employee.employeeId,
      fullName: user.fullName,
      department: employee.department,
      position: employee.position,
      role: user.role,
      isActive: employee.isActive,
      email: user.email,
      phone: user.phone ?? undefined,
      hireDate: employee.hireDate.toISOString().split("T")[0],
      salary: isAdmin ? (employee.salary ?? undefined) : undefined,
      managerId: employee.managerId ?? undefined,
      jurisdictionId: employee.jurisdictionId,
    }));

    // Apply filters
    if (filters.status === "active") items = items.filter((i) => i.isActive);
    else if (filters.status === "inactive") items = items.filter((i) => !i.isActive);

    if (filters.query) {
      const q = filters.query.toLowerCase();
      items = items.filter(
        (i) =>
          i.fullName.toLowerCase().includes(q) ||
          i.department.toLowerCase().includes(q) ||
          i.position.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.employeeId.toLowerCase().includes(q)
      );
    }

    if (filters.department) items = items.filter((i) => i.department === filters.department);
    if (filters.role) items = items.filter((i) => i.role === filters.role);

    // Facets
    const deptMap = new Map<string, number>();
    const roleMap = new Map<string, number>();
    const statusMap = new Map<string, number>();
    items.forEach((i) => {
      deptMap.set(i.department, (deptMap.get(i.department) || 0) + 1);
      roleMap.set(i.role, (roleMap.get(i.role) || 0) + 1);
      const s = i.isActive ? "active" : "inactive";
      statusMap.set(s, (statusMap.get(s) || 0) + 1);
    });

    const facets = {
      departments: Array.from(deptMap.entries()).map(([value, count]) => ({ value, count })),
      roles: Array.from(roleMap.entries()).map(([value, count]) => ({ value, count })),
      statuses: Array.from(statusMap.entries()).map(([value, count]) => ({ value, count })),
    };

    // Sort
    items.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case "name": cmp = a.fullName.localeCompare(b.fullName); break;
        case "department": cmp = a.department.localeCompare(b.department); break;
        case "position": cmp = a.position.localeCompare(b.position); break;
        case "hireDate": cmp = new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime(); break;
        default: cmp = a.fullName.localeCompare(b.fullName);
      }
      return filters.sortOrder === "desc" ? -cmp : cmp;
    });

    // Paginate
    const totalCount = items.length;
    const totalPages = Math.ceil(totalCount / filters.limit);
    const start = (filters.page - 1) * filters.limit;
    const paged = items.slice(start, start + filters.limit);

    return { employees: paged, totalCount, page: filters.page, limit: filters.limit, totalPages, facets };
  }

  async getEmployeeWithUser(id: string, requesterId: string): Promise<EmployeeDirectoryItem | undefined> {
    const [row] = await db.select({ employee: employees, user: users })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.id, id));
    if (!row) return undefined;

    const requesterUser = await this.getUser(requesterId);
    const isAdmin = requesterUser?.role === "admin" || requesterUser?.role === "super_admin";

    return {
      id: row.employee.id,
      employeeId: row.employee.employeeId,
      fullName: row.user.fullName,
      department: row.employee.department,
      position: row.employee.position,
      role: row.user.role,
      isActive: row.employee.isActive,
      email: row.user.email,
      phone: row.user.phone ?? undefined,
      hireDate: row.employee.hireDate.toISOString().split("T")[0],
      salary: isAdmin ? (row.employee.salary ?? undefined) : undefined,
      managerId: row.employee.managerId ?? undefined,
      jurisdictionId: row.employee.jurisdictionId,
    };
  }

  async getOrgTree(rootEmployeeId?: string, depth = 3): Promise<OrgChartNode[]> {
    // Fetch all employees + users in one query
    const allRows = await db.select({ employee: employees, user: users })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id));

    const empMap = new Map(allRows.map((r) => [r.employee.id, r]));

    const buildNode = (empId: string, currentDepth: number): OrgChartNode | null => {
      if (currentDepth > depth) return null;
      const row = empMap.get(empId);
      if (!row) return null;

      const children = allRows
        .filter((r) => r.employee.managerId === empId)
        .map((r) => buildNode(r.employee.id, currentDepth + 1))
        .filter((n): n is OrgChartNode => n !== null);

      return {
        id: row.employee.id,
        employeeId: row.employee.employeeId,
        fullName: row.user.fullName,
        position: row.employee.position,
        department: row.employee.department,
        email: row.user.email,
        managerId: row.employee.managerId ?? undefined,
        children,
      };
    };

    if (rootEmployeeId) {
      const node = buildNode(rootEmployeeId, 0);
      return node ? [node] : [];
    }

    return allRows
      .filter((r) => !r.employee.managerId)
      .map((r) => buildNode(r.employee.id, 0))
      .filter((n): n is OrgChartNode => n !== null);
  }

  // Project methods
  async listProjects(jurisdictionId: string, activeOnly = true): Promise<Project[]> {
    const conditions = [eq(projects.jurisdictionId, jurisdictionId)];
    if (activeOnly) conditions.push(eq(projects.active, true));
    return db.select().from(projects).where(and(...conditions)).orderBy(asc(projects.name));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();

    let projectCode = insertProject.code;
    if (!projectCode) {
      projectCode = await this.generateProjectCode(insertProject.jurisdictionId);
    }

    const [project] = await db.insert(projects).values({
      id,
      ...insertProject,
      code: projectCode,
      billable: insertProject.billable ?? false,
      active: insertProject.active ?? true,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return project;
  }

  async generateProjectCode(jurisdictionId: string): Promise<string> {
    const jurisdiction = await this.getJurisdiction(jurisdictionId);
    if (!jurisdiction) throw new Error(`Jurisdiction ${jurisdictionId} not found`);

    let rdcIdentifier = jurisdiction.identifier;
    if (!rdcIdentifier) {
      const match = jurisdiction.name.match(/Region\s*(\d+)/i);
      rdcIdentifier = match ? `RDC${match[1]}` : "RDC1";
    }

    const existing = await db.select().from(projects).where(eq(projects.jurisdictionId, jurisdictionId));
    const nextNumber = existing.length + 1;
    return `${rdcIdentifier}-${nextNumber.toString().padStart(6, "0")}`;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [updated] = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  // Enhanced timesheet management
  async submitTimesheet(id: string, submitterId: string): Promise<Timesheet | undefined> {
    const [ts] = await db.select().from(timesheets).where(eq(timesheets.id, id));
    if (!ts || ts.status !== "draft") return undefined;

    const employee = await this.getEmployeeByUserId(submitterId);
    if (!employee || employee.id !== ts.employeeId) return undefined;

    const totalHours = parseFloat(ts.totalHours);
    const overtimeHours = Math.max(0, totalHours - 40).toFixed(2);
    const regularHours = Math.min(totalHours, 40).toFixed(2);

    const [updated] = await db.update(timesheets).set({
      status: "submitted",
      submittedAt: new Date(),
      regularHours,
      overtimeHours,
      updatedAt: new Date(),
    }).where(eq(timesheets.id, id)).returning();
    return updated;
  }

  async approveTimesheet(id: string, approverId: string, comments?: string): Promise<Timesheet | undefined> {
    const [ts] = await db.select().from(timesheets).where(eq(timesheets.id, id));
    if (!ts || ts.status !== "submitted") return undefined;

    const employee = await this.getEmployee(ts.employeeId);
    const approverEmployee = await this.getEmployeeByUserId(approverId);
    if (!employee || !approverEmployee || employee.managerId !== approverEmployee.id) return undefined;

    const [updated] = await db.update(timesheets).set({
      status: "approved",
      approvedAt: new Date(),
      approvedById: approverId,
      managerComments: comments || null,
      locked: true,
      updatedAt: new Date(),
    }).where(eq(timesheets.id, id)).returning();
    return updated;
  }

  async rejectTimesheet(id: string, approverId: string, comments: string): Promise<Timesheet | undefined> {
    const [ts] = await db.select().from(timesheets).where(eq(timesheets.id, id));
    if (!ts || ts.status !== "submitted") return undefined;

    const employee = await this.getEmployee(ts.employeeId);
    const approverEmployee = await this.getEmployeeByUserId(approverId);
    if (!employee || !approverEmployee || employee.managerId !== approverEmployee.id) return undefined;

    const [updated] = await db.update(timesheets).set({
      status: "rejected",
      approvedAt: new Date(),
      approvedById: approverId,
      managerComments: comments,
      updatedAt: new Date(),
    }).where(eq(timesheets.id, id)).returning();
    return updated;
  }

  async listManagedTimesheets(managerId: string, status?: "submitted" | "approved" | "rejected"): Promise<Timesheet[]> {
    const managerEmployee = await this.getEmployeeByUserId(managerId);
    if (!managerEmployee) return [];

    const managed = await db.select().from(employees).where(eq(employees.managerId, managerEmployee.id));
    const managedIds = managed.map((e) => e.id);
    if (managedIds.length === 0) return [];

    const allTimesheets = await db.select().from(timesheets).orderBy(desc(timesheets.updatedAt));
    return allTimesheets.filter(
      (ts) => managedIds.includes(ts.employeeId) && (!status || ts.status === status)
    );
  }

  async getTimesheetWithDetails(id: string, requesterId: string) {
    const [ts] = await db.select().from(timesheets).where(eq(timesheets.id, id));
    if (!ts) return undefined;

    const employee = await this.getEmployee(ts.employeeId);
    if (!employee) return undefined;

    const requesterEmployee = await this.getEmployeeByUserId(requesterId);
    if (!requesterEmployee) return undefined;

    const isOwner = requesterEmployee.id === employee.id;
    const isManager = employee.managerId === requesterEmployee.id;
    if (!isOwner && !isManager) return undefined;

    const entries = await this.getTimesheetEntries(id);
    const projectsList = await this.listProjects(employee.jurisdictionId);

    return { timesheet: ts, entries, employee, projects: projectsList };
  }

  async getApprovedHours(jurisdictionId: string, startDate: string, endDate: string) {
    const allTimesheets = await db.select().from(timesheets).where(eq(timesheets.status, "approved"));
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = allTimesheets.filter((ts) => {
      const we = new Date(ts.weekEnding);
      return we >= start && we <= end;
    });

    const results: {
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
    }[] = [];

    for (const ts of filtered) {
      const employee = await this.getEmployee(ts.employeeId);
      if (!employee || employee.jurisdictionId !== jurisdictionId) continue;

      const user = await this.getUser(employee.userId);
      if (!user) continue;

      const entries = await this.getTimesheetEntries(ts.id);
      for (const entry of entries) {
        const project = entry.projectId ? await this.getProject(entry.projectId) : null;
        results.push({
          employeeId: employee.employeeId,
          employeeName: user.fullName,
          department: employee.department,
          weekEnding: ts.weekEnding,
          regularHours: ts.regularHours,
          overtimeHours: ts.overtimeHours,
          hourlyRate: employee.hourlyRate,
          overtimeMultiplier: employee.overtimeMultiplier,
          projectCode: project?.code || null,
          projectName: project?.name || null,
          category: entry.category,
        });
      }
    }
    return results;
  }
}
