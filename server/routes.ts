import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import {
  insertDealSchema,
  insertPaymentSchema,
  insertContractSchema,
  insertReminderSchema,
  dealStatuses,
  platforms,
  reminderTypes,
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "contracts");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    // Only serve files to authenticated users
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  });
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // ==================== DEALS API ====================
  
  // Get all deals for the current user
  app.get("/api/deals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deals = await storage.getDeals(userId);
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  // Get a single deal
  app.get("/api/deals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dealId = parseInt(req.params.id);
      const deal = await storage.getDeal(dealId, userId);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      console.error("Error fetching deal:", error);
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  // Create a new deal
  app.post("/api/deals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const parseResult = insertDealSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: parseResult.error.flatten() 
        });
      }

      const deal = await storage.createDeal({
        ...parseResult.data,
        userId,
      });
      
      res.status(201).json(deal);
    } catch (error) {
      console.error("Error creating deal:", error);
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  // Update a deal
  app.patch("/api/deals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dealId = parseInt(req.params.id);

      // Allow partial updates
      const updateSchema = insertDealSchema.partial();
      const parseResult = updateSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: parseResult.error.flatten() 
        });
      }

      const deal = await storage.updateDeal(dealId, userId, parseResult.data);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      console.error("Error updating deal:", error);
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  // Delete a deal
  app.delete("/api/deals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dealId = parseInt(req.params.id);
      
      const deleted = await storage.deleteDeal(dealId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json({ message: "Deal deleted successfully" });
    } catch (error) {
      console.error("Error deleting deal:", error);
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  // ==================== PAYMENTS API ====================
  
  // Get all payments for the current user
  app.get("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Get payments for a specific deal
  app.get("/api/deals/:dealId/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dealId = parseInt(req.params.dealId);
      
      // Verify deal belongs to user
      const deal = await storage.getDeal(dealId, userId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      const payments = await storage.getPaymentsByDeal(dealId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Create a new payment
  app.post("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const parseResult = insertPaymentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: parseResult.error.flatten() 
        });
      }

      // Verify deal belongs to user
      const deal = await storage.getDeal(parseResult.data.dealId, userId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      const payment = await storage.createPayment(parseResult.data);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Update a payment
  app.patch("/api/payments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paymentId = parseInt(req.params.id);

      // Get the payment first to verify ownership
      const existingPayment = await storage.getPayment(paymentId);
      if (!existingPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Verify the deal belongs to the user
      const deal = await storage.getDeal(existingPayment.dealId, userId);
      if (!deal) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updateSchema = insertPaymentSchema.partial();
      const parseResult = updateSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: parseResult.error.flatten() 
        });
      }

      const payment = await storage.updatePayment(paymentId, parseResult.data);
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // Delete a payment
  app.delete("/api/payments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paymentId = parseInt(req.params.id);

      // Get the payment first to verify ownership
      const existingPayment = await storage.getPayment(paymentId);
      if (!existingPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Verify the deal belongs to the user
      const deal = await storage.getDeal(existingPayment.dealId, userId);
      if (!deal) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deletePayment(paymentId);
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // ==================== CONTRACTS API ====================
  
  // Get all contracts for the current user
  app.get("/api/contracts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contracts = await storage.getContracts(userId);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  // Upload a new contract
  app.post("/api/contracts", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const dealId = parseInt(req.body.dealId);
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      // Verify deal belongs to user
      const deal = await storage.getDeal(dealId, userId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      const contract = await storage.createContract({
        dealId,
        fileUrl: `/uploads/contracts/${req.file.filename}`,
        fileName: req.file.originalname,
        usageEndDate: req.body.usageEndDate || null,
        exclusivityEndDate: req.body.exclusivityEndDate || null,
      });

      res.status(201).json(contract);
    } catch (error) {
      console.error("Error uploading contract:", error);
      res.status(500).json({ message: "Failed to upload contract" });
    }
  });

  // Delete a contract
  app.delete("/api/contracts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contractId = parseInt(req.params.id);

      // Get the contract first to verify ownership
      const existingContract = await storage.getContract(contractId);
      if (!existingContract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Verify the deal belongs to the user
      const deal = await storage.getDeal(existingContract.dealId, userId);
      if (!deal) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Delete the file from disk
      const filePath = path.join(process.cwd(), existingContract.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await storage.deleteContract(contractId);
      res.json({ message: "Contract deleted successfully" });
    } catch (error) {
      console.error("Error deleting contract:", error);
      res.status(500).json({ message: "Failed to delete contract" });
    }
  });

  // ==================== REMINDERS API ====================
  
  // Get all reminders for the current user
  app.get("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminders = await storage.getReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  // Create a new reminder
  app.post("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const parseResult = insertReminderSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: parseResult.error.flatten() 
        });
      }

      // If dealId is provided, verify it belongs to user
      if (parseResult.data.dealId) {
        const deal = await storage.getDeal(parseResult.data.dealId, userId);
        if (!deal) {
          return res.status(404).json({ message: "Deal not found" });
        }
      }

      const reminder = await storage.createReminder({
        ...parseResult.data,
        userId,
      });
      
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  // Update a reminder
  app.patch("/api/reminders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminderId = parseInt(req.params.id);

      // Allow updating sent status and other fields
      const updateSchema = insertReminderSchema.partial().extend({
        sent: z.boolean().optional(),
      });
      
      const parseResult = updateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: parseResult.error.flatten() 
        });
      }

      const reminder = await storage.updateReminder(reminderId, userId, parseResult.data);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  // Delete a reminder
  app.delete("/api/reminders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminderId = parseInt(req.params.id);
      
      const deleted = await storage.deleteReminder(reminderId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  return httpServer;
}
