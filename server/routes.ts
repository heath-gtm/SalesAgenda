import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertMeetingSchema,
  insertCompanySchema,
  insertContactSchema,
  insertTimeBlockSchema,
  insertDailyGoalSchema,
  insertActionItemSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Company routes
  app.get('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companies = await storage.getCompanies(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put('/api/companies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, validatedData);
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete('/api/companies/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteCompany(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Contact routes
  app.get('/api/companies/:companyId/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const contacts = await storage.getContacts(req.params.companyId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  // Meeting routes
  app.get('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const meetings = await storage.getMeetings(userId, date);
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get('/api/meetings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const meeting = await storage.getMeeting(req.params.id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      console.error("Error fetching meeting:", error);
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  app.post('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMeetingSchema.parse({
        ...req.body,
        userId,
      });
      const meeting = await storage.createMeeting(validatedData);
      res.status(201).json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.put('/api/meetings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertMeetingSchema.partial().parse(req.body);
      const meeting = await storage.updateMeeting(req.params.id, validatedData);
      res.json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating meeting:", error);
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete('/api/meetings/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteMeeting(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // Time block routes
  app.get('/api/timeblocks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = new Date(req.query.date as string);
      const timeBlocks = await storage.getTimeBlocks(userId, date);
      res.json(timeBlocks);
    } catch (error) {
      console.error("Error fetching time blocks:", error);
      res.status(500).json({ message: "Failed to fetch time blocks" });
    }
  });

  app.post('/api/timeblocks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTimeBlockSchema.parse({
        ...req.body,
        userId,
      });
      const timeBlock = await storage.createTimeBlock(validatedData);
      res.status(201).json(timeBlock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating time block:", error);
      res.status(500).json({ message: "Failed to create time block" });
    }
  });

  // Daily goals routes
  app.get('/api/daily-goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = new Date(req.query.date as string);
      const goal = await storage.getDailyGoal(userId, date);
      res.json(goal);
    } catch (error) {
      console.error("Error fetching daily goal:", error);
      res.status(500).json({ message: "Failed to fetch daily goal" });
    }
  });

  app.post('/api/daily-goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDailyGoalSchema.parse({
        ...req.body,
        userId,
      });
      const goal = await storage.createDailyGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating daily goal:", error);
      res.status(500).json({ message: "Failed to create daily goal" });
    }
  });

  app.put('/api/daily-goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertDailyGoalSchema.partial().parse(req.body);
      const goal = await storage.updateDailyGoal(req.params.id, validatedData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating daily goal:", error);
      res.status(500).json({ message: "Failed to update daily goal" });
    }
  });

  // Action items routes
  app.get('/api/action-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const actionItems = await storage.getActionItems(userId, date);
      res.json(actionItems);
    } catch (error) {
      console.error("Error fetching action items:", error);
      res.status(500).json({ message: "Failed to fetch action items" });
    }
  });

  app.post('/api/action-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertActionItemSchema.parse({
        ...req.body,
        userId,
      });
      const actionItem = await storage.createActionItem(validatedData);
      res.status(201).json(actionItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating action item:", error);
      res.status(500).json({ message: "Failed to create action item" });
    }
  });

  app.put('/api/action-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertActionItemSchema.partial().parse(req.body);
      const actionItem = await storage.updateActionItem(req.params.id, validatedData);
      res.json(actionItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating action item:", error);
      res.status(500).json({ message: "Failed to update action item" });
    }
  });

  app.delete('/api/action-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteActionItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting action item:", error);
      res.status(500).json({ message: "Failed to delete action item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
