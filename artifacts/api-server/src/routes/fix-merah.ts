import { Router } from "express";
import nodemailer from "nodemailer";
import { db, sendersTable, historyTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
import { SendFixMerahBody, ListFixMerahHistoryQueryParams } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

// Auto-rotate index (in-memory, resets on restart — fine for this use case)
let rotateIndex = 0;

async function pickSender() {
  const senders = await db
    .select()
    .from(sendersTable)
    .where(eq(sendersTable.status, "active"));

  if (senders.length === 0) return null;

  // Filter senders within daily limit
  const available = senders.filter((s) => {
    if (!s.dailyLimit) return true;
    return s.totalUsed < s.dailyLimit;
  });

  if (available.length === 0) return null;

  // Auto-rotate
  const autoRotate = available.filter((s) => s.autoRotate);
  const pool = autoRotate.length > 0 ? autoRotate : available;
  const sender = pool[rotateIndex % pool.length];
  rotateIndex = (rotateIndex + 1) % pool.length;
  return sender;
}

async function sendEmail(
  senderEmail: string,
  appPassword: string,
  targetNumber: string,
  customMessage?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: senderEmail, pass: appPassword },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  const normalizedNumber = targetNumber.replace(/\D/g, "");
  const subject = `Fix Merah - ${normalizedNumber}`;
  const body = customMessage
    ? customMessage
    : `Dear WhatsApp Support,

I would like to report an issue with the phone number: +${normalizedNumber}

This number appears to have a "red" status indicator suggesting account verification issues. Please review and resolve this matter.

Thank you for your assistance.

Best regards`;

  try {
    await transporter.sendMail({
      from: senderEmail,
      to: "support@support.whatsapp.com",
      subject,
      text: body,
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

// POST /fix-merah/send
router.post("/send", async (req, res) => {
  const body = SendFixMerahBody.parse(req.body);
  const sender = await pickSender();

  if (!sender) {
    return res.status(200).json({
      success: false,
      message: "Tidak ada sender aktif yang tersedia. Tambahkan sender atau aktifkan sender yang ada.",
      senderUsed: null,
      errorDetail: "no_available_sender",
    });
  }

  const result = await sendEmail(sender.email, sender.appPassword, body.targetNumber, body.customMessage);

  const status = result.ok ? "success" : "failed";

  // Record history
  await db.insert(historyTable).values({
    userIdentifier: body.userIdentifier,
    senderEmail: sender.email,
    targetNumber: body.targetNumber,
    status,
    errorMessage: result.error ?? null,
  });

  // Update sender stats
  await db.update(sendersTable).set({
    totalUsed: sql`${sendersTable.totalUsed} + 1`,
    lastActive: new Date(),
    status: result.ok ? "active" : "error",
  }).where(eq(sendersTable.id, sender.id));

  // Upsert user
  const existingUser = await db.select().from(
    (await import("@workspace/db")).usersTable
  ).where(eq((await import("@workspace/db")).usersTable.identifier, body.userIdentifier));

  const usersTable = (await import("@workspace/db")).usersTable;
  if (existingUser.length > 0) {
    await db.update(usersTable).set({
      totalProcessed: sql`${usersTable.totalProcessed} + 1`,
      successCount: result.ok ? sql`${usersTable.successCount} + 1` : usersTable.successCount,
      failedCount: !result.ok ? sql`${usersTable.failedCount} + 1` : usersTable.failedCount,
      lastActive: new Date(),
    }).where(eq(usersTable.identifier, body.userIdentifier));
  } else {
    await db.insert(usersTable).values({
      identifier: body.userIdentifier,
      totalProcessed: 1,
      successCount: result.ok ? 1 : 0,
      failedCount: !result.ok ? 1 : 0,
      lastActive: new Date(),
    });
  }

  logger.info({ sender: sender.email, target: body.targetNumber, status }, "fix-merah send");

  return res.json({
    success: result.ok,
    message: result.ok
      ? `Berhasil dikirim ke support@support.whatsapp.com via ${sender.email}`
      : `Gagal kirim: ${result.error}`,
    senderUsed: sender.email,
    errorDetail: result.error ?? null,
  });
});

// GET /fix-merah/stats
router.get("/stats", async (_req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [allTime] = await db.select({
    total: sql<number>`COUNT(*)`,
    success: sql<number>`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
    failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
  }).from(historyTable);

  const [today] = await db.select({
    total: sql<number>`COUNT(*)`,
    success: sql<number>`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
    failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
  }).from(historyTable).where(gte(historyTable.createdAt, todayStart));

  const [senderCount] = await db.select({
    available: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
  }).from(sendersTable);

  const totalAllTime = Number(allTime.total) || 0;
  const successAllTime = Number(allTime.success) || 0;

  res.json({
    totalSentToday: Number(today.total) || 0,
    totalSentAllTime: totalAllTime,
    successToday: Number(today.success) || 0,
    failedToday: Number(today.failed) || 0,
    successAllTime,
    failedAllTime: Number(allTime.failed) || 0,
    availableSenders: Number(senderCount.available) || 0,
    queuedToday: Number(today.total) || 0,
    successRate: totalAllTime > 0 ? Math.round((successAllTime / totalAllTime) * 100) : 0,
  });
});

// GET /fix-merah/history
router.get("/history", async (req, res) => {
  const params = ListFixMerahHistoryQueryParams.parse({
    status: req.query.status,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
  });

  const conditions = [];
  if (params.status && params.status !== "all") {
    conditions.push(eq(historyTable.status, params.status));
  }

  const baseQuery = conditions.length > 0
    ? db.select().from(historyTable).where(conditions[0])
    : db.select().from(historyTable);

  const items = await baseQuery
    .orderBy(sql`${historyTable.createdAt} DESC`)
    .limit(params.limit ?? 50)
    .offset(params.offset ?? 0);

  const [{ total }] = await db.select({ total: sql<number>`COUNT(*)` }).from(historyTable);

  res.json({
    items: items.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
    total: Number(total),
  });
});

export default router;
