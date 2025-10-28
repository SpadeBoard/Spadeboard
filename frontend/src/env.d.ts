// Define the type of the environment variables.
declare interface Env {
  readonly NODE_ENV: string;
  // Replace the following with your own environment variables.
  // Example: NGX_VERSION: string;
  [key: string]: any;
}

// Choose how to access the environment variables.
// Remove the unused options.

// 1. Use import.meta.env.YOUR_ENV_VAR in your code. (conventional)
declare interface ImportMeta {
  readonly env: Env;
}

// 2. Use _NGX_ENV_.YOUR_ENV_VAR in your code. (customizable)
// You can modify the name of the variable in angular.json.
// ngxEnv: {
//  define: '_NGX_ENV_',
// }
declare const _NGX_ENV_: Env;

// 3. Use process.env.YOUR_ENV_VAR in your code. (deprecated)
declare namespace NodeJS {
  export interface ProcessEnv extends Env {}
}

declare module '@thoughtsunificator/bbcode-parser';
declare module '@thoughtsunificator/bbcode-parser-template';

declare module "@sonrisa-dev/png-metadata" {
  export namespace PngMetadata {
    export const PNG_SIG: string;

    export function readFileSync(path: string): string; // binary string
    
    export function writeFileSync(path: string, bin: string): void;

    export function isPNG(s: string): boolean;

    export interface PNGChunk {
      size: number;
      type: string;
      data: string;
      crc: number;
    }

    export function splitChunk(s: string): PNGChunk[] | false;

    export function joinChunk(chunklist: PNGChunk[]): string;

    export function createChunk(type: string, data: string): PNGChunk;

    export function itos(v: number, size: number): string;

    export function stoi(s: string): number;

    export function crc32(str: string): number;
  }

  export = PngMetadata;
};

