import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import { PlayerInfo } from '@/components/PlayerInfo';
import { calculatePoints, getCapturedPieces } from '@/lib/chess-utils';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const TURN_SECONDS = 120;

export default function MultiplayerGame() {
  const [, params] = useRoute('/game/:code');
  const code = params?.code;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Use a ref for the Chess instance so ws handlers always see current game state
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());

  // Use a ref for playerColor to avoid stale closures in ws handlers
  const playerColorRef = useRef<'w' | 'b' | null>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);

  const [turnTimeLeft, setTurnTimeLeft] = useState(TURN_SECONDS);
  const [gameOver, setGameOver] = useState<{
    winner: 'w' | 'b' | 'draw' | null;
    reason: string;
  } | null>(null);

  const [gameStarted, setGameStarted] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // ── WebSocket connection ──────────────────────────────────────────────────
  useEffect(() => {
    if (!code) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', code }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as Record<string, unknown>;

      switch (data.type) {
        case 'player_joined': {
          const color = data.color as 'w' | 'b';
          setPlayerColor(color);
          playerColorRef.current = color;
          break;
        }
        case 'game_start': {
          setGameStarted(true);
          toast({ title: 'Game Started', description: 'Your opponent has connected.' });
          break;
        }
        case 'move': {
          const move = data.move as { from: string; to: string; promotion?: string };
          try {
            gameRef.current.move(move);
            setFen(gameRef.current.fen());
          } catch (_e) {
            // Invalid move from server — ignore
          }
          break;
        }
        case 'timer_expired': {
          // Opponent's timer expired — they will send a random move separately
          break;
        }
        case 'opponent_disconnected': {
          // Use ref so we get the correct playerColor even in stale closures
          setGameOver({ winner: playerColorRef.current, reason: 'Opponent Disconnected' });
          break;
        }
        case 'error': {
          toast({ title: 'Error', description: data.message as string, variant: 'destructive' });
          setLocation('/');
          break;
        }
      }
    };

    ws.onerror = () => {
      toast({
        title: 'Connection Error',
        description: 'Lost connection to the game server.',
        variant: 'destructive',
      });
    };

    return () => {
      ws.close();
    };
  }, [code, setLocation, toast]);

  // ── Game-over detection (runs after every move) ───────────────────────────
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const game = gameRef.current;
    if (game.isCheckmate()) {
      setGameOver({ winner: game.turn() === 'w' ? 'b' : 'w', reason: 'Checkmate' });
    } else if (game.isDraw()) {
      setGameOver({ winner: 'draw', reason: 'Draw' });
    }
  }, [fen, gameStarted, gameOver]);

  // ── Turn timer: reset on every move ──────────────────────────────────────
  useEffect(() => {
    if (!gameStarted) return;
    setTurnTimeLeft(TURN_SECONDS);
  }, [fen, gameStarted]);

  // ── Turn countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          const isMyTurn = gameRef.current.turn() === playerColorRef.current;
          if (isMyTurn && !gameRef.current.isGameOver()) {
            // Make a random move on behalf of the player whose timer expired
            const moves = gameRef.current.moves({ verbose: true });
            if (moves.length > 0) {
              const rand = moves[Math.floor(Math.random() * moves.length)];
              gameRef.current.move(rand);
              setFen(gameRef.current.fen());
              wsRef.current?.send(
                JSON.stringify({
                  type: 'move',
                  code,
                  move: { from: rand.from, to: rand.to, promotion: rand.promotion },
                }),
              );
              wsRef.current?.send(JSON.stringify({ type: 'timer_expired', code }));
            }
          }
          return TURN_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, code]);

  // ── Player move handler ───────────────────────────────────────────────────
  const handleMove = useCallback(
    (move: { from: string; to: string; promotion?: string }) => {
      if (gameOver || gameRef.current.turn() !== playerColorRef.current || !gameStarted) return;
      try {
        const result = gameRef.current.move(move);
        if (result) {
          setFen(gameRef.current.fen());
          wsRef.current?.send(JSON.stringify({ type: 'move', code, move }));
        }
      } catch (_e) {
        // Invalid move
      }
    },
    [gameOver, gameStarted, code],
  );

  // ── Connecting screen ─────────────────────────────────────────────────────
  if (!playerColor) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-primary font-serif tracking-widest">CONNECTING...</p>
      </div>
    );
  }

  // ── Score / captured pieces ───────────────────────────────────────────────
  const isPlayerTurn = gameRef.current.turn() === playerColor && !gameOver && gameStarted;
  const history = gameRef.current.history({ verbose: true });
  const capturedPieces = getCapturedPieces(history);
  const { whitePoints, blackPoints } = calculatePoints(capturedPieces);

  // "white captured" means white pieces that were taken by black, shown in black's panel
  const whiteCapturedByBlack = capturedPieces.filter(p => p.color === 'w');
  const blackCapturedByWhite = capturedPieces.filter(p => p.color === 'b');

  const playerPoints = playerColor === 'w' ? whitePoints : blackPoints;
  const opponentPoints = playerColor === 'w' ? blackPoints : whitePoints;
  const playerCaptured = playerColor === 'w' ? blackCapturedByWhite : whiteCapturedByBlack;
  const opponentCaptured = playerColor === 'w' ? whiteCapturedByBlack : blackCapturedByWhite;

  const finalWhitePoints = whitePoints + (gameOver?.winner === 'w' ? 100 : 0);
  const finalBlackPoints = blackPoints + (gameOver?.winner === 'b' ? 100 : 0);
  const finalPlayerPoints = playerColor === 'w' ? finalWhitePoints : finalBlackPoints;
  const finalOpponentPoints = playerColor === 'w' ? finalBlackPoints : finalWhitePoints;

  const opponentColor: 'w' | 'b' = playerColor === 'w' ? 'b' : 'w';

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background py-8 relative">
      {/* Waiting overlay */}
      {!gameStarted && !gameOver && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-card border border-primary/20 p-8 rounded-xl shadow-[0_0_50px_hsl(var(--primary)/0.1)] text-center max-w-sm w-full mx-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-6" />
            <h3 className="font-serif text-2xl text-primary tracking-widest mb-2">WAITING</h3>
            <p className="text-muted-foreground mb-2">
              Share code{' '}
              <span className="font-mono text-foreground font-bold">{code}</span> with your opponent
            </p>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
              You are playing as {playerColor === 'w' ? 'White' : 'Black'}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full px-4 items-center">
        {/* Opponent */}
        <PlayerInfo
          name="Opponent"
          color={opponentColor}
          points={opponentPoints}
          timeLeft={turnTimeLeft}
          isActive={!isPlayerTurn && !gameOver && gameStarted}
          capturedPieces={opponentCaptured}
          isOpponent
        />

        <ChessBoard
          game={gameRef.current}
          onMove={handleMove}
          playerColor={playerColor}
          disabled={!isPlayerTurn || !!gameOver || !gameStarted}
        />

        {/* Player */}
        <PlayerInfo
          name="You"
          color={playerColor}
          points={playerPoints}
          timeLeft={turnTimeLeft}
          isActive={isPlayerTurn && !gameOver && gameStarted}
          capturedPieces={playerCaptured}
        />
      </div>

      {/* Game over modal */}
      <Dialog open={!!gameOver} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-center font-serif text-3xl text-primary">
              {gameOver?.winner === playerColor
                ? 'Victory'
                : gameOver?.winner === 'draw'
                  ? 'Draw'
                  : 'Defeat'}
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              {gameOver?.reason}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-around my-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">You</p>
              <p className="text-3xl font-mono text-foreground font-bold">{finalPlayerPoints}</p>
            </div>
            <div className="w-px bg-border/50" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Opponent</p>
              <p className="text-3xl font-mono text-foreground font-bold">{finalOpponentPoints}</p>
            </div>
          </div>
          <DialogFooter>
            <Link href="/" className="w-full">
              <Button
                className="w-full"
                onClick={() => sessionStorage.removeItem('azox_match_code')}
              >
                Return Home
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
