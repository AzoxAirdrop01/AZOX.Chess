import { Chess } from 'chess.js';
import { useCallback } from 'react';

function evaluateBoard(game: Chess): number {
  const pieceValues: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  let score = 0;
  game.board().flat().forEach(piece => {
    if (!piece) return;
    const val = pieceValues[piece.type] ?? 0;
    score += piece.color === 'w' ? val : -val;
  });
  return score;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, isMax: boolean): number {
  if (depth === 0 || game.isGameOver()) return evaluateBoard(game);
  const moves = game.moves();
  if (isMax) {
    let best = -Infinity;
    for (const move of moves) {
      game.move(move);
      best = Math.max(best, minimax(game, depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      game.move(move);
      best = Math.min(best, minimax(game, depth - 1, alpha, beta, true));
      game.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function useChessAI() {
  const getBestMove = useCallback((game: Chess): string | null => {
    const moves = game.moves({ verbose: true });
    if (!moves.length) return null;
    let bestMove = moves[0].san;
    let bestVal = game.turn() === 'w' ? -Infinity : Infinity;
    
    // AI is typically playing black in our setup, but let's make it general
    const isMax = game.turn() === 'w';

    for (const move of moves) {
      game.move(move.san);
      const val = minimax(game, 2, -Infinity, Infinity, !isMax);
      game.undo();
      
      if (isMax) {
        if (val > bestVal) { bestVal = val; bestMove = move.san; }
      } else {
        if (val < bestVal) { bestVal = val; bestMove = move.san; }
      }
    }
    return bestMove;
  }, []);

  return { getBestMove };
}
