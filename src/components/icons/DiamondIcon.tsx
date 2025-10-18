import { cn } from "@/lib/utils";
import * as React from "react";

export function DiamondIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={cn(className)}
      {...props}
    >
      <path d="M12.14 2.33a1.5 1.5 0 00-1.87 0L2.3 9.47a1.5 1.5 0 000 2.12l7.97 7.14a1.5 1.5 0 001.87 0l7.97-7.14a1.5 1.5 0 000-2.12L12.14 2.33z" />
    </svg>
  );
}
