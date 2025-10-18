import { cn } from "@/lib/utils";
import * as React from "react";

export function RocketIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11.65-.9.03-2.31-.88-3.18-.95-.9-2.32-1.45-3.2-1.13-.88.32-1.61 1.23-1.61 2.2z" />
      <path d="m20.5 3.5-1.93 1.93c.3.29.54.63.71.99l1.22-1.22a.5.5 0 0 0 0-.71l-1-1a.5.5 0 0 0-.71 0z" />
      <path d="m12 15 5-5" />
      <path d="m9 18 6-6" />
      <path d="m19 11-4-4" />
    </svg>
  );
}
