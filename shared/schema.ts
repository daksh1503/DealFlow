import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth schema (sessions and users tables - mandatory for Replit Auth)
export * from "./models/auth";
import { users } from "./models/auth";

// Deal status enum values
export const dealStatuses = ["lead", "negotiation", "signed", "content_delivered", "paid"] as const;
export type DealStatus = typeof dealStatuses[number];

// Platform enum values
export const platforms = ["instagram", "youtube", "tiktok", "twitter", "linkedin", "other"] as const;
export type Platform = typeof platforms[number];

// Reminder type enum values
export const reminderTypes = ["follow_up", "content_delivery", "payment"] as const;
export type ReminderType = typeof reminderTypes[number];

// Deals table
export const deals = pgTable("deals", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brandName: varchar("brand_name", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull().$type<Platform>(),
  dealValue: decimal("deal_value", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().$type<DealStatus>().default("lead"),
  deadline: timestamp("deadline"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("deals_user_id_idx").on(table.userId),
  index("deals_status_idx").on(table.status),
]);

// Deals relations
export const dealsRelations = relations(deals, ({ one, many }) => ({
  user: one(users, {
    fields: [deals.userId],
    references: [users.id],
  }),
  payments: many(payments),
  contracts: many(contracts),
  reminders: many(reminders),
}));

// Payments table
export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  dealId: integer("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paid: boolean("paid").default(false),
  paymentDate: timestamp("payment_date"),
  mode: varchar("mode", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("payments_deal_id_idx").on(table.dealId),
]);

// Payments relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  deal: one(deals, {
    fields: [payments.dealId],
    references: [deals.id],
  }),
}));

// Contracts table
export const contracts = pgTable("contracts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  dealId: integer("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  fileUrl: varchar("file_url", { length: 512 }).notNull(),
  fileName: varchar("file_name", { length: 255 }),
  usageEndDate: timestamp("usage_end_date"),
  exclusivityEndDate: timestamp("exclusivity_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("contracts_deal_id_idx").on(table.dealId),
]);

// Contracts relations
export const contractsRelations = relations(contracts, ({ one }) => ({
  deal: one(deals, {
    fields: [contracts.dealId],
    references: [deals.id],
  }),
}));

// Reminders table
export const reminders = pgTable("reminders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dealId: integer("deal_id").references(() => deals.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull().$type<ReminderType>(),
  title: varchar("title", { length: 255 }).notNull(),
  remindAt: timestamp("remind_at").notNull(),
  sent: boolean("sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("reminders_user_id_idx").on(table.userId),
  index("reminders_remind_at_idx").on(table.remindAt),
]);

// Reminders relations
export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
  deal: one(deals, {
    fields: [reminders.dealId],
    references: [deals.id],
  }),
}));

// Insert schemas with validation
export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
}).extend({
  brandName: z.string().min(1, "Brand name is required").max(255),
  platform: z.enum(platforms),
  dealValue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  status: z.enum(dealStatuses).optional().default("lead"),
  deadline: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  paid: z.boolean().optional().default(false),
  paymentDate: z.string().datetime().optional().nullable(),
  mode: z.string().max(100).optional().nullable(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
}).extend({
  fileUrl: z.string().url("Invalid file URL"),
  fileName: z.string().max(255).optional().nullable(),
  usageEndDate: z.string().datetime().optional().nullable(),
  exclusivityEndDate: z.string().datetime().optional().nullable(),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
  sent: true,
}).extend({
  type: z.enum(reminderTypes),
  title: z.string().min(1, "Title is required").max(255),
  remindAt: z.string().datetime(),
});

// Types
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

// Extended types with relations
export type DealWithPayments = Deal & { payments: Payment[] };
export type DealWithContracts = Deal & { contracts: Contract[] };
export type DealWithAll = Deal & { payments: Payment[]; contracts: Contract[]; reminders: Reminder[] };
export type ReminderWithDeal = Reminder & { deal: Deal | null };
