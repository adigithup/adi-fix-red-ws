import { Router } from "express";
import { db, sendersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateSenderBody,
  UpdateSenderBody,
  UpdateSenderParams,
  DeleteSenderParams,
  ToggleSenderParams,
  ToggleSenderBody,
  ResetSenderParams,
  GetSenderParams,
} from "@workspace/api-zod";

const router = Router();

function formatSender(s: typeof sendersTable.$inferSelect) {
  return {
    ...s,
    lastReset: s.lastReset ? s.lastReset.toISOString() : null,
    lastActive: s.lastActive ? s.lastActive.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const senders = await db.select().from(sendersTable).orderBy(sendersTable.createdAt);
  res.json(senders.map(formatSender));
});

router.post("/", async (req, res) => {
  const body = CreateSenderBody.parse(req.body);
  const [sender] = await db
    .insert(sendersTable)
    .values({
      email: body.email,
      appPassword: body.appPassword,
      dailyLimit: body.dailyLimit ?? null,
      autoRotate: body.autoRotate ?? false,
      notes: body.notes ?? null,
      status: "active",
    })
    .returning();
  res.status(201).json(formatSender(sender));
});

router.get("/:id", async (req, res) => {
  const { id } = GetSenderParams.parse({ id: Number(req.params.id) });
  const [sender] = await db.select().from(sendersTable).where(eq(sendersTable.id, id));
  if (!sender) return res.status(404).json({ error: "Sender not found" });
  res.json(formatSender(sender));
});

router.patch("/:id", async (req, res) => {
  const { id } = UpdateSenderParams.parse({ id: Number(req.params.id) });
  const body = UpdateSenderBody.parse(req.body);
  const [sender] = await db
    .update(sendersTable)
    .set({
      ...(body.email !== undefined && { email: body.email }),
      ...(body.appPassword !== undefined && { appPassword: body.appPassword }),
      ...(body.dailyLimit !== undefined && { dailyLimit: body.dailyLimit }),
      ...(body.autoRotate !== undefined && { autoRotate: body.autoRotate }),
      ...(body.notes !== undefined && { notes: body.notes }),
    })
    .where(eq(sendersTable.id, id))
    .returning();
  if (!sender) return res.status(404).json({ error: "Sender not found" });
  res.json(formatSender(sender));
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteSenderParams.parse({ id: Number(req.params.id) });
  await db.delete(sendersTable).where(eq(sendersTable.id, id));
  res.status(204).send();
});

router.post("/:id/toggle", async (req, res) => {
  const { id } = ToggleSenderParams.parse({ id: Number(req.params.id) });
  const body = ToggleSenderBody.parse(req.body);
  const [sender] = await db
    .update(sendersTable)
    .set({ status: body.enabled ? "active" : "disabled" })
    .where(eq(sendersTable.id, id))
    .returning();
  if (!sender) return res.status(404).json({ error: "Sender not found" });
  res.json(formatSender(sender));
});

router.post("/:id/reset", async (req, res) => {
  const { id } = ResetSenderParams.parse({ id: Number(req.params.id) });
  const [sender] = await db
    .update(sendersTable)
    .set({ totalUsed: 0, lastReset: new Date() })
    .where(eq(sendersTable.id, id))
    .returning();
  if (!sender) return res.status(404).json({ error: "Sender not found" });
  res.json(formatSender(sender));
});

export default router;
