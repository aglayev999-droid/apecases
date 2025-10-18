'use client';

import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import React, { ReactNode } from 'react';

export const TonConnectProvider = ({ children }: { children: ReactNode }) => {
  return (
    <TonConnectUIProvider
        manifestUrl="https://gist.githubusercontent.com/Alerant/1e3498877543a12918b9588b9071df88/raw/e3381a1a72d0392f44c6883238918458e388d39f/gistfile1.txt"
        uiPreferences={{ theme: THEME.DARK }}
    >
        {children}
    </TonConnectUIProvider>
  );
};
