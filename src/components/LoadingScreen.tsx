'use client';

import React, { useEffect, useState } from 'react';
import { Swords } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const LoadingScreen = () => {
    const [progress, setProgress] = useState(10);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Simulate loading progress
        const timer1 = setTimeout(() => setProgress(60), 500);
        const timer2 = setTimeout(() => setProgress(100), 1500);
        
        // Start fade out animation after progress is complete
        const fadeOutTimer = setTimeout(() => {
            setVisible(false);
        }, 2500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(fadeOutTimer);
        };
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div 
            className={cn(
                "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-500",
                progress < 100 ? "opacity-100" : "opacity-0"
            )}
        >
             <div 
                className="absolute inset-0 w-full h-full opacity-30"
                style={{
                    backgroundImage: 'linear-gradient(rgba(var(--border), 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(var(--border), 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    animation: 'moveGrid 20s linear infinite',
                }}
            />
            <style>
                {`
                    @keyframes moveGrid {
                        from { background-position: 0 0; }
                        to { background-position: 40px 40px; }
                    }
                    @keyframes sword-glow {
                        0%, 100% { filter: drop-shadow(0 0 5px hsl(var(--primary))); }
                        50% { filter: drop-shadow(0 0 15px hsl(var(--primary))); }
                    }
                `}
            </style>
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-4">
                    <Swords className="h-16 w-16 text-primary" style={{ animation: 'sword-glow 2s infinite ease-in-out' }} />
                </div>

                <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent">APEX</h1>
                <p className="text-muted-foreground mb-8 font-semibold">Case Battles</p>
                
                <div className="w-48 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
