import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("Sales Rep"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  website: text("website"),
  size: text("size"), // e.g., "Series B, 200+ employees"
  revenue: text("revenue"),
  industry: text("industry"),
  techStack: text("tech_stack").array(),
  overview: text("overview"),
  painPoints: text("pain_points").array(),
  competitorsSeen: text("competitors_seen").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  title: text("title"),
  email: text("email"),
  linkedinUrl: text("linkedin_url"),
  phone: text("phone"),
  isDecisionMaker: boolean("is_decision_maker").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // Demo, Discovery, Follow-up, etc.
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // minutes
  attendeeIds: varchar("attendee_ids").array(), // contact IDs
  agenda: text("agenda"),
  notes: text("notes"),
  dealSize: text("deal_size"),
  priority: text("priority").default("Medium"), // High, Medium, Low
  stage: text("stage").default("Discovery"), // Discovery, Demo, Proposal, Closing, etc.
  competitiveSituation: text("competitive_situation"),
  painPoints: text("pain_points").array(),
  opportunityAreas: text("opportunity_areas").array(),
  discoveryQuestions: jsonb("discovery_questions"), // Array of {question, rationale, answered, answer}
  nextSteps: text("next_steps").array(),
  followUpDate: timestamp("follow_up_date"),
  status: text("status").default("Scheduled"), // Scheduled, Completed, Cancelled
  outcome: text("outcome"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const timeBlocks = pgTable("time_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(), // e.g., "09:00"
  endTime: text("end_time").notNull(), // e.g., "10:00"
  type: text("type").notNull(), // Prospecting, Admin, Prep, etc.
  description: text("description"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyGoals = pgTable("daily_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  newProspects: integer("new_prospects").default(5),
  newProspectsCompleted: integer("new_prospects_completed").default(0),
  linkedinConnections: integer("linkedin_connections").default(10),
  linkedinConnectionsCompleted: integer("linkedin_connections_completed").default(0),
  followUpMeetings: integer("follow_up_meetings").default(3),
  followUpMeetingsCompleted: integer("follow_up_meetings_completed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const actionItems = pgTable("action_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  meetingId: varchar("meeting_id").references(() => meetings.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // prep, follow-up, admin
  dueDate: timestamp("due_date"),
  isCompleted: boolean("is_completed").default(false),
  priority: text("priority").default("Medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  meetings: many(meetings),
  timeBlocks: many(timeBlocks),
  dailyGoals: many(dailyGoals),
  actionItems: many(actionItems),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  contacts: many(contacts),
  meetings: many(meetings),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  user: one(users, {
    fields: [meetings.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [meetings.companyId],
    references: [companies.id],
  }),
  actionItems: many(actionItems),
}));

export const timeBlocksRelations = relations(timeBlocks, ({ one }) => ({
  user: one(users, {
    fields: [timeBlocks.userId],
    references: [users.id],
  }),
}));

export const dailyGoalsRelations = relations(dailyGoals, ({ one }) => ({
  user: one(users, {
    fields: [dailyGoals.userId],
    references: [users.id],
  }),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  user: one(users, {
    fields: [actionItems.userId],
    references: [users.id],
  }),
  meeting: one(meetings, {
    fields: [actionItems.meetingId],
    references: [meetings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeBlockSchema = createInsertSchema(timeBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyGoalSchema = createInsertSchema(dailyGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActionItemSchema = createInsertSchema(actionItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type TimeBlock = typeof timeBlocks.$inferSelect;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;
export type DailyGoal = typeof dailyGoals.$inferSelect;
export type InsertDailyGoal = z.infer<typeof insertDailyGoalSchema>;
export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
