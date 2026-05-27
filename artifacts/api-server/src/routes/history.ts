import { Router } from "express";
import { db, historyTable, usersTable, sendersTable } from "@workspace/db";
import { eq, desc, like, or, count, sql } from "drizzle-orm";
import {
  ListHistoryQueryParams,
  CreateHistoryBody,
  DeleteHistoryParams,
} from "@workspace/api-zod";

const router = Router();

function formatEntry(e: typeof historyTable.$inferSelect) {
  return {
    ...e,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const params = ListHistoryQueryParams.parse({
    status: req.query.status,
    search: req.query.search,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
  });

  let query = db.select().from(historyTable);
  const conditions = [];

  if (params.status && params.status !== "all") {
    conditions.push(eq(historyTable.status, params.status));
  }
  if (params.search) {
    conditions.push(
      or(
        like(historyTable.userIdentifier, `%${params.search}%`),
        like(historyTable.senderEmail, `%${params.search}%`)
      )!
    );
  }

  const withConditions = conditions.length > 0
    ? query.where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`)
    : query;

  const items = await withConditions
    .orderBy(desc(historyTable.createdAt))
    .limit(params.limit ?? 50)
    .offset(params.offset ?? 0);

  const [{ count: total }] = await db.select({ count: count() }).from(historyTable);

  res.json({ items: items.map(formatEntry), total: Number(total) });
});

router.post("/", async (req, res) => {
  const body = CreateHistoryBody.parse(req.body);
  const [entry] = await db
    .insert(historyTable)
    .values({
      userIdentifier: body.userIdentifier,
      senderEmail: body.senderEmail,
      targetNumber: body.targetNumber ?? null,
      status: body.status,
      errorMessage: body.errorMessage ?? null,
    })
    .returning();

  // Update sender's totalUsed and lastActive
  await db
    .update(sendersTable)
    .set({
      totalUsed: sql`${sendersTable.totalUsed} + 1`,
      lastActive: new Date(),
      status: body.status === "failed" ? "error" : "active",
    })
    .where(eq(sendersTable.email, body.senderEmail));

  // Upsert user stats
  const existing = await db.select().from(usersTable).where(eq(usersTable.identifier, body.userIdentifier));
  if (existing.length > 0) {
    await db.update(usersTable).set({
      totalProcessed: sql`${usersTable.totalProcessed} + 1`,
      successCount: body.status === "success" ? sql`${usersTable.successCount} + 1` : usersTable.successCount,
      failedCount: body.status === "failed" ? sql`${usersTable.failedCount} + 1` : usersTable.failedCount,
      lastActive: new Date(),
    }).where(eq(usersTable.identifier, body.userIdentifier));
  } else {
    await db.insert(usersTable).values({
      identifier: body.userIdentifier,
      totalProcessed: 1,
      successCount: body.status === "success" ? 1 : 0,
      failedCount: body.status === "failed" ? 1 : 0,
      lastActive: new Date(),
    });
  }

  res.status(201).json(formatEntry(entry));
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteHistoryParams.parse({ id: Number(req.params.id) });
  await db.delete(historyTable).where(eq(historyTable.id, id));
  res.status(204).send();
});

export default router;
