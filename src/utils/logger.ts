/**
 * Production-safe logger utility
 * Only logs in development mode (except errors which always log)
 */
const isDev = import.meta.env.DEV;

export const logger = {
    debug: (tag: string, message: string, ...args: unknown[]) => {
        if (isDev) console.log(`[${tag}] ${message}`, ...args);
    },
    info: (tag: string, message: string, ...args: unknown[]) => {
        if (isDev) console.log(`[${tag}] ${message}`, ...args);
    },
    warn: (tag: string, message: string, ...args: unknown[]) => {
        if (isDev) console.warn(`[${tag}] ${message}`, ...args);
    },
    error: (tag: string, message: string, ...args: unknown[]) => {
        // Always log errors, even in production
        console.error(`[${tag}] ${message}`, ...args);
    }
};
