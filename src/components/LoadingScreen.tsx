'use client';

import React, { useEffect, useState } from 'react';
import { Logo } from '@/components/icons/Logo';
import { Progress } from '@/components/ui/progress';

export const LoadingScreen = () => {
    const [progress, setProgress] = useState(13);

    useEffect(() => {
        const timer = setTimeout(() => setProgress(66), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground animate-fade-out" style={{ animationDelay: '2.5s', animationFillMode: 'forwards' }}>
             <div 
                className="absolute inset-0 w-full h-full"
                style={{
                    backgroundImage: 'linear-gradient(rgba(13, 26, 68, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(13, 26, 68, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
            <div className="relative z-10 flex flex-col items-center">
                <Logo className="h-16 w-16 mb-4 text-primary" />
                <h1 className="text-4xl font-bold tracking-tighter">APEX</h1>
                <p className="text-muted-foreground mb-8">Case Battles</p>
                <Progress value={progress} className="w-48 h-1 bg-primary/20" />
            </div>
        </div>
    );
};
