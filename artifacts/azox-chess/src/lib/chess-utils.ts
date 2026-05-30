import { Chess } from 'chess.js';

export const PIECE_SYMBOLS: Record<string, Record<'w' | 'b', string>> = {
  p: { w: '♙', b: '♟' },
  n: { w: '♘', b: '♞' },
  b: { w: '♗', b: '♝' },
  r: { w: '♖', b: '♜' },
  q: { w: '♕', b: '♛' },
  k: { w: '♔', b: '♚' }
};

export const PIECE_POINTS: Record<string, number> = {
  p: 3,
  n: 5,
  b: 5,
  r: 5,
  q: 5,
  k: 10
};

export function calculatePoints(capturedPieces: { type: string, color: 'w' | 'b' }[]) {
  let whitePoints = 0;
  let blackPoints = 0;

  capturedPieces.forEach(p => {
    const points = PIECE_POINTS[p.type] || 0;
    if (p.color === 'w') {
      blackPoints += points; // Black captured a white piece
    } else {
      whitePoints += points; // White captured a black piece
    }
  });

  return { whitePoints, blackPoints };
}

export function getCapturedPieces(history: any[]) {
  const captured: { type: string, color: 'w' | 'b' }[] = [];
  history.forEach(move => {
    if (move.captured) {
      captured.push({
        type: move.captured,
        color: move.color === 'w' ? 'b' : 'w' // The captured piece is the opposite color of the move
      });
    }
  });
  return captured;
}
