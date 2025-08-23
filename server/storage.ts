import {
  users,
  companies,
  contacts,
  meetings,
  timeBlocks,
  dailyGoals,
  actionItems,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Contact,
  type InsertContact,
  type Meeting,
  type InsertMeeting,
  type TimeBlock,
  type InsertTimeBlock,
  type DailyGoal,
  type InsertDailyGoal,
  type ActionItem,
  type InsertActionItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company operations
  getCompanies(userId: string): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  
  // Contact operations
  getContacts(companyId: string): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  
  // Meeting operations
  getMeetings(userId: string, date?: Date): Promise<Meeting[]>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: string, meeting: Partial<InsertMeeting>): Promise<Meeting>;
  deleteMeeting(id: string): Promise<void>;
  getMeetingsForDateRange(userId: string, startDate: Date, endDate: Date): Promise<Meeting[]>;
  
  // Time block operations
  getTimeBlocks(userId: string, date: Date): Promise<TimeBlock[]>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: string, timeBlock: Partial<InsertTimeBlock>): Promise<TimeBlock>;
  deleteTimeBlock(id: string): Promise<void>;
  
  // Daily goal operations
  getDailyGoal(userId: string, date: Date): Promise<DailyGoal | undefined>;
  createDailyGoal(goal: InsertDailyGoal): Promise<DailyGoal>;
  updateDailyGoal(id: string, goal: Partial<InsertDailyGoal>): Promise<DailyGoal>;
  
  // Action item operations
  getActionItems(userId: string, date?: Date): Promise<ActionItem[]>;
  createActionItem(item: InsertActionItem): Promise<ActionItem>;
  updateActionItem(id: string, item: Partial<InsertActionItem>): Promise<ActionItem>;
  deleteActionItem(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async getCompanies(userId: string): Promise<Company[]> {
    return await db
      .select()
      .from(companies)
      .orderBy(asc(companies.name));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Contact operations
  async getContacts(companyId: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(eq(contacts.companyId, companyId))
      .orderBy(asc(contacts.firstName));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set({ ...contact, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteContact(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Meeting operations
  async getMeetings(userId: string, date?: Date): Promise<Meeting[]> {
    let query = db.select().from(meetings).where(eq(meetings.userId, userId));
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where(
        and(
          eq(meetings.userId, userId),
          gte(meetings.scheduledAt, startOfDay),
          lte(meetings.scheduledAt, endOfDay)
        )
      );
    }
    
    return await query.orderBy(asc(meetings.scheduledAt));
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting;
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [newMeeting] = await db.insert(meetings).values(meeting).returning();
    return newMeeting;
  }

  async updateMeeting(id: string, meeting: Partial<InsertMeeting>): Promise<Meeting> {
    const [updatedMeeting] = await db
      .update(meetings)
      .set({ ...meeting, updatedAt: new Date() })
      .where(eq(meetings.id, id))
      .returning();
    return updatedMeeting;
  }

  async deleteMeeting(id: string): Promise<void> {
    await db.delete(meetings).where(eq(meetings.id, id));
  }

  async getMeetingsForDateRange(userId: string, startDate: Date, endDate: Date): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.userId, userId),
          gte(meetings.scheduledAt, startDate),
          lte(meetings.scheduledAt, endDate)
        )
      )
      .orderBy(asc(meetings.scheduledAt));
  }

  // Time block operations
  async getTimeBlocks(userId: string, date: Date): Promise<TimeBlock[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(timeBlocks)
      .where(
        and(
          eq(timeBlocks.userId, userId),
          gte(timeBlocks.date, startOfDay),
          lte(timeBlocks.date, endOfDay)
        )
      )
      .orderBy(asc(timeBlocks.startTime));
  }

  async createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const [newTimeBlock] = await db.insert(timeBlocks).values(timeBlock).returning();
    return newTimeBlock;
  }

  async updateTimeBlock(id: string, timeBlock: Partial<InsertTimeBlock>): Promise<TimeBlock> {
    const [updatedTimeBlock] = await db
      .update(timeBlocks)
      .set({ ...timeBlock, updatedAt: new Date() })
      .where(eq(timeBlocks.id, id))
      .returning();
    return updatedTimeBlock;
  }

  async deleteTimeBlock(id: string): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.id, id));
  }

  // Daily goal operations
  async getDailyGoal(userId: string, date: Date): Promise<DailyGoal | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [goal] = await db
      .select()
      .from(dailyGoals)
      .where(
        and(
          eq(dailyGoals.userId, userId),
          gte(dailyGoals.date, startOfDay),
          lte(dailyGoals.date, endOfDay)
        )
      );
    return goal;
  }

  async createDailyGoal(goal: InsertDailyGoal): Promise<DailyGoal> {
    const [newGoal] = await db.insert(dailyGoals).values(goal).returning();
    return newGoal;
  }

  async updateDailyGoal(id: string, goal: Partial<InsertDailyGoal>): Promise<DailyGoal> {
    const [updatedGoal] = await db
      .update(dailyGoals)
      .set({ ...goal, updatedAt: new Date() })
      .where(eq(dailyGoals.id, id))
      .returning();
    return updatedGoal;
  }

  // Action item operations
  async getActionItems(userId: string, date?: Date): Promise<ActionItem[]> {
    let query = db.select().from(actionItems).where(eq(actionItems.userId, userId));
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where(
        and(
          eq(actionItems.userId, userId),
          gte(actionItems.dueDate, startOfDay),
          lte(actionItems.dueDate, endOfDay)
        )
      );
    }
    
    return await query.orderBy(asc(actionItems.dueDate));
  }

  async createActionItem(item: InsertActionItem): Promise<ActionItem> {
    const [newItem] = await db.insert(actionItems).values(item).returning();
    return newItem;
  }

  async updateActionItem(id: string, item: Partial<InsertActionItem>): Promise<ActionItem> {
    const [updatedItem] = await db
      .update(actionItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(actionItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteActionItem(id: string): Promise<void> {
    await db.delete(actionItems).where(eq(actionItems.id, id));
  }
}

export const storage = new DatabaseStorage();
