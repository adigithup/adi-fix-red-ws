import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

async function getOrCreateSettings() {
  const rows = await db.select().from(settingsTable);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created;
}

function formatSettings(s: typeof settingsTable.$inferSelect) {
  return {
    ...s,
    updatedAt: s.updatedAt.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  const settings = await getOrCreateSettings();
  res.json(formatSettings(settings));
});

router.patch("/", async (req, res) => {
  const body = UpdateSettingsBody.parse(req.body);
  const current = await getOrCreateSettings();
  const [updated] = await db
    .update(settingsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(settingsTable.id, current.id))
    .returning();
  res.json(formatSettings(updated));
});

export default router;
