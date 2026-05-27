import { Router } from "express";
import { db, sendersTable, usersTable } from "@workspace/db";
import { count, eq, sql } from "drizzle-orm";

const router = Router();
const startTime = Date.now();
const VERSION = "6.0.0";

router.get("/", async (_req, res) => {
  const [senderStats] = await db.select({
    total: count(),
    active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
  }).from(sendersTable);

  const [userStats] = await db.select({ total: count() }).from(usersTable);

  res.json({
    online: true,
    serverStatus: "operational",
    totalUsers: Number(userStats.total),
    totalSenders: Number(senderStats.total),
    activeSenders: Number(senderStats.active) || 0,
    uptime: (Date.now() - startTime) / 1000,
    version: VERSION,
  });
});

export default router;
