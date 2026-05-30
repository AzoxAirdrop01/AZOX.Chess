import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { Server } from "http";
import { getMatch, updateMatch, deleteMatch } from "./matchStore.js";
import { logger } from "./logger.js";

interface GameRoom {
  code: string;
  players: WebSocket[];
  colors: ("w" | "b")[];
}

const rooms = new Map<string, GameRoom>();

type ClientMessage =
  | { type: "join"; code: string }
  | { type: "move"; code: string; move: { from: string; to: string; promotion?: string } }
  | { type: "timer_expired"; code: string };

function send(ws: WebSocket, data: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcast(room: GameRoom, data: unknown, exclude?: WebSocket): void {
  for (const player of room.players) {
    if (player !== exclude) {
      send(player, data);
    }
  }
}

export function setupWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    let currentCode: string | null = null;

    ws.on("message", (raw) => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(raw.toString()) as ClientMessage;
      } catch {
        send(ws, { type: "error", message: "Invalid message format" });
        return;
      }

      if (msg.type === "join") {
        const { code } = msg;
        const match = getMatch(code);

        if (!match) {
          send(ws, { type: "error", message: "Match not found" });
          return;
        }

        let room = rooms.get(code);
        if (!room) {
          room = { code, players: [], colors: [] };
          rooms.set(code, room);
        }

        if (room.players.length >= 2) {
          send(ws, { type: "error", message: "Match is already full" });
          return;
        }

        currentCode = code;
        const playerNumber = room.players.length + 1;
        const color: "w" | "b" = playerNumber === 1 ? "w" : "b";

        room.players.push(ws);
        room.colors.push(color);

        updateMatch(code, {
          playerCount: room.players.length,
          status: room.players.length >= 2 ? "active" : "waiting",
        });

        send(ws, { type: "player_joined", playerNumber, color });

        if (room.players.length === 2) {
          for (let i = 0; i < room.players.length; i++) {
            send(room.players[i], { type: "game_start", color: room.colors[i] });
          }
          logger.info({ code }, "Game started");
        }

      } else if (msg.type === "move") {
        const { code, move } = msg;
        const room = rooms.get(code);
        if (!room) return;

        const senderIndex = room.players.indexOf(ws);
        if (senderIndex === -1) return;

        broadcast(room, { type: "move", move }, ws);

      } else if (msg.type === "timer_expired") {
        const { code } = msg;
        const room = rooms.get(code);
        if (!room) return;

        broadcast(room, { type: "timer_expired" }, ws);
      }
    });

    ws.on("close", () => {
      if (!currentCode) return;
      const room = rooms.get(currentCode);
      if (!room) return;

      const idx = room.players.indexOf(ws);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        room.colors.splice(idx, 1);
      }

      broadcast(room, { type: "opponent_disconnected" });

      if (room.players.length === 0) {
        rooms.delete(currentCode);
        deleteMatch(currentCode);
        logger.info({ code: currentCode }, "Room cleaned up");
      }
    });

    ws.on("error", (err) => {
      logger.error({ err }, "WebSocket error");
    });
  });

  logger.info("WebSocket server attached at /ws");
}
