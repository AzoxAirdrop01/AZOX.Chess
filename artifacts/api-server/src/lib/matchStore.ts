import { randomBytes } from "crypto";

export type MatchStatus = "waiting" | "active" | "finished";

export interface MatchRecord {
  code: string;
  status: MatchStatus;
  playerCount: number;
  createdAt: Date;
}

const matches = new Map<string, MatchRecord>();

function generateCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

export function createMatch(): MatchRecord {
  let code: string;
  do {
    code = generateCode();
  } while (matches.has(code));

  const match: MatchRecord = {
    code,
    status: "waiting",
    playerCount: 0,
    createdAt: new Date(),
  };

  matches.set(code, match);

  setTimeout(() => {
    const m = matches.get(code);
    if (m && m.status === "waiting") {
      matches.delete(code);
    }
  }, 30 * 60 * 1000);

  return match;
}

export function getMatch(code: string): MatchRecord | undefined {
  return matches.get(code);
}

export function updateMatch(code: string, updates: Partial<MatchRecord>): MatchRecord | undefined {
  const match = matches.get(code);
  if (!match) return undefined;
  const updated = { ...match, ...updates };
  matches.set(code, updated);
  return updated;
}

export function deleteMatch(code: string): void {
  matches.delete(code);
}
