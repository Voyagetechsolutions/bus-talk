/* eslint-disable @typescript-eslint/no-var-requires */
// Wrapper to bypass TypeScript deep type instantiation errors with Convex
// Using require() and @ts-ignore to completely avoid type inference

// @ts-ignore - Bypass deep type instantiation
const convexApi = require('./_generated/api');

// Export api as any to prevent deep type inference issues
export const api: any = convexApi.api;
