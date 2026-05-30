import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateMatch } from '@workspace/api-client-react';
import { Copy, RefreshCw, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const SESSION_KEY = 'azox_match_code';

export default function CreateMatch() {
  const [, setLocation] = useLocation();
  const createMatch = useCreateMatch();
  const { toast } = useToast();
  const [matchCode, setMatchCode] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_KEY);
  });

  const generateCode = () => {
    createMatch.mutate(undefined, {
      onSuccess: (data) => {
        sessionStorage.setItem(SESSION_KEY, data.code);
        setMatchCode(data.code);
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Could not generate a match code. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  useEffect(() => {
    if (!matchCode) {
      generateCode();
    }
  }, []);

  const handleRefresh = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setMatchCode(null);
    generateCode();
  };

  const handleGoToPlay = () => {
    if (matchCode) {
      setLocation(`/game/${matchCode}`);
    }
  };

  const copyToClipboard = () => {
    if (matchCode) {
      navigator.clipboard.writeText(matchCode);
      toast({ title: 'Copied!', description: 'Match code copied to clipboard.' });
    }
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

      <Card className="w-full max-w-md border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-serif text-3xl text-primary tracking-widest">Create Match</CardTitle>
          <CardDescription>Share this code with your opponent, then click Go to Play</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 pt-6">
          {matchCode ? (
            <>
              {/* Code display */}
              <div className="flex items-center justify-center w-full relative">
                <div
                  data-testid="text-match-code"
                  className="bg-secondary/50 font-mono text-5xl tracking-[0.2em] font-bold py-6 w-full text-center rounded-xl border border-primary/20 text-foreground"
                >
                  {matchCode}
                </div>
                <div className="absolute right-3 flex flex-col gap-1">
                  <Button
                    data-testid="button-copy-code"
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/20 hover:text-primary"
                    onClick={copyToClipboard}
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    data-testid="button-refresh-code"
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/20 hover:text-primary"
                    onClick={handleRefresh}
                    disabled={createMatch.isPending}
                    title="Generate new code"
                  >
                    <RefreshCw className={`w-4 h-4 ${createMatch.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/70 uppercase tracking-widest text-center">
                Send this code to your friend, then enter the game room to wait for them
              </p>

              {/* Go to Play button */}
              <Button
                data-testid="button-go-to-play"
                size="lg"
                className="w-full h-14 text-lg font-serif tracking-wider shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
                onClick={handleGoToPlay}
              >
                Go to Play
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating secure code...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
