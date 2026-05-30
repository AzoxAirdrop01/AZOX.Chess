import React, { useState, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PIECE_SYMBOLS } from '@/lib/chess-utils';
import { ChessPiece } from '@/components/ChessPiece';

interface ChessBoardProps {
  game: Chess;
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  playerColor?: 'w' | 'b';
  disabled?: boolean;
}

export function ChessBoard({ game, onMove, playerColor = 'w', disabled = false }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [promotionMove, setPromotionMove] = useState<{ from: string; to: string } | null>(null);

  const board = game.board();

  useEffect(() => {
    const history = game.history({ verbose: true });
    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
    setSelectedSquare(null);
    setValidMoves([]);
  }, [game.fen()]);

  const handleSquareClick = (square: Square) => {
    if (disabled) return;
    if (promotionMove) return;

    const piece = game.get(square);

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      const move = validMoves.find(m => m.to === square);
      if (move) {
        const isPromotion = move.flags.includes('p') || move.flags.includes('c');
        if (isPromotion && move.piece === 'p') {
          setPromotionMove({ from: selectedSquare, to: square });
        } else {
          onMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setValidMoves([]);
        }
        return;
      }

      if (piece && piece.color === game.turn() && piece.color === playerColor) {
        setSelectedSquare(square);
        setValidMoves(game.moves({ square, verbose: true }) as Move[]);
        return;
      }

      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      if (piece && piece.color === game.turn() && piece.color === playerColor) {
        setSelectedSquare(square);
        setValidMoves(game.moves({ square, verbose: true }) as Move[]);
      }
    }
  };

  const handlePromotion = (piece: string) => {
    if (promotionMove) {
      onMove({ from: promotionMove.from, to: promotionMove.to, promotion: piece });
      setPromotionMove(null);
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const ranks = playerColor === 'w'
    ? ['8', '7', '6', '5', '4', '3', '2', '1']
    : ['1', '2', '3', '4', '5', '6', '7', '8'];
  const files = playerColor === 'w'
    ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  const getSquareData = (file: string, rank: string) => {
    const square = `${file}${rank}` as Square;
    const rIndex = 8 - parseInt(rank);
    const fIndex = file.charCodeAt(0) - 97;
    const pieceObj = board[rIndex][fIndex];
    const isDark = (rIndex + fIndex) % 2 !== 0;
    return { square, pieceObj, isDark };
  };

  return (
    <div className="relative w-full max-w-[80vmin] aspect-square mx-auto rounded-lg overflow-hidden shadow-2xl border-4 border-card-border bg-card">
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
        {ranks.map(rank =>
          files.map(file => {
            const { square, pieceObj, isDark } = getSquareData(file, rank);

            const isSelected = selectedSquare === square;
            const isLastMove = lastMove?.from === square || lastMove?.to === square;
            const isValidMove = validMoves.some(m => m.to === square);
            const isCapture = isValidMove && !!pieceObj;
            const inCheck = pieceObj?.type === 'k' && pieceObj.color === game.turn() && game.inCheck();

            return (
              <div
                key={square}
                data-testid={`square-${square}`}
                onClick={() => handleSquareClick(square)}
                className={`
                  relative flex items-center justify-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl select-none transition-colors duration-200
                  ${isDark ? 'bg-secondary' : 'bg-primary/20'}
                  ${isSelected ? 'bg-primary/50' : ''}
                  ${isLastMove && !isSelected ? 'bg-primary/30' : ''}
                  ${inCheck ? 'bg-destructive/60 shadow-[inset_0_0_20px_hsl(var(--destructive))]' : ''}
                  ${!disabled && pieceObj?.color === playerColor && pieceObj?.color === game.turn() ? 'cursor-pointer hover:bg-primary/40' : ''}
                  ${isValidMove && !isCapture ? 'cursor-pointer hover:bg-primary/40' : ''}
                  ${isCapture ? 'cursor-pointer' : ''}
                `}
              >
                {/* Valid move indicator */}
                {isValidMove && !isCapture && (
                  <div className="absolute w-1/4 h-1/4 rounded-full bg-primary/60 shadow-[0_0_10px_hsl(var(--primary))] pointer-events-none" />
                )}

                {/* Valid capture indicator */}
                {isCapture && (
                  <div className="absolute inset-0 border-4 border-primary/60 rounded-full pointer-events-none scale-90" />
                )}

                {/* Piece */}
                {pieceObj && (
                  <div
                    className={`
                      relative z-10 transition-transform duration-200 flex items-center justify-center
                      ${pieceObj.color === 'w' ? 'text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : 'text-background drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]'}
                      ${isSelected ? 'scale-110' : 'scale-100'}
                    `}
                  >
                    <ChessPiece type={pieceObj.type} color={pieceObj.color} />
                  </div>
                )}

                {/* Coordinates */}
                {file === files[0] && (
                  <div className="absolute top-1 left-1 text-[10px] sm:text-xs font-sans font-bold opacity-50 pointer-events-none">
                    {rank}
                  </div>
                )}
                {rank === ranks[7] && (
                  <div className="absolute bottom-1 right-1 text-[10px] sm:text-xs font-sans font-bold opacity-50 pointer-events-none">
                    {file}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Promotion Dialog */}
      {promotionMove && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-primary/30 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <h3 className="font-serif text-2xl text-primary text-center">Promote Pawn</h3>
            <div className="flex gap-4">
              {(['q', 'r', 'b', 'n'] as const).map(p => (
                <button
                  key={p}
                  data-testid={`promotion-${p}`}
                  onClick={() => handlePromotion(p)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary hover:bg-primary/20 rounded-lg flex items-center justify-center text-4xl sm:text-5xl transition-all hover:scale-105"
                >
                  <span className={playerColor === 'w' ? 'text-foreground' : 'text-background drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]'}>
                    {p === 'k' || p === 'b'
                      ? <ChessPiece type={p} color={playerColor} />
                      : PIECE_SYMBOLS[p][playerColor]
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
