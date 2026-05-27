import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.totalProcessed)).limit(50);

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    userIdentifier: u.identifier,
    totalProcessed: u.totalProcessed,
    successCount: u.successCount,
    failedCount: u.failedCount,
    successRate: u.totalProcessed > 0
      ? Math.round((u.successCount / u.totalProcessed) * 100)
      : 0,
  }));

  res.json(leaderboard);
});

export default router;
