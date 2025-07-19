import { 
  users, merchants, transactions, botCommands, alerts,
  type User, type InsertUser,
  type Merchant, type InsertMerchant,
  type Transaction, type InsertTransaction,
  type BotCommand, type InsertBotCommand,
  type Alert, type InsertAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Merchants
  getMerchant(id: number): Promise<Merchant | undefined>;
  getMerchantByName(name: string): Promise<Merchant | undefined>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  getAllMerchants(): Promise<Merchant[]>;
  getTopMerchants(): Promise<Array<Merchant & { totalRevenue: string; orderCount: number }>>;

  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]>;
  getRecentTransactions(limit?: number): Promise<Array<Transaction & { user: User; merchant: Merchant }>>;
  getTotalVolume(): Promise<string>;
  getTotalTransactionCount(): Promise<number>;
  getFailedTransactionsToday(): Promise<number>;

  // Bot Commands
  createBotCommand(command: InsertBotCommand): Promise<BotCommand>;
  getCommandsToday(): Promise<number>;

  // Alerts
  createAlert(alert: InsertAlert): Promise<Alert>;
  getUnreadAlerts(): Promise<Alert[]>;
  markAlertAsRead(id: number): Promise<Alert | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private merchants: Map<number, Merchant>;
  private transactions: Map<number, Transaction>;
  private botCommands: Map<number, BotCommand>;
  private alerts: Map<number, Alert>;
  private currentUserId: number;
  private currentMerchantId: number;
  private currentTransactionId: number;
  private currentBotCommandId: number;
  private currentAlertId: number;

  constructor() {
    this.users = new Map();
    this.merchants = new Map();
    this.transactions = new Map();
    this.botCommands = new Map();
    this.alerts = new Map();
    this.currentUserId = 1;
    this.currentMerchantId = 1;
    this.currentTransactionId = 1;
    this.currentBotCommandId = 1;
    this.currentAlertId = 1;

    // Initialize with some default merchants
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const defaultMerchants = [
      { name: "Burger Palace", category: "food", description: "Premium burgers and fries", isActive: true },
      { name: "Pizza Corner", category: "food", description: "Fresh pizzas and sides", isActive: true },
      { name: "GameStop Express", category: "items", description: "Gaming gear and accessories", isActive: true },
      { name: "Brew Masters", category: "food", description: "Coffee and beverages", isActive: true },
      { name: "Taco Bell Game", category: "food", description: "Mexican-style fast food", isActive: true },
    ];

    defaultMerchants.forEach(merchant => {
      const id = this.currentMerchantId++;
      const newMerchant: Merchant = {
        ...merchant,
        id,
        description: merchant.description,
        isActive: merchant.isActive,
        createdAt: new Date(),
      };
      this.merchants.set(id, newMerchant);
    });

    // Add some demo users and transactions for testing
    const demoUsers = [
      { discordId: "123456789012345678", username: "TestPlayer1", balance: "150.00" },
      { discordId: "234567890123456789", username: "GameMaster", balance: "2500.75" },
      { discordId: "345678901234567890", username: "ProGamer", balance: "89.25" },
    ];

    demoUsers.forEach(userData => {
      const id = this.currentUserId++;
      const user: User = {
        ...userData,
        id,
        createdAt: new Date(),
      };
      this.users.set(id, user);
    });

    // Add some demo transactions
    const demoTransactions = [
      {
        transactionId: "TX123456",
        userId: 1,
        merchantId: 1,
        amount: "25.99",
        status: "completed",
        description: "Big Mac Combo with fries",
      },
      {
        transactionId: "TX123457",
        userId: 2,
        merchantId: 2,
        amount: "18.50",
        status: "completed",
        description: "Large Pepperoni Pizza",
      },
      {
        transactionId: "TX123458",
        userId: 1,
        merchantId: 3,
        amount: "59.99",
        status: "pending",
        description: "Gaming headset",
      },
    ];

    demoTransactions.forEach(txData => {
      const id = this.currentTransactionId++;
      const now = new Date();
      const transaction: Transaction = {
        ...txData,
        id,
        description: txData.description,
        createdAt: now,
        updatedAt: now,
      };
      this.transactions.set(id, transaction);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.discordId === discordId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      balance: insertUser.balance || "0.00",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, balance: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, balance };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Merchants
  async getMerchant(id: number): Promise<Merchant | undefined> {
    return this.merchants.get(id);
  }

  async getMerchantByName(name: string): Promise<Merchant | undefined> {
    return Array.from(this.merchants.values()).find(merchant => merchant.name === name);
  }

  async createMerchant(insertMerchant: InsertMerchant): Promise<Merchant> {
    const id = this.currentMerchantId++;
    const merchant: Merchant = {
      ...insertMerchant,
      id,
      description: insertMerchant.description || null,
      isActive: insertMerchant.isActive ?? true,
      createdAt: new Date(),
    };
    this.merchants.set(id, merchant);
    return merchant;
  }

  async getAllMerchants(): Promise<Merchant[]> {
    return Array.from(this.merchants.values());
  }

  async getTopMerchants(): Promise<Array<Merchant & { totalRevenue: string; orderCount: number }>> {
    const merchants = Array.from(this.merchants.values());
    const transactions = Array.from(this.transactions.values());

    return merchants.map(merchant => {
      const merchantTransactions = transactions.filter(t => t.merchantId === merchant.id && t.status === 'completed');
      const totalRevenue = merchantTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2);
      const orderCount = merchantTransactions.length;

      return {
        ...merchant,
        totalRevenue,
        orderCount,
      };
    }).sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue));
  }

  // Transactions
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(t => t.transactionId === transactionId);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      description: insertTransaction.description || null,
      createdAt: now,
      updatedAt: now,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      const updatedTransaction = { ...transaction, status, updatedAt: new Date() };
      this.transactions.set(id, updatedTransaction);
      return updatedTransaction;
    }
    return undefined;
  }

  async getTransactionsByUserId(userId: number, limit = 10): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getRecentTransactions(limit = 10): Promise<Array<Transaction & { user: User; merchant: Merchant }>> {
    const transactions = Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return transactions.map(transaction => {
      const user = this.users.get(transaction.userId)!;
      const merchant = this.merchants.get(transaction.merchantId)!;
      return { ...transaction, user, merchant };
    });
  }

  async getTotalVolume(): Promise<string> {
    const transactions = Array.from(this.transactions.values()).filter(t => t.status === 'completed');
    const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return total.toFixed(2);
  }

  async getTotalTransactionCount(): Promise<number> {
    return this.transactions.size;
  }

  async getFailedTransactionsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from(this.transactions.values()).filter(t => 
      t.status === 'failed' && t.createdAt >= today
    ).length;
  }

  // Bot Commands
  async createBotCommand(insertCommand: InsertBotCommand): Promise<BotCommand> {
    const id = this.currentBotCommandId++;
    const command: BotCommand = {
      ...insertCommand,
      id,
      parameters: insertCommand.parameters || null,
      response: insertCommand.response || null,
      executedAt: new Date(),
    };
    this.botCommands.set(id, command);
    return command;
  }

  async getCommandsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from(this.botCommands.values()).filter(c => c.executedAt >= today).length;
  }

  // Alerts
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = {
      ...insertAlert,
      id,
      isRead: insertAlert.isRead ?? false,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(a => !a.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, isRead: true };
      this.alerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        balance: insertUser.balance || "100.00", // Default starting balance
      })
      .returning();
    return user;
  }

  async updateUserBalance(id: number, balance: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ balance })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Merchants
  async getMerchant(id: number): Promise<Merchant | undefined> {
    const [merchant] = await db.select().from(merchants).where(eq(merchants.id, id));
    return merchant || undefined;
  }

  async getMerchantByName(name: string): Promise<Merchant | undefined> {
    const [merchant] = await db.select().from(merchants).where(eq(merchants.name, name));
    return merchant || undefined;
  }

  async createMerchant(insertMerchant: InsertMerchant): Promise<Merchant> {
    const [merchant] = await db
      .insert(merchants)
      .values(insertMerchant)
      .returning();
    return merchant;
  }

  async getAllMerchants(): Promise<Merchant[]> {
    return await db.select().from(merchants).orderBy(merchants.name);
  }

  async getTopMerchants(): Promise<Array<Merchant & { totalRevenue: string; orderCount: number }>> {
    const result = await db
      .select({
        id: merchants.id,
        name: merchants.name,
        category: merchants.category,
        description: merchants.description,
        isActive: merchants.isActive,
        createdAt: merchants.createdAt,
        totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.status} = 'completed' THEN ${transactions.amount}::numeric ELSE 0 END), 0)::text`,
        orderCount: sql<number>`COUNT(CASE WHEN ${transactions.status} = 'completed' THEN 1 END)::int`,
      })
      .from(merchants)
      .leftJoin(transactions, eq(merchants.id, transactions.merchantId))
      .groupBy(merchants.id)
      .orderBy(sql`SUM(CASE WHEN ${transactions.status} = 'completed' THEN ${transactions.amount}::numeric ELSE 0 END) DESC`);

    return result;
  }

  // Transactions
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.transactionId, transactionId));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ status, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async getTransactionsByUserId(userId: number, limit = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getRecentTransactions(limit = 10): Promise<Array<Transaction & { user: User; merchant: Merchant }>> {
    const result = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        userId: transactions.userId,
        merchantId: transactions.merchantId,
        amount: transactions.amount,
        status: transactions.status,
        description: transactions.description,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        user: users,
        merchant: merchants,
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .innerJoin(merchants, eq(transactions.merchantId, merchants.id))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);

    return result.map(row => ({
      id: row.id,
      transactionId: row.transactionId,
      userId: row.userId,
      merchantId: row.merchantId,
      amount: row.amount,
      status: row.status,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user,
      merchant: row.merchant,
    }));
  }

  async getTotalVolume(): Promise<string> {
    const [result] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)::text`,
      })
      .from(transactions)
      .where(eq(transactions.status, 'completed'));
    
    return result?.total || "0.00";
  }

  async getTotalTransactionCount(): Promise<number> {
    const [result] = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(transactions);
    
    return result?.count || 0;
  }

  async getFailedTransactionsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [result] = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(transactions)
      .where(and(
        eq(transactions.status, 'failed'),
        gte(transactions.createdAt, today)
      ));
    
    return result?.count || 0;
  }

  // Bot Commands
  async createBotCommand(insertCommand: InsertBotCommand): Promise<BotCommand> {
    const [command] = await db
      .insert(botCommands)
      .values(insertCommand)
      .returning();
    return command;
  }

  async getCommandsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [result] = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(botCommands)
      .where(gte(botCommands.executedAt, today));
    
    return result?.count || 0;
  }

  // Alerts
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.isRead, false))
      .orderBy(desc(alerts.createdAt));
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const [alert] = await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id))
      .returning();
    return alert || undefined;
  }
}

export const storage = new DatabaseStorage();
