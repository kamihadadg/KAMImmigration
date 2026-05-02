import "server-only";

import { join } from "node:path";

export const DEFAULT_DATA_DIR = join(process.cwd(), "content", "defaults");

export function defaultDataPath(filename: string): string {
  return join(DEFAULT_DATA_DIR, filename);
}
