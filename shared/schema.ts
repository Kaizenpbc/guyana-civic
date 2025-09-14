import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const issueStatusEnum = pgEnum("issue_status", ["submitted", "acknowledged", "in_progress", "resolved", "closed"]);
export const issuePriorityEnum = pgEnum("issue_priority", ["low", "medium", "high", "urgent"]);
export const issueCategoryEnum = pgEnum("issue_category", ["roads", "drainage", "utilities", "waste", "lighting", "parks", "other"]);
export const userRoleEnum = pgEnum("user_role", ["citizen", "staff", "admin", "super_admin"]);
export const timesheetStatusEnum = pgEnum("timesheet_status", ["draft", "submitted", "approved", "rejected"]);
export const leaveTypeEnum = pgEnum("leave_type", ["vacation", "sick", "personal", "bereavement", "maternity", "paternity"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "denied"]);
export const paystubStatusEnum = pgEnum("paystub_status", ["pending", "issued", "corrected"]);

// Tables
export const jurisdictions = pgTable("jurisdictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").default("citizen").notNull(),
  jurisdictionId: varchar("jurisdiction_id").references(() => jurisdictions.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const issues = pgTable("issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: issueCategoryEnum("category").notNull(),
  priority: issuePriorityEnum("priority").default("medium").notNull(),
  status: issueStatusEnum("status").default("submitted").notNull(),
  location: text("location").notNull(),
  citizenId: varchar("citizen_id").references(() => users.id).notNull(),
  jurisdictionId: varchar("jurisdiction_id").references(() => jurisdictions.id).notNull(),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  jurisdictionId: varchar("jurisdiction_id").references(() => jurisdictions.id).notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  employeeId: text("employee_id").notNull().unique(),
  department: text("department").notNull(),
  position: text("position").notNull(),
  salary: integer("salary"),
  hireDate: timestamp("hire_date").notNull(),
  managerId: varchar("manager_id").references((): any => employees.id),
  isActive: boolean("is_active").default(true).notNull(),
  jurisdictionId: varchar("jurisdiction_id").references(() => jurisdictions.id).notNull(),
});

export const timesheets = pgTable("timesheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  weekEnding: date("week_ending").notNull(),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }).default("0").notNull(),
  regularHours: decimal("regular_hours", { precision: 5, scale: 2 }).default("0").notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0").notNull(),
  status: timesheetStatusEnum("status").default("draft").notNull(),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  approvedById: varchar("approved_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const timesheetEntries = pgTable("timesheet_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timesheetId: varchar("timesheet_id").references(() => timesheets.id).notNull(),
  workDate: date("work_date").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 4, scale: 2 }).notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 4, scale: 2 }).default("0").notNull(),
  project: text("project"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paystubs = pgTable("paystubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  payPeriodStart: date("pay_period_start").notNull(),
  payPeriodEnd: date("pay_period_end").notNull(),
  payDate: date("pay_date").notNull(),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  federalTax: decimal("federal_tax", { precision: 10, scale: 2 }).default("0").notNull(),
  stateTax: decimal("state_tax", { precision: 10, scale: 2 }).default("0").notNull(),
  socialSecurity: decimal("social_security", { precision: 10, scale: 2 }).default("0").notNull(),
  medicare: decimal("medicare", { precision: 10, scale: 2 }).default("0").notNull(),
  retirement: decimal("retirement", { precision: 10, scale: 2 }).default("0").notNull(),
  healthcare: decimal("healthcare", { precision: 10, scale: 2 }).default("0").notNull(),
  otherDeductions: decimal("other_deductions", { precision: 10, scale: 2 }).default("0").notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  status: paystubStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveBalances = pgTable("leave_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  totalAllowed: decimal("total_allowed", { precision: 5, scale: 2 }).notNull(),
  usedHours: decimal("used_hours", { precision: 5, scale: 2 }).default("0").notNull(),
  remainingHours: decimal("remaining_hours", { precision: 5, scale: 2 }).notNull(),
  carryoverHours: decimal("carryover_hours", { precision: 5, scale: 2 }).default("0").notNull(),
  year: integer("year").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  hoursRequested: decimal("hours_requested", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  status: leaveStatusEnum("status").default("pending").notNull(),
  approvedById: varchar("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertJurisdictionSchema = createInsertSchema(jurisdictions).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimesheetEntrySchema = createInsertSchema(timesheetEntries).omit({
  id: true,
  createdAt: true,
});

export const insertPaystubSchema = createInsertSchema(paystubs).omit({
  id: true,
  createdAt: true,
});

export const insertLeaveBalanceSchema = createInsertSchema(leaveBalances).omit({
  id: true,
  updatedAt: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Employee Directory Schemas
export const directoryFiltersSchema = z.object({
  query: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(["citizen", "staff", "admin", "super_admin"]).optional(),
  status: z.enum(["active", "inactive", "all"]).default("active"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(["name", "department", "position", "hireDate"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type DirectoryFilters = z.infer<typeof directoryFiltersSchema>;

// Employee Directory Item (flattened join of employee + user data)
export type EmployeeDirectoryItem = {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  position: string;
  role: "citizen" | "staff" | "admin" | "super_admin";
  isActive: boolean;
  email: string;
  phone?: string;
  hireDate: string;
  salary?: number; // Only visible to admins
  managerId?: string;
  jurisdictionId: string;
};

// Organizational Chart Types
export type OrgChartNode = {
  id: string;
  employeeId: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  managerId?: string;
  children: OrgChartNode[];
};

export type DirectoryFacets = {
  departments: { value: string; count: number }[];
  roles: { value: string; count: number }[];
  statuses: { value: string; count: number }[];
};

export type DirectoryResponse = {
  employees: EmployeeDirectoryItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: DirectoryFacets;
};

// Types
export type InsertJurisdiction = z.infer<typeof insertJurisdictionSchema>;
export type Jurisdiction = typeof jurisdictions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;
export type Timesheet = typeof timesheets.$inferSelect;

export type InsertTimesheetEntry = z.infer<typeof insertTimesheetEntrySchema>;
export type TimesheetEntry = typeof timesheetEntries.$inferSelect;

export type InsertPaystub = z.infer<typeof insertPaystubSchema>;
export type Paystub = typeof paystubs.$inferSelect;

export type InsertLeaveBalance = z.infer<typeof insertLeaveBalanceSchema>;
export type LeaveBalance = typeof leaveBalances.$inferSelect;

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;