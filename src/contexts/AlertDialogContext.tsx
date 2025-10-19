'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

interface AlertOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  onConfirm?: () => void;
}

interface AlertDialogContextType {
  showAlert: (options: AlertOptions) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

export const AlertDialogProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<AlertOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState(options);
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    if (alertState?.onConfirm) {
      alertState.onConfirm();
    }
    setIsOpen(false);
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="w-[80vw] max-w-sm rounded-2xl bg-neutral-50/95 dark:bg-neutral-800/90 border-neutral-200 dark:border-neutral-700 shadow-xl p-0">
          <AlertDialogHeader className="items-center text-center p-4">
            {alertState?.title && (
              <AlertDialogTitle className="font-bold text-black dark:text-white">{alertState.title}</AlertDialogTitle>
            )}
            {alertState?.description && (
              <AlertDialogDescription className="font-bold text-neutral-600 dark:text-neutral-300">
                {alertState.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-0 border-t border-neutral-200 dark:border-neutral-700">
            <AlertDialogAction
              onClick={handleClose}
              className="bg-transparent text-blue-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 w-full font-bold rounded-none p-3 h-auto"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
};

export const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (context === undefined) {
    throw new Error('useAlertDialog must be used within an AlertDialogProvider');
  }
  return context;
};
