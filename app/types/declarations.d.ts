// Type declarations for modules without specific type declarations
declare module "next/server" {
  import type { NextRequest as OriginalNextRequest } from "next";
  export type NextRequest = OriginalNextRequest;
  export class NextResponse {
    static json(body: any, init?: ResponseInit): Response;
    static redirect(url: string | URL, init?: ResponseInit): Response;
  }
}

declare module "@clerk/nextjs" {
  export const auth: () => Promise<{ userId: string | null }>;
}

// Add other missing module declarations as needed 