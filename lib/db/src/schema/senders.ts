import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sendersTable = pgTable("senders", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  appPassword: text("app_password").notNull(),
  status: text("status").notNull().default("active"), // active | disabled | error
  totalUsed: integer("total_used").notNull().default(0),
  dailyLimit: integer("daily_limit"),
  lastReset: timestamp("last_reset"),
  lastActive: timestamp("last_active"),
  autoRotate: boolean("auto_rotate").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSenderSchema = createInsertSchema(sendersTable).omit({ id: true, createdAt: true });
export type InsertSender = z.infer<typeof insertSenderSchema>;
export type Sender = typeof sendersTable.$inferSelect;
