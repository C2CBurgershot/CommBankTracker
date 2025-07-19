import { 
  users, merchants, transactions, botCommands, alerts,
  type User, type InsertUser,
  type Merchant, type InsertMerchant,
  type Transaction, type InsertTransaction,
  type BotCommand, type InsertBotCommand,
  type Alert, type InsertAlert
} from "@shared/schema";

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
        createdAt: new Date(),
      };
      this.merchants.set(id, newMerchant);
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

export const storage = new MemStorage();
