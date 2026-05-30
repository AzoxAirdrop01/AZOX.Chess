import React from 'react';
import { ChessPiece } from '@/components/ChessPiece';
import { Card } from '@/components/ui/card';

interface PlayerInfoProps {
  name: string;
  color: 'w' | 'b';
  points: number;
  timeLeft: number;
  isActive: boolean;
  capturedPieces: { type: string; color: 'w' | 'b' }[];
  isOpponent?: boolean;
  showTimer?: boolean;
}

export function PlayerInfo({
  name,
  color,
  points,
  timeLeft,
  isActive,
  capturedPieces,
  isOpponent = false,
  showTimer = true,
}: PlayerInfoProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 30 && timeLeft > 0 && isActive;

  return (
    <Card
      className={`
        flex flex-col p-4 w-full max-w-[80vmin] mx-auto transition-all duration-300
        ${isActive ? 'border-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)]' : 'border-border/50 opacity-70'}
        ${isOpponent ? 'rounded-t-lg rounded-b-none border-b-0' : 'rounded-b-lg rounded-t-none border-t-0'}
      `}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full flex-shrink-0 ${
              color === 'w' ? 'bg-foreground' : 'bg-background border border-foreground/30'
            }`}
          />
          <h2 className="font-serif text-lg font-bold text-foreground">{name}</h2>
          <span data-testid={`text-points-${name}`} className="text-sm font-mono text-primary font-bold">
            +{points}
          </span>
        </div>

        {showTimer && (
          <div
            className={`
              font-mono text-xl font-bold px-3 py-1 rounded transition-colors
              ${isActive ? 'bg-secondary text-primary' : 'text-muted-foreground'}
              ${isLowTime ? 'animate-pulse text-destructive bg-destructive/10' : ''}
              ${timeLeft === 0 && isActive ? 'text-destructive' : ''}
            `}
          >
            {isActive ? formatTime(timeLeft) : '2:00'}
          </div>
        )}
      </div>

      <div className="flex flex-wrap min-h-[1.5rem] gap-1 text-lg">
        {capturedPieces.map((p, i) => (
          <span
            key={i}
            className={`
              inline-flex items-center transition-transform hover:-translate-y-1
              ${p.color === 'w' ? 'text-foreground' : 'text-background drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'}
            `}
          >
            <ChessPiece type={p.type} color={p.color} />
          </span>
        ))}
      </div>
    </Card>
  );
}
