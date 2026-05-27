import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sendersRouter from "./senders";
import historyRouter from "./history";
import statsRouter from "./stats";
import leaderboardRouter from "./leaderboard";
import settingsRouter from "./settings";
import statusRouter from "./status";
import usersRouter from "./users";
import fixMerahRouter from "./fix-merah";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/senders", sendersRouter);
router.use("/history", historyRouter);
router.use("/stats", statsRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/settings", settingsRouter);
router.use("/status", statusRouter);
router.use("/users", usersRouter);
router.use("/fix-merah", fixMerahRouter);

export default router;
