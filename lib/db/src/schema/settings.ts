import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("ADI Fix Merah"),
  neonMode: boolean("neon_mode").notNull().default(true),
  darkMode: boolean("dark_mode").notNull().default(true),
  loadingMode: boolean("loading_mode").notNull().default(true),
  bgCustom: text("bg_custom"),
  animationCustom: text("animation_custom"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
