// Global type declarations
// These declarations will help TypeScript understand modules that don't have proper type definitions

// Declare clerk modules if their types are not being properly recognized
declare module "@clerk/nextjs" {
  export const auth: () => Promise<{ userId: string | null }>;
}

// Declare Next.js server modules if needed
declare module "next/server" {
  import { NextRequest as BaseNextRequest } from "next/dist/server/web/spec-extension/request";
  export type NextRequest = BaseNextRequest;
  
  export class NextResponse {
    static json(body: any, init?: ResponseInit): Response;
    static redirect(url: string | URL, init?: ResponseInit): Response;
  }
} 