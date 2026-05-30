import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import { PlayerInfo } from '@/components/PlayerInfo';
import { useChessAI } from '@/hooks/useChessAI';
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

const TURN_SECONDS = 120;
const PLAYER_COLOR = 'w' as const;

export default function SinglePlayerGame() {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const { getBestMove } = useChessAI();

  const [turnTimeLeft, setTurnTimeLeft] = useState(TURN_SECONDS);
  const [gameOver, setGameOver] = useState<{
    winner: 'w' | 'b' | 'draw' | null;
    reason: string;
  } | null>(null);

  const isPlayerTurn = gameRef.current.turn() === PLAYER_COLOR && !gameOver;

  const checkGameOver = useCallback(() => {
    const game = gameRef.current;
    if (game.isCheckmate()) {
      setGameOver({ winner: game.turn() === 'w' ? 'b' : 'w', reason: 'Checkmate' });
    } else if (game.isDraw()) {
      setGameOver({ winner: 'draw', reason: 'Draw' });
    }
  }, []);

  // Reset timer on every move (fen change)
  useEffect(() => {
    setTurnTimeLeft(TURN_SECONDS);
  }, [fen]);

  // Turn countdown — when it expires, play a random move for the current player
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          const game = gameRef.current;
          if (!game.isGameOver()) {
            const moves = game.moves();
            if (moves.length > 0) {
              const rand = moves[Math.floor(Math.random() * moves.length)];
              game.move(rand);
              setFen(game.fen());
              checkGameOver();
            }
          }
          return TURN_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver, checkGameOver]);

  // AI move
  useEffect(() => {
    if (gameRef.current.turn() !== PLAYER_COLOR && !gameOver) {
      const timeoutId = setTimeout(() => {
        const game = gameRef.current;
        if (game.isGameOver()) return;
        const bestMove = getBestMove(game);
        if (bestMove) {
          game.move(bestMove);
          setFen(game.fen());
          checkGameOver();
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [fen, gameOver, getBestMove, checkGameOver]);

  const handleMove = useCallback(
    (move: { from: string; to: string; promotion?: string }) => {
      if (gameOver || gameRef.current.turn() !== PLAYER_COLOR) return;
      try {
        const result = gameRef.current.move(move);
        if (result) {
          setFen(gameRef.current.fen());
          checkGameOver();
        }
      } catch (_e) {
        // Invalid move
      }
    },
    [gameOver, checkGameOver],
  );

  const handlePlayAgain = useCallback(() => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setGameOver(null);
    setTurnTimeLeft(TURN_SECONDS);
  }, []);

  const history = gameRef.current.history({ verbose: true });
  const capturedPieces = getCapturedPieces(history);
  const { whitePoints, blackPoints } = calculatePoints(capturedPieces);

  // White captured black pieces; black captured white pieces
  const whiteCaptured = capturedPieces.filter(p => p.color === 'b');
  const blackCaptured = capturedPieces.filter(p => p.color === 'w');

  const finalWhitePoints = whitePoints + (gameOver?.winner === 'w' ? 100 : 0);
  const finalBlackPoints = blackPoints + (gameOver?.winner === 'b' ? 100 : 0);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background py-8">
      <div className="flex flex-col gap-4 w-full px-4 items-center">
        {/* AI (opponent) */}
        <PlayerInfo
          name="AZOX Engine"
          color="b"
          points={blackPoints}
          timeLeft={turnTimeLeft}
          isActive={!isPlayerTurn && !gameOver}
          capturedPieces={blackCaptured}
          isOpponent
        />

        <ChessBoard
          game={gameRef.current}
          onMove={handleMove}
          playerColor={PLAYER_COLOR}
          disabled={!isPlayerTurn || !!gameOver}
        />

        {/* Player */}
        <PlayerInfo
          name="You"
          color="w"
          points={whitePoints}
          timeLeft={turnTimeLeft}
          isActive={isPlayerTurn && !gameOver}
          capturedPieces={whiteCaptured}
        />
      </div>

      <Dialog open={!!gameOver} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-center font-serif text-3xl text-primary">
              {gameOver?.winner === 'w'
                ? 'Victory'
                : gameOver?.winner === 'b'
                  ? 'Defeat'
                  : 'Draw'}
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              {gameOver?.reason}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-around my-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">You</p>
              <p className="text-3xl font-mono text-foreground font-bold">{finalWhitePoints}</p>
            </div>
            <div className="w-px bg-border/50" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">AZOX Engine</p>
              <p className="text-3xl font-mono text-foreground font-bold">{finalBlackPoints}</p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full" onClick={handlePlayAgain}>
              Play Again
            </Button>
            <Link href="/" className="w-full">
              <Button className="w-full">Return Home</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
