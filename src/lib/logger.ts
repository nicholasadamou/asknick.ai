/* eslint-disable @typescript-eslint/no-explicit-any */
const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log("[DEBUG]", ...args);
    }
  },
  info: (...args: any[]) => {
    console.log("[INFO]", ...args);
  },
  warn: (...args: any[]) => {
    console.warn("[WARN]", ...args);
  },
  error: (...args: any[]) => {
    console.error("[ERROR]", ...args);
  },
};
