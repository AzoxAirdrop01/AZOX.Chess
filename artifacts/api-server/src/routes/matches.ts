import { Router, type IRouter } from "express";
import { createMatch, getMatch, updateMatch } from "../lib/matchStore.js";
import { GetMatchParams, JoinMatchParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/matches", async (_req, res): Promise<void> => {
  const match = createMatch();
  res.status(201).json({
    code: match.code,
    status: match.status,
    playerCount: match.playerCount,
    createdAt: match.createdAt.toISOString(),
  });
});

router.get("/matches/:code", async (req, res): Promise<void> => {
  const params = GetMatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const match = getMatch(params.data.code);
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.json({
    code: match.code,
    status: match.status,
    playerCount: match.playerCount,
    createdAt: match.createdAt.toISOString(),
  });
});

router.post("/matches/:code/join", async (req, res): Promise<void> => {
  const params = JoinMatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const match = getMatch(params.data.code);
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  if (match.playerCount >= 2) {
    res.status(409).json({ error: "Match is already full" });
    return;
  }

  const updated = updateMatch(params.data.code, {
    playerCount: match.playerCount + 1,
    status: match.playerCount + 1 >= 2 ? "active" : "waiting",
  });

  res.json({
    code: updated!.code,
    status: updated!.status,
    playerCount: updated!.playerCount,
    createdAt: updated!.createdAt.toISOString(),
  });
});

export default router;
