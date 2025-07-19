import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMerchantSchema, insertAlertSchema } from "@shared/schema";
import { startBot } from "./discord-bot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const [totalVolume, totalTransactions, activeUsers, failedTransactions] = await Promise.all([
        storage.getTotalVolume(),
        storage.getTotalTransactionCount(),
        storage.getAllUsers().then(users => users.length),
        storage.getFailedTransactionsToday(),
      ]);

      res.json({
        totalVolume,
        totalTransactions,
        activeUsers,
        failedTransactions,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Recent transactions
  app.get("/api/transactions/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // All transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getRecentTransactions(100);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // User transactions
  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 20;
      const transactions = await storage.getTransactionsByUserId(userId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user transactions" });
    }
  });

  // All users with balances
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Top merchants
  app.get("/api/merchants/top", async (req, res) => {
    try {
      const merchants = await storage.getTopMerchants();
      res.json(merchants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top merchants" });
    }
  });

  // All merchants
  app.get("/api/merchants", async (req, res) => {
    try {
      const merchants = await storage.getAllMerchants();
      res.json(merchants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchants" });
    }
  });

  // Create merchant
  app.post("/api/merchants", async (req, res) => {
    try {
      const validatedData = insertMerchantSchema.parse(req.body);
      const merchant = await storage.createMerchant(validatedData);
      res.status(201).json(merchant);
    } catch (error) {
      res.status(400).json({ message: "Invalid merchant data" });
    }
  });

  // Bot command history
  app.get("/api/commands/today", async (req, res) => {
    try {
      const count = await storage.getCommandsToday();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch command count" });
    }
  });

  // Alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getUnreadAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Create alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  // Mark alert as read
  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.markAlertAsRead(id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  // Bot status
  app.get("/api/bot/status", async (req, res) => {
    try {
      const commandsToday = await storage.getCommandsToday();
      res.json({
        status: "online",
        uptime: "72h 15m", // This would be calculated from bot start time
        commandsToday,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bot status" });
    }
  });

  const httpServer = createServer(app);

  // Start Discord bot
  if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CLIENT_ID) {
    startBot().catch(console.error);
  } else {
    console.warn("Discord bot credentials not provided. Bot will not start.");
  }

  return httpServer;
}
