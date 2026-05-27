import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody } from "@workspace/api-zod";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    ...u,
    lastActive: u.lastActive ? u.lastActive.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map(formatUser));
});

router.post("/", async (req, res) => {
  const body = CreateUserBody.parse(req.body);
  const existing = await db.select().from(usersTable).where(eq(usersTable.identifier, body.identifier));
  if (existing.length > 0) {
    return res.status(201).json(formatUser(existing[0]));
  }
  const [user] = await db.insert(usersTable).values({ identifier: body.identifier }).returning();
  res.status(201).json(formatUser(user));
});

export default router;
