import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const issueStatusEnum = pgEnum("issue_status", ["submitted", "acknowledged", "in_progress", "resolved", "closed"]);
export const issuePriorityEnum = pgEnum("issue_priority", ["low", "medium", "high", "urgent"]);
export const issueCategoryEnum = pgEnum("issue_category", ["roads", "drainage", "utilities", "waste", "lighting", "parks", "other"]);
export const userRoleEnum = pgEnum("user_role", ["citizen", "staff", "admin", "super_admin"]);

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
  isActive: boolean("is_active").default(true).notNull(),
  jurisdictionId: varchar("jurisdiction_id").references(() => jurisdictions.id).notNull(),
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