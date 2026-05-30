import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative chess pieces background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        <span className="absolute text-[14rem] text-primary/5 -top-12 -left-12 rotate-12 leading-none">♜</span>
        <span className="absolute text-[11rem] text-primary/5 top-[15%] -right-8 -rotate-6 leading-none">♞</span>
        <span className="absolute text-[17rem] text-primary/[0.04] -bottom-20 left-[20%] rotate-6 leading-none">♛</span>
        <span className="absolute text-[9rem] text-primary/5 bottom-[20%] -left-4 rotate-12 leading-none">♝</span>
        <span className="absolute text-[12rem] text-primary/[0.04] -top-6 right-[22%] -rotate-12 leading-none">♙</span>
        <span className="absolute text-[10rem] text-primary/[0.04] bottom-[8%] right-[5%] rotate-6 leading-none">♟</span>
      </div>

      <div className="z-10 flex flex-col items-center max-w-md w-full px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <p className="text-primary tracking-[0.3em] text-sm font-bold uppercase mb-3">Welcome to</p>

        <h1 className="font-serif font-bold text-foreground drop-shadow-lg leading-none">
          <span className="text-7xl md:text-9xl">AZOX</span>
          <br />
          <span className="text-4xl md:text-5xl tracking-[0.35em] text-primary">CHESS</span>
        </h1>

        <p className="text-muted-foreground mt-6 mb-12 max-w-xs">
          A premium chess experience. Play against an AI opponent or challenge a friend online.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <Link href="/game/ai" className="w-full group">
            <Button
              data-testid="button-play-ai"
              size="lg"
              className="w-full h-16 text-lg font-serif tracking-wider shadow-[0_0_20px_hsl(var(--primary)/0.2)] group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all"
            >
              Play vs AI
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/game/create" className="w-full">
              <Button
                data-testid="button-create-match"
                variant="outline"
                size="lg"
                className="w-full h-14 text-base font-serif tracking-wide border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                Create Match
              </Button>
            </Link>

            <Link href="/game/join" className="w-full">
              <Button
                data-testid="button-join-match"
                variant="outline"
                size="lg"
                className="w-full h-14 text-base font-serif tracking-wide border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                Join Match
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-xs text-muted-foreground/50 tracking-widest uppercase font-serif z-10">
        The Midnight Club
      </div>
    </div>
  );
}
