declare module 'next' {
  export type Metadata = any;
  export type NextConfig = any;
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
  const next: any;
  export default next;
}

declare module 'next/server' {
  export class NextResponse {
    static json(data: any, init?: any): any;
    static redirect(url: string | URL, status?: number): any;
  }
  export type NextRequest = any;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
  export function redirect(url: string): never;
}

declare module 'next/font/google' {
  export function Prompt(options: any): any;
  export function Geist(options: any): any;
  export function Geist_Mono(options: any): any;
}

declare module 'next/types.js' {
  export type Metadata = any;
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module 'next/server.js' {
  export type NextRequest = any;
  export class NextResponse {
    static json(data: any, init?: any): any;
  }
}
