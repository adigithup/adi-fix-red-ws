import { Router } from "express";
import { db, sendersTable, historyTable, usersTable } from "@workspace/db";
import { eq, count, sql, desc } from "drizzle-orm";
import { GetActivityQueryParams } from "@workspace/api-zod";

const router = Router();
const startTime = Date.now();

router.get("/", async (_req, res) => {
  const [senderStats] = await db.select({
    total: count(),
    active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
    disabled: sql<number>`SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END)`,
    error: sql<number>`SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END)`,
  }).from(sendersTable);

  const [histStats] = await db.select({
    total: count(),
    success: sql<number>`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
    failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
  }).from(historyTable);

  const [userStats] = await db.select({ total: count() }).from(usersTable);

  const total = Number(histStats.total) || 0;
  const success = Number(histStats.success) || 0;
  const successRatio = total > 0 ? Math.round((success / total) * 100) : 0;

  res.json({
    totalSenders: Number(senderStats.total),
    activeSenders: Number(senderStats.active) || 0,
    disabledSenders: Number(senderStats.disabled) || 0,
    errorSenders: Number(senderStats.error) || 0,
    totalHistory: total,
    successCount: success,
    failedCount: Number(histStats.failed) || 0,
    successRatio,
    totalUsers: Number(userStats.total),
    uptime: (Date.now() - startTime) / 1000,
  });
});

router.get("/activity", async (req, res) => {
  const params = GetActivityQueryParams.parse({
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });

  const entries = await db.select().from(historyTable)
    .orderBy(desc(historyTable.createdAt))
    .limit(params.limit ?? 20);

  const activity = entries.map(e => ({
    id: e.id,
    type: e.status === "success" ? "success" : "failed",
    message: e.status === "success"
      ? `Proses sukses oleh ${e.userIdentifier} via ${e.senderEmail}`
      : `Proses gagal oleh ${e.userIdentifier}: ${e.errorMessage ?? "unknown error"}`,
    createdAt: e.createdAt.toISOString(),
  }));

  res.json(activity);
});

router.get("/chart", async (_req, res) => {
  const days = 7;
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const [row] = await db.select({
      success: sql<number>`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
      failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
    }).from(historyTable).where(
      sql`DATE(created_at) = ${dateStr}`
    );

    result.push({
      date: dateStr,
      success: Number(row?.success) || 0,
      failed: Number(row?.failed) || 0,
    });
  }

  res.json(result);
});

export default router;
