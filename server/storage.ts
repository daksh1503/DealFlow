import {
  users,
  deals,
  payments,
  contracts,
  reminders,
  type User,
  type UpsertUser,
  type Deal,
  type InsertDeal,
  type Payment,
  type InsertPayment,
  type Contract,
  type InsertContract,
  type Reminder,
  type InsertReminder,
  type DealStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Deal operations
  getDeals(userId: string): Promise<Deal[]>;
  getDeal(id: number, userId: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal & { userId: string }): Promise<Deal>;
  updateDeal(id: number, userId: string, data: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: number, userId: string): Promise<boolean>;

  // Payment operations
  getPayments(userId: string): Promise<Payment[]>;
  getPaymentsByDeal(dealId: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment & { dealId: number }): Promise<Payment>;
  updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;

  // Contract operations
  getContracts(userId: string): Promise<Contract[]>;
  getContractsByDeal(dealId: number): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract & { dealId: number }): Promise<Contract>;
  updateContract(id: number, data: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: number): Promise<boolean>;

  // Reminder operations
  getReminders(userId: string): Promise<Reminder[]>;
  getReminder(id: number, userId: string): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder & { userId: string }): Promise<Reminder>;
  updateReminder(id: number, userId: string, data: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
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

  // Deal operations
  async getDeals(userId: string): Promise<Deal[]> {
    return db
      .select()
      .from(deals)
      .where(eq(deals.userId, userId))
      .orderBy(desc(deals.createdAt));
  }

  async getDeal(id: number, userId: string): Promise<Deal | undefined> {
    const [deal] = await db
      .select()
      .from(deals)
      .where(and(eq(deals.id, id), eq(deals.userId, userId)));
    return deal;
  }

  async createDeal(deal: InsertDeal & { userId: string }): Promise<Deal> {
    const [newDeal] = await db
      .insert(deals)
      .values({
        userId: deal.userId,
        brandName: deal.brandName,
        platform: deal.platform,
        dealValue: deal.dealValue,
        status: deal.status || "lead",
        deadline: deal.deadline ? new Date(deal.deadline) : null,
        notes: deal.notes || null,
      })
      .returning();
    return newDeal;
  }

  async updateDeal(id: number, userId: string, data: Partial<InsertDeal>): Promise<Deal | undefined> {
    const updateData: any = { ...data };
    if (data.deadline) {
      updateData.deadline = new Date(data.deadline);
    }
    
    const [updated] = await db
      .update(deals)
      .set(updateData)
      .where(and(eq(deals.id, id), eq(deals.userId, userId)))
      .returning();
    return updated;
  }

  async deleteDeal(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(deals)
      .where(and(eq(deals.id, id), eq(deals.userId, userId)))
      .returning({ id: deals.id });
    return result.length > 0;
  }

  // Payment operations
  async getPayments(userId: string): Promise<Payment[]> {
    const userDeals = await db.select({ id: deals.id }).from(deals).where(eq(deals.userId, userId));
    const dealIds = userDeals.map((d) => d.id);
    
    if (dealIds.length === 0) return [];
    
    const allPayments: Payment[] = [];
    for (const dealId of dealIds) {
      const dealPayments = await db.select().from(payments).where(eq(payments.dealId, dealId));
      allPayments.push(...dealPayments);
    }
    return allPayments;
  }

  async getPaymentsByDeal(dealId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.dealId, dealId));
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(payment: InsertPayment & { dealId: number }): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values({
        dealId: payment.dealId,
        amount: payment.amount,
        paid: payment.paid || false,
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
        mode: payment.mode || null,
      })
      .returning();
    return newPayment;
  }

  async updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const updateData: any = { ...data };
    if (data.paymentDate) {
      updateData.paymentDate = new Date(data.paymentDate);
    }
    
    const [updated] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  async deletePayment(id: number): Promise<boolean> {
    const result = await db.delete(payments).where(eq(payments.id, id)).returning({ id: payments.id });
    return result.length > 0;
  }

  // Contract operations
  async getContracts(userId: string): Promise<Contract[]> {
    const userDeals = await db.select({ id: deals.id }).from(deals).where(eq(deals.userId, userId));
    const dealIds = userDeals.map((d) => d.id);
    
    if (dealIds.length === 0) return [];
    
    const allContracts: Contract[] = [];
    for (const dealId of dealIds) {
      const dealContracts = await db.select().from(contracts).where(eq(contracts.dealId, dealId));
      allContracts.push(...dealContracts);
    }
    return allContracts;
  }

  async getContractsByDeal(dealId: number): Promise<Contract[]> {
    return db.select().from(contracts).where(eq(contracts.dealId, dealId));
  }

  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async createContract(contract: InsertContract & { dealId: number }): Promise<Contract> {
    const [newContract] = await db
      .insert(contracts)
      .values({
        dealId: contract.dealId,
        fileUrl: contract.fileUrl,
        fileName: contract.fileName || null,
        usageEndDate: contract.usageEndDate ? new Date(contract.usageEndDate) : null,
        exclusivityEndDate: contract.exclusivityEndDate ? new Date(contract.exclusivityEndDate) : null,
      })
      .returning();
    return newContract;
  }

  async updateContract(id: number, data: Partial<InsertContract>): Promise<Contract | undefined> {
    const updateData: any = { ...data };
    if (data.usageEndDate) {
      updateData.usageEndDate = new Date(data.usageEndDate);
    }
    if (data.exclusivityEndDate) {
      updateData.exclusivityEndDate = new Date(data.exclusivityEndDate);
    }
    
    const [updated] = await db
      .update(contracts)
      .set(updateData)
      .where(eq(contracts.id, id))
      .returning();
    return updated;
  }

  async deleteContract(id: number): Promise<boolean> {
    const result = await db.delete(contracts).where(eq(contracts.id, id)).returning({ id: contracts.id });
    return result.length > 0;
  }

  // Reminder operations
  async getReminders(userId: string): Promise<Reminder[]> {
    return db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(desc(reminders.remindAt));
  }

  async getReminder(id: number, userId: string): Promise<Reminder | undefined> {
    const [reminder] = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
    return reminder;
  }

  async createReminder(reminder: InsertReminder & { userId: string }): Promise<Reminder> {
    const [newReminder] = await db
      .insert(reminders)
      .values({
        userId: reminder.userId,
        dealId: reminder.dealId || null,
        type: reminder.type,
        title: reminder.title,
        remindAt: new Date(reminder.remindAt),
      })
      .returning();
    return newReminder;
  }

  async updateReminder(id: number, userId: string, data: Partial<InsertReminder & { sent?: boolean }>): Promise<Reminder | undefined> {
    const updateData: any = { ...data };
    if (data.remindAt) {
      updateData.remindAt = new Date(data.remindAt);
    }
    
    const [updated] = await db
      .update(reminders)
      .set(updateData)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return updated;
  }

  async deleteReminder(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning({ id: reminders.id });
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
