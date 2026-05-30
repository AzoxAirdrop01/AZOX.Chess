import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function JoinMatch() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState('');
  const { toast } = useToast();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Match code must be exactly 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    setLocation(`/game/${trimmed}`);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-4 relative">
      <div className="absolute top-8 left-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.05)]">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-serif text-3xl text-primary tracking-widest">Join Match</CardTitle>
          <CardDescription>Enter the 6-character code from your host</CardDescription>
        </CardHeader>
        <form onSubmit={handleJoin}>
          <CardContent className="pt-6 pb-2">
            <Input
              data-testid="input-match-code"
              placeholder="XXXXXX"
              className="text-center font-mono text-4xl tracking-[0.2em] h-20 uppercase bg-secondary/50 border-primary/30 focus-visible:ring-primary"
              value={code}
              onChange={(e) => setCode(e.target.value.substring(0, 6))}
              maxLength={6}
              autoComplete="off"
              autoCapitalize="characters"
            />
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              data-testid="button-join-to-play"
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-serif tracking-widest shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
              disabled={code.trim().length !== 6}
            >
              Join to Play
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
